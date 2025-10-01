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
import { colors } from '../theme';

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
      description: 'Bluetooth соединение нестабильно (42%).',
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
            >
              <BellOutlined style={{ fontSize: '12px' }} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#831843' }}>Уведомления</span>
          </div>
          {activeAlerts.length > 0 && (
            <Badge 
              count={activeAlerts.length} 
              style={{ backgroundColor: '#ec4899', color: 'white' }}
            />
          )}
        </div>
      }
      className={className}
      size="small"
      bodyStyle={{ padding: '10px' }}
      headStyle={{ 
        padding: '6px 12px', 
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        borderBottom: '1px solid #f3e8ff'
      }}
    >
      {/* Краткая статистика в розовой палитре */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-2 rounded-lg" style={{ 
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        border: '1px solid #f3e8ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: criticalCount > 0 ? '#dc2626' : '#a21caf',
            fontSize: 20,
            fontWeight: 'bold'
          }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: 10, color: '#831843' }}>Критических</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: warningCount > 0 ? '#d97706' : '#a21caf',
            fontSize: 20,
            fontWeight: 'bold'
          }}>
            {warningCount}
          </div>
          <div style={{ fontSize: 10, color: '#831843' }}>Предупреждений</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: activeAlerts.length > 0 ? '#ec4899' : '#a21caf',
            fontSize: 20,
            fontWeight: 'bold'
          }}>
            {activeAlerts.length}
          </div>
          <div style={{ fontSize: 10, color: '#831843' }}>Активных</div>
        </div>
      </div>

      {/* Активные уведомления в розовой палитре */}
      {activeAlerts.length > 0 ? (
        <div className="space-y-1 max-h-72 overflow-y-auto">
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
                  className="p-1.5 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all"
                  style={{
                    backgroundColor: alert.level === 'critical' ? '#fef2f2' : 
                                   alert.level === 'warning' ? '#fffbeb' : '#fef7ff',
                    borderLeftColor: alert.level === 'critical' ? '#dc2626' : 
                                   alert.level === 'warning' ? '#d97706' : '#ec4899',
                    lineHeight: '1.2'
                  }}
                  onClick={() => handleResolveAlert(alert.id)}
                >
                  <div className="flex items-start gap-1.5">
                    {/* Иконка типа */}
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#ec4899', fontSize: '10px' }}
                    >
                      {alertType.icon}
                    </div>
                    
                    {/* Содержимое */}
                    <div className="flex-1 min-w-0">
                      {/* Заголовок */}
                      <div className="flex items-center justify-between mb-0.5">
                        <Tag 
                          className="font-bold px-1.5 py-0.5"
                          style={{
                            fontSize: '8px',
                            backgroundColor: alert.level === 'critical' ? '#fecaca' : 
                                           alert.level === 'warning' ? '#fed7aa' : '#f3e8ff',
                            color: alert.level === 'critical' ? '#991b1b' : 
                                 alert.level === 'warning' ? '#92400e' : '#831843',
                            border: `1px solid ${
                              alert.level === 'critical' ? '#dc2626' : 
                              alert.level === 'warning' ? '#d97706' : '#ec4899'
                            }`,
                            lineHeight: '1'
                          }}
                        >
                          {alertLevel.text}
                        </Tag>
                        <Text style={{ fontSize: '8px', color: '#831843', opacity: 0.7, lineHeight: '1.1' }}>
                          {formatTimeAgo(alert.timestamp)}
                        </Text>
                      </div>
                      
                      {/* Название */}
                      <Text strong className="block mb-0.5" style={{ fontSize: '9px', color: '#831843', lineHeight: '1.1' }}>
                        {alert.title}
                      </Text>
                      
                      {/* Описание */}
                      <Text className="block mb-0.5" style={{ fontSize: '8px', color: '#831843', opacity: 0.8, lineHeight: '1.1' }}>
                        {alert.description}
                      </Text>
                      
                      {/* Значение, если есть */}
                      {alert.value && (
                        <div className="flex items-center justify-between mt-0.5">
                          <Text style={{ fontSize: '8px', color: '#831843', opacity: 0.7, lineHeight: '1.1' }}>
                            Значение: <span className="font-bold" style={{ color: '#ec4899' }}>
                              {alert.value}
                              {alert.type === 'battery' || alert.type === 'signal' ? '%' : 
                               alert.type === 'fetal' ? ' bpm' : 
                               alert.type === 'temperature' ? '°C' : ''}
                            </span>
                          </Text>
                          <Button size="small" type="text" style={{ fontSize: '8px', color: '#ec4899', padding: '0 4px', lineHeight: '1.1' }}>
                            Отметить ✓
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="p-3 rounded-lg text-center" style={{ 
          backgroundColor: '#fef7ff',
          border: '1px solid #f3e8ff'
        }}>
          <CheckCircleOutlined style={{ fontSize: '24px', color: '#22c55e', marginBottom: '8px' }} />
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#831843', marginBottom: '4px' }}>
            Уведомлений нет
          </div>
          <div style={{ fontSize: '11px', color: '#831843', opacity: 0.7 }}>
            Устройство работает нормально
          </div>
        </div>
      )}

      {/* История (свернуто) в розовой палитре */}
      {resolvedAlerts.length > 0 && (
        <div className="mt-3 pt-2 border-t" style={{ borderColor: '#f3e8ff' }}>
          <Text className="text-xs" style={{ color: '#831843', opacity: 0.7 }}>
            Решено сегодня: {resolvedAlerts.length} уведомлений
          </Text>
        </div>
      )}

    </Card>
  );
}
