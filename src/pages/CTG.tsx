import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Typography, 
  Input, 
  Space, 
  Tag, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Form, 
  Select, 
  DatePicker, 
  TimePicker,
  Collapse
} from 'antd';
import { colors } from '../theme';
import { 
  PlayCircleOutlined,
  PauseCircleOutlined,
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HeartOutlined,
  AlertOutlined,
  SettingOutlined,
  CalendarOutlined,
  LineChartOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Компонент для отдельного графика КТГ
interface CTGChartProps {
  title: string;
  unit: string;
  color: string;
  minValue: number;
  maxValue: number;
  height: string;
  data: number[];
}

const CTGChart: React.FC<CTGChartProps> = ({ 
  title, 
  unit, 
  color, 
  minValue, 
  maxValue, 
  height, 
  data 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Обновляем размеры canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const width = canvas.width;
    const canvasHeight = canvas.height;

    // Очистка canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Отрисовка сетки
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 0.5;

    // Вертикальные линии (время)
    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * width;
      ctx.strokeStyle = i % 4 === 0 ? '#d0d0d0' : '#e8e8e8';
      ctx.lineWidth = i % 4 === 0 ? 1 : 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // Горизонтальные линии (значения)
    for (let i = 0; i <= 8; i++) {
      const y = (i / 8) * canvasHeight;
      ctx.strokeStyle = i % 2 === 0 ? '#d0d0d0' : '#e8e8e8';
      ctx.lineWidth = i % 2 === 0 ? 1 : 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Отрисовка данных
    if (data.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 1;
      ctx.beginPath();

      for (let i = 0; i < data.length; i++) {
        const x = (i / Math.max(data.length - 1, 1)) * width;
        const normalizedValue = Math.max(0, Math.min(1, (data[i] - minValue) / (maxValue - minValue)));
        const y = canvasHeight - (normalizedValue * canvasHeight);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Подписи по оси Y
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    for (let i = 0; i <= 4; i++) {
      const value = minValue + ((maxValue - minValue) * (4 - i) / 4);
      const y = (i / 4) * canvasHeight + 4;
      ctx.fillText(Math.round(value).toString(), 4, y);
    }

    // Текущее значение в правом углу
    if (data.length > 0) {
      const currentValue = data[data.length - 1];
      ctx.fillStyle = color;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.fillRect(width - 35, 5, 30, 18);
      ctx.strokeStyle = color;
      ctx.strokeRect(width - 35, 5, 30, 18);
      ctx.fillStyle = color;
      ctx.fillText(Math.round(currentValue).toString(), width - 7, 18);
    }
  }, [data, color, minValue, maxValue]);

  return (
    <div style={{ 
      height, 
      position: 'relative', 
      border: '1px solid #e8e8e8',
      background: '#fafafa',
      borderRadius: '6px'
    }}>
      <div style={{
        position: 'absolute',
        top: '6px',
        left: '6px',
        background: 'rgba(255,255,255,0.95)',
        padding: '3px 8px',
        borderRadius: '4px',
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Text strong style={{ color, fontSize: '12px' }}>
          {title}
        </Text>
        <Text type="secondary" style={{ marginLeft: '6px', fontSize: '10px' }}>
          ({unit})
        </Text>
      </div>
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block',
          borderRadius: '6px'
        }}
      />
    </div>
  );
};

export default function CTGPage() {
  // Состояние пациентки
  const [patientName, setPatientName] = useState<string>('Иванова Мария Петровна');
  const [pregnancyWeek, setPregnancyWeek] = useState<number>(35);
  const [gestationDay, setGestationDay] = useState<number>(4);
  const [sessionDate, setSessionDate] = useState<Dayjs>(dayjs());
  const [sessionTime, setSessionTime] = useState<Dayjs>(dayjs());
  const [sessionType, setSessionType] = useState<string>('routine');
  
  // Состояние записи
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<string>('');

  // Данные для графиков
  const [fetalHeartRate, setFetalHeartRate] = useState<number[]>([]);
  const [uterineContractions, setUterineContractions] = useState<number[]>([]);
  const [contractions, setContractions] = useState<number[]>([]);

  // Типы сеансов КТГ
  const sessionTypes = [
    { value: 'routine', label: 'Плановое КТГ', color: 'blue' },
    { value: 'emergency', label: 'Экстренное КТГ', color: 'red' },
    { value: 'prenatal', label: 'Антенатальное КТГ', color: 'green' },
    { value: 'intrapartum', label: 'Интранатальное КТГ', color: 'orange' },
  ];

  // Генерация тестовых данных
  const generateData = () => {
    const time = Date.now() / 1000;
    
    // ЧСС плода (120-160 bpm с вариациями)
    const fhrBase = 140;
    const fhrVariation = Math.sin(time * 0.1) * 15 + Math.random() * 8 - 4;
    const newFHR = Math.max(110, Math.min(180, fhrBase + fhrVariation));
    
    // Тонус матки (0-100 mmHg)
    const ucBase = 20 + Math.sin(time * 0.03) * 25;
    const ucVariation = Math.random() * 6 - 3;
    const newUC = Math.max(0, Math.min(100, ucBase + ucVariation));
    
    // Схватки (0-80 mmHg) - более редкие и интенсивные
    const contractionCycle = Math.sin(time * 0.01) * Math.sin(time * 0.01); // квадрат для более редких пиков
    const contractionBase = contractionCycle > 0.5 ? contractionCycle * 60 : 5;
    const newContraction = Math.max(0, Math.min(80, contractionBase + Math.random() * 4 - 2));

    setFetalHeartRate(prev => [...prev.slice(-299), newFHR]);
    setUterineContractions(prev => [...prev.slice(-299), newUC]);
    setContractions(prev => [...prev.slice(-299), newContraction]);
  };

  // Управление записью
  const handleStartStop = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setSessionStartTime(dayjs().format('DD.MM.YYYY HH:mm:ss'));
      setRecordingTime(0);
    }
  };

  const handleSave = () => {
    setIsRecording(false);
    const duration = `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`;
    alert(`Данные КТГ сохранены.\nПациентка: ${patientName}\nСрок: ${pregnancyWeek}н ${gestationDay}д\nДлительность: ${duration}`);
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить текущую запись?')) {
      setIsRecording(false);
      setRecordingTime(0);
      setFetalHeartRate([]);
      setUterineContractions([]);
      setContractions([]);
      setSessionStartTime('');
    }
  };

  const handleNewSession = () => {
    const confirmNew = !sessionStartTime || window.confirm('Начать новое обследование? Текущие данные будут очищены.');
    if (confirmNew) {
      setIsRecording(false);
      setRecordingTime(0);
      setFetalHeartRate([]);
      setUterineContractions([]);
      setContractions([]);
      setSessionStartTime('');
    }
  };

  // Таймер записи и генерация данных
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        generateData();
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  // Получение рискового статуса
  const getRiskStatus = () => {
    if (fetalHeartRate.length === 0) return { status: 'ok', score: 0 };
    
    const currentFHR = fetalHeartRate[fetalHeartRate.length - 1];
    const currentUC = uterineContractions[uterineContractions.length - 1];
    
    let score = 0;
    if (currentFHR < 110 || currentFHR > 160) score += 30;
    if (currentUC > 80) score += 20;
    
    if (score >= 50) return { status: 'danger', score };
    if (score >= 25) return { status: 'warn', score };
    return { status: 'ok', score };
  };

  const risk = getRiskStatus();

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Компактные параметры сеанса */}
      <Collapse 
        defaultActiveKey={['1']} 
        ghost 
        style={{ marginBottom: '16px' }}
        items={[
          {
            key: '1',
            label: (
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                <SettingOutlined /> Параметры сеанса КТГ
              </span>
            ),
            children: (
              <Card size="small" style={{ margin: 0 }}>
                <Row gutter={[12, 8]}>
                  <Col span={8}>
                    <Text strong style={{ fontSize: '12px' }}>ФИО пациентки:</Text>
                    <Input 
                      size="small"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Иванова Мария Петровна"
                      prefix={<UserOutlined />}
                      style={{ marginTop: '4px' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Text strong style={{ fontSize: '12px' }}>Дата сеанса:</Text>
                    <DatePicker 
                      size="small"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={sessionDate}
                      onChange={(date) => date && setSessionDate(date)}
                      format="DD.MM.YYYY"
                    />
                  </Col>
                  <Col span={4}>
                    <Text strong style={{ fontSize: '12px' }}>Тип КТГ:</Text>
                    <Select 
                      size="small" 
                      value={sessionType}
                      onChange={setSessionType}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      {sessionTypes.map(type => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={3}>
                    <Text strong style={{ fontSize: '12px' }}>Неделя:</Text>
                    <Input 
                      size="small" 
                      type="number"
                      value={pregnancyWeek}
                      onChange={(e) => setPregnancyWeek(Number(e.target.value))}
                      placeholder="35" 
                      style={{ marginTop: '4px' }} 
                    />
                  </Col>
                  <Col span={2}>
                    <Text strong style={{ fontSize: '12px' }}>Дни:</Text>
                    <Input 
                      size="small" 
                      type="number"
                      value={gestationDay}
                      onChange={(e) => setGestationDay(Number(e.target.value))}
                      placeholder="4" 
                      style={{ marginTop: '4px' }} 
                    />
                  </Col>
                  <Col span={3}>
                    <Text strong style={{ fontSize: '12px' }}>Время начала:</Text>
                    <TimePicker 
                      size="small" 
                      format="HH:mm" 
                      value={sessionTime}
                      onChange={(time) => time && setSessionTime(time)}
                      style={{ width: '100%', marginTop: '4px' }} 
                    />
                  </Col>
                </Row>
              </Card>
            )
          }
        ]}
      />

      {/* Основная область с графиками */}
      <Row gutter={[16, 16]}>
        {/* Графики КТГ - увеличенная область */}
        <Col span={18}>
          <Card 
            title={
              <Space>
                <HeartOutlined style={{ color: colors.primary }} />
                <span>Мониторинг КТГ</span>
                <Tag color={isRecording ? 'red' : 'default'}>
                  {isRecording ? 'Запись' : 'Остановлено'}
                </Tag>
              </Space>
            }
            extra={
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <ClockCircleOutlined /> {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </Text>
            }
            size="small"
            style={{ height: '600px' }}
            bodyStyle={{ height: '540px', padding: '8px' }}
          >
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* График ЧСС плода */}
              <CTGChart
                title="ЧСС плода"
                unit="bpm"
                color="#52c41a"
                minValue={100}
                maxValue={180}
                height="calc(33.33% - 3px)"
                data={fetalHeartRate}
              />

              {/* График тонуса матки */}
              <CTGChart
                title="Тонус матки"
                unit="mmHg"
                color="#fa8c16"
                minValue={0}
                maxValue={100}
                height="calc(33.33% - 3px)"
                data={uterineContractions}
              />

              {/* График схваток */}
              <CTGChart
                title="Схватки"
                unit="mmHg"
                color="#f5222d"
                minValue={0}
                maxValue={80}
                height="calc(33.34% - 3px)"
                data={contractions}
              />
            </div>
          </Card>
        </Col>

        {/* Правая колонка - показания и управление */}
        <Col span={6}>
          {/* Текущие показания */}
          <Card 
            title="Текущие показания" 
            size="small" 
            style={{ marginBottom: '16px' }}
            bodyStyle={{ padding: '12px' }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Statistic
                title="ЧСС плода"
                value={fetalHeartRate.length > 0 ? Math.round(fetalHeartRate[fetalHeartRate.length - 1]) : 0}
                suffix="bpm"
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              />
              <Statistic
                title="Тонус матки"
                value={uterineContractions.length > 0 ? Math.round(uterineContractions[uterineContractions.length - 1]) : 0}
                suffix="mmHg"
                valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
              />
              <Statistic
                title="Схватки"
                value={contractions.length > 0 ? Math.round(contractions[contractions.length - 1]) : 0}
                suffix="mmHg"
                valueStyle={{ color: '#f5222d', fontSize: '18px' }}
              />
            </Space>
          </Card>

          {/* Статистика */}
          <Collapse 
            size="small"
            style={{ marginBottom: '16px' }}
            items={[
              {
                key: '1',
                label: 'Статистика сеанса',
                children: (
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Базальная ЧСС:</span>
                      <Text strong style={{ color: '#52c41a' }}>
                        {fetalHeartRate.length > 10 ? 
                          Math.round(fetalHeartRate.slice(-10).reduce((a, b) => a + b, 0) / 10) : 
                          '--'} bpm
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Вариабельность:</span>
                      <Text strong style={{ color: '#fa8c16' }}>
                        {fetalHeartRate.length > 10 ? 
                          Math.round(Math.max(...fetalHeartRate.slice(-10)) - Math.min(...fetalHeartRate.slice(-10))) : 
                          '--'} bpm
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Длительность:</span>
                      <Text strong style={{ color: '#1890ff' }}>
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </Text>
                    </div>
                  </div>
                )
              }
            ]}
          />

          {/* Управление */}
          <Card title="Управление" size="small" bodyStyle={{ padding: '12px' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                type="primary"
                danger={isRecording}
                icon={isRecording ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={handleStartStop}
                block
                size="small"
              >
                {isRecording ? 'СТОП' : 'СТАРТ'}
              </Button>

              <Button
                icon={<SaveOutlined />}
                onClick={handleSave}
                disabled={!sessionStartTime}
                block
                size="small"
              >
                СОХРАНИТЬ
              </Button>

              <Button
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                disabled={!sessionStartTime && !isRecording}
                block
                size="small"
                danger
              >
                УДАЛИТЬ
              </Button>

              <Button
                icon={<PlusOutlined />}
                onClick={handleNewSession}
                block
                size="small"
                type="dashed"
              >
                НОВОЕ ОБСЛЕДОВАНИЕ
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* CSS анимации */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        `
      }} />
    </div>
  );
}
