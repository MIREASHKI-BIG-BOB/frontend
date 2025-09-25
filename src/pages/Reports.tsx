import React, { useState, useEffect } from 'react';
import { colors, typography } from '../theme';
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Button, 
  Space, 
  Alert,
  Tag,
  Statistic,
  Modal,
  Avatar,
  Divider,
  Timeline,
  DatePicker,
  TimePicker,
  Select,
  Badge
} from 'antd';
import dayjs from 'dayjs';
import { 
  PrinterOutlined, 
  DownloadOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  ReferenceArea 
} from 'recharts';

const { Title, Text } = Typography;

// Фиксированные данные КТГ
const ctgData = [
  { time: '10:00', fhr: 140, uc: 10, movement: 0 },
  { time: '10:05', fhr: 145, uc: 15, movement: 1 },
  { time: '10:10', fhr: 142, uc: 8, movement: 0 },
  { time: '10:15', fhr: 138, uc: 25, movement: 0 },
  { time: '10:20', fhr: 135, uc: 30, movement: 1 },
  { time: '10:25', fhr: 132, uc: 35, movement: 0 },
  { time: '10:30', fhr: 145, uc: 20, movement: 1 },
  { time: '10:35', fhr: 148, uc: 12, movement: 0 },
  { time: '10:40', fhr: 165, uc: 15, movement: 1 },
  { time: '10:45', fhr: 170, uc: 18, movement: 0 },
  { time: '10:50', fhr: 168, uc: 22, movement: 1 },
  { time: '10:55', fhr: 145, uc: 16, movement: 0 },
  { time: '11:00', fhr: 142, uc: 12, movement: 1 }
];

// Зоны аномалий
const anomalyZones = [
  {
    id: 1,
    startTime: '10:15',
    endTime: '10:25',
    type: 'bradycardia',
    severity: 'moderate',
    description: 'Брадикардия плода',
    recommendation: 'Требуется наблюдение, возможна гипоксия плода'
  },
  {
    id: 2,
    startTime: '10:40',
    endTime: '10:50',
    type: 'tachycardia',
    severity: 'mild',
    description: 'Тахикардия плода',
    recommendation: 'Умеренная тахикардия, контролировать динамику'
  }
];

// Данные пациента
const patientData = {
  name: 'Иванова Мария Петровна',
  age: 28,
  gestationalWeek: 36,
  diagnosis: 'Беременность 36 недель',
  bloodType: 'A(II) Rh+',
  weight: 72
};

// Данные врача
const doctorData = {
  name: 'Др. Петрова Елена Александровна',
  specialization: 'Акушер-гинеколог',
  license: 'МЗ РФ №12345678',
  department: 'Родильное отделение №1'
};

