import { Card, List, Badge, Button, Space, Typography, Tag, Divider, Segmented, Empty, Input, Tooltip, Modal, Descriptions } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, ExclamationCircleOutlined, WarningOutlined, InfoCircleOutlined, SearchOutlined, ClockCircleOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { colors, typography } from '../theme';

const { Title, Text } = Typography;

type NotificationLevel = 'info' | 'warning' | 'critical';
type NotificationStatus = 'unread' | 'read';

interface Notification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  status: NotificationStatus;
  timestamp: Date;
  patient?: string;
  type: 'medical' | 'system' | 'alert';
}

// Демо-данные уведомлений
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Критическая тревога: Брадикардия',
    message: 'Пациент: Иванова А.С. - ЧСС плода снижена до 95 уд/мин. Требует немедленного внимания.',
    level: 'critical',
    status: 'unread',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    patient: 'Иванова А.С.',
    type: 'medical'
  },
  {
    id: '2',
    title: 'Предупреждение: Снижение вариабельности',
    message: 'У пациента Петровой М.И. наблюдается снижение вариабельности ЧСС менее 3 уд/мин.',
    level: 'warning',
    status: 'unread',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    patient: 'Петрова М.И.',
    type: 'medical'
  },
  {
    id: '3',
    title: 'Системное уведомление',
    message: 'Обновление системы запланировано на 23:00. Длительность: около 30 минут.',
    level: 'info',
    status: 'read',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'system'
  },
  {
    id: '4',
    title: 'Тахикардия плода',
    message: 'Пациент: Сидорова Е.Н. - ЧСС плода повышена до 175 уд/мин в течение 10 минут.',
    level: 'warning',
    status: 'read',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    patient: 'Сидорова Е.Н.',
    type: 'medical'
  },
  {
    id: '5',
    title: 'Информация о подключении',
    message: 'Новый пациент добавлен в систему мониторинга. ID: #12458',
    level: 'info',
    status: 'read',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    type: 'system'
  },
];

const getNotificationIcon = (level: NotificationLevel) => {
  switch (level) {
    case 'critical': return <ExclamationCircleOutlined className="text-red-500" />;
    case 'warning': return <WarningOutlined className="text-orange-500" />;
    case 'info': return <InfoCircleOutlined className="text-blue-500" />;
    default: return <BellOutlined />;
  }
};

