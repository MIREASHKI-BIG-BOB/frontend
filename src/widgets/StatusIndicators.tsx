import { Badge, Space, Card, Typography } from 'antd';

interface StatusIndicatorsProps {
  active?: 'ok' | 'warn' | 'danger';
}

export default function StatusIndicators({ active = 'ok' }: StatusIndicatorsProps) {
  return (
    <Card aria-label="Индикаторы состояния">
      <Space size="large" wrap>
        <Badge color="#28A745" text={<Typography.Text strong={active === 'ok'}>Норма</Typography.Text>} status={active === 'ok' ? 'success' : undefined} />
        <Badge color="#FFC107" text={<Typography.Text strong={active === 'warn'}>Подозрение</Typography.Text>} status={active === 'warn' ? 'warning' : undefined} />
        <Badge color="#DC3545" text={<Typography.Text strong={active === 'danger'}>Критично</Typography.Text>} status={active === 'danger' ? 'error' : undefined} />
      </Space>
    </Card>
  );
}
