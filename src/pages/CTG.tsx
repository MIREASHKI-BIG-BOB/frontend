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
  Collapse,
  Avatar
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
  DownOutlined,
  ThunderboltOutlined,
  WifiOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Компонент для интерактивного графика КТГ в розовой палитре
interface CTGChartProps {
  title: string;
  unit: string;
  color: string;
  minValue: number;
  maxValue: number;
  height: string;
  data: number[];
  dangerRanges?: { min: number; max: number }[];
}

const CTGChart: React.FC<CTGChartProps> = ({ 
  title, 
  unit, 
  color, 
  minValue, 
  maxValue, 
  height, 
  data,
  dangerRanges = []
}) => {
  // Преобразуем данные для Recharts
  const chartData = data.map((value, index) => ({
    time: index,
    value: value,
    timestamp: `${Math.floor(index / 60)}:${(index % 60).toString().padStart(2, '0')}`
  }));

  // Функция для определения опасности значения
  const isDangerValue = (value: number) => {
    return dangerRanges.some(range => value < range.min || value > range.max);
  };

  // Кастомный Tooltip в розовой палитре
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const isDanger = isDangerValue(data.value);
      return (
        <div style={{
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
          border: `1px solid ${isDanger ? '#f43f5e' : '#ec4899'}`,
          borderRadius: '6px',
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#831843', fontSize: '11px' }}>
            {title}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: isDanger ? '#f43f5e' : '#a21caf' }}>
            {Math.round(data.value)} {unit}
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#831843', opacity: 0.8 }}>
            {data.payload.timestamp}
          </p>
          {isDanger && (
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#f43f5e', fontWeight: 'bold' }}>
              ⚠️ ВНИМАНИЕ!
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      height, 
      position: 'relative',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
      border: '1px solid #f3e8ff',
      borderRadius: '6px',
      padding: '6px'
    }}>
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '10px',
        background: 'rgba(255,255,255,0.95)',
        padding: '3px 6px',
        borderRadius: '4px',
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(236, 72, 153, 0.1)',
        border: '1px solid #f3e8ff'
      }}>
        <Text strong style={{ color: '#831843', fontSize: '10px' }}>
          {title}
        </Text>
        <Text style={{ marginLeft: '4px', fontSize: '9px', color: '#831843', opacity: 0.7 }}>
          ({unit})
        </Text>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 28, right: 15, left: 15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#f3e8ff" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#831843' }}
            tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
          />
          <YAxis 
            domain={[minValue, maxValue]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#831843' }}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Опасные зоны как фоновая заливка в розовых тонах */}
          {dangerRanges.map((range, index) => (
            <React.Fragment key={index}>
              <ReferenceArea 
                y1={minValue} 
                y2={range.min} 
                fill="#f43f5e" 
                fillOpacity={0.08}
              />
              <ReferenceArea 
                y1={range.max} 
                y2={maxValue} 
                fill="#f43f5e" 
                fillOpacity={0.08}
              />
            </React.Fragment>
          ))}
          
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={(props: any) => {
              const isDanger = isDangerValue(props.payload.value);
              return (
                <circle 
                  cx={props.cx} 
                  cy={props.cy} 
                  r={isDanger ? 3 : 1.5}
                  fill={isDanger ? '#f43f5e' : color}
                  stroke={isDanger ? '#fff' : 'none'}
                  strokeWidth={isDanger ? 1 : 0}
                />
              );
            }}
            activeDot={{ 
              r: 4, 
              fill: color,
              stroke: '#fff',
              strokeWidth: 1
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Текущее значение в розовой палитре */}
      {data.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '10px',
          background: isDangerValue(data[data.length - 1]) ? '#fef2f2' : '#fef7ff',
          border: `1px solid ${isDangerValue(data[data.length - 1]) ? '#fecaca' : '#f3e8ff'}`,
          borderRadius: '4px',
          padding: '3px 6px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: isDangerValue(data[data.length - 1]) ? '#dc2626' : '#a21caf'
        }}>
          {Math.round(data[data.length - 1])}
          {isDangerValue(data[data.length - 1]) && (
            <span style={{ marginLeft: '3px', animation: 'blink 1s infinite' }}>⚠️</span>
          )}
        </div>
      )}
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
    <div style={{ 
      padding: '12px', 
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)', 
      minHeight: '100vh' 
    }}>
      {/* Компактный заголовок страницы в розовой палитре */}
      <Card 
        size="small" 
        style={{ marginBottom: '10px' }}
        bodyStyle={{ padding: '8px 12px' }}
        headStyle={{ 
          padding: '6px 12px', 
          minHeight: 'auto',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
          borderBottom: '1px solid #f3e8ff'
        }}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar 
                size={20}
                style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
                icon={<HeartOutlined />}
              />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>КТГ Мониторинг</span>
            </div>
            <Tag 
              color={isRecording ? 'error' : 'default'}
              className="text-xs"
              style={{ 
                fontSize: '10px',
                padding: '2px 6px',
                background: isRecording ? '#fef2f2' : '#f8fafc',
                color: isRecording ? '#dc2626' : '#64748b',
                border: `1px solid ${isRecording ? '#fecaca' : '#e2e8f0'}`
              }}
            >
              {isRecording ? 'ЗАПИСЬ' : 'ОСТАНОВЛЕНО'}
            </Tag>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <UserOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#831843' }}>
                {patientName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ClockCircleOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
              <span style={{ fontSize: '11px', color: '#831843' }}>
                {pregnancyWeek}н {gestationDay}д
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
              <span style={{ fontSize: '11px', color: '#831843' }}>
                {sessionDate.format('DD.MM.YYYY')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '11px', color: '#831843', fontWeight: 'bold' }}>
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-red-500' : 'bg-gray-400'
            } ${isRecording ? 'animate-pulse' : ''}`}></div>
          </div>
        </div>
      </Card>

      {/* Основная область с графиками и боковой панелью */}
      <Row gutter={[12, 12]}>
        {/* Графики КТГ - компактные, без скролла */}
        <Col span={18}>
          <Card 
            size="small"
            style={{ height: '520px' }}
            bodyStyle={{ height: '490px', padding: '6px' }}
            headStyle={{ 
              padding: '4px 8px', 
              minHeight: 'auto',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <div className="flex items-center gap-2">
                <LineChartOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#831843' }}>
                  Графики КТГ
                </span>
              </div>
            }
          >
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {/* График ЧСС плода - розовый */}
              <CTGChart
                title="ЧСС плода"
                unit="bpm"
                color="#ec4899"
                minValue={100}
                maxValue={180}
                height="calc(33.33% - 2px)"
                data={fetalHeartRate}
                dangerRanges={[{ min: 110, max: 160 }]}
              />

              {/* График тонуса матки - фиолетовый */}
              <CTGChart
                title="Тонус матки"
                unit="mmHg"
                color="#a21caf"
                minValue={0}
                maxValue={100}
                height="calc(33.33% - 2px)"
                data={uterineContractions}
                dangerRanges={[{ min: 0, max: 80 }]}
              />

              {/* График схваток - малиновый */}
              <CTGChart
                title="Схватки"
                unit="mmHg"
                color="#be185d"
                minValue={0}
                maxValue={80}
                height="calc(33.34% - 2px)"
                data={contractions}
                dangerRanges={[{ min: 0, max: 60 }]}
              />
            </div>
          </Card>
        </Col>

        {/* Правая колонка - компактные виджеты в розовой палитре */}
        <Col span={6}>
          {/* Текущие показания */}
          <Card 
            size="small" 
            style={{ marginBottom: '10px' }}
            bodyStyle={{ padding: '8px' }}
            headStyle={{ 
              padding: '4px 8px', 
              minHeight: 'auto',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <div className="flex items-center gap-2">
                <ThunderboltOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#831843' }}>
                  Показания
                </span>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-2">
              <div className="p-2 rounded" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
                <div style={{ fontSize: '10px', color: '#831843', fontWeight: 'bold' }}>ЧСС плода</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ec4899' }}>
                  {fetalHeartRate.length > 0 ? Math.round(fetalHeartRate[fetalHeartRate.length - 1]) : 0}
                </div>
                <div style={{ fontSize: '9px', color: '#831843', opacity: 0.7 }}>bpm</div>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
                <div style={{ fontSize: '10px', color: '#831843', fontWeight: 'bold' }}>Тонус матки</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#a21caf' }}>
                  {uterineContractions.length > 0 ? Math.round(uterineContractions[uterineContractions.length - 1]) : 0}
                </div>
                <div style={{ fontSize: '9px', color: '#831843', opacity: 0.7 }}>mmHg</div>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
                <div style={{ fontSize: '10px', color: '#831843', fontWeight: 'bold' }}>Схватки</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#be185d' }}>
                  {contractions.length > 0 ? Math.round(contractions[contractions.length - 1]) : 0}
                </div>
                <div style={{ fontSize: '9px', color: '#831843', opacity: 0.7 }}>mmHg</div>
              </div>
            </div>
          </Card>

          {/* Управление */}
          <Card 
            size="small" 
            style={{ marginBottom: '10px' }}
            bodyStyle={{ padding: '8px' }}
            headStyle={{ 
              padding: '4px 8px', 
              minHeight: 'auto',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <div className="flex items-center gap-2">
                <SettingOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#831843' }}>
                  Управление
                </span>
              </div>
            }
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                type="primary"
                danger={isRecording}
                icon={isRecording ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={handleStartStop}
                block
                size="small"
                style={{
                  background: isRecording ? 
                    'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 
                    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              >
                {isRecording ? 'СТОП' : 'СТАРТ'}
              </Button>

              <Button
                icon={<SaveOutlined />}
                onClick={handleSave}
                disabled={!sessionStartTime}
                block
                size="small"
                style={{
                  background: '#fef7ff',
                  borderColor: '#f3e8ff',
                  color: '#831843',
                  fontSize: '11px'
                }}
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
                style={{
                  fontSize: '11px'
                }}
              >
                УДАЛИТЬ
              </Button>

              <Button
                icon={<PlusOutlined />}
                onClick={handleNewSession}
                block
                size="small"
                type="dashed"
                style={{
                  borderColor: '#f3e8ff',
                  color: '#831843',
                  fontSize: '11px'
                }}
              >
                НОВОЕ
              </Button>
            </Space>
          </Card>

          {/* Компактная статистика */}
          <Card 
            size="small"
            bodyStyle={{ padding: '8px' }}
            headStyle={{ 
              padding: '4px 8px', 
              minHeight: 'auto',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
              borderBottom: '1px solid #f3e8ff'
            }}
            title={
              <div className="flex items-center gap-2">
                <WifiOutlined style={{ color: '#ec4899', fontSize: '12px' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#831843' }}>
                  Статистика
                </span>
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-1.5 rounded" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
                <div style={{ fontSize: '10px', color: '#831843', fontWeight: 'bold' }}>Базальная</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ec4899' }}>
                  {fetalHeartRate.length > 10 ? 
                    Math.round(fetalHeartRate.slice(-10).reduce((a, b) => a + b, 0) / 10) : 
                    '--'}
                </div>
                <div style={{ fontSize: '8px', color: '#831843', opacity: 0.7 }}>bpm</div>
              </div>
              <div className="text-center p-1.5 rounded" style={{ backgroundColor: '#fef7ff', border: '1px solid #f3e8ff' }}>
                <div style={{ fontSize: '10px', color: '#831843', fontWeight: 'bold' }}>Вариация</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a21caf' }}>
                  {fetalHeartRate.length > 10 ? 
                    Math.round(Math.max(...fetalHeartRate.slice(-10)) - Math.min(...fetalHeartRate.slice(-10))) : 
                    '--'}
                </div>
                <div style={{ fontSize: '8px', color: '#831843', opacity: 0.7 }}>bpm</div>
              </div>
            </div>
          </Card>

          {/* Параметры сеанса - collapsed */}
          <Collapse 
            size="small"
            ghost
            items={[
              {
                key: '1',
                label: (
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#831843' }}>
                    <SettingOutlined /> Параметры сеанса
                  </span>
                ),
                children: (
                  <div className="space-y-2 p-2 rounded" style={{ 
                    background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
                    border: '1px solid #f3e8ff'
                  }}>
                    <div>
                      <Text style={{ fontSize: '10px', fontWeight: 'bold', color: '#831843' }}>ФИО:</Text>
                      <Input 
                        size="small"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        style={{ fontSize: '11px', marginTop: '2px' }}
                      />
                    </div>
                    <div>
                      <Text style={{ fontSize: '10px', fontWeight: 'bold', color: '#831843' }}>Тип КТГ:</Text>
                      <Select 
                        size="small" 
                        value={sessionType}
                        onChange={setSessionType}
                        style={{ width: '100%', marginTop: '2px' }}
                      >
                        {sessionTypes.map(type => (
                          <Option key={type.value} value={type.value}>
                            <span style={{ fontSize: '11px' }}>{type.label}</span>
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Text style={{ fontSize: '10px', fontWeight: 'bold', color: '#831843' }}>Недели:</Text>
                        <Input 
                          size="small" 
                          type="number"
                          value={pregnancyWeek}
                          onChange={(e) => setPregnancyWeek(Number(e.target.value))}
                          style={{ marginTop: '2px' }} 
                        />
                      </div>
                      <div>
                        <Text style={{ fontSize: '10px', fontWeight: 'bold', color: '#831843' }}>Дни:</Text>
                        <Input 
                          size="small" 
                          type="number"
                          value={gestationDay}
                          onChange={(e) => setGestationDay(Number(e.target.value))}
                          style={{ marginTop: '2px' }} 
                        />
                      </div>
                    </div>
                  </div>
                )
              }
            ]}
          />
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
