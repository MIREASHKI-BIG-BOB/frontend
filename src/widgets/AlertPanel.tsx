import { useState, useEffect } from 'react';
import { Card, Alert, Badge, Button, List, Typography, Space, Tag, Collapse } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, BellOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { Alert as AlertType, AlertLevel, AlertSystem } from '../utils/AlertSystem';
import { colors, typography } from '../theme';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface AlertPanelProps {
  alertSystem: AlertSystem;
  className?: string;
}

const LEVEL_CONFIG = {
  critical: { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Критично' },
  danger: { color: 'volcano', icon: <ExclamationCircleOutlined />, text: 'Опасно' },
  warning: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Внимание' },
  info: { color: 'blue', icon: <BellOutlined />, text: 'Информация' }
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes} мин назад`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ч назад`;
  return date.toLocaleString('ru-RU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AlertPanel({ alertSystem, className }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [statsCollapsed, setStatsCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = alertSystem.subscribe((newAlerts) => {
      setAlerts([...newAlerts]); // создаем новый массив для ререндера
    });
    
    // Получаем текущие тревоги
    setAlerts(alertSystem.getAllAlerts());
    
    return unsubscribe;
  }, [alertSystem]);
  
  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);
  const criticalCount = activeAlerts.filter(alert => alert.level === 'critical').length;
  const warningCount = activeAlerts.filter(alert => alert.level === 'warning' || alert.level === 'danger').length;
  
  const handleResolveAlert = (alertId: string) => {
    alertSystem.resolveAlert(alertId);
  };

  return (
    <Card 
      title={
        <Space>
          <BellOutlined />
          <Title level={4} className="!mb-0">Система тревог</Title>
          {activeAlerts.length > 0 && (
            <Badge count={activeAlerts.length} showZero={false} />
          )}
        </Space>
      }
      className={className}
      size="small"
    >
      {/* Общая статистика - сворачиваемая */}
      <div className="mb-4">
        <Button 
          type="text" 
          size="small"
          className="w-full p-2 text-left hover:bg-gray-50"
          onClick={() => setStatsCollapsed(!statsCollapsed)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 flex-1 mr-2">
              <div className="text-center flex-1 min-w-0">
                <Text className="block truncate" style={typography.styles.caption}>Критичные</Text>
                <Text className={`text-sm font-bold ${criticalCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {criticalCount}
                </Text>
              </div>
              <div className="text-center flex-1 min-w-0">
                <Text className="block truncate" style={typography.styles.caption}>Предупр.</Text>
                <Text className={`text-sm font-bold ${warningCount > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                  {warningCount}
                </Text>
              </div>
              <div className="text-center flex-1 min-w-0">
                <Text className="block truncate" style={typography.styles.caption}>Всего</Text>
                <Text className={`text-sm font-bold ${activeAlerts.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {activeAlerts.length}
                </Text>
              </div>
            </div>
            {statsCollapsed ? <DownOutlined className="text-gray-400 flex-shrink-0" /> : <UpOutlined className="text-gray-400 flex-shrink-0" />}
          </div>
        </Button>
        
        {!statsCollapsed && (
          <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Критичные тревоги требуют немедленного вмешательства</div>
              <div>• Предупреждения - контроль состояния пациентки</div>
              <div>• Последнее обновление: {new Date().toLocaleTimeString('ru-RU')}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Активные тревоги */}
      {activeAlerts.length > 0 ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <Title level={5} className="!mb-0">Активные тревоги</Title>
            <Badge count={activeAlerts.length} showZero={false} />
          </div>
          
          <div className="max-h-80 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            <div className="space-y-2">
              {activeAlerts
                .sort((a, b) => {
                  if (a.level !== b.level) {
                    const priority = { critical: 4, danger: 3, warning: 2, info: 1 };
                    return priority[b.level] - priority[a.level];
                  }
                  return b.timestamp.getTime() - a.timestamp.getTime();
                })
                .map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`
                      border-l-4 bg-white rounded-r p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-gray-50
                      ${alert.level === 'critical' ? 'border-l-red-500' : 
                        alert.level === 'warning' ? 'border-l-orange-400' : 
                        'border-l-blue-400'}
                    `}
                    onClick={() => {
                      // Переход на страницу уведомлений
                      window.location.href = 'http://localhost:5173/notifications#/notifications';
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        {/* Компактный заголовок */}
                        <div className="flex items-center justify-between mb-1">
                          <Text className={`text-xs font-semibold uppercase tracking-wide
                            ${alert.level === 'critical' ? 'text-red-600' : 
                              alert.level === 'warning' ? 'text-orange-600' : 'text-blue-600'}
                          `}>
                            {LEVEL_CONFIG[alert.level].text}
                          </Text>
                          <Text className="text-xs text-gray-400">
                            {formatTimeAgo(alert.timestamp)}
                          </Text>
                        </div>
                        
                        {/* Название */}
                        <Text strong className="text-gray-800 text-sm block mb-0.5">
                          {alert.title}
                        </Text>
                        
                        {/* Краткое описание */}
                        <Text className="text-xs text-gray-600 leading-tight">
                          {alert.description}
                        </Text>
                      </div>
                      
                      {/* Стрелка для перехода */}
                      <div className="ml-3 text-gray-400 hover:text-gray-600">
                        →
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      ) : (
        <Alert 
          message="Тревог нет" 
          description="Все показатели в пределах нормы" 
          type="success" 
          showIcon 
          className="mb-4 text-sm"
        />
      )}
      
      {/* Решенные тревоги */}
      {resolvedAlerts.length > 0 && (
        <Collapse ghost>
          <Panel 
            header={`История тревог (${resolvedAlerts.length})`} 
            key="history"
          >
            <List
              className="max-h-64 overflow-y-auto"
              size="small"
              dataSource={resolvedAlerts.slice(0, 10)} // показываем только последние 10
              renderItem={(alert) => (
                <List.Item key={alert.id} className="!px-2 !py-2">
                  <div className="w-full">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Tag 
                          color="default" 
                          className="!mr-0 text-xs px-1"
                        >
                          Решено
                        </Tag>
                        <Text className="text-sm line-through opacity-60">
                          {alert.title}
                        </Text>
                      </div>
                      <Text type="secondary" className="text-xs whitespace-nowrap">
                        {formatTimeAgo(alert.timestamp)}
                      </Text>
                    </div>
                    <Text className="text-xs text-gray-600 opacity-60">{alert.description}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
      )}
    </Card>
  );
}