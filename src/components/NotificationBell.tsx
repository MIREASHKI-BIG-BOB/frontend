import React, { useState } from 'react';
import { Badge, Button, Dropdown, List, Typography, Space, Divider, Empty } from 'antd';
import { BellOutlined, EyeOutlined, ExclamationCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { colors, typography } from '../theme';

const { Text } = Typography;

type NotificationLevel = 'info' | 'warning' | 'critical';

interface Notification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  timestamp: Date;
  patient?: string;
}

// Моковые данные - последние уведомления
const recentNotifications: Notification[] = [
  {
    id: '1',
    title: 'Критическая тревога: Брадикардия',
    message: 'Пациент: Иванова А.С. - ЧСС плода снижена до 95 уд/мин',
    level: 'critical',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    patient: 'Иванова А.С.',
  },
  {
    id: '2',
    title: 'Предупреждение: Снижение вариабельности',
    message: 'У пациента Петровой М.И. снижение вариабельности ЧСС',
    level: 'warning',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    patient: 'Петрова М.И.',
  },
  {
    id: '3',
    title: 'Системное уведомление',
    message: 'Обновление системы запланировано на 23:00',
    level: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const getNotificationIcon = (level: NotificationLevel) => {
  switch (level) {
    case 'critical': return <ExclamationCircleOutlined className="text-red-500 text-sm" />;
    case 'warning': return <WarningOutlined className="text-orange-500 text-sm" />;
    case 'info': return <InfoCircleOutlined className="text-blue-500 text-sm" />;
    default: return <BellOutlined className="text-sm" />;
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 60) return `${minutes} мин`;
  if (hours < 24) return `${hours} ч`;
  return 'Давно';
};

interface NotificationBellProps {
  onNavigateToNotifications: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigateToNotifications }) => {
  const [open, setOpen] = useState(false);
  
  const unreadCount = recentNotifications.filter(n => n.level !== 'info').length; // критичные и предупреждения считаем непрочитанными
  
  const dropdownContent = (
    <div className="w-80 max-h-96 overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-white">
        <Text strong>Последние уведомления</Text>
        <Button 
          type="link" 
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setOpen(false);
            onNavigateToNotifications();
          }}
        >
          Все уведомления
        </Button>
      </div>
      
      <div className="max-h-64 overflow-y-auto bg-white">
        {recentNotifications.length > 0 ? (
          <List
            size="small"
            dataSource={recentNotifications.slice(0, 4)} // Показываем только первые 4
            renderItem={(notification, index) => (
              <List.Item 
                key={notification.id}
                className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                  notification.level === 'critical' ? 'border-l-2 border-l-red-400 bg-red-50' :
                  notification.level === 'warning' ? 'border-l-2 border-l-orange-400 bg-orange-50' : 'bg-white'
                }`}
                style={{ borderBottom: index < recentNotifications.length - 1 ? `1px solid ${colors.border.light}` : 'none' }}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(notification.level)}
                  title={
                    <Text 
                      className="text-sm font-medium line-clamp-1"
                      style={{ 
                        color: notification.level === 'critical' ? '#dc2626' : 
                               notification.level === 'warning' ? '#ea580c' : '#374151' 
                      }}
                    >
                      {notification.title}
                    </Text>
                  }
                  description={
                    <div>
                      <Text className="text-xs text-gray-600 line-clamp-2">
                        {notification.message}
                      </Text>
                      <div className="flex justify-between items-center mt-1">
                        <Text className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)} назад
                        </Text>
                        {notification.patient && (
                          <Text className="text-xs text-gray-500">
                            {notification.patient}
                          </Text>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="p-4 bg-white">
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Нет новых уведомлений"
              className="text-sm"
            />
          </div>
        )}
      </div>

      {recentNotifications.length > 4 && (
        <div className="p-3 border-t border-gray-100 text-center bg-white">
          <Button 
            type="primary" 
            size="small" 
            ghost
            onClick={() => {
              setOpen(false);
              onNavigateToNotifications();
            }}
          >
            Показать все ({recentNotifications.length})
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => dropdownContent}
      placement="bottomRight"
      overlayStyle={{ zIndex: 9999 }}
    >
      <Button
        type="text"
        className="text-gray-600 hover:text-accent hover:bg-gray-50 flex items-center justify-center"
        size="large"
      >
        <Badge count={unreadCount} size="small" offset={[6, -6]}>
          <BellOutlined className="text-lg" />
        </Badge>
      </Button>
    </Dropdown>
  );
};

export default NotificationBell;