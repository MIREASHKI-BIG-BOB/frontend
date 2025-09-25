import { Card, Typography } from 'antd';
import { useState, useEffect } from 'react';

interface SimpleCTGProps {
  fpsMs?: number;
  windowLengthSec?: number;
  onRiskChange?: (risk: 'ok' | 'warn' | 'danger', score: number) => void;
}

export default function SimpleCTG({ fpsMs = 250, windowLengthSec = 180, onRiskChange }: SimpleCTGProps) {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(p => p + 1);
      if (onRiskChange) {
        // Простая симуляция риска
        const risk = Math.random() < 0.7 ? 'ok' : Math.random() < 0.5 ? 'warn' : 'danger';
        const score = Math.floor(Math.random() * 100);
        onRiskChange(risk, score);
      }
    }, fpsMs);

    return () => clearInterval(interval);
  }, [fpsMs, onRiskChange]);

  return (
    <Card title="КТГ (упрощённая версия)" aria-label="График КТГ">
      <div className="h-[360px] bg-gray-50 rounded-md flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📈</div>
          <Typography.Title level={4}>CTG Мониторинг</Typography.Title>
          <Typography.Paragraph>
            Точек данных: {points}<br/>
            FPS: {fpsMs}ms<br/>
            Окно: {windowLengthSec}s
          </Typography.Paragraph>
        </div>
      </div>
    </Card>
  );
}