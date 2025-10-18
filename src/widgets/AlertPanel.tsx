import { useState, useEffect } from 'react';
import { Card, Alert, Badge, Button, Typography, Space, Tag } from 'antd';
import { 
  BellOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  FireOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { colors, typography } from '../theme';

const { Text, Title } = Typography;

interface DeviceAlert {
  id: string;
  type: 'battery' | 'signal' | 'temperature' | 'fetal' | 'connection';
  level: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  value?: number;
}

interface AlertPanelProps {
  className?: string;
}

// Конфигурация типов уведомлений
const ALERT_TYPES = {
  battery: { icon: <ThunderboltOutlined />, color: '#fa8c16', name: 'Батарея' },
  signal: { icon: <WifiOutlined />, color: '#1890ff', name: 'Сигнал' },
  temperature: { icon: <FireOutlined />, color: '#f5222d', name: 'Температура' },
  fetal: { icon: <HeartOutlined />, color: '#52c41a', name: 'Плод' },
  connection: { icon: <WifiOutlined />, color: '#722ed1', name: 'Подключение' }
};

// Конфигурация уровней важности
const ALERT_LEVELS = {
  critical: { color: '#f5222d', icon: <ExclamationCircleOutlined />, text: 'КРИТИЧНО' },
  warning: { color: '#fa8c16', icon: <ClockCircleOutlined />, text: 'ВНИМАНИЕ' },
  info: { color: '#1890ff', icon: <CheckCircleOutlined />, text: 'ИНФО' }
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes} мин`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ч`;
  return `${Math.floor(diffHours / 24)} дн`;
}

// Генерация тестовых уведомлений от устройства
function generateDeviceAlerts(): DeviceAlert[] {
  return [
    {
      id: '1',
      type: 'battery',
      level: 'warning',
      title: 'Низкий заряд батареи',
      description: 'Устройство разрядилось до 18%. Подключите зарядку.',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      resolved: false,
      value: 18
    },
    {
      id: '2',
      type: 'fetal',
      level: 'critical',
      title: 'Аномальная ЧСС плода',
      description: 'ЧСС 175 bpm превышает норму. Обратитесь к врачу!',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resolved: false,
      value: 175
    },
    {
      id: '3',
      type: 'signal',
      level: 'warning',
      title: 'Слабый сигнал',
      description: 'WiFi соединение нестабильно (42%).',
      timestamp: new Date(Date.now() - 22 * 60 * 1000),
      resolved: false,
      value: 42
    },
    {
      id: '4',
      type: 'connection',
      level: 'info',
      title: 'Подключение восстановлено',
      description: 'Связь с устройством стабилизирована.',
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      resolved: true
    }
  ];
}

