import { Card, List, Badge, Button, Space, Typography, Tag, Divider, Select, Empty, Input, Tooltip, Modal, Descriptions, Row, Col, Avatar, Progress } from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined, 
  SearchOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  MedicineBoxOutlined,
  RobotOutlined,
  HeartOutlined,
  SettingOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useMLWebSocket } from '../hooks/useMLWebSocket';
import React, { useState, useMemo, useEffect } from 'react';
import { colors, typography } from '../theme';

const { Title, Text } = Typography;
const { Option } = Select;

type NotificationLevel = 'info' | 'warning' | 'critical';
type NotificationStatus = 'unread' | 'read';
type NotificationSource = 'ai_analysis' | 'ctg_monitoring' | 'device_status' | 'system';

interface Notification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  status: NotificationStatus;
  timestamp: Date;
  patient?: string;
  source: NotificationSource;
  data?: any;
}

// Демо-данные уведомлений
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'ИИ-анализ: Критические отклонения обнаружены',
    message: 'Пациент: Иванова М.П. - ИИ обнаружил поздние децелерации и признаки брадикардии плода. Оценка: 45/100',
    level: 'critical',
    status: 'unread',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    patient: 'Иванова М.П.',
    source: 'ai_analysis',
    data: {
      score: 45,
      risks: ['Высокий риск гипоксии плода', 'Риск асфиксии при родах'],
      session: 'ctg-003'
    }
  },
  {
    id: '2',
    title: 'КТГ-мониторинг: Тахикардия плода',
    message: 'Пациент: Петрова А.С. - ЧСС плода повышена до 170 уд/мин в течение 12 минут',
    level: 'warning',
    status: 'unread',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    patient: 'Петрова А.С.',
    source: 'ctg_monitoring',
    data: {
      fhr: 170,
      duration: 12,
      baseline: 145
    }
  },
  {
    id: '3',
    title: 'Устройство: Низкий заряд батареи',
    message: 'MoniPuck #001 - заряд батареи снижен до 15%. Рекомендуется замена',
    level: 'warning',
    status: 'unread',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    source: 'device_status',
    data: {
      deviceId: 'MoniPuck #001',
      battery: 15,
      signal: 85
    }
  },
  {
    id: '4',
    title: 'ИИ-анализ: Отличные результаты',
    message: 'Пациент: Сидорова Е.Н. - все показатели в норме. Оценка ИИ: 95/100',
    level: 'info',
    status: 'read',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    patient: 'Сидорова Е.Н.',
    source: 'ai_analysis',
    data: {
      score: 95,
      session: 'ctg-002'
    }
  },
  {
    id: '5',
    title: 'КТГ-мониторинг: Снижение вариабельности',
    message: 'Пациент: Козлова О.И. - вариабельность ЧСС снижена до 6 уд/мин',
    level: 'warning',
    status: 'read',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    patient: 'Козлова О.И.',
    source: 'ctg_monitoring',
    data: {
      variability: 6,
      normal_range: '10-25'
    }
  },
  {
    id: '6',
    title: 'Устройство: Слабый сигнал',
    message: 'MoniPuck #002 - качество сигнала WiFi снижено до 45%',
    level: 'warning',
    status: 'read',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    source: 'device_status',
    data: {
      deviceId: 'MoniPuck #002',
      signal: 45,
      battery: 78
    }
  },
  {
    id: '7',
    title: 'Системное уведомление',
    message: 'Запланировано обновление системы в 23:00. Длительность: ~30 минут',
    level: 'info',
    status: 'read',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    source: 'system'
  },
  {
    id: '8',
    title: 'ИИ-анализ: Требуется внимание',
    message: 'Пациент: Волкова Н.А. - ИИ выявил ранние децелерации. Оценка: 68/100',
    level: 'warning',
    status: 'read',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    patient: 'Волкова Н.А.',
    source: 'ai_analysis',
    data: {
      score: 68,
      risks: ['Риск компрессии пуповины (умеренный)'],
      session: 'ctg-005'
    }
  }
];

