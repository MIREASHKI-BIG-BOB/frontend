import { Space, Row, Col, Card, Typography, Select, Button, Tag, Input, message, Modal } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import CTGChartSimple from '../widgets/CTGChartSimple';
import { useState, useEffect, useMemo } from 'react';
import { colors } from '../theme';
import { AlertSystem } from '../utils/AlertSystem';
import { NotificationService } from '../utils/NotificationService';
import { 
  HeartOutlined, 
  UserOutlined, 
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SaveOutlined,
  DeleteOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Компонент одиночного графика CTG
interface CTGGraphProps {
  title: string;
  data: any[];
  color: string;
  yAxisDomain: [number, number];
  dataKey: string;
  unit: string;
  height?: number;
}

function CTGGraph({ title, data, color, yAxisDomain, dataKey, unit, height = 200 }: CTGGraphProps) {
  const timeFmt = (t: number) => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card title={title} style={{ marginBottom: '16px' }}>
      <div style={{ height: `${height}px`, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border.grid} />
            <XAxis 
              dataKey="t" 
              tickFormatter={timeFmt} 
              minTickGap={30} 
              fontSize={12}
            />
            <YAxis 
              domain={yAxisDomain} 
              fontSize={12}
              label={{ value: unit, angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              labelFormatter={(v: any) => `Время: ${timeFmt(v as number)}`}
              formatter={(value: any) => [`${value} ${unit}`, title]}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              name={title} 
              stroke={color} 
              dot={false} 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function CTGPage() {
  const [patientName, setPatientName] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('monitoring');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [graphCount, setGraphCount] = useState<number>(3);
  
  // Данные для графиков
  const [fhrData, setFhrData] = useState<any[]>([]);
  const [ucData, setUcData] = useState<any[]>([]);
  const [risk, setRisk] = useState<'ok' | 'warn' | 'danger'>('ok');
  const [riskScore, setRiskScore] = useState<number>(0);

  // Системы уведомлений
  const alertSystem = useMemo(() => new AlertSystem(), []);
  const notificationService = useMemo(() => new NotificationService(), []);

  // WebSocket подключение
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Типы обследований
  const sessionTypes = [
    { value: 'monitoring', label: 'Мониторинг плода', color: 'blue' },
    { value: 'stress', label: 'Стресс-тест', color: 'orange' },
    { value: 'nst', label: 'НСТ (нестрессовый тест)', color: 'green' },
    { value: 'cst', label: 'КСТ (контрактильный стресс-тест)', color: 'red' }
  ];

  // WebSocket подключение
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let reconnectTimeout: number | null = null;
    let isConnecting = false;
    
    const connectWebSocket = () => {
      if (isConnecting || (ws && ws.readyState === WebSocket.CONNECTING)) {
        return;
      }
      
      try {
        isConnecting = true;
        setWsStatus('connecting');
        ws = new WebSocket('ws://localhost:8081/ws');
        
        ws.onopen = () => {
          console.log('CTG WebSocket connected');
          setWsStatus('connected');
          reconnectAttempts = 0;
          isConnecting = false;
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.data && typeof message.data.bpm === 'number' && typeof message.data.uterus === 'number') {
              const currentTime = Date.now();
              const relativeTime = Math.round((currentTime - startTime) / 1000);
              
              const fhrValue = Math.max(60, Math.min(240, message.data.bpm));
              const ucValue = Math.max(0, Math.min(100, message.data.uterus));
              
              // Обновляем данные для графиков
              setFhrData(prev => {
                const newData = [...prev, { t: relativeTime, value: fhrValue }];
                return newData.length > 300 ? newData.slice(-300) : newData;
              });
              
              setUcData(prev => {
                const newData = [...prev, { t: relativeTime, value: ucValue }];
                return newData.length > 300 ? newData.slice(-300) : newData;
              });

              // Проверка на тревоги
              if (alertSystem) {
                const fhrValues = [fhrValue];
                const ucValues = [ucValue];
                const newAlerts = alertSystem.checkForAlerts(fhrValues, ucValues);
                
                newAlerts.forEach(alert => {
                  notificationService.showNotification(
                    alert.title,
                    { body: alert.description, requireInteraction: alert.level === 'critical' }
                  );
                });
              }

              // Расчет риска
              let currentRisk: 'ok' | 'warn' | 'danger' = 'ok';
              let score = 0;
              
              // Оценка ЧСС плода (нормальные значения 110-160 уд/мин)
              if (fhrValue < 100 || fhrValue > 180) score += 40; // Критично
              else if (fhrValue < 110 || fhrValue > 160) score += 20; // Предупреждение
              
              // Оценка сокращений матки
              if (ucValue > 80) score += 30;
              else if (ucValue > 60) score += 15;
              
              if (score < 25) currentRisk = 'ok';
              else if (score < 50) currentRisk = 'warn';
              else currentRisk = 'danger';
              
              setRisk(currentRisk);
              setRiskScore(score);
            }
          } catch (error) {
            console.error('Error parsing CTG WebSocket message:', error);
          }
        };
        
        ws.onclose = (event) => {
          console.log('CTG WebSocket closed', event.code, event.reason);
          setWsStatus('disconnected');
          isConnecting = false;
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting reconnect ${reconnectAttempts}/${maxReconnectAttempts}`);
            reconnectTimeout = setTimeout(connectWebSocket, 5000);
          } else {
            console.log('Max reconnect attempts reached');
          }
        };
        
        ws.onerror = (error) => {
          console.error('CTG WebSocket error:', error);
          setWsStatus('error');
          isConnecting = false;
        };
        
      } catch (error) {
        console.error('Failed to create CTG WebSocket connection:', error);
        setWsStatus('error');
        isConnecting = false;
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Таймер записи
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Управление генератором
  const startGenerator = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/on', { method: 'GET' });
      if (response.ok) {
        setIsRecording(true);
        message.success('Обследование начато');
      } else {
        message.error('Ошибка запуска генератора');
      }
    } catch (error) {
      message.error('Генератор недоступен');
    }
  };

  const stopGenerator = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/off', { method: 'GET' });
      if (response.ok) {
        setIsRecording(false);
        message.success('Обследование остановлено');
      } else {
        message.error('Ошибка остановки генератора');
      }
    } catch (error) {
      message.error('Генератор недоступен');
    }
  };

  const saveSession = () => {
    if (!patientName.trim()) {
      message.error('Введите ФИО пациентки');
      return;
    }
    // Здесь будет логика сохранения данных
    message.success('Сессия сохранена');
  };

  const deleteSession = () => {
    Modal.confirm({
      title: 'Удалить обследование?',
      content: 'Все данные текущего обследования будут удалены. Это действие нельзя отменить.',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: () => {
        setFhrData([]);
        setUcData([]);
        setRecordingTime(0);
        setPatientName('');
        message.success('Обследование удалено');
      }
    });
  };

  // Получаем текущий тип сессии
  const getCurrentSessionType = () => {
    return sessionTypes.find(type => type.value === sessionType);
  };

  // Рендер графиков в зависимости от количества
  const renderGraphs = () => {
    const graphs = [];
    const containerHeight = isFullscreen ? 'calc(100vh - 200px)' : 'calc(100vh - 300px)';
    const scrollable = graphCount > 3;
    
    const graphHeight = isFullscreen 
      ? Math.floor((window.innerHeight - 200) / Math.min(graphCount, 3)) - 30
      : Math.floor((window.innerHeight - 300) / Math.min(graphCount, 3)) - 30;

    if (graphCount >= 1) {
      graphs.push(
        <CTGGraph
          key="fhr"
          title="ЧСС плода (FHR)"
          data={fhrData}
          color={colors.chart.fhr}
          yAxisDomain={[60, 240]}
          dataKey="value"
          unit="уд/мин"
          height={graphHeight}
        />
      );
    }
    
    if (graphCount >= 2) {
      graphs.push(
        <CTGGraph
          key="uc"
          title="Схватки (UC)"
          data={ucData}
          color={colors.chart.uc}
          yAxisDomain={[0, 100]}
          dataKey="value"
          unit="mmHg"
          height={graphHeight}
        />
      );
    }

    // Добавляем дополнительные графики-заглушки при необходимости
    for (let i = 3; i <= graphCount; i++) {
      graphs.push(
        <Card key={`placeholder-${i}`} title={`График ${i}`} style={{ marginBottom: '16px' }}>
          <div style={{ height: `${graphHeight}px`, backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text type="secondary">Дополнительный параметр {i}</Text>
          </div>
        </Card>
      );
    }

    return (
      <div 
        style={{ 
          height: containerHeight, 
          overflow: scrollable ? 'auto' : 'hidden',
          padding: scrollable ? '0 8px' : '0'
        }}
      >
        {graphs}
      </div>
    );
  };

  const containerStyle = isFullscreen 
    ? { 
        position: 'fixed' as const, 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: 'white', 
        zIndex: 1000, 
        padding: '16px',
        overflow: 'hidden'
      }
    : { padding: '16px', height: '100vh', overflow: 'hidden' };

  return (
    <div style={containerStyle}>
      {/* Заголовок и управление */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={isFullscreen ? 3 : 2} style={{ margin: 0 }}>
            КТГ Обследование
            <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '16px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: wsStatus === 'connected' ? '#52c41a' : wsStatus === 'connecting' ? '#faad14' : '#f5222d',
                marginRight: '8px' 
              }} />
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {wsStatus === 'connected' ? 'Подключено' : 
                 wsStatus === 'connecting' ? 'Подключение...' : 
                 wsStatus === 'error' ? 'Ошибка' : 'Отключено'}
              </Text>
            </div>
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? 'Выйти из полноэкранного режима' : 'Полный экран'}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Панель управления */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={6}>
            <Text strong>ФИО пациентки:</Text>
            <Input
              placeholder="Введите ФИО"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              prefix={<UserOutlined />}
              style={{ marginTop: '4px' }}
            />
          </Col>
          
          <Col xs={24} md={4}>
            <Text strong>Тип обследования:</Text>
            <Select
              value={sessionType}
              onChange={setSessionType}
              style={{ width: '100%', marginTop: '4px' }}
            >
              {sessionTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  <Tag color={type.color}>{type.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} md={3}>
            <Text strong>Количество графиков:</Text>
            <Select
              value={graphCount}
              onChange={setGraphCount}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <Option value={1}>1 график</Option>
              <Option value={2}>2 графика</Option>
              <Option value={3}>3 графика</Option>
              <Option value={4}>4 графика</Option>
              <Option value={5}>5 графиков</Option>
            </Select>
          </Col>
          
          <Col xs={24} md={11}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Button
                  type="primary"
                  danger={isRecording}
                  icon={isRecording ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={isRecording ? stopGenerator : startGenerator}
                  size="large"
                >
                  {isRecording ? 'Остановить' : 'Начать'}
                </Button>
                
                <Button
                  icon={<StopOutlined />}
                  onClick={stopGenerator}
                  disabled={!isRecording}
                >
                  Завершить
                </Button>
                
                <Button
                  icon={<SaveOutlined />}
                  onClick={saveSession}
                  type="primary"
                  ghost
                >
                  Сохранить
                </Button>
                
                <Button
                  icon={<DeleteOutlined />}
                  onClick={deleteSession}
                  danger
                >
                  Удалить
                </Button>
              </Space>
              
              <Space direction="vertical" size="small" style={{ textAlign: 'right' }}>
                <Text strong>
                  {getCurrentSessionType()?.label}
                </Text>
                <Text type="secondary">
                  {isRecording ? `Записано: ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}` : 'Не записывается'}
                  {` | Риск: `}
                  <span style={{ 
                    color: risk === 'ok' ? colors.status.success : 
                          risk === 'warn' ? colors.status.warning : 
                          colors.status.danger 
                  }}>
                    {risk === 'ok' ? 'Норма' : risk === 'warn' ? 'Внимание' : 'Критично'} ({riskScore}/100)
                  </span>
                </Text>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Графики */}
      {renderGraphs()}
    </div>
  );
}
