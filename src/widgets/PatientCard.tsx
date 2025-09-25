import { Card, Typography, Progress, Tag, Space, Statistic, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

function fmtTime(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec || 0));
  const hh = Math.floor(s / 3600).toString().padStart(2, '0');
  const mm = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

interface PatientCardProps {
  risk?: number; // 0..100
  spo2?: number; // mother's SpO2
  movements?: number; // fetal movements count
  recordingSec?: number; // recording timer
}

export default function PatientCard({ risk: riskProp, spo2, movements, recordingSec }: PatientCardProps) {
  // demo data
  const patient = {
    name: 'Иванова Анна',
    age: 29,
    gestation: '34 нед.',
    anamnesis: 'Преэклампсия в анамнезе',
  };
  const risk = typeof riskProp === 'number' ? Math.round(riskProp) : 70; // %
  const status = risk < 30 ? 'Норма' : risk < 60 ? 'Подозрение' : 'Критично';

  return (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar 
              size={28}
              style={{ backgroundColor: '#e91e63' }}
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
      bodyStyle={{ padding: '16px' }}
      headStyle={{ fontSize: '14px', fontWeight: '600' }}
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
            <span className="text-xs font-medium text-gray-500 w-16">Анамнез:</span>
            <span className="text-xs text-gray-600 leading-tight">{patient.anamnesis}</span>
          </div>
        </div>

        {/* Показатели мониторинга - ключевые медицинские данные */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="text-center px-1 py-0.5 bg-gray-50 rounded border border-gray-100">
            <div className="text-xs text-gray-600 font-medium mb-0.5">SpO₂ мамы</div>
            <div className="text-base font-bold" style={{ color: '#6a4162' }}>{typeof spo2 === 'number' ? spo2 : 98}%</div>
            <div className="text-xs text-gray-400">сатурация O₂</div>
          </div>
          <div className="text-center px-1 py-0.5 bg-gray-50 rounded border border-gray-100">
            <div className="text-xs text-gray-600 font-medium mb-0.5">Д. п.</div>
            <div className="text-base font-bold" style={{ color: '#e91e63' }}>{typeof movements === 'number' ? movements : 12}</div>
                        <div className="text-xs text-gray-400">За посл. час</div>
          </div>
          <div className="text-center px-1 py-0.5 bg-gray-50 rounded border border-gray-100">
            <div className="text-xs text-gray-600 font-medium mb-0.5">Запись</div>
            <div className="text-sm font-bold text-gray-700 font-mono">{fmtTime(recordingSec ?? 189)}</div>
            <div className="text-xs text-gray-400">время КТГ</div>
          </div>
        </div>

        {/* Риск осложнений - прогресс-бар показывает вероятность осложнений в % */}
        <div className="space-y-2">
          <div className="text-xs text-gray-600 font-medium">
            Риск осложнений: {status} ({risk}%)
          </div>
          <Progress 
            percent={risk} 
            strokeColor={
              risk < 30 ? '#10b981' :  // Зеленый - низкий риск (норма)
              risk < 60 ? '#f59e0b' :  // Желтый - умеренный риск (подозрение)
              '#e91e63'                // Красный - высокий риск (критично)
            }
            trailColor="#e5e7eb"
            strokeWidth={6}
            format={() => `${risk}%`}
            className="text-xs"
          />
          <div className="text-xs text-gray-500 leading-tight">
            • 0-30% — Норма (низкий риск осложнений)
            <br />
            • 30-60% — Подозрение (требует наблюдения) 
            <br />
            • 60-100% — Критично (немедленная помощь)
          </div>
        </div>
      </Space>
    </Card>
  );
}