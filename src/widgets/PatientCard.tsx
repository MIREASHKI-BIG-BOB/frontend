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
              size={24}
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
              icon={<UserOutlined />}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>Пациентка</span>
          </div>
          <Tag 
            color={risk < 30 ? 'success' : risk < 60 ? 'warning' : 'error'}
            className="text-xs"
            style={{ 
              fontSize: '10px',
              padding: '2px 6px',
              background: risk < 30 ? '#f0f9ff' : risk < 60 ? '#fffbeb' : '#fef2f2',
              color: risk < 30 ? '#0c4a6e' : risk < 60 ? '#92400e' : '#991b1b',
              border: `1px solid ${risk < 30 ? '#bae6fd' : risk < 60 ? '#fed7aa' : '#fecaca'}`
            }}
          >
            {status}
          </Tag>
        </div>
      } 
      className="h-full"
      bodyStyle={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}
      headStyle={{ 
        padding: '6px 12px', 
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        borderBottom: '1px solid #f3e8ff'
      }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      aria-label="Карточка пациентки"
    >
      <Space direction="vertical" size="small" className="w-full">
        {/* Основная информация - компактно в розовой палитре */}
        <div className="space-y-1.5 p-2 rounded-lg" style={{ 
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
          border: '1px solid #f3e8ff'
        }}>
          <div className="flex items-center">
            <span className="text-xs font-medium w-12" style={{ color: '#831843' }}>ФИО:</span>
            <span className="text-sm font-semibold" style={{ color: '#a21caf' }}>{patient.name}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium w-12" style={{ color: '#831843' }}>Возраст:</span>
            <span className="text-sm" style={{ color: '#831843' }}>{patient.age}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium w-12" style={{ color: '#831843' }}>Срок:</span>
            <span className="text-sm font-medium" style={{ color: '#ec4899' }}>{patient.gestation}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium w-12" style={{ color: '#831843' }}>Место:</span>
            <span className="text-xs" style={{ color: '#831843', opacity: 0.8 }}>{patient.location}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium w-12" style={{ color: '#831843' }}>Устр-во:</span>
            <span className="text-xs" style={{ color: '#ec4899' }}>{patient.deviceModel}</span>
          </div>
        </div>

        {/* Показатели домашнего мониторинга - компактно */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="text-center px-1.5 py-1.5 rounded" style={{ 
            backgroundColor: '#fef7ff', 
            border: '1px solid #f3e8ff' 
          }}>
            <div className="text-xs font-medium mb-1" style={{ color: '#831843' }}>Подключение</div>
            <div className="text-lg font-bold" style={{ 
              color: deviceConnected !== false ? '#22c55e' : '#ef4444' 
            }}>
              {deviceConnected !== false ? '✓' : '✗'}
            </div>
            <div className="text-xs" style={{ color: '#831843', opacity: 0.7 }}>устройство</div>
          </div>
          <div className="text-center px-1.5 py-1.5 rounded" style={{ 
            backgroundColor: '#fef7ff', 
            border: '1px solid #f3e8ff' 
          }}>
            <div className="text-xs font-medium mb-1" style={{ color: '#831843' }}>Посл. движ.</div>
            <div className="text-lg font-bold" style={{ 
              color: (lastMovement || 8) > 30 ? '#ef4444' : (lastMovement || 8) > 15 ? '#f59e0b' : '#22c55e'
            }}>
              {lastMovement || 8}м
            </div>
            <div className="text-xs" style={{ color: '#831843', opacity: 0.7 }}>назад</div>
          </div>
          <div className="text-center px-1.5 py-1.5 rounded" style={{ 
            backgroundColor: '#fef7ff', 
            border: '1px solid #f3e8ff' 
          }}>
            <div className="text-xs font-medium mb-1" style={{ color: '#831843' }}>Сеанс</div>
            <div className="text-sm font-bold font-mono" style={{ color: '#a21caf' }}>
              {fmtTime(recordingSec ?? 247)}
            </div>
            <div className="text-xs" style={{ color: '#831843', opacity: 0.7 }}>длится</div>
          </div>
        </div>

        {/* Риск осложнений - компактно в розовой палитре */}
        <div className="space-y-2">
          <div className="text-xs font-medium" style={{ color: '#831843' }}>
            Оценка состояния: <span style={{ color: '#ec4899' }}>{status} ({risk}%)</span>
          </div>
          <Progress 
            percent={risk} 
            strokeColor={
              risk < 30 ? '#22c55e' :    // Зеленый - норма
              risk < 60 ? '#f59e0b' :    // Желтый - наблюдение
              '#ef4444'                   // Красный - тревога
            }
            trailColor="#f3e8ff"
            strokeWidth={6}
            format={() => `${risk}%`}
            className="text-xs"
          />
          <div className="text-xs leading-tight" style={{ color: '#831843', opacity: 0.8 }}>
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