import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Space, Progress } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  MonitorOutlined
} from '@ant-design/icons';

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
          color: '#1890ff', 
          icon: <PlayCircleOutlined />, 
          text: 'Активен',
          bgColor: '#f0f9ff',
          borderColor: '#bfdbfe'
        };
      case 'completed': 
        return { 
          color: '#52c41a', 
          icon: <CheckCircleOutlined />, 
          text: 'Завершен',
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0'
        };
      case 'interrupted': 
        return { 
          color: '#fa8c16', 
          icon: <PauseCircleOutlined />, 
          text: 'Прерван',
          bgColor: '#fffbeb',
          borderColor: '#fed7aa'
        };
      default: 
        return { 
          color: '#d9d9d9', 
          icon: <ClockCircleOutlined />, 
          text: 'Неизвестно',
          bgColor: '#f9fafb',
          borderColor: '#e5e7eb'
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
    if (quality >= 90) return '#52c41a';
    if (quality >= 75) return '#fa8c16';
    return '#dc2626';
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
              <MonitorOutlined style={{ fontSize: '12px' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
              Последние сеансы мониторинга
            </span>
          </div>
        </div>
      }
      className="h-full"
      size="small"
      bodyStyle={{ padding: '8px' }}
      headStyle={{ 
        padding: '6px 12px', 
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        borderBottom: '1px solid #f3e8ff'
      }}
    >
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {sessionsList.map((session) => {
          const statusConfig = getStatusConfig(session.status);
          
          return (
            <div 
              key={session.id}
              className="p-2 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all"
              style={{
                backgroundColor: session.status === 'active' ? '#fef7ff' : 
                               session.status === 'completed' ? '#f0fdf4' : 
                               session.status === 'interrupted' ? '#fffbeb' : '#fef7ff',
                borderLeftColor: session.status === 'active' ? '#ec4899' : 
                               session.status === 'completed' ? '#22c55e' : 
                               session.status === 'interrupted' ? '#f59e0b' : '#ec4899',
                lineHeight: '1.2'
              }}
            >
              {/* Заголовок сессии */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: '#ec4899', fontSize: '12px' }}
                  >
                    {statusConfig.icon}
                  </div>
                  <Tag 
                    className="font-bold px-1.5 py-0.5"
                    style={{
                      fontSize: '12px',
                      backgroundColor: session.status === 'active' ? '#f3e8ff' : 
                                     session.status === 'completed' ? '#dcfce7' : 
                                     session.status === 'interrupted' ? '#fef3c7' : '#f3e8ff',
                      color: session.status === 'active' ? '#831843' : 
                           session.status === 'completed' ? '#166534' : 
                           session.status === 'interrupted' ? '#92400e' : '#831843',
                      border: `1px solid ${
                        session.status === 'active' ? '#ec4899' : 
                        session.status === 'completed' ? '#22c55e' : 
                        session.status === 'interrupted' ? '#f59e0b' : '#ec4899'
                      }`,
                      lineHeight: '1.2'
                    }}
                  >
                    {statusConfig.text}
                  </Tag>
                  <Text style={{ fontSize: '11px', color: '#831843', opacity: 0.7 }}>
                    {session.date}
                  </Text>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#831843' }}>
                  {formatDuration(session.duration)}
                  {session.status === 'active' && (
                    <div className="inline-block w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse ml-1"></div>
                  )}
                </div>
              </div>

              {/* Основные показатели в компактном виде */}
              <div className="grid grid-cols-3 gap-2 mb-1.5">
                {/* ЧСС */}
                <div className="text-center">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white mx-auto mb-0.5"
                    style={{ backgroundColor: '#ec4899', fontSize: '11px' }}
                  >
                    <HeartOutlined />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#831843' }}>
                    {session.avgHeartRate}
                  </div>
                  <div style={{ fontSize: '10px', color: '#831843', opacity: 0.7 }}>ср. ЧСС</div>
                </div>

                {/* Качество данных */}
                <div className="text-center">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white mx-auto mb-0.5"
                    style={{ backgroundColor: getQualityColor(session.quality), fontSize: '11px' }}
                  >
                    <WifiOutlined />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: getQualityColor(session.quality) }}>
                    {session.quality}%
                  </div>
                  <div style={{ fontSize: '10px', color: '#831843', opacity: 0.7 }}>качество</div>
                </div>

                {/* Расход батареи */}
                <div className="text-center">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white mx-auto mb-0.5"
                    style={{ 
                      backgroundColor: session.batteryUsed > 15 ? '#f59e0b' : '#22c55e',
                      fontSize: '11px'
                    }}
                  >
                    <ThunderboltOutlined />
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: session.batteryUsed > 15 ? '#f59e0b' : '#22c55e'
                  }}>
                    -{session.batteryUsed.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '10px', color: '#831843', opacity: 0.7 }}>батарея</div>
                </div>
              </div>

              {/* Прогресс-бар качества */}
              <div className="mb-1.5">
                <div className="flex items-center justify-between mb-0.5">
                  <div style={{ fontSize: '11px', color: '#831843', opacity: 0.7 }}>Качество передачи</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: getQualityColor(session.quality) }}>
                    {session.quality}%
                  </div>
                </div>
                <Progress 
                  percent={session.quality} 
                  size="small"
                  strokeColor={getQualityColor(session.quality)}
                  showInfo={false}
                  style={{ fontSize: '8px' }}
                />
              </div>

              {/* Нижняя информация */}
              <div className="flex items-center justify-between">
                <div style={{ fontSize: '11px', color: '#831843', opacity: 0.7 }}>
                  Пациентка: {session.patientName}
                </div>
                <div className="flex items-center gap-1">
                  {session.alerts > 0 && (
                    <Tag 
                      className="font-bold px-1 py-0"
                      style={{
                        fontSize: '10px',
                        backgroundColor: '#fed7aa',
                        color: '#92400e',
                        border: '1px solid #f59e0b',
                        lineHeight: '1.2'
                      }}
                    >
                      {session.alerts} увед.
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </Card>
  );
};

// Экспортируем как RecentPatients для совместимости с Dashboard
export default RecentSessions;