const getNotificationColor = (level: NotificationLevel) => {
  switch (level) {
    case 'critical': return 'error';
    case 'warning': return 'warning';
    case 'info': return 'default';
    default: return 'default';
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  return `${days} дн назад`;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'medical'>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Фильтр по типу
      const matchesFilter = (() => {
        switch (filter) {
          case 'unread': return notification.status === 'unread';
          case 'medical': return notification.type === 'medical';
          default: return true;
        }
      })();
      
      // Фильтр по поиску
      const matchesSearch = searchText === '' || 
        notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchText.toLowerCase()) ||
        (notification.patient && notification.patient.toLowerCase().includes(searchText.toLowerCase()));
      
      return matchesFilter && matchesSearch;
    }).sort((a, b) => {
      // Сначала непрочитанные, потом по времени
      if (a.status !== b.status) {
        return a.status === 'unread' ? -1 : 1;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [notifications, filter, searchText]);

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

  const getDetailedInfo = (notification: Notification) => {
    // Генерируем дополнительную детальную информацию в зависимости от типа
    if (notification.type === 'medical' && notification.patient) {
      return {
        patientInfo: {
          name: notification.patient,
          id: '#' + Math.random().toString().substr(2, 5),
          room: 'Палата ' + (Math.floor(Math.random() * 20) + 1),
          age: Math.floor(Math.random() * 15) + 20 + ' лет',
        },
        medicalData: notification.level === 'critical' 
          ? [
              'ЧСС плода: 95 уд/мин (норма: 120-160)',
              'Вариабельность: 2 уд/мин (норма: 5-25)', 
              'Длительность эпизода: 8 минут',
              'Сопутствующие признаки: Снижение двигательной активности'
            ]
          : [
              'ЧСС плода: 168 уд/мин (норма: 120-160)',
              'Продолжительность тахикардии: 12 минут',
              'Характер: Умеренная тахикардия',
              'Рекомендации: Контроль в динамике'
            ],
        priority: notification.level === 'critical' ? 'Высокий' : 'Средний',
        actions: notification.level === 'critical' 
          ? ['Немедленная консультация врача', 'Подготовка к экстренному родоразрешению', 'Информирование анестезиолога']
          : ['Наблюдение за состоянием', 'Контроль ЧСС каждые 15 минут', 'Консультация при ухудшении']
      };
    }
    return null;
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Заголовок */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Space align="center">
            <BellOutlined className="text-xl text-blue-600" />
            <Title level={2} className="!mb-0">
              Уведомления
              {unreadCount > 0 && (
                <Badge 
                  count={unreadCount} 
                  className="ml-2"
                  style={{ backgroundColor: '#ef4444' }}
                />
              )}
            </Title>
          </Space>
          
          {unreadCount > 0 && (
            <Button 
              type="primary"
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
              size="middle"
            >
              Прочитать все
            </Button>
          )}
        </div>

        {/* Фильтры и поиск */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Segmented
            options={[
              { label: `Все (${notifications.length})`, value: 'all' },
              { label: `Новые (${unreadCount})`, value: 'unread' },
              { label: 'Медицинские', value: 'medical' },
            ]}
            value={filter}
            onChange={setFilter}
            className="flex-shrink-0"
          />
          
          <Input
            placeholder="Поиск по уведомлениям..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
            allowClear
          />
        </div>
      </div>

      {/* Список уведомлений */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              size="small"
              className={`
                transition-all hover:shadow-md cursor-pointer
                ${notification.status === 'unread' 
                  ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm' 
                  : 'bg-white hover:bg-gray-50'
                }
              `}
              bodyStyle={{ padding: typography.spacing.md }}
              onClick={() => openNotificationDetail(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Иконка */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.level)}
                  </div>
                  
                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    {/* Заголовок с тегами */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Text 
                          strong 
                          className={`${
                            notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                          } text-sm leading-5`}
                        >
                          {notification.title}
                        </Text>
                        {notification.status === 'unread' && (
                          <Badge status="processing" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <Tag 
                          color={getNotificationColor(notification.level)} 
                          className="text-xs"
                        >
                          {notification.level === 'critical' ? 'Критично' : 
                           notification.level === 'warning' ? 'Внимание' : 'Инфо'}
                        </Tag>
                      </div>
                    </div>
                    
                    {/* Сообщение */}
                    <Text 
                      className={`
                        ${notification.status === 'unread' ? 'text-gray-700' : 'text-gray-600'} 
                        text-sm leading-5 block mb-3
                      `}
                    >
                      {notification.message}
                    </Text>
                    
                    {/* Метаинформация */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockCircleOutlined />
                        <span>{formatTime(notification.timestamp)}</span>
                      </div>
                      
                      {notification.patient && (
                        <>
                          <Divider type="vertical" className="my-0" />
                          <span>Пациент: <strong>{notification.patient}</strong></span>
                        </>
                      )}
                      
                      <Divider type="vertical" className="my-0" />
                      <Tag 
                        color={notification.type === 'medical' ? 'red' : 'blue'}
                        className="text-xs"
                      >
                        {notification.type === 'medical' ? 'Медицинское' : 'Системное'}
                      </Tag>
                    </div>
                  </div>
                </div>
                
                {/* Действия */}
                <div className="flex items-center space-x-1 ml-4">
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
                      className={notification.status === 'read' ? 'text-green-500' : ''}
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
                      danger
                    />
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchText ? 'По вашему запросу ничего не найдено' :
              filter === 'unread' ? 'Нет новых уведомлений' : 
              filter === 'medical' ? 'Нет медицинских уведомлений' : 'Нет уведомлений'
            }
          />
        </Card>
      )}
      
      {/* Модальное окно с детальной информацией */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            {selectedNotification && getNotificationIcon(selectedNotification.level)}
            <span className="text-lg">Детали уведомления</span>
            {selectedNotification && (
              <Tag color={getNotificationColor(selectedNotification.level)}>
                {selectedNotification.level === 'critical' ? 'Критично' : 
                 selectedNotification.level === 'warning' ? 'Внимание' : 'Инфо'}
              </Tag>
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
          >
            Удалить
          </Button>
        ]}
      >
        {selectedNotification && (
          <div className="space-y-4">
            {/* Основная информация */}
            <div>
              <Title level={4} className="!mb-2">
                {selectedNotification.title}
              </Title>
              <Text className="text-gray-600 leading-6">
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
                <div className="flex items-center space-x-2">
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
              <Descriptions.Item label="Тип" span={1}>
                <Tag color={selectedNotification.type === 'medical' ? 'red' : 'blue'}>
                  {selectedNotification.type === 'medical' ? 'Медицинское' : 'Системное'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Уровень" span={1}>
                <Tag color={getNotificationColor(selectedNotification.level)}>
                  {selectedNotification.level === 'critical' ? 'Критичный' : 
                   selectedNotification.level === 'warning' ? 'Предупреждение' : 'Информационный'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Медицинская информация */}
            {(() => {
              const details = getDetailedInfo(selectedNotification);
              if (details) {
                return (
                  <>
                    <Descriptions 
                      bordered 
                      size="small" 
                      column={2}
                      title={
                        <div className="flex items-center space-x-2">
                          <UserOutlined />
                          <span>Информация о пациенте</span>
                        </div>
                      }
                    >
                      <Descriptions.Item label="ФИО" span={1}>
                        {details.patientInfo.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="ID пациента" span={1}>
                        {details.patientInfo.id}
                      </Descriptions.Item>
                      <Descriptions.Item label="Палата" span={1}>
                        {details.patientInfo.room}
                      </Descriptions.Item>
                      <Descriptions.Item label="Возраст" span={1}>
                        {details.patientInfo.age}
                      </Descriptions.Item>
                    </Descriptions>

                    <div>
                      <Title level={5} className="flex items-center space-x-2 !mb-3">
                        <MedicineBoxOutlined />
                        <span>Медицинские данные</span>
                      </Title>
                      <div className="bg-gray-50 p-4 rounded border">
                        <div className="space-y-2">
                          {details.medicalData.map((data, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span className="text-sm text-gray-700">{data}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Descriptions 
                      bordered 
                      size="small" 
                      column={1}
                      title="Приоритет и рекомендации"
                    >
                      <Descriptions.Item label="Приоритет">
                        <Tag color={selectedNotification.level === 'critical' ? 'red' : 'orange'}>
                          {details.priority}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Рекомендуемые действия">
                        <div className="space-y-1">
                          {details.actions.map((action, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-blue-600 font-bold">{index + 1}.</span>
                              <span className="text-sm">{action}</span>
                            </div>
                          ))}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </>
                );
              }
              return null;
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}