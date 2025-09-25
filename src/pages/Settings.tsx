import { Card, Space, Segmented } from 'antd';
import { useState } from 'react';

export default function Settings() {
  const [fps, setFps] = useState(250);
  const [winSec, setWinSec] = useState(180);
  return (
    <div className="p-6">
      <Card title="Настройки">
        <Space direction="vertical" size="large">
          <Space size="middle">
            <span className="text-secondary">FPS</span>
            <Segmented
              options={[
                { label: '250 мс', value: 250 },
                { label: '333 мс', value: 333 },
                { label: '500 мс', value: 500 },
              ]}
              value={fps}
              onChange={(v) => setFps(v as number)}
            />
          </Space>
          <Space size="middle">
            <span className="text-secondary">Окно</span>
            <Segmented
              options={[
                { label: '120 с', value: 120 },
                { label: '180 с', value: 180 },
              ]}
              value={winSec}
              onChange={(v) => setWinSec(v as number)}
            />
          </Space>
        </Space>
      </Card>
    </div>
  );
}