const getSourceConfig = (source: NotificationSource) => {
  switch (source) {
    case 'ai_analysis':
      return {
        icon: <RobotOutlined />,
        color: colors.primary,
        gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        label: 'ИИ-анализ',
        bgColor: colors.primaryPale
      };
    case 'ctg_monitoring':
      return {
        icon: <HeartOutlined />,
        color: colors.error,
        gradient: `linear-gradient(135deg, ${colors.error} 0%, #dc2626 100%)`,
        label: 'КТГ-мониторинг',
        bgColor: `${colors.error}10`
      };
    case 'device_status':
      return {
        icon: <SettingOutlined />,
        color: colors.warning,
        gradient: `linear-gradient(135deg, ${colors.warning} 0%, #d97706 100%)`,
        label: 'Устройство',
        bgColor: `${colors.warning}10`
      };
    case 'system':
      return {
        icon: <InfoCircleOutlined />,
        color: colors.info,
        gradient: `linear-gradient(135deg, ${colors.info} 0%, #0891b2 100%)`,
        label: 'Система',
        bgColor: `${colors.info}10`
      };
    default:
      return {
        icon: <BellOutlined />,
        color: colors.text.secondary,
        gradient: colors.text.secondary,
        label: 'Прочее',
        bgColor: colors.background.secondary
      };
  }
};

const getNotificationIcon = (level: 'info' | 'warning' | 'critical') => {
  switch (level) {
    case 'critical':
      return <WarningOutlined style={{ color: colors.error, fontSize: typography.fontSize.sm }} />;
    case 'warning':
      return <ExclamationCircleOutlined style={{ color: colors.warning, fontSize: typography.fontSize.sm }} />;
    case 'info':
    default:
      return <InfoCircleOutlined style={{ color: colors.info, fontSize: typography.fontSize.sm }} />;
  }
};

