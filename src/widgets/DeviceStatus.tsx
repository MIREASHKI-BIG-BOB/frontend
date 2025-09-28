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
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <SettingOutlined style={{ fontSize: '14px' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>MoniPuck v2.1</span>
          </Space>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            } animate-pulse`}></div>
            <Tag 
              color={overallStatus.color} 
              icon={overallStatus.icon}
              className="text-xs font-medium border-0"
              style={{ 
                background: overallStatus.color === '#52c41a' ? '#f6ffed' : 
                           overallStatus.color === '#faad14' ? '#fffbe6' : '#fff2f0',
                color: overallStatus.color
              }}
            >
              {overallStatus.status}
            </Tag>
          </div>
        </div>
      }
      className="h-full"
      bodyStyle={{ padding: '12px' }}
      headStyle={{ padding: '12px 16px', minHeight: 'auto' }}
    >
      <Space direction="vertical" size="middle" className="w-full">
        {/* Название устройства */}
        <div className="text-center py-2 bg-gray-50 rounded border">
          <Text strong style={{ fontSize: '14px', color: colors.text.primary }}>
            {deviceName}
          </Text>
          <div className="flex items-center justify-center gap-2 mt-1">
            <WifiOutlined 
              style={{ 
                color: isConnected ? '#52c41a' : '#f5222d',
                fontSize: '12px'
              }} 
            />
            <Text style={{ fontSize: '11px', color: '#666' }}>
              {isConnected ? 'Подключено' : 'Отключено'}
            </Text>
          </div>
        </div>

        {/* Основные параметры */}
        <Row gutter={[12, 12]}>
          {/* Батарея */}
          <Col span={12}>
            <div className="text-center p-3 bg-gray-50 rounded border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ThunderboltOutlined 
                  style={{ color: batteryStatus.color, fontSize: '16px' }} 
                />
                <Text style={{ fontSize: '11px', fontWeight: 'bold' }}>Батарея</Text>
              </div>
              <Progress 
                type="circle" 
                percent={Math.round(battery)} 
                size={60}
                strokeColor={batteryStatus.color}
                format={(percent) => `${percent}%`}
                strokeWidth={8}
              />
              <div className="mt-2">
                <Text style={{ fontSize: '10px', color: '#666' }}>
                  {batteryStatus.status}
                </Text>
              </div>
            </div>
          </Col>

          {/* Сигнал Bluetooth */}
          <Col span={12}>
            <div className="text-center p-3 bg-gray-50 rounded border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <WifiOutlined 
                  style={{ color: signalStatus.color, fontSize: '16px' }} 
                />
                <Text style={{ fontSize: '11px', fontWeight: 'bold' }}>Сигнал</Text>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: signalStatus.color }}>
                {Math.round(signalQuality)}%
              </div>
              <div className="flex justify-center gap-1 mt-1">
                {Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: `${(i + 1) * 3}px`,
                      backgroundColor: i < signalStatus.bars ? signalStatus.color : '#e8e8e8',
                      borderRadius: '1px'
                    }}
                  />
                ))}
              </div>
              <Text style={{ fontSize: '10px', color: '#666' }}>
                {signalStatus.status}
              </Text>
            </div>
          </Col>

          {/* Температура устройства */}
          <Col span={24}>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FireOutlined 
                    style={{ color: tempStatus.color, fontSize: '16px' }} 
                  />
                  <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    Температура устройства
                  </Text>
                </div>
                <Text style={{ fontSize: '10px', color: '#666' }}>
                  {tempStatus.status}
                </Text>
              </div>
              
              <div className="flex items-center justify-between">
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: tempStatus.color 
                }}>
                  {temperature.toFixed(1)}°C
                </div>
                
                <Progress 
                  percent={Math.round(((temperature - 35) / 3) * 100)} 
                  size="small"
                  strokeColor={tempStatus.color}
                  showInfo={false}
                  style={{ width: '60%' }}
                />
              </div>
              
              <div className="flex justify-between mt-1" style={{ fontSize: '9px', color: '#999' }}>
                <span>35°C</span>
                <span>Норма: 35.5-37.5°C</span>
                <span>38°C</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Дополнительная информация */}
        <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
          <Text style={{ fontSize: '11px', color: '#666' }}>
            Последнее обновление: {new Date(lastUpdate).toLocaleTimeString('ru-RU')}
          </Text>
          <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
            Bluetooth 5.0 • Авт. обновление каждые 3 сек
          </div>
        </div>

        {/* Статистика работы - компактно */}
        <div className="mt-3 p-3 bg-gray-50 rounded border">
          <Text style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '8px', display: 'block' }}>
            📊 Статистика работы
          </Text>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <div className="text-center">
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                  {sessionsToday}
                </div>
                <Text style={{ fontSize: '9px', color: '#666' }}>сеансов сегодня</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="text-center">
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                  {formatUptime(deviceUptime)}
                </div>
                <Text style={{ fontSize: '9px', color: '#666' }}>время работы</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="text-center">
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: dataQuality > 90 ? '#52c41a' : '#fa8c16' }}>
                  {dataQuality}%
                </div>
                <Text style={{ fontSize: '9px', color: '#666' }}>качество данных</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="text-center">
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: alertsToday > 0 ? '#fa8c16' : '#52c41a' }}>
                  {alertsToday}
                </div>
                <Text style={{ fontSize: '9px', color: '#666' }}>уведомлений</Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Предупреждения */}
        {(battery < 30 || signalQuality < 50 || !isConnected) && (
          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
            <Text style={{ fontSize: '11px', color: '#d46b08', fontWeight: 'bold' }}>
              ⚠️ Требует внимания:
            </Text>
            <div style={{ fontSize: '10px', color: '#d46b08', marginTop: '2px' }}>
              {battery < 30 && '• Низкий заряд батареи'}
              {signalQuality < 50 && '• Слабый сигнал Bluetooth'}
              {!isConnected && '• Устройство отключено'}
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default DeviceStatus;