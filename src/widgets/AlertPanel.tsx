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
        <Space>
          <BellOutlined style={{ color: colors.primary }} />
          <Title level={4} className="!mb-0">Уведомления устройства</Title>
          {activeAlerts.length > 0 && (
            <Badge count={activeAlerts.length} />
          )}
        </Space>
      }
      className={className}
      size="small"
      bodyStyle={{ padding: '12px' }}
    >
      {/* Краткая статистика */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-gray-50 rounded">
        <div className="text-center">
          <div className={`text-lg font-bold ${criticalCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {criticalCount}
          </div>
          <Text style={{ fontSize: '10px' }} type="secondary">Критичных</Text>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${warningCount > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
            {warningCount}
          </div>
          <Text style={{ fontSize: '10px' }} type="secondary">Предупреждений</Text>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${activeAlerts.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
            {activeAlerts.length}
          </div>
          <Text style={{ fontSize: '10px' }} type="secondary">Активных</Text>
        </div>
      </div>

      {/* Активные уведомления */}
      {activeAlerts.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
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
                  className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all
                    ${alert.level === 'critical' ? 'bg-red-50 border-l-red-500' : 
                      alert.level === 'warning' ? 'bg-orange-50 border-l-orange-400' : 
                      'bg-blue-50 border-l-blue-400'}
                  `}
                  onClick={() => handleResolveAlert(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Иконка типа */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: alertType.color }}
                    >
                      {alertType.icon}
                    </div>
                    
                    {/* Содержимое */}
                    <div className="flex-1 min-w-0">
                      {/* Заголовок */}
                      <div className="flex items-center justify-between mb-1">
                        <Tag 
                          color={alertLevel.color} 
                          className="text-xs font-bold px-2 py-0"
                        >
                          {alertLevel.text}
                        </Tag>
                        <Text className="text-xs text-gray-400">
                          {formatTimeAgo(alert.timestamp)}
                        </Text>
                      </div>
                      
                      {/* Название */}
                      <Text strong className="text-sm block mb-1">
                        {alert.title}
                      </Text>
                      
                      {/* Описание */}
                      <Text className="text-xs text-gray-600 block mb-2">
                        {alert.description}
                      </Text>
                      
                      {/* Значение, если есть */}
                      {alert.value && (
                        <div className="flex items-center justify-between">
                          <Text className="text-xs text-gray-500">
                            Значение: <span className="font-bold" style={{ color: alertType.color }}>
                              {alert.value}
                              {alert.type === 'battery' || alert.type === 'signal' ? '%' : 
                               alert.type === 'fetal' ? ' bpm' : 
                               alert.type === 'temperature' ? '°C' : ''}
                            </span>
                          </Text>
                          <Button size="small" type="text" className="text-xs">
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
        <Alert
          message="Уведомлений нет"
          description="Устройство работает нормально"
          type="success"
          showIcon
          className="text-sm"
        />
      )}

      {/* История (свернуто) */}
      {resolvedAlerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Text type="secondary" className="text-xs">
            Решено сегодня: {resolvedAlerts.length} уведомлений
          </Text>
        </div>
      )}

      {/* Подсказка */}
      <div className="mt-4 p-2 bg-blue-50 rounded text-center">
        <Text className="text-xs text-blue-700">
          💡 Нажмите на уведомление, чтобы отметить его как решённое
        </Text>
      </div>
    </Card>
  );
}
