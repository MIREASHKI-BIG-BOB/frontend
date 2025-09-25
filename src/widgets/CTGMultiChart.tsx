import { Card, Typography, Segmented, Space, Statistic, Row, Col, Badge, Progress, Alert } from 'antd';
import { 
  HeartOutlined, 
  UserOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { useEffect, useState } from 'react';
import { AlertSystem } from '../utils/AlertSystem';

const { Text } = Typography;

type MonitoringType = 'fetus' | 'mother' | 'uterus';

interface CTGData {
  t: number;
  // Плод
  fhr: number; // частота сердечных сокращений плода
  // Мать  
  mhr: number; // частота сердечных сокращений матери
  bp_sys: number; // систолическое давление
  bp_dia: number; // диастолическое давление
  // Матка
  uc: number; // маточные сокращения
  iup: number; // внутриматочное давление
}

// Генерация данных для разных типов мониторинга
function generateCTGData(n = 100): CTGData[] {
  const now = Date.now();
  const data: CTGData[] = [];
  
  let fetalBaseline = 140;
  let maternalBaseline = 75;
  let contractionPhase = 0;
  let pressureBase = 120;
  
  for (let i = 0; i < n; i++) {
    // Плод - ЧСС
    fetalBaseline += (Math.random() - 0.5) * 0.8;
    fetalBaseline = Math.max(120, Math.min(160, fetalBaseline));
    let fhr = fetalBaseline + Math.sin(i * 0.1) * 6 + (Math.random() - 0.5) * 10;
    
    // Occasional decelerations (плод)
    if (Math.random() < 0.02) {
      fhr -= 15 + Math.random() * 20;
    }
    
    // Мать - ЧСС
    maternalBaseline += (Math.random() - 0.5) * 0.3;
    maternalBaseline = Math.max(60, Math.min(100, maternalBaseline));
    let mhr = maternalBaseline + Math.sin(i * 0.08) * 3 + (Math.random() - 0.5) * 5;
    
    // Давление матери
    let bp_sys = pressureBase + Math.sin(i * 0.05) * 10 + (Math.random() - 0.5) * 8;
    let bp_dia = bp_sys - 40 - Math.random() * 15;
    
    // Матка - сокращения
    let uc = 10 + Math.sin(i * 0.04) * 20 + (Math.random() - 0.5) * 5;
    let iup = 8 + Math.sin(i * 0.03) * 15 + (Math.random() - 0.5) * 4;
    
    // Periodic contractions
    if (Math.sin(i * 0.02) > 0.6) {
      uc += Math.sin(contractionPhase) * 50;
      iup += Math.sin(contractionPhase) * 25;
      contractionPhase += 0.4;
    } else {
      contractionPhase = 0;
    }
    
    data.push({
      t: now - (n - i) * 1000,
      fhr: Math.max(90, Math.min(200, fhr)),
      mhr: Math.max(50, Math.min(120, mhr)),
      bp_sys: Math.max(90, Math.min(160, bp_sys)),
      bp_dia: Math.max(50, Math.min(110, bp_dia)),
      uc: Math.max(0, Math.min(100, uc)),
      iup: Math.max(0, Math.min(50, iup))
    });
  }
  
  return data;
}

// Конфигурации для разных типов мониторинга
const monitoringConfigs = {
  fetus: {
    title: 'Мониторинг плода',
    icon: <HeartOutlined />,
    color: '#6a4162',
    lines: [
      { key: 'fhr', name: 'ЧСС плода (уд/мин)', color: '#6a4162', yAxisId: 'left', domain: [90, 200] }
    ],
    referenceLines: [
      { value: 110, color: '#ff4d4f', yAxisId: 'left', label: 'Мин. норма' },
      { value: 160, color: '#ff4d4f', yAxisId: 'left', label: 'Макс. норма' }
    ],
    statistics: ['fhr']
  },
  mother: {
    title: 'Мониторинг матери',
    icon: <UserOutlined />,
    color: '#1890ff',
    lines: [
      { key: 'mhr', name: 'ЧСС матери (уд/мин)', color: '#1890ff', yAxisId: 'left', domain: [50, 120] },
      { key: 'bp_sys', name: 'АД систол. (мм рт.ст.)', color: '#52c41a', yAxisId: 'right', domain: [80, 170] },
      { key: 'bp_dia', name: 'АД диастол. (мм рт.ст.)', color: '#faad14', yAxisId: 'right', domain: [40, 120] }
    ],
    referenceLines: [
      { value: 60, color: '#ff4d4f', yAxisId: 'left', label: 'ЧСС мин' },
      { value: 100, color: '#ff4d4f', yAxisId: 'left', label: 'ЧСС макс' },
      { value: 140, color: '#faad14', yAxisId: 'right', label: 'АД макс' }
    ],
    statistics: ['mhr', 'bp_sys', 'bp_dia']
  },
  uterus: {
    title: 'Мониторинг матки',
    icon: <ExclamationCircleOutlined />,
    color: '#f39db6',
    lines: [
      { key: 'uc', name: 'Маточные сокращения (%)', color: '#f39db6', yAxisId: 'left', domain: [0, 100] },
      { key: 'iup', name: 'Внутриматочное давление (мм рт.ст.)', color: '#722ed1', yAxisId: 'right', domain: [0, 50] }
    ],
    referenceLines: [
      { value: 70, color: '#faad14', yAxisId: 'left', label: 'Высокая активность' },
      { value: 25, color: '#ff4d4f', yAxisId: 'right', label: 'Высокое давление' }
    ],
    statistics: ['uc', 'iup']
  }
};

interface CTGMultiChartProps {
  fpsMs?: number;
  windowLengthSec?: number;
  onRiskChange?: (risk: 'ok' | 'warn' | 'danger', score: number) => void;
  alertSystem?: AlertSystem;
}

export default function CTGMultiChart({ 
  fpsMs = 1000, 
  windowLengthSec = 180, 
  onRiskChange,
  alertSystem 
}: CTGMultiChartProps) {
  const [monitoringType, setMonitoringType] = useState<MonitoringType>('fetus');
  const [data, setData] = useState<CTGData[]>(generateCTGData(100));
  const [anomalyZones, setAnomalyZones] = useState<Array<{start: number, end: number, type: string}>>([]);
  const [currentRisk, setCurrentRisk] = useState<'ok' | 'warn' | 'danger'>('ok');
  const [riskScore, setRiskScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const lastTime = prev[prev.length - 1]?.t || Date.now();
        const nextTime = lastTime + 1000;
        
        const lastPoint = prev[prev.length - 1];
        if (!lastPoint) return prev;
        
        // Генерация новой точки на основе предыдущих значений
        let fhr = lastPoint.fhr + (Math.random() - 0.5) * 8;
        let mhr = lastPoint.mhr + (Math.random() - 0.5) * 4;
        let bp_sys = lastPoint.bp_sys + (Math.random() - 0.5) * 6;
        let bp_dia = lastPoint.bp_dia + (Math.random() - 0.5) * 4;
        let uc = lastPoint.uc + (Math.random() - 0.5) * 8;
        let iup = lastPoint.iup + (Math.random() - 0.5) * 6;
        
        // События для создания аномалий
        if (Math.random() < 0.008) {
          fhr = Math.max(90, fhr - 30); // брадикардия плода
        }
        if (Math.random() < 0.005) {
          mhr = Math.max(50, mhr - 20); // брадикардия матери
        }
        if (Math.random() < 0.006) {
          bp_sys = Math.min(170, bp_sys + 25); // гипертензия
        }
        if (Math.random() < 0.010) {
          uc = Math.min(100, uc + 35); // сильная схватка
        }
        
        const newPoint: CTGData = {
          t: nextTime,
          fhr: Math.max(90, Math.min(200, fhr)),
          mhr: Math.max(50, Math.min(120, mhr)),
          bp_sys: Math.max(80, Math.min(170, bp_sys)),
          bp_dia: Math.max(40, Math.min(120, bp_dia)),
          uc: Math.max(0, Math.min(100, uc)),
          iup: Math.max(0, Math.min(50, iup))
        };
        
        const newData = [...prev, newPoint];
        const maxPoints = windowLengthSec || 180;
        const finalData = newData.length > maxPoints ? newData.slice(-maxPoints) : newData;
        
        // Оценка риска
        const recent = finalData.slice(-10);
        let score = 0;
        let risk: 'ok' | 'warn' | 'danger' = 'ok';
        
        if (monitoringType === 'fetus') {
          const avgFhr = recent.reduce((sum, p) => sum + p.fhr, 0) / recent.length;
          if (avgFhr < 110 || avgFhr > 170) score += 60;
          else if (avgFhr < 120 || avgFhr > 160) score += 30;
        } else if (monitoringType === 'mother') {
          const avgMhr = recent.reduce((sum, p) => sum + p.mhr, 0) / recent.length;
          const avgSys = recent.reduce((sum, p) => sum + p.bp_sys, 0) / recent.length;
          if (avgMhr < 60 || avgMhr > 100) score += 40;
          if (avgSys > 140) score += 50;
        } else if (monitoringType === 'uterus') {
          const maxUc = Math.max(...recent.map(p => p.uc));
          const maxIup = Math.max(...recent.map(p => p.iup));
          if (maxUc > 80) score += 40;
          if (maxIup > 25) score += 35;
        }
        
        if (score < 30) risk = 'ok';
        else if (score < 60) risk = 'warn';
        else risk = 'danger';
        
        setCurrentRisk(risk);
        setRiskScore(score);
        onRiskChange?.(risk, score);
        
        return finalData;
      });
    }, fpsMs);

    return () => clearInterval(interval);
  }, [fpsMs, windowLengthSec, onRiskChange, monitoringType]);

  const timeFmt = (t: number) => new Date(t).toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const config = monitoringConfigs[monitoringType];
  const recentData = data.slice(-10);

  // Статистика для текущего типа мониторинга
  const getStatistics = () => {
    if (recentData.length === 0) return {};
    
    const stats: { [key: string]: { current: number; avg: number; status: 'normal' | 'warning' | 'danger' } } = {};
    
    config.statistics.forEach(key => {
      const values = recentData.map(d => d[key as keyof CTGData] as number);
      const current = values[values.length - 1];
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      
      let status: 'normal' | 'warning' | 'danger' = 'normal';
      
      if (key === 'fhr') {
        if (current < 110 || current > 170) status = 'danger';
        else if (current < 120 || current > 160) status = 'warning';
      } else if (key === 'mhr') {
        if (current < 60 || current > 100) status = 'warning';
      } else if (key === 'bp_sys') {
        if (current > 140) status = 'danger';
        else if (current > 130) status = 'warning';
      } else if (key === 'uc') {
        if (current > 80) status = 'warning';
      } else if (key === 'iup') {
        if (current > 25) status = 'danger';
        else if (current > 20) status = 'warning';
      }
      
      stats[key] = { current: Math.round(current), avg: Math.round(avg), status };
    });
    
    return stats;
  };

  const statistics = getStatistics();
  const riskColor = currentRisk === 'ok' ? '#52c41a' : currentRisk === 'warn' ? '#faad14' : '#ff4d4f';
  const riskIcon = currentRisk === 'ok' ? <CheckCircleOutlined /> : currentRisk === 'warn' ? <WarningOutlined /> : <CloseCircleOutlined />;

  return (
    <Card 
      title={
        <Space>
          {config.icon}
          <Text strong>{config.title}</Text>
        </Space>
      }
      extra={
        <Space>
          <Badge color={riskColor} text={`Риск: ${riskScore}%`} />
          {riskIcon}
        </Space>
      }
    >
      {/* Переключатель типа мониторинга */}
      <div className="mb-4">
        <Segmented
          value={monitoringType}
          onChange={setMonitoringType}
          options={[
            { label: 'Плод', value: 'fetus', icon: <HeartOutlined /> },
            { label: 'Мать', value: 'mother', icon: <UserOutlined /> },
            { label: 'Матка', value: 'uterus', icon: <ExclamationCircleOutlined /> }
          ]}
        />
      </div>

      {/* Статистика */}
      <Row gutter={16} className="mb-4">
        {Object.entries(statistics).map(([key, stat]) => {
          const getStatTitle = (key: string) => {
            switch(key) {
              case 'fhr': return 'ЧСС плода';
              case 'mhr': return 'ЧСС матери';  
              case 'bp_sys': return 'АД сист.';
              case 'bp_dia': return 'АД диаст.';
              case 'uc': return 'Схватки';
              case 'iup': return 'Давление';
              default: return key;
            }
          };

          const getUnit = (key: string) => {
            switch(key) {
              case 'fhr':
              case 'mhr': return 'уд/мин';
              case 'bp_sys': 
              case 'bp_dia':
              case 'iup': return 'мм рт.ст.';
              case 'uc': return '%';
              default: return '';
            }
          };

          return (
            <Col span={24 / config.statistics.length} key={key}>
              <Statistic
                title={getStatTitle(key)}
                value={stat.current}
                suffix={getUnit(key)}
                valueStyle={{ 
                  color: stat.status === 'normal' ? '#52c41a' : 
                         stat.status === 'warning' ? '#faad14' : '#ff4d4f'
                }}
                prefix={
                  stat.status === 'normal' ? <CheckCircleOutlined /> :
                  stat.status === 'warning' ? <WarningOutlined /> : <CloseCircleOutlined />
                }
              />
            </Col>
          );
        })}
      </Row>

      {/* Индикатор общего риска */}
      {currentRisk !== 'ok' && (
        <Alert
          type={currentRisk === 'warn' ? 'warning' : 'error'}
          message={`${currentRisk === 'warn' ? 'Внимание' : 'Критическое состояние'}: обнаружены отклонения в показателях`}
          showIcon
          className="mb-4"
        />
      )}

      {/* График */}
      <div className="h-[400px] bg-gray-50 rounded-md">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="t" 
              tickFormatter={timeFmt} 
              minTickGap={30} 
              fontSize={11}
            />
            
            {/* Левая ось Y */}
            <YAxis 
              yAxisId="left" 
              domain={config.lines.find(l => l.yAxisId === 'left')?.domain || [0, 100]}
              fontSize={11}
              width={35}
            />
            
            {/* Правая ось Y (если есть) */}
            {config.lines.some(l => l.yAxisId === 'right') && (
              <YAxis 
                yAxisId="right" 
                orientation="right"
                domain={config.lines.find(l => l.yAxisId === 'right')?.domain || [0, 100]}
                fontSize={11}
                width={35}
              />
            )}
            
            <Tooltip 
              labelFormatter={(v) => timeFmt(v as number)}
              formatter={(value: number, name: string) => [Math.round(value), name]}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            
            {/* Референсные линии */}
            {config.referenceLines.map((line, index) => (
              <ReferenceLine
                key={index}
                yAxisId={(line as any).yAxisId || 'left'}
                y={line.value}
                stroke={line.color}
                strokeDasharray="2 2"
                strokeWidth={1}
              />
            ))}
            
            {/* Линии данных */}
            {config.lines.map((line, index) => (
              <Line 
                key={index}
                type="monotone" 
                yAxisId={line.yAxisId}
                dataKey={line.key} 
                name={line.name}
                stroke={line.color} 
                dot={false} 
                strokeWidth={2}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Информация */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Окно: {windowLengthSec}с
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Обновление: {fpsMs}мс
              </Text>
            </Space>
          </Col>
          <Col>
            <Progress 
              percent={riskScore}
              size="small"
              strokeColor={riskColor}
              showInfo={false}
              style={{ width: '100px' }}
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
}