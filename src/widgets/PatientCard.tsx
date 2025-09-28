import { Card, Typography, Progress, Tag, Space, Statistic, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { colors, typography } from '../theme';

function fmtTime(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec || 0));
  const hh = Math.floor(s / 3600).toString().padStart(2, '0');
  const mm = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

interface PatientCardProps {
  risk?: number; // 0..100
  deviceConnected?: boolean; // статус подключения домашнего устройства
  lastMovement?: number; // минут назад было последнее движение
  recordingSec?: number; // время записи
}

export default function PatientCard({ risk: riskProp, deviceConnected, lastMovement, recordingSec }: PatientCardProps) {
  // demo data
  const patient = {
    name: 'Иванова Анна',
    age: 29,
    gestation: '34 нед. 5 дн.',
    location: 'Домашний мониторинг',
    deviceModel: 'MoniPuck v2.1'
  };
  const risk = typeof riskProp === 'number' ? Math.round(riskProp) : 45; // %
  const status = risk < 30 ? 'Норма' : risk < 60 ? 'Наблюдение' : 'Тревога';

  return (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar 
              size={28}
              style={{ backgroundColor: colors.risk.high }}
              icon={<UserOutlined />}
            />
            <span>Пациентка</span>
          </div>
          <Tag 
            color={risk < 30 ? 'success' : risk < 60 ? 'warning' : 'error'}
            className="text-xs"
          >
            {status}
          </Tag>
        </div>
      } 
      className="h-full"
      bodyStyle={{ padding: typography.spacing.md }}
      headStyle={{ ...typography.styles.h4, margin: 0 }}
      aria-label="Карточка пациентки"
    >
      <Space direction="vertical" size="middle" className="w-full">
        {/* Основная информация - компактно */}
        <div className="space-y-2">
          <div className="flex">
            <span className="text-xs font-medium text-gray-500 w-16">ФИО:</span>
            <span className="text-sm font-semibold text-gray-900">{patient.name}</span>
          </div>
          <div className="flex">
            <span className="text-xs font-medium text-gray-500 w-16">Возраст:</span>
            <span className="text-sm text-gray-700">{patient.age}</span>
          </div>
          <div className="flex">
            <span className="text-xs font-medium text-gray-500 w-16">Срок:</span>
            <span className="text-sm font-medium text-blue-600">{patient.gestation}</span>
          </div>
          <div className="flex">
            <span className="text-xs font-medium text-gray-500 w-16">Место:</span>
            <span className="text-xs text-gray-600 leading-tight">{patient.location}</span>
          </div>
          <div className="flex">
            <span className="text-xs font-medium text-gray-500 w-16">Устр-во:</span>
            <span className="text-xs text-blue-600 leading-tight">{patient.deviceModel}</span>
          </div>
        </div>

        {/* Показатели домашнего мониторинга */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="text-center px-1 py-0.5 bg-gray-50 rounded border border-gray-100">
            <div className="text-xs text-gray-600 font-medium mb-0.5">Подключение</div>
            <div className="text-base font-bold" style={{ 
              color: deviceConnected !== false ? '#52c41a' : '#f5222d' 
            }}>
              {deviceConnected !== false ? '✓' : '✗'}
            </div>
            <div className="text-xs text-gray-400">устройство</div>
          </div>
          <div className="text-center px-1 py-0.5 bg-gray-50 rounded border border-gray-100">
            <div className="text-xs text-gray-600 font-medium mb-0.5">Посл. движ.</div>
            <div className="text-base font-bold" style={{ 
              color: (lastMovement || 8) > 30 ? '#f5222d' : (lastMovement || 8) > 15 ? '#fa8c16' : '#52c41a'
            }}>
              {lastMovement || 8}м
            </div>
            <div className="text-xs text-gray-400">назад</div>
          </div>
          <div className="text-center px-1 py-0.5 bg-gray-50 rounded border border-gray-100">
            <div className="text-xs text-gray-600 font-medium mb-0.5">Сеанс</div>
            <div className="text-sm font-bold text-gray-700 font-mono">{fmtTime(recordingSec ?? 247)}</div>
            <div className="text-xs text-gray-400">длится</div>
          </div>
        </div>

        {/* Риск осложнений для домашнего мониторинга */}
        <div className="space-y-2">
          <div className="text-xs text-gray-600 font-medium">
            Оценка состояния: {status} ({risk}%)
          </div>
          <Progress 
            percent={risk} 
            strokeColor={
              risk < 30 ? colors.risk.low :    // Зеленый - норма (все хорошо)
              risk < 60 ? colors.risk.medium : // Желтый - наблюдение (требует внимания)
              colors.risk.high                 // Красный - тревога (нужна консультация)
            }
            trailColor={colors.background.gray}
            strokeWidth={6}
            format={() => `${risk}%`}
            className="text-xs"
          />
          <div style={typography.styles.caption}>
            • 0-30% — Норма (спокойное состояние)
            <br />
            • 30-60% — Наблюдение (контроль параметров) 
            <br />
            • 60-100% — Тревога (обратиться к врачу)
          </div>
        </div>
      </Space>
    </Card>
  );
}