export default function ReportsPage() {
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // Состояние для управления временем приема
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [sessionType, setSessionType] = useState('monitoring');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSessionPanelCollapsed, setIsSessionPanelCollapsed] = useState(false);

  // Таймер записи
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleResetRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleAnomalyClick = (anomaly: any) => {
    setSelectedAnomaly(anomaly);
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'severe': return 'red';
      case 'moderate': return 'orange';
      case 'mild': return 'yellow';
      default: return 'green';
    }
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Заголовок отчета */}
      <Card className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="mb-2">Отчет КТГ исследования</Title>
            <Space>
              <Text type="secondary">
                <CalendarOutlined /> {selectedDate.format('DD MMMM YYYY')}, {selectedTime.format('HH:mm')}-{selectedTime.add(sessionDuration, 'minute').format('HH:mm')}
              </Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">Длительность: {sessionDuration} минут</Text>
              {isRecording && (
                <>
                  <Text type="secondary">•</Text>
                  <Text type="secondary" className="text-red-500">
                    ● ЗАПИСЬ ИДЕТ ({formatTime(recordingTime)})
                  </Text>
                </>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<RobotOutlined />} 
                onClick={() => setShowAIModal(true)}
                type="default"
              >
                ИИ Анализ
              </Button>
              <Button icon={<PrinterOutlined />} type="default">Печать</Button>
              <Button icon={<DownloadOutlined />} type="primary">Экспорт PDF</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Панель управления временем приема */}
      <Card 
        className="mb-4" 
        title="Параметры сеанса КТГ"
        extra={
          <Button
            type="text"
            icon={isSessionPanelCollapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={() => setIsSessionPanelCollapsed(!isSessionPanelCollapsed)}
            className="text-gray-500 hover:text-blue-500"
          >
            {isSessionPanelCollapsed ? 'Развернуть' : 'Свернуть'}
          </Button>
        }
      >
        {!isSessionPanelCollapsed && (
          <>
            <Row gutter={24} align="middle">
              <Col xs={24} sm={6}>
                <Space direction="vertical" size="small" className="w-full">
                  <Text type="secondary">Дата приема</Text>
                  <DatePicker 
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date || dayjs())}
                    className="w-full"
                    format="DD.MM.YYYY"
                  />
                </Space>
              </Col>
              
              <Col xs={24} sm={6}>
                <Space direction="vertical" size="small" className="w-full">
                  <Text type="secondary">Время начала</Text>
                  <TimePicker 
                    value={selectedTime}
                    onChange={(time) => setSelectedTime(time || dayjs())}
                    className="w-full"
                    format="HH:mm"
                  />
                </Space>
              </Col>
              
              <Col xs={24} sm={6}>
                <Space direction="vertical" size="small" className="w-full">
                  <Text type="secondary">Тип сеанса</Text>
                  <Select
                    value={sessionType}
                    onChange={setSessionType}
                    className="w-full"
                    options={[
                      { value: 'monitoring', label: 'Мониторинг плода' },
                      { value: 'stress', label: 'Стресс-тест' },
                      { value: 'nst', label: 'НСТ (нестрессовый тест)' },
                      { value: 'cst', label: 'КСТ (контрактильный стресс-тест)' }
                    ]}
                  />
                </Space>
              </Col>
              
              <Col xs={24} sm={6}>
                <Space direction="vertical" size="small" className="w-full">
                  <Text type="secondary">Длительность (мин)</Text>
                  <Select
                    value={sessionDuration}
                    onChange={setSessionDuration}
                    className="w-full"
                    options={[
                      { value: 20, label: '20 минут' },
                      { value: 30, label: '30 минут' },
                      { value: 40, label: '40 минут' },
                      { value: 60, label: '60 минут' },
                      { value: 90, label: '90 минут' },
                      { value: 120, label: '120 минут' }
                    ]}
                  />
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            {/* Контроллы записи */}
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="large">
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-blue-500" />
                    <Text strong>
                      Время записи: {formatTime(recordingTime)}
                    </Text>
                    {isRecording && (
                      <Badge status="processing" text="Идет запись" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-green-500" />
                    <Text>
                      Сеанс: {selectedDate.format('DD.MM.YYYY')} в {selectedTime.format('HH:mm')}
                    </Text>
                  </div>
                </Space>
              </Col>
              
              <Col>
                <Space>
                  {!isRecording ? (
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />}
                      onClick={handleStartRecording}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Начать запись
                    </Button>
                  ) : (
                    <Button 
                      type="default" 
                      icon={<PauseCircleOutlined />}
                      onClick={handleStopRecording}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Пауза
                    </Button>
                  )}
                  
                  <Button 
                    type="default" 
                    icon={<StopOutlined />}
                    onClick={handleStopRecording}
                    disabled={!isRecording && recordingTime === 0}
                    danger
                  >
                    Стоп
                  </Button>
                  
                  <Button 
                    type="default" 
                    icon={<ReloadOutlined />}
                    onClick={handleResetRecording}
                    disabled={isRecording}
                  >
                    Сброс
                  </Button>
                </Space>
              </Col>
            </Row>
          </>
        )}
        
        {/* Компактная информация в свернутом виде */}
        {isSessionPanelCollapsed && (
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="large">
                <div className="flex items-center gap-2">
                  <CalendarOutlined className="text-blue-500" />
                  <Text>
                    {selectedDate.format('DD.MM.YYYY')} в {selectedTime.format('HH:mm')}
                  </Text>
                </div>
                
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-green-500" />
                  <Text>
                    {formatTime(recordingTime)} / {sessionDuration}мин
                  </Text>
                </div>
                
                <div className="flex items-center gap-2">
                  {isRecording ? (
                    <Badge status="processing" text="Запись идет" />
                  ) : recordingTime > 0 ? (
                    <Badge status="warning" text="На паузе" />
                  ) : (
                    <Badge status="default" text="Остановлено" />
                  )}
                </div>
              </Space>
            </Col>
            
            <Col>
              <Space>
                {!isRecording ? (
                  <Button 
                    type="primary" 
                    icon={<PlayCircleOutlined />}
                    onClick={handleStartRecording}
                    size="small"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Старт
                  </Button>
                ) : (
                  <Button 
                    type="default" 
                    icon={<PauseCircleOutlined />}
                    onClick={handleStopRecording}
                    size="small"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Пауза
                  </Button>
                )}
                
                <Button 
                  type="default" 
                  icon={<StopOutlined />}
                  onClick={handleStopRecording}
                  disabled={!isRecording && recordingTime === 0}
                  size="small"
                  danger
                >
                  Стоп
                </Button>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      <Row gutter={24}>
        {/* Левая панель */}
        <Col xs={24} lg={8}>
          <Card title="Информация о пациенте" className="mb-4">
            <Space direction="vertical" size="small" className="w-full">
              <div className="flex items-center gap-2">
                <Avatar size={40} icon={<UserOutlined />} />
                <div>
                  <Text strong>{patientData.name}</Text>
                  <br />
                  <Text type="secondary">{patientData.age} лет</Text>
                </div>
              </div>
              <Divider className="my-3" />
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Срок:</Text>
                  <br />
                  <Text strong>{patientData.gestationalWeek} недель</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Вес:</Text>
                  <br />
                  <Text strong>{patientData.weight} кг</Text>
                </Col>
              </Row>
            </Space>
          </Card>

          <Card title="Параметры сеанса" className="mb-4">
            <Space direction="vertical" size="small" className="w-full">
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Тип сеанса:</Text>
                  <br />
                  <Text strong>
                    {sessionType === 'monitoring' && 'Мониторинг плода'}
                    {sessionType === 'stress' && 'Стресс-тест'}
                    {sessionType === 'nst' && 'НСТ'}
                    {sessionType === 'cst' && 'КСТ'}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Статус:</Text>
                  <br />
                  {isRecording ? (
                    <Tag color="red">● Запись идет</Tag>
                  ) : recordingTime > 0 ? (
                    <Tag color="orange">⏸ На паузе</Tag>
                  ) : (
                    <Tag color="default">⏹ Остановлено</Tag>
                  )}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Время записи:</Text>
                  <br />
                  <Text strong className={isRecording ? 'text-red-500' : ''}>
                    {formatTime(recordingTime)}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Плановая длительность:</Text>
                  <br />
                  <Text strong>{sessionDuration} мин</Text>
                </Col>
              </Row>
            </Space>
          </Card>

          <Card title="Показатели КТГ">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="Базальный ЧСС" 
                  value={142} 
                  suffix="уд/мин"
                  valueStyle={{ color: colors.utility.positive }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Вариабельность" 
                  value={15} 
                  suffix="уд/мин"
                  valueStyle={{ color: colors.utility.negative }}
                />
              </Col>
            </Row>
            <Divider />
            <div className="text-center">
              <Tag color="green" className="text-lg px-4 py-1">
                <CheckCircleOutlined /> Удовлетворительное
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Правая панель - график */}
        <Col xs={24} lg={16}>
          <Card title="Кардиотокограмма" className="mb-4">
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={ctgData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[110, 180]} />
                  <Tooltip />
                  
                  {/* Зоны аномалий */}
                  {anomalyZones.map((zone) => (
                    <ReferenceArea
                      key={zone.id}
                      x1={zone.startTime}
                      x2={zone.endTime}
                      fill={zone.severity === 'moderate' ? colors.status.danger : colors.status.warning}
                      fillOpacity={0.3}
                      onClick={() => handleAnomalyClick(zone)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                  
                  <ReferenceLine y={110} stroke={colors.status.danger} strokeDasharray="5 5" />
                  <ReferenceLine y={160} stroke={colors.status.danger} strokeDasharray="5 5" />
                  
                  <Line 
                    type="monotone" 
                    dataKey="fhr" 
                    stroke={colors.chart.materialBlue} 
                    strokeWidth={2}
                    dot={{ fill: colors.chart.materialBlue, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4">
              <Title level={4}>Выявленные отклонения:</Title>
              <Space wrap>
                {anomalyZones.map((anomaly) => (
                  <Tag
                    key={anomaly.id}
                    color={getSeverityColor(anomaly.severity)}
                    className="cursor-pointer"
                    onClick={() => handleAnomalyClick(anomaly)}
                  >
                    <ExclamationCircleOutlined /> {anomaly.description}
                  </Tag>
                ))}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Модальные окна */}
      <Modal
        title="Детали отклонения"
        open={!!selectedAnomaly}
        onCancel={() => setSelectedAnomaly(null)}
        footer={null}
      >
        {selectedAnomaly && (
          <Space direction="vertical" size="large" className="w-full">
            <Title level={4}>{selectedAnomaly.description}</Title>
            <Alert
              message="Рекомендации"
              description={selectedAnomaly.recommendation}
              type="warning"
              showIcon
            />
          </Space>
        )}
      </Modal>

      <Modal
        title="ИИ Анализ КТГ"
        open={showAIModal}
        onCancel={() => setShowAIModal(false)}
        footer={null}
        width={700}
      >
        <Alert
          message="Анализ завершен"
          description="ИИ-система проанализировала КТГ"
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Timeline
          items={[
            {
              color: 'red',
              children: 'Брадикардия плода (10:15-10:25): требуется контроль'
            },
            {
              color: 'orange', 
              children: 'Тахикардия плода (10:40-10:50): умеренная степень'
            },
            {
              color: 'green',
              children: 'Общее состояние: удовлетворительное'
            }
          ]}
        />
      </Modal>
    </div>
  );
}