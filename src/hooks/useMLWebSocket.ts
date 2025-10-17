import { useEffect, useState, useRef } from 'react';

export interface MLPrediction {
  hypoxia_probability: number;
  hypoxia_risk: 'low' | 'medium' | 'high' | 'critical';
  alerts: string[];
  confidence: number;
  recommendations: string[];
}

export interface CTGDataPoint {
  sensorID: string;
  secFromStart: number;
  data: {
    BPMChild?: number;  // Формат от ML сервиса
    bpmChild?: number;  // Формат от генератора
    bpm?: number;       // BPM значение
    sec_from_start?: number; // Время в секундах
    uterus: number;
    spasms: number;
    tone?: number;      // Тонус матки
  };
  prediction: MLPrediction | null;
  status: 'ok' | 'warning' | 'critical' | 'error';
  timestamp: string;
}

interface UseMLWebSocketReturn {
  isConnected: boolean;
  latestData: CTGDataPoint | null;
  error: string | null;
}

export function useMLWebSocket(): UseMLWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [latestData, setLatestData] = useState<CTGDataPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Используем относительный путь для работы как локально (через Vite proxy), так и в Docker
        const wsUrl = window.location.protocol === 'https:' 
          ? `wss://${window.location.host}/ws/` 
          : `ws://${window.location.host}/ws/`;
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('✅ ML WebSocket connected');
          setIsConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data: CTGDataPoint = JSON.parse(event.data);
            
            // Поддерживаем оба формата: BPMChild (от ML) и bpmChild (от генератора)
            const bpmValue = data.data && (data.data.BPMChild || data.data.bpmChild);
            
            if (data.data && typeof bpmValue === 'number') {
              setLatestData(data);
              
              // Логируем CTG данные
              console.log('📊 CTG Data:', {
                BPM: bpmValue?.toFixed(1),
                uterus: data.data.uterus?.toFixed(1),
                spasms: data.data.spasms?.toFixed(1),
                tone: data.data.tone?.toFixed(1)
              });
              
              // Логируем ML предсказание если есть
              if (data.prediction) {
                console.log('🧠 ML Prediction:', {
                  risk: data.prediction.hypoxia_risk,
                  probability: `${(data.prediction.hypoxia_probability * 100).toFixed(1)}%`,
                  confidence: `${(data.prediction.confidence * 100).toFixed(1)}%`,
                  alerts: data.prediction.alerts.length
                });
              }
            }
          } catch (err) {
            console.error('❌ Error parsing ML WebSocket message:', err);
            setError('Ошибка обработки данных');
          }
        };

        ws.onclose = (event) => {
          console.log('🔌 ML WebSocket closed:', event.code, event.reason);
          setIsConnected(false);

          // Автоматическое переподключение
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            console.log(`🔄 Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            setTimeout(connectWebSocket, 3000);
          } else {
            setError(`Не удалось подключиться после ${maxReconnectAttempts} попыток`);
          }
        };

        ws.onerror = (err) => {
          console.error('❌ ML WebSocket error:', err);
          setError('Ошибка подключения к ML сервису');
        };

      } catch (err) {
        console.error('❌ Failed to create ML WebSocket:', err);
        setError('Не удалось создать WebSocket подключение');
      }
    };

    connectWebSocket();

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    latestData,
    error
  };
}
