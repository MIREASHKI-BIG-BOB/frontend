import { Space } from 'antd';
import CTGChartSimple from '../widgets/CTGChartSimple';
import StatusIndicators from '../widgets/StatusIndicators';
import { useState } from 'react';

export default function CTGPage() {
  const [risk, setRisk] = useState<'ok' | 'warn' | 'danger'>('ok');
  const [score, setScore] = useState(0);
  return (
    <div className="p-6">
      <Space direction="vertical" className="w-full">
        <CTGChartSimple onRiskChange={(r: 'ok' | 'warn' | 'danger', s: number) => { setRisk(r); setScore(s); }} />
      </Space>
    </div>
  );
}
