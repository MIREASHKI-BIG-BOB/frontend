import React from 'react';
import { Card, List, Tag, Typography, Space } from 'antd';
import { UserOutlined, HeartOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { colors, typography } from '../theme';

const { Text } = Typography;

interface Patient {
  id: string;
  name: string;
  gestation: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdate: string;
  heartRate: number;
}

interface RecentPatientsProps {
  patients?: Patient[];
}

const RecentPatients: React.FC<RecentPatientsProps> = ({ patients }) => {
  const defaultPatients: Patient[] = [
    {
      id: '1',
      name: 'Иванова А.С.',
      gestation: '34 нед',
      status: 'normal',
      lastUpdate: '2 мин назад',
      heartRate: 72
    },
    {
      id: '2',
      name: 'Петрова М.В.',
      gestation: '28 нед',
      status: 'warning',
      lastUpdate: '5 мин назад',
      heartRate: 85
    },
    {
      id: '3',
      name: 'Сидорова Е.А.',
      gestation: '32 нед',
      status: 'critical',
      lastUpdate: '1 мин назад',
      heartRate: 95
    },
    {
      id: '4',
      name: 'Козлова О.И.',
      gestation: '30 нед',
      status: 'normal',
      lastUpdate: '10 мин назад',
      heartRate: 68
    }
  ];

  const patientsList = patients || defaultPatients;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <ExclamationCircleOutlined />;
      default: return <HeartOutlined />;
    }
  };

  return (
    <Card 
      title="Последние пациентки" 
      className="h-full"
      bodyStyle={{ padding: typography.spacing.sm, height: `calc(100% - ${typography.sizes.cardHeight.header})`, overflowY: 'auto' }}
      headStyle={{ padding: typography.sizes.cardPadding, minHeight: typography.sizes.cardHeight.header }}
    >
      <List
        itemLayout="horizontal"
        dataSource={patientsList}
        size="small"
        renderItem={(patient) => (
          <List.Item className="!px-1 !py-2 border-b border-gray-100 last:border-b-0">
            <List.Item.Meta
              avatar={
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                  <UserOutlined className="text-gray-600 text-xs" />
                </div>
              }
              title={
                <div className="flex items-center justify-between">
                  <Text strong className="text-sm">{patient.name}</Text>
                  <Tag 
                    color={getStatusColor(patient.status)} 
                    icon={getStatusIcon(patient.status)}
                    className="text-xs"
                  >
                    {patient.heartRate} уд/мин
                  </Tag>
                </div>
              }
              description={
                <Space className="text-xs text-gray-500">
                  <span>{patient.gestation}</span>
                  <span>•</span>
                  <span>{patient.lastUpdate}</span>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RecentPatients;