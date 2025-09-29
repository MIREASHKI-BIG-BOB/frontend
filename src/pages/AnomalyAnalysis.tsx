import React from 'react';
import { 
  Button, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Tag, 
  Avatar,
  Descriptions,
  Alert,
  Timeline,
  Progress,
  Tabs
} from 'antd';
import { 
  ArrowLeftOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RobotOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { colors } from '../theme';

const { Text, Title } = Typography;

// Интерфейс для данных анализа аномалии
interface AnomalyAnalysisData {
  anomaly: {
    time: number;
    type: 'fhr' | 'uc' | 'contractions';
    severity: 'warning' | 'critical';
    description: string;
  };
  timestamp: string;
  patientInfo: {
    name: string;
    week: number;
    day: number;
  };
  chartData: {
    fhr: number[];
    uc: number[];
    contractions: number[];
  };
}

interface AnomalyAnalysisProps {
  data: AnomalyAnalysisData;
  onBack: () => void;
}

// Статичный график с фрагментом аномалии
const AnomalyChart: React.FC<{
  title: string;
  unit: string;
  color: string;
  data: number[];
  anomalyTime: number;
  anomalyType: string;
  severity: 'warning' | 'critical';
}> = ({ title, unit, color, data, anomalyTime, anomalyType, severity }) => {
  // Преобразуем данные для отображения
  const chartData = data.map((value, index) => ({
    time: index - 30, // Центрируем на аномалии
    value: value,
    timestamp: `${Math.floor((anomalyTime + index - 30) / 60)}:${((anomalyTime + index - 30) % 60).toString().padStart(2, '0')}`
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
          border: `1px solid ${severity === 'critical' ? '#dc2626' : '#f59e0b'}`,
          borderRadius: '6px',
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#831843', fontSize: '11px' }}>
            {title}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: severity === 'critical' ? '#dc2626' : '#f59e0b' }}>
            {Math.round(data.value)} {unit}
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#831843', opacity: 0.8 }}>
            {data.payload.timestamp}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      height: '200px',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
      border: `2px solid ${severity === 'critical' ? '#dc2626' : '#f59e0b'}`,
      borderRadius: '8px',
      padding: '12px',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '12px',
        background: 'rgba(255,255,255,0.95)',
        padding: '4px 8px',
        borderRadius: '4px',
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: `1px solid ${severity === 'critical' ? '#dc2626' : '#f59e0b'}`
      }}>
        <Text strong style={{ color: '#831843', fontSize: '13px' }}>
          {title} - Фрагмент аномалии
        </Text>
        <Text style={{ marginLeft: '4px', fontSize: '12px', color: '#831843', opacity: 0.7 }}>
          ({unit})
        </Text>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 40, right: 20, left: 20, bottom: 8 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#f3e8ff" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#831843' }}
            tickFormatter={(value) => {
              const totalTime = anomalyTime + value;
              return `${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}`;
            }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#831843' }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Выделение области аномалии */}
          <ReferenceArea
            x1={-5}
            x2={5}
            fill={severity === 'critical' ? '#dc2626' : '#f59e0b'}
            fillOpacity={0.2}
          />
          <ReferenceArea
            x1={-2}
            x2={2}
            fill={severity === 'critical' ? '#dc2626' : '#f59e0b'}
            fillOpacity={0.3}
          />
          
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={3}
            dot={(props: any) => {
              const isAnomalyPoint = Math.abs(props.payload.time) <= 2;
              return (
                <circle 
                  cx={props.cx} 
                  cy={props.cy} 
                  r={isAnomalyPoint ? 6 : 2}
                  fill={isAnomalyPoint ? (severity === 'critical' ? '#dc2626' : '#f59e0b') : color}
                  stroke="#fff"
                  strokeWidth={isAnomalyPoint ? 2 : 0}
                />
              );
            }}
            activeDot={{ 
              r: 5, 
              fill: color,
              stroke: '#fff',
              strokeWidth: 2
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Маркер центра аномалии */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: severity === 'critical' ? '#dc2626' : '#f59e0b',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        Аномалия
      </div>
    </div>
  );
};

export default function AnomalyAnalysisPage({ data, onBack }: AnomalyAnalysisProps) {
  const { anomaly, patientInfo, chartData } = data;
  
  // Получаем данные нужного типа для анализа
  const getChartData = () => {
    switch (anomaly.type) {
      case 'fhr': return { data: chartData.fhr, title: 'ЧСС плода', unit: 'bpm', color: '#ec4899' };
      case 'uc': return { data: chartData.uc, title: 'Тонус матки', unit: 'mmHg', color: '#a21caf' };
      case 'contractions': return { data: chartData.contractions, title: 'Схватки', unit: 'mmHg', color: '#be185d' };
      default: return { data: chartData.fhr, title: 'ЧСС плода', unit: 'bpm', color: '#ec4899' };
    }
  };

  const { data: plotData, title, unit, color } = getChartData();

  // Генерация детального анализа от ИИ
  const generateAIAnalysis = () => {
    const analysisMap = {
      'fhr': {
        'warning': {
          findings: [
            'Выявлены изменения базального ритма ЧСС плода',
            'Снижение вариабельности сердечного ритма',
            'Отклонения от нормальных показателей (110-160 bpm)'
          ],
          risks: [
            'Возможное нарушение кислородного обмена',
            'Потенциальный дистресс плода',
            'Необходимость дополнительного мониторинга'
          ],
          recommendations: [
            'Продолжить непрерывный мониторинг ЧСС',
            'Оценить состояние пуповины',
            'При ухудшении - рассмотреть изменение положения роженицы'
          ]
        },
        'critical': {
          findings: [
            'Критическое отклонение ЧСС плода от нормы',
            'Выраженная брадикардия или тахикардия',
            'Значительное снижение вариабельности'
          ],
          risks: [
            'Острая гипоксия плода',
            'Риск внутриутробной асфиксии',
            'Немедленная угроза жизни плода'
          ],
          recommendations: [
            'НЕМЕДЛЕННАЯ консультация врача',
            'Подготовка к экстренному родоразрешению',
            'Оксигенотерапия матери'
          ]
        }
      },
      'uc': {
        'warning': {
          findings: [
            'Повышение базального тонуса матки',
            'Нерегулярность маточных сокращений',
            'Превышение нормальных показателей тонуса'
          ],
          risks: [
            'Нарушение маточно-плацентарного кровотока',
            'Угроза преждевременных родов',
            'Снижение поступления кислорода к плоду'
          ],
          recommendations: [
            'Мониторинг динамики тонуса матки',
            'Оценка состояния шейки матки',
            'Рассмотреть токолитическую терапию'
          ]
        },
        'critical': {
          findings: [
            'Критическое повышение тонуса матки',
            'Тетанические сокращения матки',
            'Нарушение расслабления миометрия'
          ],
          risks: [
            'Угроза разрыва матки',
            'Острая гипоксия плода',
            'Преждевременная отслойка плаценты'
          ],
          recommendations: [
            'ЭКСТРЕННОЕ вмешательство',
            'Немедленная токолитическая терапия',
            'Подготовка к кесареву сечению'
          ]
        }
      },
      'contractions': {
        'warning': {
          findings: [
            'Нерегулярность родовой деятельности',
            'Изменение силы и продолжительности схваток',
            'Отклонение от нормального паттерна'
          ],
          risks: [
            'Дискоординация родовой деятельности',
            'Затяжные роды',
            'Утомление роженицы'
          ],
          recommendations: [
            'Коррекция родовой деятельности',
            'Обезболивание по показаниям',
            'Контроль прогресса родов'
          ]
        },
        'critical': {
          findings: [
            'Критическое нарушение родовой деятельности',
            'Чрезмерно сильные или частые схватки',
            'Отсутствие расслабления между схватками'
          ],
          risks: [
            'Разрыв матки',
            'Острая гипоксия плода',
            'Травматизация родовых путей'
          ],
          recommendations: [
            'НЕМЕДЛЕННОЕ прекращение стимуляции',
            'Экстренное кесарево сечение',
            'Интенсивная терапия'
          ]
        }
      }
    };

    return analysisMap[anomaly.type]?.[anomaly.severity] || analysisMap.fhr.warning;
  };

  const aiAnalysis = generateAIAnalysis();

  return (
    <div style={{ 
      padding: '16px', 
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)', 
      minHeight: '100vh' 
    }}>
      {/* Шапка страницы */}
      <Card 
        size="small" 
        style={{ marginBottom: '16px' }}
        bodyStyle={{ padding: '12px 16px' }}
        headStyle={{ 
          padding: '8px 16px', 
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
          borderBottom: '1px solid #f3e8ff'
        }}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={onBack}
                style={{ color: '#831843' }}
              >
                Назад к КТГ
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar 
                  size={28}
                  style={{ 
                    background: anomaly.severity === 'critical' ? 
                      'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' :
                      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  }}
                  icon={anomaly.severity === 'critical' ? <ExclamationCircleOutlined /> : <WarningOutlined />}
                />
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#831843' }}>
                  Детальный анализ аномалии
                </span>
              </div>
            </div>
            <Tag 
              color={anomaly.severity === 'critical' ? 'error' : 'warning'}
              style={{ 
                fontSize: '14px',
                padding: '4px 12px',
                fontWeight: 'bold'
              }}
            >
              {anomaly.severity === 'critical' ? 'КРИТИЧНО' : 'ПРЕДУПРЕЖДЕНИЕ'}
            </Tag>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <UserOutlined style={{ color: '#ec4899', fontSize: '16px' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                {patientInfo.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClockCircleOutlined style={{ color: '#ec4899', fontSize: '16px' }} />
              <span style={{ fontSize: '14px', color: '#831843' }}>
                {patientInfo.week}н {patientInfo.day}д
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertOutlined style={{ color: '#ec4899', fontSize: '16px' }} />
              <span style={{ fontSize: '14px', color: '#831843' }}>
                {anomaly.description}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '14px', color: '#831843' }}>
              Время обнаружения:
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#831843' }}>
              {Math.floor(anomaly.time / 60)}:{(anomaly.time % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* График с аномалией */}
        <Col span={16}>
          <Card 
            size="small"
            style={{ height: '280px' }}
            bodyStyle={{ height: '250px', padding: '12px' }}
            headStyle={{ 
              padding: '8px 16px', 
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <div className="flex items-center gap-2">
                <LineChartOutlined style={{ color: '#ec4899', fontSize: '16px' }} />
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#831843' }}>
                  Статичный фрагмент графика
                </span>
                <span style={{ fontSize: '12px', color: '#831843', opacity: 0.7 }}>
                  (±30 секунд от аномалии)
                </span>
              </div>
            }
          >
            <AnomalyChart
              title={title}
              unit={unit}
              color={color}
              data={plotData}
              anomalyTime={anomaly.time}
              anomalyType={anomaly.type}
              severity={anomaly.severity}
            />
          </Card>

          {/* ИИ анализ */}
          <Card 
            size="small"
            style={{ marginTop: '16px' }}
            bodyStyle={{ padding: '16px' }}
            headStyle={{ 
              padding: '8px 16px', 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderBottom: 'none',
              color: 'white'
            }}
            title={
              <div className="flex items-center gap-2">
                <RobotOutlined style={{ color: 'white', fontSize: '16px' }} />
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>
                  Анализ нейронной сети
                </span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              </div>
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <Title level={5} style={{ color: '#dc2626', margin: 0, marginBottom: '8px' }}>
                    🔍 Обнаруженные отклонения
                  </Title>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {aiAnalysis.findings.map((finding, index) => (
                      <li key={index} style={{ fontSize: '13px', color: '#831843', marginBottom: '4px' }}>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: '#fefce8', border: '1px solid #fef3c7' }}>
                  <Title level={5} style={{ color: '#d97706', margin: 0, marginBottom: '8px' }}>
                    ⚠️ Потенциальные риски
                  </Title>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {aiAnalysis.risks.map((risk, index) => (
                      <li key={index} style={{ fontSize: '13px', color: '#831843', marginBottom: '4px' }}>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <Title level={5} style={{ color: '#16a34a', margin: 0, marginBottom: '8px' }}>
                    💡 Рекомендации
                  </Title>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {aiAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index} style={{ fontSize: '13px', color: '#831843', marginBottom: '4px' }}>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Боковая панель с деталями */}
        <Col span={8}>
          <Tabs
            defaultActiveKey="details"
            size="small"
            style={{
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderRadius: '6px',
              border: '1px solid #f3e8ff'
            }}
            items={[
              {
                key: 'details',
                label: (
                  <span style={{ fontSize: '12px', color: '#831843' }}>
                    📋 Детали
                  </span>
                ),
                children: (
                  <div style={{ padding: '0 8px 8px 8px' }}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item 
                        label={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>Тип</span>}
                      >
                        <Tag color="blue" style={{ fontSize: '12px' }}>
                          {title}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item 
                        label={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>Описание</span>}
                      >
                        <span style={{ fontSize: '13px' }}>{anomaly.description}</span>
                      </Descriptions.Item>
                      <Descriptions.Item 
                        label={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>Время</span>}
                      >
                        <span style={{ fontSize: '13px' }}>
                          {Math.floor(anomaly.time / 60)}:{(anomaly.time % 60).toString().padStart(2, '0')}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item 
                        label={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>Критичность</span>}
                      >
                        <Tag 
                          color={anomaly.severity === 'critical' ? 'error' : 'warning'}
                          style={{ fontSize: '12px' }}
                        >
                          {anomaly.severity === 'critical' ? 'КРИТИЧНО' : 'ПРЕДУПРЕЖДЕНИЕ'}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )
              },
              {
                key: 'analysis',
                label: (
                  <span style={{ fontSize: '12px', color: '#831843' }}>
                    🤖 Анализ
                  </span>
                ),
                children: (
                  <div style={{ padding: '0 8px 8px 8px' }}>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span style={{ fontSize: '12px', color: '#831843' }}>Детектирование паттернов</span>
                          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>100%</span>
                        </div>
                        <Progress percent={100} size="small" status="success" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span style={{ fontSize: '12px', color: '#831843' }}>Анализ рисков</span>
                          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>100%</span>
                        </div>
                        <Progress percent={100} size="small" status="success" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span style={{ fontSize: '12px', color: '#831843' }}>Генерация рекомендаций</span>
                          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>100%</span>
                        </div>
                        <Progress percent={100} size="small" status="success" />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                key: 'timeline',
                label: (
                  <span style={{ fontSize: '12px', color: '#831843' }}>
                    ⏱️ Хронология
                  </span>
                ),
                children: (
                  <div style={{ padding: '0 8px 8px 8px' }}>
                    <Timeline>
                      <Timeline.Item 
                        dot={<CheckCircleOutlined style={{ color: '#16a34a' }} />}
                        color="green"
                      >
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ fontWeight: 'bold', color: '#831843' }}>Начало мониторинга</div>
                          <div style={{ color: '#64748b' }}>
                            {Math.floor((anomaly.time - 60) / 60)}:{((anomaly.time - 60) % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      </Timeline.Item>
                      <Timeline.Item 
                        dot={<ExclamationCircleOutlined style={{ color: anomaly.severity === 'critical' ? '#dc2626' : '#f59e0b' }} />}
                        color={anomaly.severity === 'critical' ? 'red' : 'orange'}
                      >
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ fontWeight: 'bold', color: '#831843' }}>Обнаружена аномалия</div>
                          <div style={{ color: '#64748b' }}>
                            {Math.floor(anomaly.time / 60)}:{(anomaly.time % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      </Timeline.Item>
                      <Timeline.Item 
                        dot={<RobotOutlined style={{ color: '#8b5cf6' }} />}
                        color="purple"
                      >
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ fontWeight: 'bold', color: '#831843' }}>Анализ ИИ завершен</div>
                          <div style={{ color: '#64748b' }}>
                            {Math.floor((anomaly.time + 10) / 60)}:{((anomaly.time + 10) % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      </Timeline.Item>
                    </Timeline>
                  </div>
                )
              }
            ]}
          />
        </Col>
      </Row>
    </div>
  );
}