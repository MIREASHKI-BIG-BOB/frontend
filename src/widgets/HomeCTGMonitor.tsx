import React, { useState, useEffect } from 'react';
import { Card, Typography, Progress, Tag, Space } from 'antd';
import { 
  HeartOutlined,
  ThunderboltOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  MonitorOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

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

  // Кастомный Tooltip в розовом стиле
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
          border: '2px solid #ec4899',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)',
          fontSize: '11px',
          lineHeight: '1.4'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#831843' }}>
            Время: {label}
          </p>
          {payload.map((entry: any, index: number) => {
            const isDanger = isDangerValue(entry.dataKey, entry.value);
            return (
              <p key={index} style={{ 
                margin: '4px 0 0 0', 
                fontSize: '10px',
                color: isDanger ? '#dc2626' : '#831843'
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
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
            >
              <MonitorOutlined style={{ fontSize: '12px' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
              Домашний мониторинг
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}></div>
            <Text style={{ fontSize: '11px', color: '#831843', opacity: 0.7 }}>
              {isConnected ? 'Устройство активно' : 'Устройство отключено'}
            </Text>
            <Text style={{ fontSize: '12px', fontWeight: 'bold', color: '#831843' }}>
              {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
            </Text>
          </div>
        </div>
      }
      className="h-full"
      size="small"
      bodyStyle={{ padding: '8px' }}
      headStyle={{ 
        padding: '6px 12px', 
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        borderBottom: '1px solid #f3e8ff'
      }}
    >
      {/* Текущие показатели в розово-белом стиле */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-2 rounded-lg" style={{ 
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        border: '1px solid #f3e8ff'
      }}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: '#ec4899', fontSize: '9px' }}
            >
              <HeartOutlined />
            </div>
            <Text style={{ fontSize: '10px', color: '#831843', opacity: 0.7 }}>ЧСС плода</Text>
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: currentData && isDangerValue('fhr', currentData.fetalHeartRate) ? '#dc2626' : '#831843'
          }}>
            {currentData ? currentData.fetalHeartRate : '--'}
            <Text style={{ fontSize: '9px', marginLeft: '2px', color: '#831843', opacity: 0.7 }}>bpm</Text>
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: '#be185d', fontSize: '9px' }}
            >
              <ThunderboltOutlined />
            </div>
            <Text style={{ fontSize: '10px', color: '#831843', opacity: 0.7 }}>Движения</Text>
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: currentData && isDangerValue('movements', currentData.fetalMovements) ? '#dc2626' : '#831843'
          }}>
            {currentData ? currentData.fetalMovements.toFixed(1) : '--'}
            <Text style={{ fontSize: '9px', marginLeft: '2px', color: '#831843', opacity: 0.7 }}>дв/мин</Text>
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: '#a21caf', fontSize: '9px' }}
            >
              <UserOutlined />
            </div>
            <Text style={{ fontSize: '10px', color: '#831843', opacity: 0.7 }}>Пульс мамы</Text>
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: currentData && isDangerValue('maternal', currentData.maternalPulse) ? '#dc2626' : '#831843'
          }}>
            {currentData ? currentData.maternalPulse : '--'}
            <Text style={{ fontSize: '9px', marginLeft: '2px', color: '#831843', opacity: 0.7 }}>bpm</Text>
          </div>
        </div>
      </div>

      {/* График мониторинга в розово-белом стиле */}
      <div style={{ 
        height: '220px', 
        background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)', 
        border: '1px solid #f3e8ff', 
        borderRadius: '8px', 
        padding: '6px' 
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
            <XAxis 
              dataKey="timestamp" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#831843' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[50, 180]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#831843' }}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Опасные зоны для ЧСС плода в розовых тонах */}
            <ReferenceArea y1={50} y2={110} fill="#dc2626" fillOpacity={0.08} />
            <ReferenceArea y1={170} y2={180} fill="#dc2626" fillOpacity={0.08} />
            
            {/* ЧСС плода - основная линия в розовом */}
            <Line 
              type="monotone" 
              dataKey="fetalHeartRate" 
              stroke="#ec4899"
              strokeWidth={2.5}
              dot={(props: any) => {
                const isDanger = isDangerValue('fhr', props.payload.fetalHeartRate);
                return (
                  <circle 
                    cx={props.cx} 
                    cy={props.cy} 
                    r={isDanger ? 3 : 1.5}
                    fill={isDanger ? '#dc2626' : '#ec4899'}
                    stroke={isDanger ? '#fff' : 'none'}
                    strokeWidth={isDanger ? 1 : 0}
                  />
                );
              }}
              activeDot={{ r: 4, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
            />
            
            {/* Пульс мамы - вспомогательная линия в темно-розовом */}
            <Line 
              type="monotone" 
              dataKey="maternalPulse" 
              stroke="#be185d"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 3, fill: '#be185d', stroke: '#fff', strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Статус внизу в розово-белом стиле */}
      <div className="mt-2 px-2 py-1 rounded-lg border-t" style={{
        fontSize: '11px', 
        color: '#831843',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        borderColor: '#f3e8ff'
      }}>
        <div className="flex justify-between items-center">
          <span style={{ opacity: 0.8 }}>
            {isConnected ? '🔗 Bluetooth подключен' : '🔴 Устройство отключено'}
          </span>
          <span style={{ opacity: 0.8 }}>
            Данных: <strong style={{ color: '#ec4899' }}>{data.length}</strong> точек
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