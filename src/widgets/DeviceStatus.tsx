import React, { useState, useEffect } from 'react';
import { Card, Progress, Tag, Space, Typography, Statistic, Row, Col } from 'antd';
import { 
  ThunderboltOutlined,
  WifiOutlined,
  FireOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { colors, typography } from '../theme';

const { Text } = Typography;

interface DeviceStatusProps {
  deviceName?: string;
  sessionsToday?: number;
  deviceUptime?: number;
  dataQuality?: number;
  alertsToday?: number;
}

const DeviceStatus: React.FC<DeviceStatusProps> = ({ 
  deviceName = "MoniPuck v2.1",
  sessionsToday = 3,
  deviceUptime = 847,
  dataQuality = 94,
  alertsToday = 2
}) => {
  // Форматирование времени работы (минуты в часы:минуты)
  const formatUptime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${remainingMinutes}м`;
    }
    return `${remainingMinutes}м`;
  };

  const [battery, setBattery] = useState(85);
  const [signalQuality, setSignalQuality] = useState(92);
  const [temperature, setTemperature] = useState(36.4);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Симуляция изменения параметров устройства
  useEffect(() => {
    const interval = setInterval(() => {
      // Батарея медленно разряжается
      setBattery(prev => {
        const newBattery = prev - (Math.random() * 0.5);
        return Math.max(0, newBattery);
      });
      
      // Качество сигнала флуктуирует
      setSignalQuality(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, prev + change));
      });
      
      // Температура слегка меняется
      setTemperature(prev => {
        const change = (Math.random() - 0.5) * 0.2;
        return Math.max(35, Math.min(38, prev + change));
      });
      
      // Иногда теряем соединение
      if (Math.random() < 0.05) {
        setIsConnected(prev => !prev);
      }
      
      setLastUpdate(Date.now());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Определение статуса батареи
  const getBatteryStatus = () => {
    if (battery > 50) return { color: '#52c41a', status: 'Хорошо' };
    if (battery > 20) return { color: '#faad14', status: 'Средне' };
    return { color: '#f5222d', status: 'Низкий' };
  };

  // Определение качества сигнала
  const getSignalStatus = () => {
    if (signalQuality > 80) return { color: '#52c41a', status: 'Отлично', bars: 4 };
    if (signalQuality > 60) return { color: '#faad14', status: 'Хорошо', bars: 3 };
    if (signalQuality > 30) return { color: '#fa8c16', status: 'Средне', bars: 2 };
    return { color: '#f5222d', status: 'Плохо', bars: 1 };
  };

  // Определение статуса температуры
  const getTemperatureStatus = () => {
    if (temperature >= 35.5 && temperature <= 37.5) return { color: '#52c41a', status: 'Норма' };
    if (temperature >= 35 && temperature < 35.5) return { color: '#faad14', status: 'Прохладно' };
    if (temperature > 37.5) return { color: '#f5222d', status: 'Перегрев' };
    return { color: '#f5222d', status: 'Холодно' };
  };

  const batteryStatus = getBatteryStatus();
  const signalStatus = getSignalStatus();
  const tempStatus = getTemperatureStatus();

  // Общий статус устройства
  const getOverallStatus = () => {
    if (!isConnected) return { color: '#f5222d', status: 'Отключено', icon: <CloseCircleOutlined /> };
    if (battery < 20 || temperature < 35 || temperature > 38) return { color: '#f5222d', status: 'Критично', icon: <ExclamationCircleOutlined /> };
    if (battery < 50 || signalQuality < 60) return { color: '#faad14', status: 'Предупр.', icon: <ExclamationCircleOutlined /> };
    return { color: '#52c41a', status: 'Активно', icon: <CheckCircleOutlined /> };
  };

  const overallStatus = getOverallStatus();

  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <Space>
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
            >
              <SettingOutlined style={{ fontSize: '12px' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#831843' }}>MoniPuck v2.1</span>
          </Space>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-pink-500' : 'bg-red-500'
            } ${isConnected ? 'animate-pulse' : ''}`}></div>
            <Tag 
              color={overallStatus.color} 
              icon={overallStatus.icon}
              className="text-xs font-medium border-0"
              style={{ 
                fontSize: '9px',
                padding: '1px 4px',
                background: overallStatus.color === '#52c41a' ? '#fef7ff' : 
                           overallStatus.color === '#faad14' ? '#fefce8' : '#fef2f2',
                color: overallStatus.color === '#52c41a' ? '#a21caf' : 
                       overallStatus.color === '#faad14' ? '#a16207' : '#dc2626'
              }}
            >
              {overallStatus.status}
            </Tag>
          </div>
        </div>
      }
      className="h-full"
      bodyStyle={{ padding: '8px' }}
      headStyle={{ 
        padding: '8px 12px', 
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        borderBottom: '1px solid #f3e8ff'
      }}
    >
      <Space direction="vertical" size="small" className="w-full">
        {/* Компактные основные параметры в одну строку */}
        <div className="grid grid-cols-3 gap-2 p-2 rounded-lg" style={{ 
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
          border: '1px solid #f3e8ff'
        }}>
          {/* Батарея */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThunderboltOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
              <span style={{ fontSize: '9px', color: '#831843', fontWeight: 'bold' }}>БАТ</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: batteryStatus.color }}>
              {Math.round(battery)}%
            </div>
            <div className="h-1 bg-pink-100 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${battery}%`, 
                  backgroundColor: battery > 50 ? '#ec4899' : battery > 20 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
          </div>

          {/* Сигнал */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <WifiOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
              <span style={{ fontSize: '9px', color: '#831843', fontWeight: 'bold' }}>BT</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: signalStatus.color }}>
              {Math.round(signalQuality)}%
            </div>
            <div className="flex justify-center gap-1 mt-1">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-300"
                  style={{
                    height: `${(i + 1) * 2 + 2}px`,
                    backgroundColor: i < signalStatus.bars ? '#ec4899' : '#f3e8ff'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Температура */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FireOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
              <span style={{ fontSize: '9px', color: '#831843', fontWeight: 'bold' }}>T°</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: tempStatus.color }}>
              {temperature.toFixed(1)}°
            </div>
            <div className="h-1 bg-pink-100 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${Math.min(100, Math.max(0, ((temperature - 35) / 3) * 100))}%`, 
                  backgroundColor: temperature >= 35.5 && temperature <= 37.5 ? '#ec4899' : '#f59e0b'
                }}
              />
            </div>
          </div>
        </div>

        {/* Компактная статистика в 2 строки */}
        <div className="grid grid-cols-4 gap-1">
          <div className="p-1 rounded text-center" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a21caf' }}>
              {sessionsToday}
            </div>
            <div style={{ fontSize: '8px', color: '#831843' }}>сеансов</div>
          </div>

          <div className="p-1 rounded text-center" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a21caf' }}>
              {formatUptime(deviceUptime)}
            </div>
            <div style={{ fontSize: '8px', color: '#831843' }}>работы</div>
          </div>

          <div className="p-1 rounded text-center" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: dataQuality > 90 ? '#a21caf' : '#d97706' }}>
              {dataQuality}%
            </div>
            <div style={{ fontSize: '8px', color: '#831843' }}>качество</div>
          </div>

          <div className="p-1 rounded text-center" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: alertsToday > 0 ? '#dc2626' : '#a21caf' }}>
              {alertsToday}
            </div>
            <div style={{ fontSize: '8px', color: '#831843' }}>уведомл.</div>
          </div>
        </div>

        {/* Компактный статус подключения */}
        <div className="flex items-center justify-between px-2 py-1 rounded" style={{ 
          backgroundColor: isConnected ? '#fef7ff' : '#fef2f2',
          border: `1px solid ${isConnected ? '#f3e8ff' : '#fecaca'}`
        }}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-pink-500' : 'bg-red-500'
            } ${isConnected ? 'animate-pulse' : ''}`}></div>
            <span style={{ fontSize: '9px', color: isConnected ? '#831843' : '#991b1b', fontWeight: 'bold' }}>
              {deviceName} • {isConnected ? 'Подключено' : 'Отключено'}
            </span>
          </div>
          <span style={{ fontSize: '8px', color: '#64748b' }}>
            {new Date(lastUpdate).toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>

        {/* Компактные предупреждения */}
        {(battery < 30 || signalQuality < 50 || !isConnected) && (
          <div className="px-2 py-1 rounded-md" style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca' 
          }}>
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined style={{ color: '#dc2626', fontSize: '10px' }} />
              <div style={{ fontSize: '8px', color: '#991b1b', fontWeight: 'bold' }}>
                {!isConnected ? 'Не подключено' : 
                 battery < 30 ? 'Разряжается' : 
                 signalQuality < 50 ? 'Слабый сигнал' : ''}
                {(battery < 30 && isConnected) && (signalQuality < 50) && ' • Слабый сигнал'}
              </div>
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default DeviceStatus;