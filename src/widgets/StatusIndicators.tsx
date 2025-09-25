import { Badge, Space, Card, Typography } from 'antd';
import { colors } from '../theme';

interface StatusIndicatorsProps {
  active?: 'ok' | 'warn' | 'danger';
}

export default function StatusIndicators({ active = 'ok' }: StatusIndicatorsProps) {
  return (
    <Card aria-label="Индикаторы состояния">
      <Space size="large" wrap>
        <Badge color={colors.success} text={<Typography.Text strong={active === 'ok'}>Норма</Typography.Text>} status={active === 'ok' ? 'success' : undefined} />
        <Badge color={colors.warning} text={<Typography.Text strong={active === 'warn'}>Подозрение</Typography.Text>} status={active === 'warn' ? 'warning' : undefined} />
        <Badge color={colors.error} text={<Typography.Text strong={active === 'danger'}>Критично</Typography.Text>} status={active === 'danger' ? 'error' : undefined} />
      </Space>
    </Card>
  );
}
