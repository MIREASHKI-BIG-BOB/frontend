import React, { useState } from 'react';
import { Row, Col, Card, Table, Select, DatePicker, Statistic, Progress, Tag } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { RiseOutlined, HeartOutlined, UserOutlined, AlertOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

// Моковые данные пациенток
const patientsData = [
  {
    id: 1,
    name: 'Анна Петрова',
    age: 28,
    gestation: '32 недели',
    lastUpdate: '2024-09-20 09:30',
    metrics: {
      heartRate: 72,
      bloodPressure: '120/80',
      weight: 67.5,
      temperature: 36.6,
      bloodSugar: 5.2
    },
    trends: [
      { date: '2024-09-15', heartRate: 70, weight: 66.8, bloodPressure: 118 },
      { date: '2024-09-16', heartRate: 71, weight: 67.0, bloodPressure: 119 },
      { date: '2024-09-17', heartRate: 73, weight: 67.2, bloodPressure: 122 },
      { date: '2024-09-18', heartRate: 72, weight: 67.3, bloodPressure: 121 },
      { date: '2024-09-19', heartRate: 74, weight: 67.4, bloodPressure: 120 },
      { date: '2024-09-20', heartRate: 72, weight: 67.5, bloodPressure: 120 }
    ],
    alerts: [
      { type: 'info', message: 'Показатели в норме', severity: 'low' },
      { type: 'warning', message: 'Незначительное повышение ЧСС', severity: 'medium' }
    ]
  },
  {
    id: 2,
    name: 'Мария Иванова',
    age: 24,
    gestation: '28 недель',
    lastUpdate: '2024-09-20 10:15',
    metrics: {
      heartRate: 78,
      bloodPressure: '125/85',
      weight: 72.1,
      temperature: 36.8,
      bloodSugar: 5.8
    },
    trends: [
      { date: '2024-09-15', heartRate: 75, weight: 71.2, bloodPressure: 122 },
      { date: '2024-09-16', heartRate: 76, weight: 71.4, bloodPressure: 123 },
      { date: '2024-09-17', heartRate: 79, weight: 71.7, bloodPressure: 126 },
      { date: '2024-09-18', heartRate: 77, weight: 71.9, bloodPressure: 124 },
      { date: '2024-09-19', heartRate: 78, weight: 72.0, bloodPressure: 125 },
      { date: '2024-09-20', heartRate: 78, weight: 72.1, bloodPressure: 125 }
    ],
    alerts: [
      { type: 'warning', message: 'Повышенное давление', severity: 'medium' },
      { type: 'success', message: 'Стабильный вес', severity: 'low' }
    ]
  }
];

// Столбцы для таблицы
const columns = [
  {
    title: 'Пациентка',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => (
      <div className="flex items-center gap-2">
        <UserOutlined className="text-gray-400" />
        <span className="font-medium">{text}</span>
      </div>
    ),
  },
  {
    title: 'Возраст',
    dataIndex: 'age',
    key: 'age',
    width: 80,
  },
  {
    title: 'Срок',
    dataIndex: 'gestation',
    key: 'gestation',
    width: 100,
  },
  {
    title: 'ЧСС',
    dataIndex: ['metrics', 'heartRate'],
    key: 'heartRate',
    width: 80,
    render: (rate: number) => (
      <span className={`font-medium ${rate > 75 ? 'text-orange-600' : 'text-green-600'}`}>
        {rate} уд/мин
      </span>
    ),
  },
  {
    title: 'Давление',
    dataIndex: ['metrics', 'bloodPressure'],
    key: 'bloodPressure',
    width: 100,
    render: (pressure: string) => {
      const systolic = parseInt(pressure.split('/')[0]);
      const color = systolic > 120 ? 'text-orange-600' : 'text-green-600';
      return <span className={`font-medium ${color}`}>{pressure}</span>;
    },
  },
  {
    title: 'Вес',
    dataIndex: ['metrics', 'weight'],
    key: 'weight',
    width: 80,
    render: (weight: number) => <span>{weight} кг</span>,
  },
  {
    title: 'Сахар',
    dataIndex: ['metrics', 'bloodSugar'],
    key: 'bloodSugar',
    width: 80,
    render: (sugar: number) => (
      <span className={`font-medium ${sugar > 5.5 ? 'text-orange-600' : 'text-green-600'}`}>
        {sugar} ммоль/л
      </span>
    ),
  },
  {
    title: 'Статус',
    key: 'status',
    width: 120,
    render: (_: any, record: any) => {
      const hasWarnings = record.alerts.some((alert: any) => alert.type === 'warning');
      return (
        <Tag color={hasWarnings ? 'orange' : 'green'}>
          {hasWarnings ? 'Требует внимания' : 'В норме'}
        </Tag>
      );
    },
  },
];

const Reports: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<number>(1);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const currentPatient = patientsData.find(p => p.id === selectedPatient) || patientsData[0];

  const summaryStats = {
    totalPatients: patientsData.length,
    activeMonitoring: patientsData.length,
    alertsCount: patientsData.reduce((acc, p) => acc + p.alerts.length, 0),
    avgHeartRate: Math.round(patientsData.reduce((acc, p) => acc + p.metrics.heartRate, 0) / patientsData.length)
  };

  return (
    <div className="space-y-6 p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Отчетность и аналитика</h1>
          <p className="text-gray-600">Собираемые данные и показатели пациенток</p>
        </div>
        <RangePicker
          onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
          className="shadow-sm"
        />
      </div>

      {/* Общая статистика */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего пациенток"
              value={summaryStats.totalPatients}
              prefix={<UserOutlined style={{ color: '#e91e63' }} />}
              valueStyle={{ color: '#e91e63' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Активный мониторинг"
              value={summaryStats.activeMonitoring}
              prefix={<HeartOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Уведомления"
              value={summaryStats.alertsCount}
              prefix={<AlertOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Средний пульс"
              value={summaryStats.avgHeartRate}
              suffix="уд/мин"
              prefix={<RiseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Таблица пациенток */}
      <Card title="Сводная таблица пациенток" className="shadow-sm">
        <Table
          columns={columns}
          dataSource={patientsData}
          rowKey="id"
          pagination={false}
          size="middle"
          className="border rounded-lg"
        />
      </Card>

      {/* Детальная аналитика выбранной пациентки */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Детальный анализ пациентки" className="shadow-sm">
            <div className="mb-4">
              <Select
                value={selectedPatient}
                onChange={setSelectedPatient}
                className="w-full max-w-xs"
                placeholder="Выберите пациентку"
              >
                {patientsData.map(patient => (
                  <Select.Option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.gestation}
                  </Select.Option>
                ))}
              </Select>
            </div>
            
            {/* График динамики показателей */}
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentPatient.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="#e91e63" 
                    name="ЧСС (уд/мин)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bloodPressure" 
                    stroke="#1890ff" 
                    name="Давление (сист.)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div className="space-y-4">
            {/* Текущие показатели */}
            <Card title="Текущие показатели" className="shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ЧСС:</span>
                  <span className="font-medium">{currentPatient.metrics.heartRate} уд/мин</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Давление:</span>
                  <span className="font-medium">{currentPatient.metrics.bloodPressure}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Вес:</span>
                  <span className="font-medium">{currentPatient.metrics.weight} кг</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Температура:</span>
                  <span className="font-medium">{currentPatient.metrics.temperature}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Сахар:</span>
                  <span className="font-medium">{currentPatient.metrics.bloodSugar} ммоль/л</span>
                </div>
              </div>
            </Card>

            {/* Уведомления и рекомендации */}
            <Card title="Уведомления" className="shadow-sm">
              <div className="space-y-2">
                {currentPatient.alerts.map((alert, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'warning' ? 'bg-orange-50 border-orange-400' :
                      alert.type === 'success' ? 'bg-green-50 border-green-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <p className={`text-sm font-medium ${
                      alert.type === 'warning' ? 'text-orange-800' :
                      alert.type === 'success' ? 'text-green-800' :
                      'text-blue-800'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;