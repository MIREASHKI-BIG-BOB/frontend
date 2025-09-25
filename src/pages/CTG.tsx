import { Space, Row, Col, Card, Statistic, Typography, Select, DatePicker, TimePicker, Button, Tag } from 'antd';
import CTGMultiChart from '../widgets/CTGMultiChart';
import StatusIndicators from '../widgets/StatusIndicators';
import { useState, useEffect } from 'react';
import { colors, typography } from '../theme';
import { 
  HeartOutlined, 
  UserOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CTGPage() {
  const [risk, setRisk] = useState<'ok' | 'warn' | 'danger'>('ok');
  const [score, setScore] = useState(0);
  const [sessionDate, setSessionDate] = useState<Dayjs>(dayjs());
  const [sessionTime, setSessionTime] = useState<Dayjs>(dayjs());
  const [sessionDuration, setSessionDuration] = useState<number>(30); // минуты
  const [sessionType, setSessionType] = useState<string>('routine');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0); // секунды

  // Запуск/остановка записи
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
    }
  };

  // Предустановленные типы сессий КТГ
  const sessionTypes = [
    { value: 'routine', label: 'Плановое КТГ', color: 'blue' },
    { value: 'emergency', label: 'Экстренное КТГ', color: 'red' },
    { value: 'prenatal', label: 'Антенатальное КТГ', color: 'green' },
    { value: 'intrapartum', label: 'Интранатальное КТГ', color: 'orange' },
    { value: 'postpartum', label: 'Постнатальное КТГ', color: 'purple' }
  ];

  const getCurrentSessionType = () => {
    return sessionTypes.find(type => type.value === sessionType);
  };

  // Таймер для отслеживания времени записи
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          КТГ Мониторинг
        </Title>
        <Text type="secondary">
          Комплексный мониторинг состояния плода, матери и маточной активности
        </Text>
      </div>

      {/* Панель управления временем приема */}
      <Card className="mb-4" title={
        <Space>
          <ClockCircleOutlined />
          <Text strong>Параметры сеанса КТГ</Text>
        </Space>
      }>
        <Row gutter={[16, 16]} align="middle">
          {/* Дата приема */}
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2">
              <Text strong>Дата приема</Text>
            </div>
            <DatePicker
              value={sessionDate}
              onChange={(date) => date && setSessionDate(date)}
              placeholder="Выберите дату"
              style={{ width: '100%' }}
              suffixIcon={<CalendarOutlined />}
              format="DD.MM.YYYY"
            />
          </Col>

          {/* Время начала */}
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2">
              <Text strong>Время начала</Text>
            </div>
            <TimePicker
              value={sessionTime}
              onChange={(time) => time && setSessionTime(time)}
              placeholder="Выберите время"
              style={{ width: '100%' }}
              format="HH:mm"
              suffixIcon={<ClockCircleOutlined />}
            />
          </Col>

          {/* Длительность сеанса */}
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2">
              <Text strong>Длительность</Text>
            </div>
            <Select
              value={sessionDuration}
              onChange={setSessionDuration}
              style={{ width: '100%' }}
              placeholder="Выберите длительность"
            >
              <Option value={10}>10 минут</Option>
              <Option value={20}>20 минут</Option>
              <Option value={30}>30 минут</Option>
              <Option value={40}>40 минут</Option>
              <Option value={60}>60 минут</Option>
              <Option value={90}>90 минут</Option>
            </Select>
          </Col>

          {/* Тип КТГ */}
          <Col xs={24} sm={12} md={6}>
            <div className="mb-2">
              <Text strong>Тип КТГ</Text>
            </div>
            <Select
              value={sessionType}
              onChange={setSessionType}
              style={{ width: '100%' }}
              placeholder="Выберите тип"
            >
              {sessionTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  <Tag color={type.color}>{type.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Контроль записи */}
        <Row className="mt-4" justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                type="primary"
                danger={isRecording}
                icon={isRecording ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={toggleRecording}
                size="large"
              >
                {isRecording ? 'Остановить запись' : 'Начать запись'}
              </Button>
              {getCurrentSessionType() && (
                <Tag color={getCurrentSessionType()!.color} className="text-sm">
                  {getCurrentSessionType()!.label}
                </Tag>
              )}
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" size="small" className="text-right">
              <Text strong>
                Сеанс: {sessionDate.format('DD.MM.YYYY')} в {sessionTime.format('HH:mm')}
              </Text>
              <Text type="secondary">
                Запланировано: {sessionDuration} мин
                {isRecording && ` | Записано: ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Основной график КТГ */}
        <Col span={24}>
          <CTGMultiChart 
            onRiskChange={(r: 'ok' | 'warn' | 'danger', s: number) => { 
              setRisk(r); 
              setScore(s); 
            }} 
            fpsMs={isRecording ? 1000 : 2000}
            windowLengthSec={sessionDuration * 60}
          />
        </Col>

        {/* Дополнительные индикаторы */}
        <Col span={24}>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Общий статус"
                  value={risk === 'ok' ? 'Норма' : risk === 'warn' ? 'Внимание' : 'Критично'}
                  valueStyle={{ 
                    color: risk === 'ok' ? colors.status.success : risk === 'warn' ? colors.status.warning : colors.status.danger 
                  }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Оценка риска"
                  value={score}
                  suffix="/ 100"
                  valueStyle={{ 
                    color: score < 30 ? colors.status.success : score < 60 ? colors.status.warning : colors.status.danger 
                  }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Время записи"
                  value={isRecording ? `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}` : '--:--'}
                  suffix={`/ ${sessionDuration} мин`}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{
                    color: isRecording ? colors.status.info : colors.utility.inactive
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Прогресс"
                  value={isRecording ? Math.round((recordingTime / (sessionDuration * 60)) * 100) : 0}
                  suffix="%"
                  prefix={<HeartOutlined />}
                  valueStyle={{
                    color: isRecording ? colors.status.success : colors.utility.inactive
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
