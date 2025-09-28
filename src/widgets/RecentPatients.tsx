import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Space, Progress } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  WifiOutlined
} from '@ant-design/icons';
import { colors, typography } from '../theme';

const { Text } = Typography;

interface MonitoringSession {
  id: string;
  patientName: string;
  date: string;
  duration: number; // в минутах
  status: 'active' | 'completed' | 'interrupted';
  quality: number; // качество данных в %
  avgHeartRate: number;
  batteryUsed: number; // использовано батареи %
  alerts: number;
}

interface RecentSessionsProps {
  sessions?: MonitoringSession[];
}

const RecentSessions: React.FC<RecentSessionsProps> = ({ sessions }) => {
  const [recentSessions, setRecentSessions] = useState<MonitoringSession[]>([
    {
      id: '1',
      patientName: 'Иванова А.С.',
      date: '10 мин назад',
      duration: 45,
      status: 'active',
      quality: 94,
      avgHeartRate: 142,
      batteryUsed: 8,
      alerts: 0
    },
    {
      id: '2',
      patientName: 'Иванова А.С.',
      date: '2 ч назад',
      duration: 60,
      status: 'completed',
      quality: 89,
      avgHeartRate: 138,
      batteryUsed: 12,
      alerts: 1
    },
    {
      id: '3',
      patientName: 'Иванова А.С.',
      date: 'Вчера 22:30',
      duration: 25,
      status: 'interrupted',
      quality: 67,
      avgHeartRate: 145,
      batteryUsed: 5,
      alerts: 2
    },
    {
      id: '4',
      patientName: 'Иванова А.С.',
      date: 'Вчера 18:15',
      duration: 90,
      status: 'completed',
      quality: 96,
      avgHeartRate: 140,
      batteryUsed: 15,
      alerts: 0
    },
    {
      id: '5',
      patientName: 'Иванова А.С.',
      date: '2 дня назад',
      duration: 120,
      status: 'completed',
      quality: 92,
      avgHeartRate: 136,
      batteryUsed: 18,
      alerts: 1
    }
  ]);

  // Симуляция обновления активных сессий
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentSessions(prev => prev.map(session => {
        if (session.status === 'active') {
          return {
            ...session,
            duration: session.duration + 1,
            batteryUsed: Math.min(20, session.batteryUsed + 0.2)
          };
        }
        return session;
      }));
    }, 60000); // Каждую минуту

    return () => clearInterval(interval);
  }, []);

  const sessionsList = sessions || recentSessions;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': 
        return { 
          color: 'processing', 
          icon: <PlayCircleOutlined />, 
          text: 'Активен',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'completed': 
        return { 
          color: 'success', 
          icon: <CheckCircleOutlined />, 
          text: 'Завершен',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'interrupted': 
        return { 
          color: 'warning', 
          icon: <PauseCircleOutlined />, 
          text: 'Прерван',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default: 
        return { 
          color: 'default', 
          icon: <ClockCircleOutlined />, 
          text: 'Неизвестно',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return colors.status.success;
    if (quality >= 75) return colors.chart.warning;
    return colors.risk.high;
  };

  return (
    <Card 
      title="Последние сеансы мониторинга" 
      className="h-full"
      bodyStyle={{ 
        padding: typography.spacing.sm, 
        height: `calc(100% - ${typography.sizes.cardHeight.header})`, 
        overflowY: 'auto' 
      }}
      headStyle={{ 
        padding: typography.sizes.cardPadding, 
        minHeight: typography.sizes.cardHeight.header 
      }}
    >
      <List
        itemLayout="vertical"
        dataSource={sessionsList}
        size="small"
        renderItem={(session) => {
          const statusConfig = getStatusConfig(session.status);
          
          return (
            <List.Item 
              className={`!px-3 !py-3 rounded-lg mb-2 border ${statusConfig.bgColor} ${statusConfig.borderColor} hover:shadow-sm transition-all cursor-pointer`}
              style={{ marginBottom: '8px' }}
            >
              <div className="w-full">
                {/* Заголовок сессии */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag 
                      color={statusConfig.color} 
                      icon={statusConfig.icon}
                      className="text-xs font-medium"
                    >
                      {statusConfig.text}
                    </Tag>
                    <Text className="text-xs text-gray-600">{session.date}</Text>
                  </div>
                  <Text strong className="text-sm">{formatDuration(session.duration)}</Text>
                </div>

                {/* Основные показатели */}
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {/* ЧСС */}
                  <div className="text-center">
                    <HeartOutlined style={{ color: colors.status.info, fontSize: '12px' }} />
                    <div className="text-sm font-bold" style={{ color: colors.status.info }}>
                      {session.avgHeartRate}
                    </div>
                    <Text className="text-xs text-gray-500">ср. ЧСС</Text>
                  </div>

                  {/* Качество данных */}
                  <div className="text-center">
                    <WifiOutlined style={{ color: getQualityColor(session.quality), fontSize: '12px' }} />
                    <div className="text-sm font-bold" style={{ color: getQualityColor(session.quality) }}>
                      {session.quality}%
                    </div>
                    <Text className="text-xs text-gray-500">качество</Text>
                  </div>

                  {/* Расход батареи */}
                  <div className="text-center">
                    <ThunderboltOutlined style={{ 
                      color: session.batteryUsed > 15 ? colors.chart.warning : colors.status.success, 
                      fontSize: '12px' 
                    }} />
                    <div className="text-sm font-bold" style={{ 
                      color: session.batteryUsed > 15 ? colors.chart.warning : colors.status.success
                    }}>
                      -{session.batteryUsed.toFixed(0)}%
                    </div>
                    <Text className="text-xs text-gray-500">батарея</Text>
                  </div>
                </div>

                {/* Качество данных - прогресс-бар */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <Text className="text-xs text-gray-600">Качество передачи данных</Text>
                    <Text className="text-xs font-medium" style={{ color: getQualityColor(session.quality) }}>
                      {session.quality}%
                    </Text>
                  </div>
                  <Progress 
                    percent={session.quality} 
                    size="small"
                    strokeColor={getQualityColor(session.quality)}
                    showInfo={false}
                  />
                </div>

                {/* Уведомления */}
                <div className="flex items-center justify-between text-xs">
                  <Space>
                    <Text type="secondary">Пациентка: {session.patientName}</Text>
                  </Space>
                  <Space>
                    {session.alerts > 0 && (
                      <Tag color="orange" className="text-xs">
                        {session.alerts} уведомл.
                      </Tag>
                    )}
                    {session.status === 'active' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </Space>
                </div>
              </div>
            </List.Item>
          );
        }}
      />

      {/* Подсказка внизу */}
      <div className="text-center mt-2 pt-2 border-t border-gray-200">
        <Text className="text-xs text-gray-500">
          📱 Нажмите на сеанс для подробностей
        </Text>
      </div>
    </Card>
  );
};

// Экспортируем как RecentPatients для совместимости с Dashboard
export default RecentSessions;