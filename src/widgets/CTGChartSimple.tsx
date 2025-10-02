import { Card, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { useEffect, useState } from 'react';
import { AlertSystem } from '../utils/AlertSystem';
import { colors, typography } from '../theme';

type Point = { t: number; fhr: number; uc: number };

// Simple data generation with more realistic patterns
function initSimpleData(n = 100): Point[] {
  const data: Point[] = [];
  
  let baseline = 140;
  let contractionPhase = 0;
  
  for (let i = 0; i < n; i++) {
    // Baseline drift
    baseline += (Math.random() - 0.5) * 0.5;
    baseline = Math.max(120, Math.min(160, baseline));
    
    // FHR with occasional events
    let fhr = baseline + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 8;
    
    // Occasional decelerations
    if (Math.random() < 0.02) {
      fhr -= 20 + Math.random() * 15; // deceleration
    }
    
    // UC with contraction pattern
    let uc = 5 + Math.sin(i * 0.03) * 15 + (Math.random() - 0.5) * 3;
    
    // Periodic contractions
    if (Math.sin(i * 0.02) > 0.7) {
      uc += Math.sin(contractionPhase) * 40;
      contractionPhase += 0.3;
    } else {
      contractionPhase = 0;
    }
    
    data.push({
      t: i, // используем индекс как относительное время в секундах
      fhr: Math.max(90, Math.min(180, fhr)),
      uc: Math.max(0, Math.min(100, uc))
    });
  }
  
  return data;
}

interface CTGChartSimpleProps {
  fpsMs?: number;
  windowLengthSec?: number;
  onRiskChange?: (risk: 'ok' | 'warn' | 'danger', score: number) => void;
  alertSystem?: AlertSystem;
}

export default function CTGChartSimple({ 
  fpsMs = 250, 
  windowLengthSec = 180, 
  onRiskChange,
  alertSystem 
}: CTGChartSimpleProps) {
  const [data, setData] = useState<Point[]>(initSimpleData(100));
  const [anomalyZones, setAnomalyZones] = useState<Array<{start: number, end: number, type: string}>>([]);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [wsError, setWsError] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    
    const connectWebSocket = () => {
      try {
        setWsStatus('connecting');
        setWsError('');
        // Используем относительный путь для работы как локально (через Vite proxy), так и в Docker
        const wsUrl = window.location.protocol === 'https:' 
          ? `wss://${window.location.host}/ws/` 
          : `ws://${window.location.host}/ws/`;
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected to backend');
          setWsStatus('connected');
          setStartTime(Date.now()); // Сбрасываем время начала при подключении
          setData([]); // Очищаем данные при новом подключении
          reconnectAttempts = 0;
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Поддерживаем оба формата: BPMChild (от ML) и bpmChild (от генератора)
            const bpmValue = message.data && (message.data.BPMChild || message.data.bpmChild);
            const uterusValue = message.data && message.data.uterus;
            
            if (message.data && typeof bpmValue === 'number' && typeof uterusValue === 'number') {
              // Используем secFromStart из сообщения, если есть, иначе вычисляем
              const relativeTime = message.secFromStart 
                ? Math.round(message.secFromStart) 
                : Math.round((Date.now() - startTime) / 1000);
              
              const newPoint: Point = {
                t: relativeTime,
                fhr: Math.max(90, Math.min(180, bpmValue)), // Поддерживаем оба формата
                uc: Math.max(0, Math.min(100, uterusValue))
              };
              
              // Логируем ML предсказание если есть
              if (message.prediction) {
                console.log('ML Prediction:', {
                  risk: message.prediction.hypoxia_risk,
                  probability: message.prediction.hypoxia_probability,
                  alerts: message.prediction.alerts,
                  confidence: message.prediction.confidence
                });
              } else {
                console.log('Accumulating data... (first 5 minutes)');
              }
              
              setData(prev => {
                const newData = [...prev, newPoint];
                const maxPoints = windowLengthSec || 180;
                const finalData = newData.length > maxPoints ? newData.slice(-maxPoints) : newData;
                
                // Check for alerts if system provided
                if (alertSystem) {
                  const fhrValues = finalData.map(p => p.fhr);
                  const ucValues = finalData.map(p => p.uc);
                  
                  const newAlerts = alertSystem.checkForAlerts(fhrValues, ucValues);
                  
                  // Create anomaly zones for visualization
                  if (newAlerts.length > 0) {
                    const now = relativeTime;
                    const newZones = newAlerts.map(alert => ({
                      start: now - 30, // last 30 seconds
                      end: now,
                      type: alert.level
                    }));
                    setAnomalyZones(prevZones => [...prevZones, ...newZones].slice(-10)); // keep last 10 zones
                  }
                }
                
                // Risk calculation based on real data
                if (onRiskChange) {
                  const avgFhr = finalData.slice(-10).reduce((sum, p) => sum + p.fhr, 0) / 10;
                  const maxUc = Math.max(...finalData.slice(-10).map(p => p.uc));
                  
                  let risk: 'ok' | 'warn' | 'danger' = 'ok';
                  let score = 0;
                  
                  if (avgFhr < 110 || avgFhr > 170) score += 40;
                  else if (avgFhr < 120 || avgFhr > 160) score += 20;
                  
                  if (maxUc > 80) score += 30;
                  else if (maxUc > 60) score += 15;
                  
                  if (score < 25) risk = 'ok';
                  else if (score < 50) risk = 'warn';
                  else risk = 'danger';
                  
                  onRiskChange(risk, score);
                }
                
                return finalData;
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          setWsStatus('disconnected');
          
          // Попытка переподключения
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
            setTimeout(connectWebSocket, 3000); // повторная попытка через 3 секунды
          } else {
            setWsError(`Failed to connect after ${maxReconnectAttempts} attempts`);
            setWsStatus('error');
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsStatus('error');
          setWsError('WebSocket connection error');
        };
        
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setWsStatus('error');
        setWsError('Failed to create WebSocket connection');
      }
    };
    
    // Инициализация подключения
    connectWebSocket();
    
    // Cleanup
    return () => {
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  }, [windowLengthSec, onRiskChange, alertSystem]);

  const timeFmt = (t: number) => {
    // t теперь в секундах с начала сеанса
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <span>КТГ мониторинг</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              wsStatus === 'connected' ? 'bg-green-500' : 
              wsStatus === 'connecting' ? 'bg-yellow-500' : 
              wsStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-xs text-gray-500">
              {wsStatus === 'connected' ? 'Подключено' :
               wsStatus === 'connecting' ? 'Подключение...' :
               wsStatus === 'error' ? 'Ошибка' : 'Отключено'}
            </span>
          </div>
        </div>
      } 
      aria-label="График КТГ"
    >
      <div className="h-[300px] bg-gray-50 rounded-md">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 10, left: 10, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border.grid} />
            <XAxis 
              dataKey="t" 
              tickFormatter={timeFmt} 
              minTickGap={25} 
              fontSize={11}
              height={18}
            />
            <YAxis 
              yAxisId="left" 
              domain={[100, 180]} 
              tickCount={4} 
              fontSize={11}
              width={28}
              label={{ value: 'FHR', position: 'insideLeft', style: { fontSize: 10 } }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 100]} 
              tickCount={4} 
              fontSize={11}
              width={28}
              label={{ value: 'UC', position: 'insideRight', style: { fontSize: 10 } }} 
            />
            <Tooltip labelFormatter={(v) => timeFmt(v as number)} />
            <Legend 
              wrapperStyle={{ fontSize: typography.fontSize.xs, paddingTop: typography.spacing.xs }}
              iconSize={12}
            />
            
            {/* Anomaly zones highlighting */}
            {anomalyZones.map((zone, index) => (
              <ReferenceArea
                key={index}
                x1={zone.start}
                x2={zone.end}
                fill={zone.type === 'critical' ? colors.status.danger : zone.type === 'warning' ? colors.status.warning : colors.status.info}
                fillOpacity={0.2}
              />
            ))}
            
            {/* Reference lines for normal ranges */}
            <ReferenceLine yAxisId="left" y={110} stroke={colors.status.danger} strokeDasharray="2 2" strokeWidth={1} />
            <ReferenceLine yAxisId="left" y={160} stroke={colors.status.danger} strokeDasharray="2 2" strokeWidth={1} />
            <ReferenceLine yAxisId="right" y={70} stroke={colors.status.warning} strokeDasharray="2 2" strokeWidth={1} />
            
            <Line 
              type="monotone" 
              yAxisId="left" 
              dataKey="fhr" 
              name="FHR (ЧСС плода)" 
              stroke={colors.chart.fhr} 
              dot={false} 
              strokeWidth={1.5} 
            />
            <Line 
              type="monotone" 
              yAxisId="right" 
              dataKey="uc" 
              name="UC (Схватки)" 
              stroke={colors.chart.uc} 
              dot={false} 
              strokeWidth={1.5} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="!mt-2 text-gray-600 text-xs px-2 py-1 bg-gray-50 rounded border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span>
            {wsStatus === 'connected' ? 'Данные в реальном времени' : `Окно: ${windowLengthSec}с`}
            {wsStatus === 'error' && wsError && ` • ${wsError}`}
          </span>
          {anomalyZones.length > 0 && (
            <span className="text-orange-600 font-medium flex items-center gap-1">
              <ExclamationCircleOutlined className="text-orange-500" />
              {anomalyZones.length} аномалий
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}