// Вспомогательные функции
const formatTime = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes} мин назад`;
  } else if (hours < 24) {
    return `${hours} ч назад`;
  } else if (days < 7) {
    return `${days} дн назад`;
  } else {
    return timestamp.toLocaleDateString('ru-RU');
  }
};

export default function Notifications() {
  const { latestData: mlData } = useMLWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sourceFilter, setSourceFilter] = useState<NotificationSource | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Создаем уведомления из реальных ML данных
  useEffect(() => {
    if (!mlData || !mlData.prediction) return;

    const pred = mlData.prediction;
    
    // Создаем уведомление только для критических состояний
    if (pred.hypoxia_risk === 'critical' || pred.hypoxia_risk === 'high') {
      const newNotification: Notification = {
        id: `ml-${Date.now()}`,
        title: `ИИ-анализ: ${pred.hypoxia_risk === 'critical' ? 'КРИТИЧЕСКОЕ' : 'ВЫСОКИЙ РИСК'} состояние`,
        message: `Риск гипоксии: ${Math.round(pred.hypoxia_probability * 100)}%. ${pred.alerts.join(', ')}`,
        level: pred.hypoxia_risk === 'critical' ? 'critical' : 'warning',
        status: 'unread',
        timestamp: new Date(),
        patient: 'Пациент КТГ',
        source: 'ai_analysis',
        data: {
          score: Math.round(pred.hypoxia_probability * 100),
          risks: pred.alerts,
          session: `ctg-${mlData.sensorID?.slice(0, 8)}`
        }
      };

      setNotifications(prev => {
        // Избегаем дублирования - проверяем что последнее уведомление не такое же
        const lastNotification = prev[0];
        if (lastNotification && 
            lastNotification.level === newNotification.level &&
            Date.now() - lastNotification.timestamp.getTime() < 10000) { // Менее 10 секунд
          return prev;
        }
        return [newNotification, ...prev.slice(0, 19)]; // Храним последние 20 уведомлений
      });
    }
  }, [mlData]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Фильтр по источнику
      const matchesSource = sourceFilter === 'all' || notification.source === sourceFilter;
      
      // Фильтр по статусу
      const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
      
      // Фильтр по поиску
      const matchesSearch = searchText === '' || 
        notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchText.toLowerCase()) ||
        (notification.patient && notification.patient.toLowerCase().includes(searchText.toLowerCase()));
      
      return matchesSource && matchesStatus && matchesSearch;
    }).sort((a, b) => {
      // Сначала непрочитанные, потом по времени
      if (a.status !== b.status) {
        return a.status === 'unread' ? -1 : 1;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [notifications, sourceFilter, statusFilter, searchText]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, status: 'read' as const }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const openNotificationDetail = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
    // Автоматически отмечаем как прочитанное при открытии деталей
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
  };

  const closeNotificationDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedNotification(null);
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const sourceCount = (source: NotificationSource) => notifications.filter(n => n.source === source).length;

  return (
    <div style={{ 
      padding: typography.spacing.lg,
      background: colors.background.secondary,
      minHeight: '100vh'
    }}>
      {/* Заголовок страницы */}
      <div style={{
        marginBottom: typography.spacing.lg,
        padding: typography.spacing.lg,
        background: colors.primaryPale,
        borderRadius: '8px',
        border: `1px solid ${colors.border.light}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.md }}>
            <Avatar 
              size={32}
              style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)` }}
              icon={<BellOutlined />}
            />
            <div>
              <Title level={4} style={{ margin: 0, color: colors.text.primary }}>
                Центр уведомлений
                {unreadCount > 0 && (
                  <Badge 
                    count={unreadCount} 
                    style={{ 
                      backgroundColor: colors.error,
                      marginLeft: typography.spacing.sm
                    }}
                  />
                )}
              </Title>
              <Text type="secondary" style={{ fontSize: typography.fontSize.sm }}>
                Уведомления от ИИ-анализа, КТГ-мониторинга и устройств
              </Text>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              type="primary"
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
              style={{
                background: `linear-gradient(135deg, ${colors.success} 0%, #059669 100%)`,
                border: 'none'
              }}
            >
              Прочитать все ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Статистика по источникам */}
      <Row gutter={16} style={{ marginBottom: typography.spacing.lg }}>
        <Col span={6}>
          <Card 
            size="small"
            style={{ 
              background: colors.primaryPale,
              borderColor: colors.border.light
            }}
            bodyStyle={{ padding: typography.spacing.md }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
              <Avatar 
                size={24}
                style={{ background: getSourceConfig('ai_analysis').gradient }}
                icon={getSourceConfig('ai_analysis').icon}
              />
              <div>
                <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                  {sourceCount('ai_analysis')}
                </div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                  ИИ-анализ
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            size="small"
            style={{ 
              background: `${colors.error}10`,
              borderColor: colors.error
            }}
            bodyStyle={{ padding: typography.spacing.md }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
              <Avatar 
                size={24}
                style={{ background: getSourceConfig('ctg_monitoring').gradient }}
                icon={getSourceConfig('ctg_monitoring').icon}
              />
              <div>
                <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                  {sourceCount('ctg_monitoring')}
                </div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                  КТГ-мониторинг
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            size="small"
            style={{ 
              background: `${colors.warning}10`,
              borderColor: colors.warning
            }}
            bodyStyle={{ padding: typography.spacing.md }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
              <Avatar 
                size={24}
                style={{ background: getSourceConfig('device_status').gradient }}
                icon={getSourceConfig('device_status').icon}
              />
              <div>
                <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                  {sourceCount('device_status')}
                </div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                  Устройства
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            size="small"
            style={{ 
              background: `${colors.info}10`,
              borderColor: colors.info
            }}
            bodyStyle={{ padding: typography.spacing.md }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
              <Avatar 
                size={24}
                style={{ background: getSourceConfig('system').gradient }}
                icon={getSourceConfig('system').icon}
              />
              <div>
                <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                  {sourceCount('system')}
                </div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                  Система
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Фильтры и поиск */}
      <Card 
        size="small"
        style={{ marginBottom: typography.spacing.lg }}
        bodyStyle={{ padding: typography.spacing.md }}
      >
        <Row gutter={16} align="middle">
          <Col span={6}>
            <div style={{ marginBottom: typography.spacing.xs }}>
              <Text style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
                Источник:
              </Text>
            </div>
            <Select
              value={sourceFilter}
              onChange={setSourceFilter}
              style={{ width: '100%' }}
              size="small"
            >
              <Option value="all">Все источники</Option>
              <Option value="ai_analysis">ИИ-анализ</Option>
              <Option value="ctg_monitoring">КТГ-мониторинг</Option>
              <Option value="device_status">Устройства</Option>
              <Option value="system">Система</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: typography.spacing.xs }}>
              <Text style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
                Статус:
              </Text>
            </div>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              size="small"
            >
              <Option value="all">Все уведомления</Option>
              <Option value="unread">Новые ({unreadCount})</Option>
              <Option value="read">Прочитанные</Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: typography.spacing.xs }}>
              <Text style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
                Поиск:
              </Text>
            </div>
            <Input
              placeholder="Поиск по уведомлениям или пациентам..."
              prefix={<SearchOutlined style={{ color: colors.text.tertiary }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="small"
            />
          </Col>
        </Row>
      </Card>

      {/* Список уведомлений */}
      {filteredNotifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: typography.spacing.sm }}>
          {filteredNotifications.map((notification) => {
            const sourceConfig = getSourceConfig(notification.source);
            return (
              <Card
                key={notification.id}
                size="small"
                style={{
                  borderRadius: '8px',
                  borderLeft: `4px solid ${
                    notification.level === 'critical' ? colors.error :
                    notification.level === 'warning' ? colors.warning : colors.success
                  }`,
                  background: notification.status === 'unread' ? colors.primaryPale : colors.background.primary,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: notification.status === 'read' ? 0.8 : 1
                }}
                bodyStyle={{ padding: typography.spacing.md }}
                onClick={() => openNotificationDetail(notification)}
                hoverable
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: typography.spacing.md, flex: 1 }}>
                    {/* Иконка источника */}
                    <Avatar 
                      size={32}
                      style={{ 
                        background: sourceConfig.gradient,
                        flexShrink: 0
                      }}
                      icon={sourceConfig.icon}
                    />
                    
                    {/* Контент уведомления */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Заголовок с тегами */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: typography.spacing.sm, marginBottom: typography.spacing.xs }}>
                        <Text 
                          strong 
                          style={{
                            fontSize: typography.fontSize.base,
                            color: colors.text.primary,
                            lineHeight: typography.lineHeight.tight,
                            flex: 1
                          }}
                        >
                          {notification.title}
                        </Text>
                        {notification.status === 'unread' && (
                          <Badge status="processing" />
                        )}
                        {getNotificationIcon(notification.level)}
                      </div>
                      
                      {/* Сообщение */}
                      <Text 
                        style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.text.secondary,
                          lineHeight: typography.lineHeight.relaxed,
                          display: 'block',
                          marginBottom: typography.spacing.sm
                        }}
                      >
                        {notification.message}
                      </Text>
                      
                      {/* Метаинформация */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.md, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.xs }}>
                          <ClockCircleOutlined style={{ color: colors.text.tertiary, fontSize: typography.fontSize.xs }} />
                          <Text style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                            {formatTime(notification.timestamp)}
                          </Text>
                        </div>
                        
                        {notification.patient && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.xs }}>
                            <UserOutlined style={{ color: colors.text.tertiary, fontSize: typography.fontSize.xs }} />
                            <Text style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                              {notification.patient}
                            </Text>
                          </div>
                        )}
                        
                        <Tag 
                          style={{
                            fontSize: typography.fontSize.xs,
                            border: 'none',
                            background: sourceConfig.bgColor,
                            color: sourceConfig.color
                          }}
                        >
                          {sourceConfig.label}
                        </Tag>

                        {/* Дополнительная информация в зависимости от типа */}
                        {notification.source === 'ai_analysis' && notification.data?.score && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.xs }}>
                            <ThunderboltOutlined style={{ color: colors.primary, fontSize: typography.fontSize.xs }} />
                            <Text style={{ fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.semibold }}>
                              Оценка: {notification.data.score}/100
                            </Text>
                          </div>
                        )}

                        {notification.source === 'ctg_monitoring' && notification.data?.fhr && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.xs }}>
                            <HeartOutlined style={{ color: colors.error, fontSize: typography.fontSize.xs }} />
                            <Text style={{ fontSize: typography.fontSize.xs, color: colors.error, fontWeight: typography.fontWeight.semibold }}>
                              ЧСС: {notification.data.fhr} уд/мин
                            </Text>
                          </div>
                        )}

                        {notification.source === 'device_status' && notification.data?.battery && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.xs }}>
                            <SettingOutlined style={{ color: colors.warning, fontSize: typography.fontSize.xs }} />
                            <Text style={{ fontSize: typography.fontSize.xs, color: colors.warning, fontWeight: typography.fontWeight.semibold }}>
                              Батарея: {notification.data.battery}%
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Действия */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.xs, marginLeft: typography.spacing.md }}>
                    <Tooltip title={notification.status === 'read' ? 'Прочитано' : 'Отметить как прочитанное'}>
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        disabled={notification.status === 'read'}
                        style={{ 
                          color: notification.status === 'read' ? colors.success : colors.text.secondary 
                        }}
                      />
                    </Tooltip>
                    
                    <Tooltip title="Удалить">
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        style={{ color: colors.error }}
                      />
                    </Tooltip>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text style={{ color: colors.text.secondary }}>
                {searchText ? 'По вашему запросу ничего не найдено' :
                 sourceFilter !== 'all' ? `Нет уведомлений от источника "${getSourceConfig(sourceFilter as NotificationSource).label}"` :
                 statusFilter === 'unread' ? 'Нет новых уведомлений' : 'Нет уведомлений'}
              </Text>
            }
          />
        </Card>
      )}
      
      {/* Модальное окно с детальной информацией */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.md }}>
            {selectedNotification && (
              <>
                <Avatar 
                  size={24}
                  style={{ background: getSourceConfig(selectedNotification.source).gradient }}
                  icon={getSourceConfig(selectedNotification.source).icon}
                />
                <span style={{ fontSize: typography.fontSize.lg, color: colors.text.primary }}>
                  Детали уведомления
                </span>
                <Tag 
                  style={{
                    background: selectedNotification.level === 'critical' ? `${colors.error}10` :
                               selectedNotification.level === 'warning' ? `${colors.warning}10` : `${colors.success}10`,
                    color: selectedNotification.level === 'critical' ? colors.error :
                           selectedNotification.level === 'warning' ? colors.warning : colors.success,
                    border: 'none'
                  }}
                >
                  {selectedNotification.level === 'critical' ? 'Критично' : 
                   selectedNotification.level === 'warning' ? 'Внимание' : 'Норма'}
                </Tag>
              </>
            )}
          </div>
        }
        open={isDetailModalOpen}
        onCancel={closeNotificationDetail}
        width={700}
        footer={[
          <Button key="close" onClick={closeNotificationDetail}>
            Закрыть
          </Button>,
          selectedNotification && selectedNotification.status === 'unread' && (
            <Button 
              key="mark-read" 
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                markAsRead(selectedNotification.id);
                closeNotificationDetail();
              }}
              style={{
                background: `linear-gradient(135deg, ${colors.success} 0%, #059669 100%)`,
                border: 'none'
              }}
            >
              Отметить как прочитанное
            </Button>
          ),
          <Button 
            key="delete" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (selectedNotification) {
                deleteNotification(selectedNotification.id);
                closeNotificationDetail();
              }
            }}
            style={{ color: colors.error, borderColor: colors.error }}
          >
            Удалить
          </Button>
        ]}
      >
        {selectedNotification && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: typography.spacing.lg }}>
            {/* Основная информация */}
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: typography.spacing.sm, color: colors.text.primary }}>
                {selectedNotification.title}
              </Title>
              <Text style={{ 
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed
              }}>
                {selectedNotification.message}
              </Text>
            </div>

            {/* Общая информация */}
            <Descriptions 
              bordered 
              size="small" 
              column={2}
              title="Общая информация"
            >
              <Descriptions.Item label="Время" span={1}>
                <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
                  <ClockCircleOutlined />
                  <span>{selectedNotification.timestamp.toLocaleString('ru-RU')}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Статус" span={1}>
                <Badge 
                  status={selectedNotification.status === 'unread' ? 'processing' : 'success'} 
                  text={selectedNotification.status === 'unread' ? 'Новое' : 'Прочитано'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Источник" span={1}>
                <Tag style={{
                  background: getSourceConfig(selectedNotification.source).bgColor,
                  color: getSourceConfig(selectedNotification.source).color,
                  border: 'none'
                }}>
                  {getSourceConfig(selectedNotification.source).label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Уровень" span={1}>
                <Tag style={{
                  background: selectedNotification.level === 'critical' ? `${colors.error}10` :
                             selectedNotification.level === 'warning' ? `${colors.warning}10` : `${colors.success}10`,
                  color: selectedNotification.level === 'critical' ? colors.error :
                         selectedNotification.level === 'warning' ? colors.warning : colors.success,
                  border: 'none'
                }}>
                  {selectedNotification.level === 'critical' ? 'Критичный' : 
                   selectedNotification.level === 'warning' ? 'Предупреждение' : 'Информационный'}
                </Tag>
              </Descriptions.Item>
              {selectedNotification.patient && (
                <Descriptions.Item label="Пациент" span={2}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: typography.spacing.sm }}>
                    <UserOutlined />
                    <span>{selectedNotification.patient}</span>
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Специфичная для типа информация */}
            {selectedNotification.source === 'ai_analysis' && selectedNotification.data && (
              <div>
                <Title level={5} style={{ marginBottom: typography.spacing.md, color: colors.text.primary }}>
                  Данные ИИ-анализа
                </Title>
                <div style={{ 
                  background: colors.primaryPale,
                  padding: typography.spacing.md,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.light}`
                }}>
                  {selectedNotification.data.score && (
                    <div style={{ marginBottom: typography.spacing.md }}>
                      <Text strong style={{ fontSize: typography.fontSize.sm }}>Оценка ИИ:</Text>
                      <div style={{ marginTop: typography.spacing.sm }}>
                        <Progress
                          percent={selectedNotification.data.score}
                          strokeColor={
                            selectedNotification.data.score >= 80 ? colors.success :
                            selectedNotification.data.score >= 60 ? colors.warning : colors.error
                          }
                          size="small"
                        />
                      </div>
                    </div>
                  )}
                  {selectedNotification.data.risks && (
                    <div>
                      <Text strong style={{ fontSize: typography.fontSize.sm }}>Выявленные риски:</Text>
                      <ul style={{ marginTop: typography.spacing.sm, paddingLeft: typography.spacing.lg }}>
                        {selectedNotification.data.risks.map((risk: string, idx: number) => (
                          <li key={idx} style={{ fontSize: typography.fontSize.sm, color: colors.error }}>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedNotification.source === 'ctg_monitoring' && selectedNotification.data && (
              <div>
                <Title level={5} style={{ marginBottom: typography.spacing.md, color: colors.text.primary }}>
                  Данные КТГ-мониторинга
                </Title>
                <div style={{ 
                  background: `${colors.error}10`,
                  padding: typography.spacing.md,
                  borderRadius: '8px',
                  border: `1px solid ${colors.error}`
                }}>
                  <Row gutter={16}>
                    {selectedNotification.data.fhr && (
                      <Col span={8}>
                        <Text strong style={{ fontSize: typography.fontSize.sm }}>ЧСС плода:</Text>
                        <div style={{ fontSize: typography.fontSize.lg, color: colors.error, fontWeight: typography.fontWeight.bold }}>
                          {selectedNotification.data.fhr} уд/мин
                        </div>
                      </Col>
                    )}
                    {selectedNotification.data.duration && (
                      <Col span={8}>
                        <Text strong style={{ fontSize: typography.fontSize.sm }}>Длительность:</Text>
                        <div style={{ fontSize: typography.fontSize.lg, color: colors.text.primary, fontWeight: typography.fontWeight.bold }}>
                          {selectedNotification.data.duration} мин
                        </div>
                      </Col>
                    )}
                    {selectedNotification.data.baseline && (
                      <Col span={8}>
                        <Text strong style={{ fontSize: typography.fontSize.sm }}>Базовая линия:</Text>
                        <div style={{ fontSize: typography.fontSize.lg, color: colors.text.primary, fontWeight: typography.fontWeight.bold }}>
                          {selectedNotification.data.baseline} уд/мин
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              </div>
            )}

            {selectedNotification.source === 'device_status' && selectedNotification.data && (
              <div>
                <Title level={5} style={{ marginBottom: typography.spacing.md, color: colors.text.primary }}>
                  Статус устройства
                </Title>
                <div style={{ 
                  background: `${colors.warning}10`,
                  padding: typography.spacing.md,
                  borderRadius: '8px',
                  border: `1px solid ${colors.warning}`
                }}>
                  <Row gutter={16}>
                    {selectedNotification.data.deviceId && (
                      <Col span={12}>
                        <Text strong style={{ fontSize: typography.fontSize.sm }}>Устройство:</Text>
                        <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary }}>
                          {selectedNotification.data.deviceId}
                        </div>
                      </Col>
                    )}
                    {selectedNotification.data.battery && (
                      <Col span={6}>
                        <Text strong style={{ fontSize: typography.fontSize.sm }}>Батарея:</Text>
                        <div style={{ fontSize: typography.fontSize.lg, color: colors.warning, fontWeight: typography.fontWeight.bold }}>
                          {selectedNotification.data.battery}%
                        </div>
                      </Col>
                    )}
                    {selectedNotification.data.signal && (
                      <Col span={6}>
                        <Text strong style={{ fontSize: typography.fontSize.sm }}>Сигнал:</Text>
                        <div style={{ fontSize: typography.fontSize.lg, color: colors.text.primary, fontWeight: typography.fontWeight.bold }}>
                          {selectedNotification.data.signal}%
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}