export default function AlertPanel({ className }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<DeviceAlert[]>(generateDeviceAlerts());

  // Симуляция новых уведомлений от устройства
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.15) { // 15% шанс нового уведомления
        const types: (keyof typeof ALERT_TYPES)[] = ['battery', 'signal', 'temperature', 'fetal', 'connection'];
        const levels: (keyof typeof ALERT_LEVELS)[] = ['critical', 'warning', 'info'];
        
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        
        const newAlert: DeviceAlert = {
          id: Date.now().toString(),
          type: randomType,
          level: randomLevel,
          title: `${ALERT_TYPES[randomType].name}: новое уведомление`,
          description: 'Автоматически сгенерированное уведомление от устройства.',
          timestamp: new Date(),
          resolved: false,
          value: Math.floor(Math.random() * 100)
        };
        
        setAlerts(prev => [newAlert, ...prev.slice(0, 15)]);
      }
    }, 20000); // Каждые 20 секунд

    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);
  const criticalCount = activeAlerts.filter(alert => alert.level === 'critical').length;
  const warningCount = activeAlerts.filter(alert => alert.level === 'warning').length;

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
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
              <BellOutlined style={{ fontSize: typography.fontSize.sm }} />
            </div>
            <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
              Уведомления
            </span>
          </div>
          {activeAlerts.length > 0 && (
            <Badge 
              count={activeAlerts.length} 
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            />
          )}
        </div>
      }
      className={className}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ padding: typography.spacing.md, height: '100%', display: 'flex', flexDirection: 'column' }}
      headStyle={{ 
        padding: `${typography.spacing.sm} ${typography.spacing.md}`, 
        minHeight: '48px',
        background: colors.primaryPale,
        borderBottom: `1px solid ${colors.border.light}`
      }}
    >
      {/* Краткая статистика */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: typography.spacing.xs,
        marginBottom: typography.spacing.sm,
        padding: typography.spacing.sm,
        borderRadius: '8px',
        background: colors.primaryPale,
        border: `1px solid ${colors.border.light}`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: criticalCount > 0 ? colors.error : colors.text.secondary,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold
          }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>Критических</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: warningCount > 0 ? colors.warning : colors.text.secondary,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold
          }}>
            {warningCount}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>Предупреждений</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: activeAlerts.length > 0 ? colors.primary : colors.text.secondary,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold
          }}>
            {activeAlerts.length}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>Активных</div>
        </div>
      </div>

      {/* Активные уведомления в розовой палитре */}
      {activeAlerts.length > 0 ? (
        <div className="space-y-0.5 max-h-72 overflow-y-auto">
          {activeAlerts
            .sort((a, b) => {
              // Сначала критичные, потом по времени
              if (a.level !== b.level) {
                const priority = { critical: 3, warning: 2, info: 1 };
                return priority[b.level] - priority[a.level];
              }
              return b.timestamp.getTime() - a.timestamp.getTime();
            })
            .map((alert) => {
              const alertType = ALERT_TYPES[alert.type];
              const alertLevel = ALERT_LEVELS[alert.level];
              
              return (
                <div 
                  key={alert.id}
                  style={{
                    padding: typography.spacing.sm,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: alert.level === 'critical' ? `${colors.error}10` : 
                                   alert.level === 'warning' ? `${colors.warning}10` : `${colors.primary}10`,
                    borderLeft: `3px solid ${
                      alert.level === 'critical' ? colors.error : 
                      alert.level === 'warning' ? colors.warning : colors.primary
                    }`
                  }}
                  onClick={() => handleResolveAlert(alert.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: typography.spacing.sm }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Название */}
                      <Text strong style={{   
                        fontSize: typography.fontSize.xs, 
                        color: alert.level === 'critical' ? colors.error : 
                               alert.level === 'warning' ? colors.warning : colors.text.primary,
                        lineHeight: typography.lineHeight.tight,
                        fontWeight: typography.fontWeight.semibold,
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        {alert.title}
                      </Text>
                      
                      {/* Описание */}
                      <Text style={{ 
                        fontSize: typography.fontSize.xs, 
                        color: colors.text.secondary,
                        lineHeight: typography.lineHeight.tight,
                        display: 'block'
                      }}>
                        {alert.description}
                      </Text>
                      
                      {/* Значение, если есть */}
                      {alert.value && (
                        <Text style={{ 
                          fontSize: typography.fontSize.xs, 
                          color: alert.level === 'critical' ? colors.error : colors.primary,
                          lineHeight: typography.lineHeight.tight,
                          display: 'block',
                          marginTop: '4px',
                          fontWeight: typography.fontWeight.semibold
                        }}>
                          Значение: {alert.value}
                          {alert.type === 'battery' || alert.type === 'signal' ? '%' : 
                           alert.type === 'fetal' ? ' bpm' : 
                           alert.type === 'temperature' ? '°C' : ''}
                        </Text>
                      )}
                    </div>
                    
                    {/* Время */}
                    <Text style={{ 
                      fontSize: typography.fontSize.xs, 
                      color: colors.text.tertiary,
                      lineHeight: typography.lineHeight.tight,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {formatTimeAgo(alert.timestamp)}
                    </Text>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div style={{ 
          padding: typography.spacing.md,
          borderRadius: '8px',
          textAlign: 'center',
          backgroundColor: colors.primaryPale,
          border: `1px solid ${colors.border.light}`
        }}>
          <CheckCircleOutlined style={{ 
            fontSize: typography.fontSize['2xl'], 
            color: colors.success, 
            marginBottom: typography.spacing.sm 
          }} />
          <div style={{ 
            fontSize: typography.fontSize.base, 
            fontWeight: typography.fontWeight.semibold, 
            color: colors.text.primary, 
            marginBottom: typography.spacing.xs 
          }}>
            Уведомлений нет
          </div>
          <div style={{ 
            fontSize: typography.fontSize.xs, 
            color: colors.text.secondary
          }}>
            Устройство работает нормально
          </div>
        </div>
      )}

      {/* История */}
      {resolvedAlerts.length > 0 && (
        <div style={{ 
          marginTop: typography.spacing.md, 
          paddingTop: typography.spacing.sm, 
          borderTop: `1px solid ${colors.border.light}` 
        }}>
          <Text style={{ 
            fontSize: typography.fontSize.xs, 
            color: colors.text.secondary 
          }}>
            Решено сегодня: {resolvedAlerts.length} уведомлений
          </Text>
        </div>
      )}

    </Card>
  );
}
