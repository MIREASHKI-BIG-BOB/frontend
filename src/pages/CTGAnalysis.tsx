import React, { useEffect, useState } from 'react';
import { Card, Button, Tag, Space, Typography, Divider } from 'antd';
import { 
  ArrowLeftOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface CTGEvent {
  id: string;
  kind: string;
  severity: 'info' | 'warning' | 'critical';
  start: number;
  end: number;
  peak?: number;
}

interface CTGMetrics {
  baseline?: number;
  variabilityAmplitude?: number;
}

interface AnalysisData {
  event: CTGEvent;
  center: number;
  start: number;
  end: number;
  metrics: CTGMetrics;
}

export default function CTGAnalysis() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('ctg_analysis_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAnalysisData(data);
      } catch (e) {
        console.error('Failed to load analysis data:', e);
      }
    }
  }, []);

  const handleBack = () => {
    location.hash = '#/ctg';
  };

  if (!analysisData) {
    return (
      <div style={{ 
        padding: '24px',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card style={{ maxWidth: 500, textAlign: 'center' }}>
          <WarningOutlined style={{ fontSize: 64, color: '#fbbf24', marginBottom: 16 }} />
          <Title level={4}>Нет данных для анализа</Title>
          <Paragraph type="secondary">
            Выберите опасное событие на мониторе КТГ для детального анализа
          </Paragraph>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Вернуться к мониторингу
          </Button>
        </Card>
      </div>
    );
  }

  const { event, start, end, metrics } = analysisData;

  // Определение причины опасности
  const getDangerReason = (evt: CTGEvent): { title: string; description: string; recommendations: string[] } => {
    const kind = evt.kind;
    const severity = evt.severity;

    if (kind === 'deceleration') {
      if (severity === 'critical') {
        return {
          title: 'Критическое замедление сердцебиения плода',
          description: 'Обнаружено глубокое и длительное замедление ЧСС плода ниже 100 уд/мин. Это может указывать на компрессию пуповины, гипоксию плода или другие серьёзные состояния, требующие немедленного медицинского вмешательства.',
          recommendations: [
            'Немедленно вызвать врача',
            'Изменить положение беременной (левый боковой)',
            'Обеспечить кислородную поддержку',
            'Подготовиться к экстренному родоразрешению при необходимости'
          ]
        };
      } else {
        return {
          title: 'Предупреждение: замедление ЧСС плода',
          description: 'Замедление сердцебиения плода может быть признаком сдавления пуповины или стресса плода. Требуется тщательное наблюдение и оценка состояния.',
          recommendations: [
            'Продолжить мониторинг КТГ',
            'Оценить связь с сокращениями матки',
            'Рассмотреть изменение положения беременной',
            'При повторении - консультация врача'
          ]
        };
      }
    }

    if (kind === 'baseline') {
      const baseline = metrics.baseline || 140;
      if (baseline > 160) {
        return {
          title: 'Тахикардия плода',
          description: `Базальная ЧСС плода повышена (${Math.round(baseline)} уд/мин при норме 110-160). Может быть связана с гипоксией, инфекцией, лихорадкой матери или приёмом медикаментов.`,
          recommendations: [
            'Проверить температуру тела матери',
            'Оценить состояние матери (инфекция, обезвоживание)',
            'Исключить приём препаратов, повышающих ЧСС',
            'Провести УЗИ для оценки состояния плода'
          ]
        };
      } else {
        return {
          title: 'Брадикардия плода',
          description: `Базальная ЧСС плода снижена (${Math.round(baseline)} уд/мин при норме 110-160). Может указывать на гипоксию, блокаду сердца плода или другие состояния.`,
          recommendations: [
            'Немедленная консультация врача',
            'Изменить положение беременной',
            'Кислородная поддержка',
            'Подготовка к родоразрешению'
          ]
        };
      }
    }

    if (kind === 'variability') {
      return {
        title: 'Снижение вариабельности ЧСС',
        description: 'Уменьшение вариабельности сердцебиения плода может указывать на гипоксию, сон плода, приём медикаментов или патологическое состояние нервной системы.',
        recommendations: [
          'Продлить мониторинг (исключить сон плода)',
          'Провести стимуляцию плода',
          'Оценить приём лекарств матерью',
          'При сохранении - консультация врача'
        ]
      };
    }

    return {
      title: 'Обнаружена аномалия КТГ',
      description: 'Выявлено отклонение от нормальных показателей КТГ, требующее внимания медицинского персонала.',
      recommendations: [
        'Продолжить мониторинг',
        'Консультация врача',
        'Оценка общего состояния'
      ]
    };
  };

  const dangerInfo = getDangerReason(event);
  const severityColor = event.severity === 'critical' ? '#dc2626' : '#f59e0b';
  const severityText = event.severity === 'critical' ? 'КРИТИЧЕСКОЕ' : 'ПРЕДУПРЕЖДЕНИЕ';

  return (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Верхняя панель */}
        <Card 
          bordered={false}
          style={{ marginBottom: 16, borderRadius: 12 }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                type="text"
                size="large"
              >
                Назад к мониторингу
              </Button>
              <Divider type="vertical" style={{ height: 32 }} />
              <Tag 
                color={severityColor}
                style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  padding: '4px 12px',
                  margin: 0
                }}
              >
                <WarningOutlined /> {severityText}
              </Tag>
            </div>
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">
                {Math.floor(event.start / 60)}:{String(Math.floor(event.start % 60)).padStart(2, '0')} - 
                {Math.floor(event.end / 60)}:{String(Math.floor(event.end % 60)).padStart(2, '0')}
              </Text>
            </Space>
          </div>
        </Card>

        {/* Описание опасности */}
        <Card
          bordered={false}
          style={{ marginBottom: 16, borderRadius: 12 }}
          bodyStyle={{ padding: 24 }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4} style={{ marginBottom: 8, color: severityColor }}>
                <WarningOutlined /> {dangerInfo.title}
              </Title>
              <Paragraph style={{ fontSize: 16, marginBottom: 0 }}>
                {dangerInfo.description}
              </Paragraph>
            </div>

            <div>
              <Title level={5} style={{ marginBottom: 12 }}>
                <HeartOutlined /> Рекомендации:
              </Title>
              <ul style={{ marginLeft: 20, fontSize: 15 }}>
                {dangerInfo.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>{rec}</li>
                ))}
              </ul>
            </div>

            <div style={{ 
              background: '#fef3c7', 
              padding: 16, 
              borderRadius: 8,
              border: '1px solid #fde68a'
            }}>
              <Space>
                <DashboardOutlined style={{ color: '#d97706' }} />
                <Text strong style={{ color: '#92400e' }}>
                  Показатели в момент события:
                </Text>
                <Text type="secondary">
                  ЧСС базальная: {Math.round(metrics.baseline || 140)} уд/мин
                </Text>
                <Text type="secondary">|</Text>
                <Text type="secondary">
                  Вариабельность: {Math.round(metrics.variabilityAmplitude || 0)} уд/мин
                </Text>
              </Space>
            </div>
          </Space>
        </Card>

        {/* Временные параметры события */}
        <Card
          title={<Text strong>Параметры опасного события</Text>}
          bordered={false}
          style={{ borderRadius: 12 }}
          bodyStyle={{ padding: 24 }}
        >
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}>
            <div style={{ 
              padding: 16, 
              background: '#f0f9ff', 
              borderRadius: 8,
              border: '1px solid #bae6fd'
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Начало события</Text>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#0369a1', marginTop: 4 }}>
                {Math.floor(start / 60)}:{String(Math.floor(start % 60)).padStart(2, '0')}
              </div>
            </div>
            
            <div style={{ 
              padding: 16, 
              background: '#fef3c7', 
              borderRadius: 8,
              border: '1px solid #fde68a'
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Конец события</Text>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#d97706', marginTop: 4 }}>
                {Math.floor(end / 60)}:{String(Math.floor(end % 60)).padStart(2, '0')}
              </div>
            </div>
            
            <div style={{ 
              padding: 16, 
              background: '#fee2e2', 
              borderRadius: 8,
              border: '1px solid #fecaca'
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Длительность</Text>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#dc2626', marginTop: 4 }}>
                {Math.round(end - start)} сек
              </div>
            </div>
            
            <div style={{ 
              padding: 16, 
              background: '#f3e8ff', 
              borderRadius: 8,
              border: '1px solid #e9d5ff'
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Тип события</Text>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#7c3aed', marginTop: 4 }}>
                {event.kind === 'deceleration' ? 'Замедление' : 
                 event.kind === 'acceleration' ? 'Ускорение' :
                 event.kind === 'baseline' ? 'Базальная ЧСС' :
                 event.kind === 'variability' ? 'Вариабельность' : event.kind}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
