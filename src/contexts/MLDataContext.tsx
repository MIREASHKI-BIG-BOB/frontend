import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMLWebSocket } from '../hooks/useMLWebSocket';

export interface MLPrediction {
  hypoxia_probability: number;
  hypoxia_risk: 'low' | 'medium' | 'high' | 'critical';
  alerts: string[];
  confidence: number;
  recommendations: string[];
}

export interface MLDataPoint {
  sensorID: string;
  secFromStart: number;
  data: {
    BPMChild: number;
    uterus: number;
    spasms: number;
  };
  prediction?: MLPrediction | null;
  status: string;
  timestamp: string;
}

export interface AnomalyDetection {
  type: 'bradycardia' | 'tachycardia' | 'late_deceleration' | 'variable_deceleration' | 'uterine_hyperactivity';
  severity: 'mild' | 'moderate' | 'severe';
  startTime: number;
  endTime?: number;
  value: number;
  description: string;
}

export interface SessionAnalysis {
  id: string;
  startTime: string;
  endTime?: string;
  totalDuration: number;
  averageRisk: number;
  maxRisk: number;
  totalAnomalies: number;
  criticalPeriods: Array<{
    startTime: number;
    endTime: number;
    risk: string;
    description: string;
  }>;
  recommendations: string[];
  overallStatus: 'normal' | 'warning' | 'critical';
}

interface MLDataContextType {
  // Текущие данные
  latestData: MLDataPoint | null;
  isConnected: boolean;
  error: string | null;
  
  // История данных
  dataHistory: MLDataPoint[];
  predictionHistory: MLPrediction[];
  
  // Анализ аномалий
  detectedAnomalies: AnomalyDetection[];
  
  // Сессии анализа
  currentSession: SessionAnalysis | null;
  sessionHistory: SessionAnalysis[];
  
  // Методы управления
  startNewSession: () => void;
  endCurrentSession: () => void;
  addCustomNote: (note: string) => void;
  clearHistory: () => void;
}

const MLDataContext = createContext<MLDataContextType | undefined>(undefined);

export const useMLDataContext = () => {
  const context = useContext(MLDataContext);
  if (!context) {
    throw new Error('useMLDataContext must be used within MLDataProvider');
  }
  return context;
};

interface MLDataProviderProps {
  children: ReactNode;
}

export const MLDataProvider: React.FC<MLDataProviderProps> = ({ children }) => {
  // WebSocket подключение
  const { isConnected, latestData, error } = useMLWebSocket();
  
  // Состояние истории данных
  const [dataHistory, setDataHistory] = useState<MLDataPoint[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<MLPrediction[]>([]);
  const [detectedAnomalies, setDetectedAnomalies] = useState<AnomalyDetection[]>([]);
  
  // Состояние сессий
  const [currentSession, setCurrentSession] = useState<SessionAnalysis | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionAnalysis[]>([]);

  // Обновление истории при получении новых данных
  useEffect(() => {
    if (latestData) {
      // Добавляем в историю данных
      setDataHistory(prev => {
        const newHistory = [...prev, latestData];
        // Ограничиваем до последних 1000 записей
        return newHistory.length > 1000 ? newHistory.slice(-1000) : newHistory;
      });
      
      // Добавляем предикшен в историю
      if (latestData.prediction) {
        setPredictionHistory(prev => {
          const newHistory = [...prev, latestData.prediction!];
          return newHistory.length > 1000 ? newHistory.slice(-1000) : newHistory;
        });
        
        // Анализируем аномалии
        detectAnomalies(latestData);
      }
      
      // Обновляем текущую сессию
      updateCurrentSession(latestData);
    }
  }, [latestData]);

  // Определение аномалий
  const detectAnomalies = (data: MLDataPoint) => {
    const anomalies: AnomalyDetection[] = [];
    const { BPMChild, uterus } = data.data;
    const timeNow = data.secFromStart;

    // Брадикардия
    if (BPMChild < 110) {
      anomalies.push({
        type: 'bradycardia',
        severity: BPMChild < 90 ? 'severe' : BPMChild < 100 ? 'moderate' : 'mild',
        startTime: timeNow,
        value: BPMChild,
        description: `Брадикардия: ${BPMChild.toFixed(1)} уд/мин`
      });
    }

    // Тахикардия
    if (BPMChild > 160) {
      anomalies.push({
        type: 'tachycardia',
        severity: BPMChild > 180 ? 'severe' : BPMChild > 170 ? 'moderate' : 'mild',
        startTime: timeNow,
        value: BPMChild,
        description: `Тахикардия: ${BPMChild.toFixed(1)} уд/мин`
      });
    }

    // Гипертонус матки
    if (uterus > 60) {
      anomalies.push({
        type: 'uterine_hyperactivity',
        severity: uterus > 80 ? 'severe' : uterus > 70 ? 'moderate' : 'mild',
        startTime: timeNow,
        value: uterus,
        description: `Гипертонус матки: ${uterus.toFixed(1)}`
      });
    }

    if (anomalies.length > 0) {
      setDetectedAnomalies(prev => [...prev, ...anomalies]);
    }
  };

  // Обновление текущей сессии
  const updateCurrentSession = (data: MLDataPoint) => {
    if (!currentSession) return;
    
    const riskScore = data.prediction?.hypoxia_probability ?? 0;
    
    setCurrentSession(prev => ({
      ...prev!,
      endTime: data.timestamp,
      totalDuration: data.secFromStart,
      averageRisk: (prev!.averageRisk + riskScore) / 2,
      maxRisk: Math.max(prev!.maxRisk, riskScore),
      overallStatus: riskScore > 0.8 ? 'critical' : riskScore > 0.5 ? 'warning' : 'normal'
    }));
  };

  // Методы управления
  const startNewSession = () => {
    const newSession: SessionAnalysis = {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      totalDuration: 0,
      averageRisk: 0,
      maxRisk: 0,
      totalAnomalies: 0,
      criticalPeriods: [],
      recommendations: [],
      overallStatus: 'normal'
    };
    
    setCurrentSession(newSession);
    setDataHistory([]);
    setPredictionHistory([]);
    setDetectedAnomalies([]);
  };

  const endCurrentSession = () => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date().toISOString(),
        totalAnomalies: detectedAnomalies.length,
        recommendations: predictionHistory
          .flatMap(p => p.recommendations)
          .filter((rec, index, arr) => arr.indexOf(rec) === index) // уникальные
      };
      
      setSessionHistory(prev => [...prev, completedSession]);
      setCurrentSession(null);
    }
  };

  const addCustomNote = (note: string) => {
    // Можно добавить кастомные заметки к сессии
    console.log('Custom note added:', note);
  };

  const clearHistory = () => {
    setDataHistory([]);
    setPredictionHistory([]);
    setDetectedAnomalies([]);
    setSessionHistory([]);
  };

  const contextValue: MLDataContextType = {
    latestData,
    isConnected,
    error,
    dataHistory,
    predictionHistory,
    detectedAnomalies,
    currentSession,
    sessionHistory,
    startNewSession,
    endCurrentSession,
    addCustomNote,
    clearHistory
  };

  return (
    <MLDataContext.Provider value={contextValue}>
      {children}
    </MLDataContext.Provider>
  );
};