import React, { useState, useEffect } from 'react';
import { Card, Typography, Progress, Tag, Space } from 'antd';
import { 
  HeartOutlined,
  ThunderboltOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { colors, typography } from '../theme';

const { Text } = Typography;

interface MonitoringData {
  time: number;
  fetalHeartRate: number;
  fetalMovements: number;
  maternalPulse: number;
  timestamp: string;
}

interface HomeCTGMonitorProps {
  onRiskChange?: (risk: 'ok' | 'warn' | 'danger', score: number) => void;
}

const HomeCTGMonitor: React.FC<HomeCTGMonitorProps> = ({ onRiskChange }) => {
  const [data, setData] = useState<MonitoringData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Генерация тестовых данных для домашнего мониторинга
  const generateHomeData = () => {
    const time = sessionDuration;
    
    // ЧСС плода (120-160 bpm)
    const fhrBase = 140;
    const fhrVariation = Math.sin(time * 0.1) * 12 + Math.random() * 6 - 3;
    const fetalHeartRate = Math.max(110, Math.min(180, fhrBase + fhrVariation));
    
    // Движения плода (0-5 в минуту, редкие всплески)
    const movementCycle = Math.random() < 0.1 ? Math.random() * 4 + 1 : Math.random() * 0.5;
    const fetalMovements = Math.min(5, movementCycle);
    
    // Пульс мамы (60-100 bpm)
    const maternalBase = 75;
    const maternalVariation = Math.sin(time * 0.05) * 8 + Math.random() * 4 - 2;
    const maternalPulse = Math.max(55, Math.min(110, maternalBase + maternalVariation));

    return {
      time,
      fetalHeartRate: Math.round(fetalHeartRate),
      fetalMovements: Math.round(fetalMovements * 10) / 10,
      maternalPulse: Math.round(maternalPulse),
      timestamp: `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`
    };
  };

  // Симуляция подключения к устройству
  useEffect(() => {
    const connectDevice = () => {
      setIsConnected(true);
      console.log('Домашнее устройство подключено');
    };

    const disconnectDevice = () => {
      setIsConnected(false);
      console.log('Домашнее устройство отключено');
    };

    // Симуляция нестабильного соединения
    const connectionInterval = setInterval(() => {
      if (Math.random() < 0.05) { // 5% шанс переподключения
        setIsConnected(prev => !prev);
      }
    }, 3000);

    connectDevice();

    return () => {
      clearInterval(connectionInterval);
      disconnectDevice();
    };
  }, []);

  // Таймер сеанса и генерация данных
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isConnected) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
        const newPoint = generateHomeData();
        
        setData(prev => {
          const newData = [...prev, newPoint];
          const maxPoints = 300; // 5 минут данных
          return newData.length > maxPoints ? newData.slice(-maxPoints) : newData;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isConnected, sessionDuration]);

  // Расчет риска на основе домашних параметров
  useEffect(() => {
    if (data.length >= 10 && onRiskChange) {
      const recent = data.slice(-10);
      const avgFHR = recent.reduce((sum, p) => sum + p.fetalHeartRate, 0) / 10;
      const avgMaternal = recent.reduce((sum, p) => sum + p.maternalPulse, 0) / 10;
      const movementCount = recent.reduce((sum, p) => sum + p.fetalMovements, 0);
      
      let score = 0;
      
      // Анализ ЧСС плода
      if (avgFHR < 110 || avgFHR > 170) score += 40;
      else if (avgFHR < 120 || avgFHR > 160) score += 20;
      
      // Анализ пульса мамы
      if (avgMaternal < 50 || avgMaternal > 120) score += 30;
      else if (avgMaternal < 60 || avgMaternal > 100) score += 15;
      
      // Анализ движений плода
      if (movementCount < 2) score += 25;
      else if (movementCount > 30) score += 15;
      
      let risk: 'ok' | 'warn' | 'danger' = 'ok';
      if (score >= 50) risk = 'danger';
      else if (score >= 30) risk = 'warn';
      
      onRiskChange(risk, score);
    }
  }, [data, onRiskChange]);

  // Функция для определения опасного значения
  const isDangerValue = (type: string, value: number) => {
    switch (type) {
      case 'fhr':
        return value < 110 || value > 170;
      case 'maternal':
        return value < 50 || value > 120;
      case 'movements':
        return value > 4; // больше 4 движений в минуту может быть тревожным
      default:
        return false;
    }
  };

  // Кастомный Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #1890ff',
          borderRadius: '6px',
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1890ff' }}>
            Время: {label}
          </p>
          {payload.map((entry: any, index: number) => {
            const isDanger = isDangerValue(entry.dataKey, entry.value);
            return (
              <p key={index} style={{ 
                margin: '4px 0 0 0', 
                fontSize: '14px',
                color: isDanger ? '#ff4d4f' : entry.color
              }}>
                <strong>{entry.name}:</strong> {Math.round(entry.value * 10) / 10}
                {entry.dataKey === 'fetalHeartRate' || entry.dataKey === 'maternalPulse' ? ' bpm' : 
                 entry.dataKey === 'fetalMovements' ? ' дв/мин' : ''}
                {isDanger && ' ⚠️'}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const currentData = data.length > 0 ? data[data.length - 1] : null;
  
  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <Space>
            <HeartOutlined style={{ color: colors.primary }} />
            <span>Домашний мониторинг</span>
          </Space>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {isConnected ? 'Устройство активно' : 'Устройство отключено'}
            </Text>
          </div>
        </div>
      }
      extra={
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
        </Text>
      }
      className="h-full"
      bodyStyle={{ padding: '8px' }}
    >
      {/* Текущие показатели */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-gray-50 rounded">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <HeartOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
            <Text style={{ fontSize: '11px', color: '#666' }}>ЧСС плода</Text>
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: currentData && isDangerValue('fhr', currentData.fetalHeartRate) ? '#ff4d4f' : '#52c41a'
          }}>
            {currentData ? currentData.fetalHeartRate : '--'}
            <Text style={{ fontSize: '10px', marginLeft: '2px' }}>bpm</Text>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ThunderboltOutlined style={{ color: '#fa8c16', fontSize: '14px' }} />
            <Text style={{ fontSize: '11px', color: '#666' }}>Движения</Text>
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: currentData && isDangerValue('movements', currentData.fetalMovements) ? '#ff4d4f' : '#fa8c16'
          }}>
            {currentData ? currentData.fetalMovements.toFixed(1) : '--'}
            <Text style={{ fontSize: '10px', marginLeft: '2px' }}>дв/мин</Text>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserOutlined style={{ color: '#f5222d', fontSize: '14px' }} />
            <Text style={{ fontSize: '11px', color: '#666' }}>Пульс мамы</Text>
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: currentData && isDangerValue('maternal', currentData.maternalPulse) ? '#ff4d4f' : '#f5222d'
          }}>
            {currentData ? currentData.maternalPulse : '--'}
            <Text style={{ fontSize: '10px', marginLeft: '2px' }}>bpm</Text>
          </div>
        </div>
      </div>

      {/* График мониторинга */}
      <div style={{ height: '240px', background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '6px', padding: '4px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <XAxis 
              dataKey="timestamp" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#666' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[50, 180]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#666' }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Опасные зоны для ЧСС плода */}
            <ReferenceArea y1={50} y2={110} fill="#ff4d4f" fillOpacity={0.1} />
            <ReferenceArea y1={170} y2={180} fill="#ff4d4f" fillOpacity={0.1} />
            
            {/* ЧСС плода - основная линия */}
            <Line 
              type="monotone" 
              dataKey="fetalHeartRate" 
              stroke="#52c41a"
              strokeWidth={2}
              dot={(props: any) => {
                const isDanger = isDangerValue('fhr', props.payload.fetalHeartRate);
                return (
                  <circle 
                    cx={props.cx} 
                    cy={props.cy} 
                    r={isDanger ? 3 : 1}
                    fill={isDanger ? '#ff4d4f' : '#52c41a'}
                    stroke={isDanger ? '#fff' : 'none'}
                    strokeWidth={isDanger ? 1 : 0}
                  />
                );
              }}
              activeDot={{ r: 4, fill: '#52c41a', stroke: '#fff', strokeWidth: 2 }}
            />
            
            {/* Пульс мамы - вспомогательная линия */}
            <Line 
              type="monotone" 
              dataKey="maternalPulse" 
              stroke="#f5222d"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Статус внизу */}
      <div className="mt-2 text-xs text-gray-600 px-2 py-1 bg-gray-50 rounded border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span>
            {isConnected ? '🔗 Bluetooth подключен' : '🔴 Устройство отключено'}
          </span>
          <span>
            Данных: {data.length} точек
          </span>
        </div>
      </div>

      {/* Анимации для предупреждений */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        `
      }} />
    </Card>
  );
};

export default HomeCTGMonitor;