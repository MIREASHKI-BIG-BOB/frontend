import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { HeartOutlined, UserOutlined, ClockCircleOutlined, AlertOutlined } from '@ant-design/icons';
import { colors, typography } from '../theme';

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
    <Card title="Быстрая статистика" className="h-full" bodyStyle={{ padding: typography.spacing.sm }}>
      <Row gutter={[4, 8]}>
        <Col span={12}>
          <Statistic
            title="Пациенток"
            value={patientsTotal}
            prefix={<UserOutlined style={{ color: colors.risk.high, fontSize: typography.fontSize.sm }} />}
            valueStyle={{ fontSize: typography.fontSize.base, color: colors.risk.high, fontWeight: typography.fontWeight.bold }}
            className="text-center"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Активно"
            value={activeMonitoring}
            prefix={<ClockCircleOutlined style={{ color: colors.status.success, fontSize: typography.fontSize.sm }} />}
            valueStyle={{ fontSize: typography.fontSize.base, color: colors.status.success, fontWeight: typography.fontWeight.bold }}
            className="text-center"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="ЧСС ср."
            value={avgHeartRate}
            suffix="уд/мин"
            prefix={<HeartOutlined style={{ color: colors.status.info, fontSize: typography.fontSize.sm }} />}
            valueStyle={{ fontSize: typography.fontSize.sm, color: colors.status.info, fontWeight: typography.fontWeight.bold }}
            className="text-center"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Тревоги"
            value={alertsToday}
            prefix={<AlertOutlined style={{ color: colors.chart.warning, fontSize: typography.fontSize.sm }} />}
            valueStyle={{ fontSize: typography.fontSize.base, color: colors.chart.warning, fontWeight: typography.fontWeight.bold }}
            className="text-center"
          />
        </Col>
      </Row>
    </Card>
  );
};

export default QuickStats;