import React from 'react';
import { Card, Button, Row, Col, Descriptions, Tag, Timeline, Progress } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined, RobotOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

interface DetailedAnomalyAnalysisProps {
  data: any;
  onBack: () => void;
}

const DetailedAnomalyAnalysis: React.FC<DetailedAnomalyAnalysisProps> = ({ data, onBack }) => {
  const { anomaly } = data;
  
  const getAnomalyTitle = (type: string) => {
    switch (type) {
      case 'fhr': return 'Аномалия ЧСС плода';
      case 'uc': return 'Аномалия тонуса матки';
      case 'contractions': return 'Аномалия схваток';
      default: return 'Неизвестная аномалия';
    }
  };

  const title = getAnomalyTitle(anomaly.type);

  return (
    <div style={{ 
      padding: '16px',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
      minHeight: '100vh'
    }}>
      {/* Заголовок с кнопкой назад */}
      <div style={{ marginBottom: '16px' }}>
        <div className="flex items-center gap-3">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
            style={{ color: '#831843' }}
          />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#831843' }}>
            Детальный анализ аномалии
          </span>
        </div>
      </div>

      <Row gutter={16}>
        {/* Левая колонка - График и дополнительная информация */}
        <Col span={16}>
          {/* График с аномалией */}
          <Card 
            size="small"
            style={{ marginBottom: '16px' }}
            bodyStyle={{ padding: '12px' }}
            headStyle={{ 
              padding: '8px 12px', 
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <div className="flex items-center gap-2">
                <ExclamationCircleOutlined style={{ 
                  color: anomaly.severity === 'critical' ? '#dc2626' : '#f59e0b', 
                  fontSize: '14px' 
                }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                  График аномалии ({title})
                </span>
              </div>
            }
          >
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(() => {
                  // Создаем данные для графика на основе типа аномалии
                  const chartData = [];
                  const dataLength = data.chartData?.fhr?.length || 60;
                  
                  for (let i = 0; i < dataLength; i++) {
                    const point: any = { time: i };
                    
                    if (anomaly.type === 'fhr') {
                      point.value = data.chartData?.fhr?.[i] || (140 + Math.sin(i * 0.1) * 15);
                      point.name = 'ЧСС плода (bpm)';
                    } else if (anomaly.type === 'uc') {
                      point.value = data.chartData?.uc?.[i] || (20 + Math.sin(i * 0.05) * 10);
                      point.name = 'Тонус матки (mmHg)';
                    } else {
                      point.value = data.chartData?.contractions?.[i] || (10 + Math.sin(i * 0.02) * 5);
                      point.name = 'Схватки (mmHg)';
                    }
                    
                    chartData.push(point);
                  }
                  return chartData;
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `${Math.round(value)} ${anomaly.type === 'fhr' ? 'bpm' : 'mmHg'}`, 
                      anomaly.type === 'fhr' ? 'ЧСС плода' : 
                      anomaly.type === 'uc' ? 'Тонус матки' : 'Схватки'
                    ]}
                    labelFormatter={(label) => `Время: ${Math.floor(label / 60)}:${(label % 60).toString().padStart(2, '0')}`}
                    contentStyle={{
                      backgroundColor: '#fdf2f8',
                      border: '1px solid #f3e8ff',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  
                  {/* Выделение области аномалии */}
                  <ReferenceArea
                    x1={Math.max(0, anomaly.time - 8)}
                    x2={Math.min(59, anomaly.time + 8)}
                    fill={anomaly.severity === 'critical' ? '#fee2e2' : '#fef3c7'}
                    fillOpacity={0.3}
                    stroke={anomaly.severity === 'critical' ? '#dc2626' : '#f59e0b'}
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={anomaly.type === 'fhr' ? '#ec4899' : anomaly.type === 'uc' ? '#a21caf' : '#be185d'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ 
                      r: 4, 
                      fill: anomaly.type === 'fhr' ? '#ec4899' : anomaly.type === 'uc' ? '#a21caf' : '#be185d',
                      stroke: '#fff',
                      strokeWidth: 1
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Легенда */}
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              background: '#fef7ff', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div className="flex items-center justify-between">
                <span style={{ color: '#831843' }}>
                  Выделенная область показывает период аномалии
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div style={{
                      width: '12px',
                      height: '3px',
                      background: anomaly.type === 'fhr' ? '#ec4899' : anomaly.type === 'uc' ? '#a21caf' : '#be185d'
                    }}></div>
                    <span style={{ color: '#831843' }}>
                      {anomaly.type === 'fhr' ? 'ЧСС плода' : 
                       anomaly.type === 'uc' ? 'Тонус матки' : 'Схватки'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: anomaly.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                      border: `1px dashed ${anomaly.severity === 'critical' ? '#dc2626' : '#f59e0b'}`
                    }}></div>
                    <span style={{ color: '#831843' }}>Аномалия</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Дополнительная информация */}
          <Card 
            size="small"
            bodyStyle={{ padding: '12px' }}
            headStyle={{ 
              padding: '8px 12px', 
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                Дополнительная информация
              </span>
            }
          >
            <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
              Здесь может быть дополнительная информация об аномалии
            </div>
          </Card>
        </Col>

        {/* Правая колонка - Детали, анализ и хронология */}
        <Col span={8}>
          {/* Детали */}
          <Card 
            size="small"
            style={{ marginBottom: '16px' }}
            bodyStyle={{ padding: '12px' }}
            headStyle={{ 
              padding: '8px 12px', 
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <div className="flex items-center gap-2">
                <FileTextOutlined style={{ color: '#ec4899', fontSize: '14px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                  Детали аномалии
                </span>
              </div>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item 
                label={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>Тип</span>}
              >
                <Tag color="blue" style={{ fontSize: '12px' }}>
                  {title}
                </Tag>
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
              <Descriptions.Item 
                label={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>Описание</span>}
              >
                <span style={{ fontSize: '13px' }}>{anomaly.description}</span>
              </Descriptions.Item>
              <Descriptions.Item 
                label={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>Время обнаружения</span>}
              >
                <span style={{ fontSize: '13px' }}>
                  {Math.floor(anomaly.time / 60)}:{(anomaly.time % 60).toString().padStart(2, '0')}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Анализ ИИ */}
          <Card 
            size="small"
            style={{ marginBottom: '16px' }}
            bodyStyle={{ padding: '12px' }}
            headStyle={{ 
              padding: '8px 12px', 
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <div className="flex items-center gap-2">
                <RobotOutlined style={{ color: '#8b5cf6', fontSize: '14px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                  Анализ ИИ
                </span>
              </div>
            }
          >
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
          </Card>

          {/* Хронология */}
          <Card 
            size="small"
            bodyStyle={{ padding: '12px' }}
            headStyle={{ 
              padding: '8px 12px', 
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <div className="flex items-center gap-2">
                <ClockCircleOutlined style={{ color: '#ec4899', fontSize: '14px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                  Хронология событий
                </span>
              </div>
            }
          >
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
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DetailedAnomalyAnalysis;