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
  deviceUptime = 240,
  dataQuality = 94,
  alertsToday = 2
}) => {
  // Форматирование времени работы (минуты в часы:минуты)
  const formatUptime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}ч`;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <div 
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
              }}
            >
              <SettingOutlined style={{ fontSize: typography.fontSize.sm }} />
            </div>
            <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
              MoniPuck v2.1
            </span>
          </Space>
          <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isConnected ? colors.primary : colors.error,
              animation: isConnected ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }}></div>
            <Tag 
              icon={overallStatus.icon}
              style={{ 
                fontSize: typography.fontSize.xs,
                padding: '2px 8px',
                margin: 0,
                border: 'none',
                background: overallStatus.color === colors.success ? `${colors.success}10` : 
                           overallStatus.color === colors.warning ? `${colors.warning}10` : `${colors.error}10`,
                color: overallStatus.color === colors.success ? colors.success : 
                       overallStatus.color === colors.warning ? colors.warning : colors.error,
                fontWeight: typography.fontWeight.semibold
              }}
            >
              {overallStatus.status}
            </Tag>
          </div>
        </div>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ padding: typography.spacing.md, height: '100%', display: 'flex', flexDirection: 'column' }}
      headStyle={{ 
        padding: `${typography.spacing.sm} ${typography.spacing.md}`, 
        minHeight: '48px',
        background: colors.primaryPale,
        borderBottom: `1px solid ${colors.border.light}`
      }}
    >
      <Space direction="vertical" size="small" className="w-full">
        {/* Компактные основные параметры в одну строку */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: typography.spacing.sm,
          padding: typography.spacing.md,
          borderRadius: '8px',
          background: colors.primaryPale,
          border: `1px solid ${colors.border.light}`
        }}>
          {/* Батарея */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: typography.spacing.xs, marginBottom: typography.spacing.sm }}>
              <ThunderboltOutlined style={{ color: colors.primary, fontSize: typography.fontSize.sm }} />
              <span style={{ fontSize: typography.fontSize.xs, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                Батарея
              </span>
            </div>
            <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: batteryStatus.color }}>
              {Math.round(battery)}%
            </div>
            <div style={{ height: '6px', background: colors.primaryLighter, borderRadius: '999px', marginTop: typography.spacing.sm, overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%',
                  width: `${battery}%`,
                  transition: 'all 0.5s',
                  borderRadius: '999px',
                  backgroundColor: battery > 50 ? colors.primary : battery > 20 ? colors.warning : colors.error
                }}
              />
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary, marginTop: typography.spacing.xs }}>
              {batteryStatus.status}
            </div>
          </div>

          {/* Сигнал */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: typography.spacing.xs, marginBottom: typography.spacing.sm }}>
              <WifiOutlined style={{ color: colors.primary, fontSize: typography.fontSize.sm }} />
              <span style={{ fontSize: typography.fontSize.xs, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>Bluetooth</span>
            </div>
            <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: signalStatus.color }}>
              {Math.round(signalQuality)}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: typography.spacing.sm }}>
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: `${(i + 1) * 3 + 4}px`,
                    borderRadius: '999px',
                    transition: 'all 0.3s',
                    backgroundColor: i < signalStatus.bars ? colors.primary : colors.primaryLighter
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary, marginTop: typography.spacing.xs }}>
              {signalStatus.status}
            </div>
          </div>

          {/* Температура */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: typography.spacing.xs, marginBottom: typography.spacing.sm }}>
              <FireOutlined style={{ color: colors.primary, fontSize: typography.fontSize.sm }} />
              <span style={{ fontSize: typography.fontSize.xs, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>Температура</span>
            </div>
            <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: tempStatus.color }}>
              {temperature.toFixed(1)}°C
            </div>
            <div style={{ height: '6px', background: colors.primaryLighter, borderRadius: '999px', marginTop: typography.spacing.sm, overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, ((temperature - 35) / 3) * 100))}%`,
                  transition: 'all 0.5s',
                  borderRadius: '999px',
                  backgroundColor: temperature >= 35.5 && temperature <= 37.5 ? colors.primary : colors.warning
                }}
              />
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary, marginTop: typography.spacing.xs }}>
              {tempStatus.status}
            </div>
          </div>
        </div>

        {/* Компактная статистика */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: typography.spacing.sm
        }}>
          <div style={{ 
            padding: typography.spacing.sm,
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: colors.primaryPale,
            border: `1px solid ${colors.border.light}`
          }}>
            <div style={{ 
              fontSize: typography.fontSize.lg, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.primary 
            }}>
              {sessionsToday}
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>сеансов</div>
          </div>

          <div style={{ 
            padding: typography.spacing.sm,
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: colors.primaryPale,
            border: `1px solid ${colors.border.light}`
          }}>
            <div style={{ 
              fontSize: typography.fontSize.lg, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.primary 
            }}>
              {formatUptime(deviceUptime)}
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>работы</div>
          </div>

          <div style={{ 
            padding: typography.spacing.sm,
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: colors.primaryPale,
            border: `1px solid ${colors.border.light}`
          }}>
            <div style={{ 
              fontSize: typography.fontSize.lg, 
              fontWeight: typography.fontWeight.bold, 
              color: dataQuality > 90 ? colors.primary : colors.warning 
            }}>
              {dataQuality}%
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>качество</div>
          </div>

          <div style={{ 
            padding: typography.spacing.sm,
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: colors.primaryPale,
            border: `1px solid ${colors.border.light}`
          }}>
            <div style={{ 
              fontSize: typography.fontSize.lg, 
              fontWeight: typography.fontWeight.bold, 
              color: alertsToday > 0 ? colors.error : colors.primary 
            }}>
              {alertsToday}
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>уведомл.</div>
          </div>
        </div>

        {/* Статус подключения */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${typography.spacing.sm} ${typography.spacing.md}`,
          borderRadius: '8px',
          backgroundColor: isConnected ? colors.primaryPale : `${colors.error}10`,
          border: `1px solid ${isConnected ? colors.border.light : colors.error}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? colors.primary : colors.error,
              animation: isConnected ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }}></div>
            <span style={{ 
              fontSize: typography.fontSize.xs, 
              color: isConnected ? colors.text.primary : colors.error, 
              fontWeight: typography.fontWeight.semibold 
            }}>
              {deviceName} • {isConnected ? 'Подключено' : 'Отключено'}
            </span>
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
            {new Date(lastUpdate).toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>

        {/* Предупреждения */}
        {(battery < 30 || signalQuality < 50) && isConnected && (
          <div style={{ 
            padding: typography.spacing.sm,
            borderRadius: '8px',
            backgroundColor: `${colors.error}10`, 
            border: `1px solid ${colors.error}` 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
              <ExclamationCircleOutlined style={{ 
                color: colors.error, 
                fontSize: typography.fontSize.xs 
              }} />
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.error, 
                fontWeight: typography.fontWeight.semibold 
              }}>
                {battery < 30 ? 'Разряжается' : ''}
                {battery < 30 && signalQuality < 50 ? ' • ' : ''}
                {signalQuality < 50 ? 'Слабый сигнал' : ''}
              </div>
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default DeviceStatus;