import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Space, Typography, Progress, Collapse, Statistic, Row, Col, Checkbox, Alert, Spin } from 'antd';
import { 
  ThunderboltOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined,
  HeartOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  RobotOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
  SyncOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface CTGSession {
  id: string;
  date: string;
  duration: number;
  week: number;
  day: number;
  status: 'normal' | 'warning' | 'critical' | 'pending';
  score: number | null;
  aiAnalysis: {
    summary: string;
    fhrAnalysis: string;
    ucAnalysis: string;
    recommendations: string[];
    risks: string[];
  } | null;
}

interface PatientInfo {
  name: string;
  age: number;
  id: string;
  currentWeek: number;
  currentDay: number;
}

// Информация о пациенте
const patientInfo: PatientInfo = {
  name: 'Иванова Мария Петровна',
  age: 28,
  id: 'P-2025-001',
  currentWeek: 35,
  currentDay: 4
};

// Моковые данные КТГ-сессий для одного пациента
const initialSessions: CTGSession[] = [
  {
    id: 'ctg-001',
    date: '2025-10-01 14:30',
    duration: 45,
    week: 35,
    day: 4,
    status: 'pending',
    score: null,
    aiAnalysis: null
  },
  {
    id: 'ctg-002',
    date: '2025-09-29 11:15',
    duration: 40,
    week: 35,
    day: 2,
    status: 'pending',
    score: null,
    aiAnalysis: null
  },
  {
    id: 'ctg-003',
    date: '2025-09-27 16:45',
    duration: 50,
    week: 34,
    day: 7,
    status: 'pending',
    score: null,
    aiAnalysis: null
  },
  {
    id: 'ctg-004',
    date: '2025-09-25 09:20',
    duration: 42,
    week: 34,
    day: 5,
    status: 'pending',
    score: null,
    aiAnalysis: null
  },
  {
    id: 'ctg-005',
    date: '2025-09-23 13:00',
    duration: 38,
    week: 34,
    day: 3,
    status: 'pending',
    score: null,
    aiAnalysis: null
  },
  {
    id: 'ctg-006',
    date: '2025-09-21 10:30',
    duration: 43,
    week: 34,
    day: 1,
    status: 'pending',
    score: null,
    aiAnalysis: null
  },
  {
    id: 'ctg-007',
    date: '2025-09-19 14:15',
    duration: 47,
    week: 33,
    day: 6,
    status: 'pending',
    score: null,
    aiAnalysis: null
  }
];

// Моковые результаты ИИ-анализа
const mockAIResults: Record<string, Omit<CTGSession, 'id' | 'date' | 'duration' | 'week' | 'day'>> = {
  'ctg-001': {
    status: 'warning',
    score: 72,
    aiAnalysis: {
      summary: 'Обнаружены признаки лёгкой тахикардии плода и нерегулярные сокращения матки. Общее состояние удовлетворительное, рекомендуется наблюдение.',
      fhrAnalysis: 'ЧСС плода варьируется в диапазоне 155-170 уд/мин (норма 110-160). Зафиксированы периоды тахикардии продолжительностью до 8 минут. Вариабельность ЧСС умеренная (8-12 уд/мин), что является положительным признаком. Акцелерации присутствуют, децелераций не обнаружено.',
      ucAnalysis: 'Сокращения матки происходят с нерегулярными интервалами (8-15 минут). Интенсивность сокращений варьируется от 25 до 45 мм рт.ст. Продолжительность сокращений 45-65 секунд. Тонус матки в норме (8-12 мм рт.ст).',
      recommendations: [
        'Повторить КТГ через 3-4 дня',
        'Контроль артериального давления матери',
        'Увеличить потребление жидкости',
        'Избегать стрессовых ситуаций',
        'Консультация акушера-гинеколога'
      ],
      risks: [
        'Риск развития гипоксии плода (низкий)',
        'Возможность преждевременных родов (низкий)'
      ]
    }
  },
  'ctg-002': {
    status: 'normal',
    score: 95,
    aiAnalysis: {
      summary: 'Все показатели в пределах нормы. КТГ демонстрирует хорошее состояние плода и адекватную активность матки. Признаков патологии не обнаружено.',
      fhrAnalysis: 'ЧСС плода стабильная, в диапазоне 135-145 уд/мин (норма 110-160). Вариабельность ЧСС отличная (10-15 уд/мин). Множественные акцелерации амплитудой 15-20 уд/мин. Децелераций не обнаружено. Реактивность плода отличная.',
      ucAnalysis: 'Сокращения матки регулярные, с интервалом 10-12 минут. Интенсивность 30-40 мм рт.ст. Продолжительность 50-60 секунд. Тонус матки нормальный (8-10 мм рт.ст). Паттерн сокращений характерен для доношенной беременности.',
      recommendations: [
        'Продолжить стандартное наблюдение',
        'Следующее КТГ через неделю',
        'Поддерживать физическую активность',
        'Продолжить приём витаминов для беременных'
      ],
      risks: []
    }
  },
  'ctg-003': {
    status: 'critical',
    score: 45,
    aiAnalysis: {
      summary: 'КРИТИЧЕСКОЕ СОСТОЯНИЕ: обнаружены поздние децелерации и признаки брадикардии плода. Требуется немедленная консультация врача и возможная госпитализация.',
      fhrAnalysis: 'ЧСС плода снижена до 95-110 уд/мин (норма 110-160). Зафиксированы множественные поздние децелерации амплитудой до 30 уд/мин, следующие за каждым сокращением матки. Вариабельность ЧСС снижена (5-7 уд/мин). Акцелераций практически нет. Реактивность плода значительно снижена.',
      ucAnalysis: 'Частые сокращения матки с интервалом 4-6 минут. Повышенная интенсивность (50-70 мм рт.ст). Продолжительность 60-90 секунд. Повышенный тонус матки (15-18 мм рт.ст). Паттерн может указывать на начало родовой деятельности или дистресс плода.',
      recommendations: [
        'СРОЧНО: немедленная консультация врача',
        'Рассмотреть госпитализацию',
        'Возможная необходимость экстренного родоразрешения',
        'Дополнительное УЗИ с допплерометрией',
        'Постоянный мониторинг состояния плода',
        'Оценка показаний к кесареву сечению'
      ],
      risks: [
        'ВЫСОКИЙ риск гипоксии плода',
        'Риск асфиксии плода при родах',
        'Возможность дистресса плода',
        'Необходимость экстренного вмешательства'
      ]
    }
  },
  'ctg-004': {
    status: 'normal',
    score: 88,
    aiAnalysis: {
      summary: 'КТГ соответствует сроку беременности. Все показатели в пределах нормы. Плод демонстрирует хорошую реактивность и адаптационные способности.',
      fhrAnalysis: 'ЧСС плода в норме: 140-150 уд/мин. Вариабельность хорошая (12-15 уд/мин). Регулярные акцелерации амплитудой 15-25 уд/мин, связанные с движениями плода. Децелераций нет. Базальный ритм стабильный.',
      ucAnalysis: 'Умеренные сокращения матки с интервалом 12-15 минут. Интенсивность 25-35 мм рт.ст. Продолжительность 45-55 секунд. Тонус матки в норме (8-10 мм рт.ст). Сократительная активность соответствует сроку.',
      recommendations: [
        'Продолжить плановое наблюдение',
        'КТГ через 7-10 дней',
        'Подготовка к родам в срок',
        'Продолжить витаминотерапию'
      ],
      risks: []
    }
  },
  'ctg-005': {
    status: 'warning',
    score: 68,
    aiAnalysis: {
      summary: 'Выявлены ранние децелерации и сниженная вариабельность ЧСС. Требуется дополнительное обследование и контроль через 2-3 дня.',
      fhrAnalysis: 'ЧСС плода в пределах нормы (130-145 уд/мин), но вариабельность снижена (6-8 уд/мин). Обнаружены ранние децелерации амплитудой 10-15 уд/мин, синхронные с сокращениями матки. Акцелерации присутствуют, но редкие.',
      ucAnalysis: 'Сокращения матки нерегулярные, интервалы 10-18 минут. Интенсивность умеренная (20-35 мм рт.ст). Продолжительность вариабельная (40-70 секунд). Тонус матки нормальный.',
      recommendations: [
        'КТГ-контроль через 2-3 дня',
        'Дополнительное УЗИ',
        'Контроль самочувствия и движений плода',
        'Избегать физических нагрузок',
        'Консультация акушера'
      ],
      risks: [
        'Риск компрессии пуповины (умеренный)',
        'Возможна фетоплацентарная недостаточность'
      ]
    }
  },
  'ctg-006': {
    status: 'normal',
    score: 92,
    aiAnalysis: {
      summary: 'Отличное состояние плода. Все показатели в норме. Высокая реактивность и хорошая адаптация к внутриутробным условиям.',
      fhrAnalysis: 'ЧСС плода оптимальная: 138-148 уд/мин. Отличная вариабельность (13-16 уд/мин). Частые акцелерации хорошей амплитуды. Децелераций нет. Признаки активного и здорового плода.',
      ucAnalysis: 'Регулярные умеренные сокращения с интервалом 11-13 минут. Нормальная интенсивность (28-38 мм рт.ст). Тонус матки в норме. Паттерн идеален для данного срока.',
      recommendations: [
        'Продолжить наблюдение по стандартному графику',
        'КТГ через неделю',
        'Поддерживать текущий режим',
        'Сохранять физическую активность'
      ],
      risks: []
    }
  },
  'ctg-007': {
    status: 'warning',
    score: 74,
    aiAnalysis: {
      summary: 'Обнаружена небольшая тахикардия и единичные ранние децелерации. Состояние требует контроля, но не критично.',
      fhrAnalysis: 'ЧСС плода повышена: 158-168 уд/мин (норма 110-160). Вариабельность удовлетворительная (9-12 уд/мин). Единичные ранние децелерации небольшой амплитуды. Акцелерации присутствуют.',
      ucAnalysis: 'Сокращения матки с интервалом 9-14 минут. Интенсивность в норме (30-42 мм рт.ст). Продолжительность 48-58 секунд. Тонус матки нормальный.',
      recommendations: [
        'КТГ-контроль через 4-5 дней',
        'Контроль температуры матери',
        'Избегать перегрева',
        'Достаточный питьевой режим',
        'При ухудшении - немедленный осмотр'
      ],
      risks: [
        'Возможная материнская лихорадка',
        'Риск гипоксии (низкий)'
      ]
    }
  }
};

export default function AIAnalysis() {
  const [sessions, setSessions] = useState<CTGSession[]>(initialSessions);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAnalyzingId, setCurrentAnalyzingId] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(sessions.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectSession = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleAnalyze = async () => {
    if (selectedIds.length === 0) return;

    setIsAnalyzing(true);
    setProgress(0);

    // Симуляция анализа с прогрессом (5 секунд)
    const totalTime = 5; // 5 секунд
    const intervalTime = 100; // обновление каждые 100мс
    const step = (100 * intervalTime) / (totalTime * 1000);

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Обновляем сессии по очереди
    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];
      setCurrentAnalyzingId(id);
      
      await new Promise(resolve => setTimeout(resolve, (totalTime * 1000) / selectedIds.length));
      
      setSessions(prev => prev.map(session => {
        if (session.id === id) {
          const result = mockAIResults[id];
          return { ...session, ...result };
        }
        return session;
      }));
    }

    clearInterval(interval);
    setProgress(100);
    setIsAnalyzing(false);
    setCurrentAnalyzingId(null);
    setSelectedIds([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      case 'pending': return '#94a3b8';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircleOutlined />;
      case 'warning': return <WarningOutlined />;
      case 'critical': return <CloseCircleOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      default: return <CheckCircleOutlined />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Норма';
      case 'warning': return 'Внимание';
      case 'critical': return 'Критично';
      case 'pending': return 'Ожидает анализа';
      default: return 'Неизвестно';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const analyzedCount = sessions.filter(s => s.status !== 'pending').length;
  const normalCount = sessions.filter(s => s.status === 'normal').length;
  const warningCount = sessions.filter(s => s.status === 'warning').length;
  const criticalCount = sessions.filter(s => s.status === 'critical').length;

  return (
    <div style={{ 
      padding: '16px',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
      minHeight: '100vh'
    }}>
      {/* Информация о пациенте */}
      <Card
        bordered={false}
        style={{ 
          marginBottom: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(6, 182, 212, 0.1)',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Space align="center" size="large">
          <UserOutlined style={{ fontSize: '32px', color: 'white' }} />
          <div>
            <Title level={3} style={{ margin: 0, color: 'white', fontSize: '20px' }}>
              {patientInfo.name}
            </Title>
            <Space size="large" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px' }}>
              <span>Возраст: {patientInfo.age} лет</span>
              <span>ID: {patientInfo.id}</span>
              <span>Срок: {patientInfo.currentWeek} нед {patientInfo.currentDay} дн</span>
            </Space>
          </div>
        </Space>
      </Card>

      {/* Статистика */}
      <Card
        bordered={false}
        style={{ 
          marginBottom: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title={<span style={{ fontSize: '11px' }}>Всего КТГ</span>}
              value={sessions.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ fontSize: '24px', color: '#06b6d4' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ fontSize: '11px' }}>Проанализировано</span>}
              value={analyzedCount}
              prefix={<RobotOutlined />}
              valueStyle={{ fontSize: '24px', color: '#06b6d4' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title={<span style={{ fontSize: '11px' }}>Норма</span>}
              value={normalCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ fontSize: '24px', color: '#10b981' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title={<span style={{ fontSize: '11px' }}>Внимание</span>}
              value={warningCount}
              prefix={<WarningOutlined />}
              valueStyle={{ fontSize: '24px', color: '#f59e0b' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title={<span style={{ fontSize: '11px' }}>Критично</span>}
              value={criticalCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ fontSize: '24px', color: '#ef4444' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Панель управления анализом */}
      <Card
        bordered={false}
        style={{ 
          marginBottom: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Space size="large">
            <Checkbox
              checked={selectedIds.length === sessions.length}
              indeterminate={selectedIds.length > 0 && selectedIds.length < sessions.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              disabled={isAnalyzing}
            >
              <Text style={{ fontSize: '12px', fontWeight: 600 }}>
                Выбрать все ({sessions.length})
              </Text>
            </Checkbox>
            <Text style={{ fontSize: '11px', color: '#64748b' }}>
              Выбрано: {selectedIds.length} из {sessions.length}
            </Text>
          </Space>

          <Button
            type="primary"
            size="large"
            icon={isAnalyzing ? <SyncOutlined spin /> : <PlayCircleOutlined />}
            onClick={handleAnalyze}
            disabled={selectedIds.length === 0 || isAnalyzing}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              height: '40px',
              padding: '0 24px'
            }}
          >
            {isAnalyzing ? 'Анализирую...' : `Запустить ИИ-анализ (${selectedIds.length})`}
          </Button>
        </div>

        {isAnalyzing && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <LoadingOutlined style={{ fontSize: '16px', color: '#06b6d4' }} />
                <Text style={{ fontSize: '12px', color: '#0891b2', fontWeight: 600 }}>
                  Искусственный интеллект анализирует КТГ-данные...
                </Text>
              </Space>
              <Text style={{ fontSize: '11px', color: '#64748b' }}>
                ~5 секунд
              </Text>
            </div>
            <Progress 
              percent={Math.round(progress)} 
              strokeColor={{
                '0%': '#06b6d4',
                '100%': '#0891b2',
              }}
              size="small"
            />
            {currentAnalyzingId && (
              <Text style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Обработка: {sessions.find(s => s.id === currentAnalyzingId)?.date}
              </Text>
            )}
          </div>
        )}
      </Card>

      {/* Список сессий */}
      <List
        dataSource={sessions}
        renderItem={(session) => (
          <Card
            key={session.id}
            bordered={false}
            style={{ 
              marginBottom: '12px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(6, 182, 212, 0.1)',
              borderLeft: `4px solid ${getStatusColor(session.status)}`,
              opacity: isAnalyzing && !selectedIds.includes(session.id) ? 0.5 : 1
            }}
            bodyStyle={{ padding: '16px' }}
          >
            {/* Краткая информация */}
            <div style={{ marginBottom: session.aiAnalysis ? '12px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Checkbox
                    checked={selectedIds.includes(session.id)}
                    onChange={(e) => handleSelectSession(session.id, e.target.checked)}
                    disabled={isAnalyzing || session.status !== 'pending'}
                    style={{ marginTop: '4px' }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Text strong style={{ fontSize: '14px', color: '#831843' }}>
                        КТГ-сессия #{session.id.split('-')[1]}
                      </Text>
                      <Tag 
                        icon={getStatusIcon(session.status)}
                        color={getStatusColor(session.status)}
                        style={{ fontSize: '10px', padding: '2px 8px' }}
                      >
                        {getStatusText(session.status)}
                      </Tag>
                    </div>
                    
                    <Space size="large" style={{ fontSize: '11px', color: '#64748b' }}>
                      <span>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {session.date}
                      </span>
                      <span>
                        <HeartOutlined style={{ marginRight: '4px' }} />
                        {session.week} нед {session.day} дн
                      </span>
                      <span>
                        <LineChartOutlined style={{ marginRight: '4px' }} />
                        {session.duration} мин
                      </span>
                    </Space>
                  </div>
                </div>

                {session.score !== null && (
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
                      Оценка ИИ
                    </div>
                    <Progress
                      type="circle"
                      percent={session.score}
                      size={60}
                      strokeColor={getScoreColor(session.score || 0)}
                      format={(percent) => (
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: getScoreColor(session.score || 0) }}>
                          {percent}
                        </span>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Краткое резюме */}
              {session.aiAnalysis && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '12px',
                  marginLeft: '36px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <ThunderboltOutlined style={{ color: '#06b6d4', fontSize: '14px', marginTop: '2px' }} />
                    <Text style={{ fontSize: '12px', color: '#0891b2', lineHeight: '1.5' }}>
                      {session.aiAnalysis.summary}
                    </Text>
                  </div>
                </div>
              )}
            </div>

            {/* Подробный анализ (раскрывающийся) */}
            {session.aiAnalysis && (
              <div style={{ marginLeft: '36px' }}>
                <Collapse
                  ghost
                  activeKey={expandedSession === session.id ? ['1'] : []}
                  onChange={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                >
                  <Panel 
                    header={
                      <Button 
                        type="link" 
                        style={{ padding: 0, fontSize: '12px', fontWeight: 600, color: '#06b6d4' }}
                      >
                        {expandedSession === session.id ? '▼ Скрыть детальный анализ' : '▶ Показать детальный анализ'}
                      </Button>
                    }
                    key="1"
                    showArrow={false}
                  >
                    <div style={{ paddingTop: '12px' }}>
                      {/* Анализ ЧСС */}
                      <Card 
                        size="small" 
                        title={
                          <span style={{ fontSize: '12px', color: '#0891b2' }}>
                            <HeartOutlined style={{ marginRight: '6px', color: '#06b6d4' }} />
                            Анализ частоты сердечных сокращений плода
                          </span>
                        }
                        bordered={false}
                        style={{ marginBottom: '12px', background: '#ecfeff' }}
                        bodyStyle={{ padding: '12px' }}
                      >
                        <Paragraph style={{ fontSize: '11px', color: '#64748b', marginBottom: 0, lineHeight: '1.6' }}>
                          {session.aiAnalysis.fhrAnalysis}
                        </Paragraph>
                      </Card>

                      {/* Анализ сокращений */}
                      <Card 
                        size="small" 
                        title={
                          <span style={{ fontSize: '12px', color: '#0891b2' }}>
                            <LineChartOutlined style={{ marginRight: '6px', color: '#06b6d4' }} />
                            Анализ сокращений матки
                          </span>
                        }
                        bordered={false}
                        style={{ marginBottom: '12px', background: '#cffafe' }}
                        bodyStyle={{ padding: '12px' }}
                      >
                        <Paragraph style={{ fontSize: '11px', color: '#64748b', marginBottom: 0, lineHeight: '1.6' }}>
                          {session.aiAnalysis.ucAnalysis}
                        </Paragraph>
                      </Card>

                      {/* Рекомендации */}
                      <Card 
                        size="small" 
                        title={
                          <span style={{ fontSize: '12px', color: '#0891b2' }}>
                            <CheckCircleOutlined style={{ marginRight: '6px', color: '#10b981' }} />
                            Рекомендации
                          </span>
                        }
                        bordered={false}
                        style={{ marginBottom: session.aiAnalysis.risks.length > 0 ? '12px' : 0, background: '#f0fdf4' }}
                        bodyStyle={{ padding: '12px' }}
                      >
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: '20px', 
                          fontSize: '11px', 
                          color: '#64748b',
                          lineHeight: '1.8'
                        }}>
                          {session.aiAnalysis.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </Card>

                      {/* Риски (если есть) */}
                      {session.aiAnalysis.risks.length > 0 && (
                        <Card 
                          size="small" 
                          title={
                            <span style={{ fontSize: '12px', color: '#dc2626' }}>
                              <WarningOutlined style={{ marginRight: '6px', color: '#dc2626' }} />
                              Выявленные риски
                            </span>
                          }
                          bordered={false}
                          style={{ background: '#fef2f2' }}
                          bodyStyle={{ padding: '12px' }}
                        >
                          <ul style={{ 
                            margin: 0, 
                            paddingLeft: '20px', 
                            fontSize: '11px', 
                            color: '#dc2626',
                            lineHeight: '1.8',
                            fontWeight: 500
                          }}>
                            {session.aiAnalysis.risks.map((risk, idx) => (
                              <li key={idx}>{risk}</li>
                            ))}
                          </ul>
                        </Card>
                      )}
                    </div>
                  </Panel>
                </Collapse>
              </div>
            )}
          </Card>
        )}
      />
    </div>
  );
}
