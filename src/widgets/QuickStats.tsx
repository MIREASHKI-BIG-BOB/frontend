import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { HeartOutlined, UserOutlined, ClockCircleOutlined, AlertOutlined } from '@ant-design/icons';

interface QuickStatsProps {
  patientsTotal?: number;
  activeMonitoring?: number;
  avgHeartRate?: number;
  alertsToday?: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  patientsTotal = 8,
  activeMonitoring = 6,
  avgHeartRate = 76,
  alertsToday = 3
}) => {
  return (
    <Card title="Быстрая статистика" className="h-full" bodyStyle={{ padding: '8px' }}>
      <Row gutter={[4, 8]}>
        <Col span={12}>
          <Statistic
            title="Пациенток"
            value={patientsTotal}
            prefix={<UserOutlined style={{ color: '#e91e63', fontSize: '14px' }} />}
            valueStyle={{ fontSize: '16px', color: '#e91e63', fontWeight: 'bold' }}
            className="text-center"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Активно"
            value={activeMonitoring}
            prefix={<ClockCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} />}
            valueStyle={{ fontSize: '16px', color: '#52c41a', fontWeight: 'bold' }}
            className="text-center"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="ЧСС ср."
            value={avgHeartRate}
            suffix="уд/мин"
            prefix={<HeartOutlined style={{ color: '#1890ff', fontSize: '14px' }} />}
            valueStyle={{ fontSize: '14px', color: '#1890ff', fontWeight: 'bold' }}
            className="text-center"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Тревоги"
            value={alertsToday}
            prefix={<AlertOutlined style={{ color: '#fa8c16', fontSize: '14px' }} />}
            valueStyle={{ fontSize: '16px', color: '#fa8c16', fontWeight: 'bold' }}
            className="text-center"
          />
        </Col>
      </Row>
    </Card>
  );
};

export default QuickStats;