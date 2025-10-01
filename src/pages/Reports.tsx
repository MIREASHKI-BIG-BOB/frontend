import React, { useState } from 'react';
import { Card, Typography, Row, Col, Button, Space, Alert, Tag, Modal, Avatar, Divider, Input, Progress, Descriptions, message, Badge, Spin } from 'antd';
import dayjs from 'dayjs';
import { PrinterOutlined, DownloadOutlined, UserOutlined, CheckCircleOutlined, RobotOutlined, EditOutlined, SaveOutlined, FileTextOutlined, ThunderboltOutlined, HeartOutlined, WarningOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ReportsPage() {
  // Данные пациента
  const [patientData] = useState({
    name: 'Иванова Мария Петровна',
    age: 28,
    gestationalWeek: 36,
    gestationalDay: 4,
    diagnosis: 'Беременность 36 недель',
    bloodType: 'A(II) Rh+',
    weight: 72,
    height: 165,
    previousPregnancies: 1
  });

  // Данные врача
  const [doctorData] = useState({
    name: 'Др. Петрова Елена Александровна',
    specialization: 'Акушер-гинеколог высшей категории',
    license: 'МЗ РФ №12345678',
    department: 'Родильное отделение №1',
    experience: 15
  });

  // Симулированные данные КТГ сеансов
  const [ctgSessions] = useState([
    {
      id: 1,
      date: dayjs().subtract(3, 'day'),
      duration: 40,
      basalFHR: 142,
      variability: 15,
      accelerations: 8,
      decelerations: 0,
      anomalies: [],
      conclusion: 'КТГ в норме'
    },
    {
      id: 2,
      date: dayjs().subtract(1, 'day'),
      duration: 45,
      basalFHR: 138,
      variability: 12,
      accelerations: 6,
      decelerations: 1,
      anomalies: [
        {
          time: '14:23',
          type: 'bradycardia',
          description: 'Кратковременная брадикардия',
          duration: 45
        }
      ],
      conclusion: 'Требуется наблюдение'
    },
    {
      id: 3,
      date: dayjs(),
      duration: 50,
      basalFHR: 145,
      variability: 18,
      accelerations: 10,
      decelerations: 0,
      anomalies: [
        {
          time: '10:18',
          type: 'tachycardia',
          description: 'Умеренная тахикардия',
          duration: 120
        }
      ],
      conclusion: 'Требуется контроль'
    }
  ]);

  // Состояние для генерации отчёта
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  // Редактируемые поля отчёта
  const [aiConclusion, setAiConclusion] = useState('');
  const [aiRecommendationsForDoctor, setAiRecommendationsForDoctor] = useState('');
  const [aiRecommendationsForPatient, setAiRecommendationsForPatient] = useState('');
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [approvedByDoctor, setApprovedByDoctor] = useState(false);

  // Генерация отчёта с помощью ИИ
  const generateAIReport = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setReportGenerated(false);

    // Симуляция процесса генерации отчёта
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          
          // Генерация контента отчёта
          generateReportContent();
          
          setReportGenerated(true);
          message.success('Отчёт успешно сгенерирован!');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Генерация контента отчёта на основе данных
  const generateReportContent = () => {
    // Анализ всех сеансов КТГ
    const totalSessions = ctgSessions.length;
    const totalAnomalies = ctgSessions.reduce((sum, session) => sum + session.anomalies.length, 0);
    const avgFHR = Math.round(ctgSessions.reduce((sum, s) => sum + s.basalFHR, 0) / totalSessions);
    const avgVariability = Math.round(ctgSessions.reduce((sum, s) => sum + s.variability, 0) / totalSessions);
    
    // Оценка риска
    let riskLevel = 'low';
    let riskScore = 10;
    
    if (totalAnomalies > 2) {
      riskLevel = 'high';
      riskScore = 75;
    } else if (totalAnomalies > 0) {
      riskLevel = 'medium';
      riskScore = 45;
    }
    
    setRiskAssessment({
      level: riskLevel,
      score: riskScore,
      factors: totalAnomalies > 0 ? [
        'Обнаружены аномалии в КТГ',
        totalAnomalies > 1 ? 'Множественные эпизоды отклонений' : 'Единичный эпизод отклонения',
        avgVariability < 10 ? 'Сниженная вариабельность ЧСС' : 'Нормальная вариабельность'
      ] : [
        'Нет критических аномалий',
        'Стабильные показатели ЧСС',
        'Хорошая вариабельность'
      ]
    });

    // Генерация заключения
    const conclusion = `На основании комплексного анализа ${totalSessions} сеансов кардиотокографии пациентки ${patientData.name} (${patientData.age} лет, срок беременности ${patientData.gestationalWeek} недель ${patientData.gestationalDay} дней) за период с ${ctgSessions[0].date.format('DD.MM.YYYY')} по ${ctgSessions[ctgSessions.length - 1].date.format('DD.MM.YYYY')}.

ПОКАЗАТЕЛИ КТГ:
• Базальная ЧСС плода: средняя ${avgFHR} уд/мин (норма 110-160)
• Вариабельность: средняя ${avgVariability} уд/мин (норма 10-25)
• Акцелерации: регистрируются регулярно
• Децелерации: ${ctgSessions.filter(s => s.decelerations > 0).length > 0 ? 'единичные, кратковременные' : 'отсутствуют'}

ВЫЯВЛЕННЫЕ ОСОБЕННОСТИ:
${totalAnomalies > 0 ? ctgSessions.filter(s => s.anomalies.length > 0).map(s => 
  `• ${s.date.format('DD.MM.YYYY')}: ${s.anomalies.map(a => a.description).join(', ')}`
).join('\n') : '• Патологические изменения не выявлены'}

ЗАКЛЮЧЕНИЕ:
${riskLevel === 'high' ? 'Состояние плода требует повышенного внимания. Рекомендуется усиленный мониторинг и консультация специалиста.' :
  riskLevel === 'medium' ? 'Состояние плода в целом удовлетворительное, однако выявлены отклонения, требующие наблюдения.' :
  'Состояние плода удовлетворительное. Показатели КТГ в пределах нормы.'}`;

    setAiConclusion(conclusion);

    // Рекомендации для врача
    const doctorRecs = riskLevel === 'high' ? 
      `СРОЧНЫЕ МЕРЫ:
• Усилить частоту КТГ-мониторинга до ежедневного
• Рассмотреть необходимость госпитализации для наблюдения
• Провести дополнительное УЗИ с допплерометрией
• Консультация перинатолога

ДАЛЬНЕЙШАЯ ТАКТИКА:
• Контроль показателей в динамике
• При ухудшении показателей - рассмотреть вопрос о досрочном родоразрешении
• Готовность к экстренным мерам` :
      riskLevel === 'medium' ?
      `РЕКОМЕНДАЦИИ:
• Продолжить регулярный КТГ-мониторинг (2-3 раза в неделю)
• Контроль показателей в динамике
• При появлении новых аномалий - усиление наблюдения
• Разъяснить пациентке важность контроля шевелений плода

ПРОФИЛАКТИКА:
• Соблюдение режима отдыха
• Избегать стрессовых ситуаций
• Адекватная физическая активность` :
      `РЕКОМЕНДАЦИИ:
• Продолжить плановый КТГ-мониторинг согласно протоколу
• Стандартное наблюдение до родов
• Подготовка к физиологическим родам

ПРОФИЛАКТИКА:
• Соблюдение общих рекомендаций для беременных
• Контроль самочувствия и активности плода`;

    setAiRecommendationsForDoctor(doctorRecs);

    // Рекомендации для пациентки
    const patientRecs = `Уважаемая ${patientData.name.split(' ')[0]}!

По результатам обследования состояние вашего малыша ${riskLevel === 'low' ? 'отличное!' : 'находится под наблюдением врачей.'}

ЧТО ЭТО ЗНАЧИТ?
${riskLevel === 'high' ? 'Выявлены изменения, которые требуют повышенного внимания. Ваш малыш находится под тщательным наблюдением.' :
  riskLevel === 'medium' ? 'В целом всё хорошо, но есть моменты, на которые стоит обратить внимание.' :
  'Все показатели в норме, ваш малыш развивается прекрасно!'}

ЧТО ВАМ НУЖНО ДЕЛАТЬ?

1. РЕГУЛЯРНО:
   ${riskLevel === 'high' ? '• Приходите на КТГ ежедневно или по назначению врача' :
     riskLevel === 'medium' ? '• Приходите на КТГ 2-3 раза в неделю' :
     '• Регулярное наблюдение у врача по графику'}
   • Считайте шевеления малыша (норма: 10 за 12 часов)

2. ЕЖЕДНЕВНО:
   • Больше отдыхайте, спите на левом боку
   • Гуляйте на свежем воздухе (30-40 минут)
   • Избегайте переутомления и стресса
   • Пейте достаточно воды

3. ОБРАТИТЕСЬ К ВРАЧУ СРОЧНО, ЕСЛИ:
   • Меньше 10 шевелений за 12 часов
   • Появились необычные боли
   • Кровянистые выделения
   • Излитие околоплодных вод

ВАЖНО ПОМНИТЬ:
${riskLevel === 'high' ? 'Вы и ваш малыш находитесь под постоянным наблюдением специалистов. При любых вопросах - сразу звоните своему врачу!' :
  riskLevel === 'medium' ? 'Вы делаете всё правильно! Просто продолжайте следить за собой и малышом.' :
  'У вас всё прекрасно! Наслаждайтесь этим особенным временем и готовьтесь к встрече с малышом!'}`;

    setAiRecommendationsForPatient(patientRecs);
  };

  // Сохранение отчёта
  const handleSaveReport = () => {
    setIsEditing(false);
    message.success('Изменения сохранены');
  };

  // Утверждение отчёта врачом
  const handleApproveReport = () => {
    Modal.confirm({
      title: 'Утверждение отчёта',
      content: 'Вы уверены, что хотите утвердить этот отчёт? После утверждения отчёт будет доступен пациентке.',
      okText: 'Утвердить',
      cancelText: 'Отмена',
      onOk: () => {
        setApprovedByDoctor(true);
        setIsEditing(false);
        message.success('Отчёт утверждён и отправлен пациентке');
      }
    });
  };

  return (
    <div style={{ 
      padding: '16px',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
      minHeight: '100vh'
    }}>
      {/* Заголовок страницы */}
      <div style={{
        marginBottom: '16px',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fef7ff 100%)',
        borderRadius: '8px',
        border: '1px solid #f3e8ff'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar 
              size={32}
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
              icon={<FileTextOutlined />}
            />
            <div>
              <Title level={4} style={{ margin: 0, color: '#831843' }}>
                Генерация медицинского отчёта
              </Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Комплексный анализ КТГ с рекомендациями
              </Text>
            </div>
          </div>
          <Space>
            {reportGenerated && (
              <>
                <Button 
                  icon={<PrinterOutlined />} 
                  onClick={() => message.info('Печать отчёта')}
                  style={{
                    borderColor: '#ec4899',
                    color: '#831843'
                  }}
                >
                  Печать
                </Button>
                <Button 
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => message.info('Экспорт в PDF')}
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                    border: 'none'
                  }}
                >
                  Экспорт PDF
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>

      <Row gutter={16}>
        {/* Левая колонка - информация и данные */}
        <Col span={8}>
          {/* Информация о пациенте */}
          <Card 
            size="small"
            title={
              <div className="flex items-center gap-2">
                <UserOutlined style={{ color: '#ec4899' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                  Информация о пациенте
                </span>
              </div>
            }
            style={{ marginBottom: '16px' }}
            headStyle={{ 
              padding: '8px 12px',
              background: 'transparent',
              borderBottom: '1px solid #f3e8ff'
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="ФИО">
                <Text strong>{patientData.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Возраст">
                {patientData.age} лет
              </Descriptions.Item>
              <Descriptions.Item label="Срок беременности">
                <Tag color="blue">{patientData.gestationalWeek}н {patientData.gestationalDay}д</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Диагноз">
                {patientData.diagnosis}
              </Descriptions.Item>
              <Descriptions.Item label="Группа крови">
                {patientData.bloodType}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Информация о враче */}
          <Card 
            size="small"
            title={
              <div className="flex items-center gap-2">
                <SafetyOutlined style={{ color: '#be185d' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                  Ответственный врач
                </span>
              </div>
            }
            style={{ marginBottom: '16px' }}
            headStyle={{ 
              padding: '8px 12px',
              background: 'transparent',
              borderBottom: '1px solid #f3e8ff'
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="ФИО">
                <Text strong>{doctorData.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Специализация">
                {doctorData.specialization}
              </Descriptions.Item>
              <Descriptions.Item label="Отделение">
                {doctorData.department}
              </Descriptions.Item>
              <Descriptions.Item label="Лицензия">
                {doctorData.license}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Сводка по сеансам КТГ */}
          <Card 
            size="small"
            title={
              <div className="flex items-center gap-2">
                <HeartOutlined style={{ color: '#ec4899' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                  Данные КТГ сеансов
                </span>
              </div>
            }
            headStyle={{ 
              padding: '8px 12px',
              background: 'transparent',
              borderBottom: '1px solid #f3e8ff'
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div className="flex items-center justify-between">
                <Text>Всего сеансов:</Text>
                <Tag color="blue">{ctgSessions.length}</Tag>
              </div>
              <div className="flex items-center justify-between">
                <Text>Аномалий обнаружено:</Text>
                <Tag color={ctgSessions.reduce((sum, s) => sum + s.anomalies.length, 0) > 0 ? 'warning' : 'success'}>
                  {ctgSessions.reduce((sum, s) => sum + s.anomalies.length, 0)}
                </Tag>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              {ctgSessions.map((session, idx) => (
                <div key={session.id} style={{
                  padding: '8px',
                  background: '#fef7ff',
                  borderRadius: '4px',
                  border: '1px solid #f3e8ff'
                }}>
                  <div className="flex items-center justify-between mb-1">
                    <Text strong style={{ fontSize: '12px', color: '#831843' }}>
                      Сеанс #{idx + 1}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {session.date.format('DD.MM.YYYY')}
                    </Text>
                  </div>
                  <div style={{ fontSize: '11px', color: '#831843' }}>
                    ЧСС: {session.basalFHR} bpm • Вариабельность: {session.variability} bpm
                  </div>
                  {session.anomalies.length > 0 && (
                    <Tag color="warning" style={{ fontSize: '10px', marginTop: '4px' }}>
                      {session.anomalies[0].description}
                    </Tag>
                  )}
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Правая колонка - генерация отчёта */}
        <Col span={16}>
          {!reportGenerated ? (
            // Экран до генерации отчёта
            <Card
              style={{ minHeight: '600px' }}
              bodyStyle={{ 
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Avatar 
                size={80}
                style={{ 
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  marginBottom: '24px'
                }}
                icon={<RobotOutlined style={{ fontSize: '40px' }} />}
              />
              <Title level={3} style={{ color: '#831843', marginBottom: '12px' }}>
                Генерация отчёта с помощью ИИ
              </Title>
              <Paragraph style={{ textAlign: 'center', maxWidth: '500px', marginBottom: '32px', color: '#64748b' }}>
                Система проанализирует все данные КТГ сеансов и сгенерирует комплексный медицинский отчёт 
                с заключением, оценкой рисков и персонализированными рекомендациями для врача и пациентки.
              </Paragraph>

              {isGenerating ? (
                <div style={{ width: '100%', maxWidth: '400px' }}>
                  <Progress 
                    percent={generationProgress} 
                    status="active"
                    strokeColor={{
                      '0%': '#ec4899',
                      '100%': '#be185d',
                    }}
                  />
                  <div style={{ textAlign: 'center', marginTop: '16px', color: '#831843' }}>
                    <Spin /> 
                    <Text style={{ marginLeft: '8px' }}>
                      {generationProgress < 30 ? 'Анализ данных КТГ...' :
                       generationProgress < 60 ? 'Оценка рисков...' :
                       generationProgress < 90 ? 'Формирование рекомендаций...' :
                       'Завершение отчёта...'}
                    </Text>
                  </div>
                </div>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  icon={<ThunderboltOutlined />}
                  onClick={generateAIReport}
                  style={{
                    height: '48px',
                    fontSize: '16px',
                    padding: '0 48px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                    border: 'none'
                  }}
                >
                  Сгенерировать отчёт
                </Button>
              )}
            </Card>
          ) : (
            // Сгенерированный отчёт
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Статус утверждения */}
              {approvedByDoctor && (
                <Alert
                  message="Отчёт утверждён врачом"
                  description={`Утверждён: ${dayjs().format('DD.MM.YYYY HH:mm')} • Врач: ${doctorData.name}`}
                  type="success"
                  icon={<CheckCircleOutlined />}
                  showIcon
                />
              )}

              {/* Оценка рисков */}
              {riskAssessment && (
                <Card
                  size="small"
                  title={
                    <div className="flex items-center gap-2">
                      <WarningOutlined style={{ color: '#f59e0b' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                        Оценка рисков ИИ
                      </span>
                    </div>
                  }
                  headStyle={{ 
                    padding: '8px 12px',
                    background: 'transparent',
                    borderBottom: '1px solid #f3e8ff'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Row gutter={16} align="middle">
                    <Col span={12}>
                      <div style={{
                        padding: '16px',
                        borderRadius: '8px',
                        background: riskAssessment.level === 'high' ? '#fef2f2' :
                                   riskAssessment.level === 'medium' ? '#fefce8' : '#f0fdf4',
                        border: `2px solid ${riskAssessment.level === 'high' ? '#fecaca' :
                                            riskAssessment.level === 'medium' ? '#fef3c7' : '#bbf7d0'}`
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <Text style={{ fontSize: '12px', color: '#831843' }}>Уровень риска</Text>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: riskAssessment.level === 'high' ? '#dc2626' :
                                   riskAssessment.level === 'medium' ? '#d97706' : '#16a34a',
                            marginTop: '4px'
                          }}>
                            {riskAssessment.level === 'high' ? 'ВЫСОКИЙ' :
                             riskAssessment.level === 'medium' ? 'СРЕДНИЙ' : 'НИЗКИЙ'}
                          </div>
                          <Progress
                            percent={riskAssessment.score}
                            strokeColor={riskAssessment.level === 'high' ? '#dc2626' :
                                        riskAssessment.level === 'medium' ? '#d97706' : '#16a34a'}
                            showInfo={false}
                            style={{ marginTop: '8px' }}
                          />
                          <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#831843' }}>
                            {riskAssessment.score}%
                          </Text>
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ fontSize: '12px' }}>
                        <Text strong style={{ color: '#831843' }}>Факторы оценки:</Text>
                        <ul style={{ marginTop: '8px', paddingLeft: '16px', color: '#64748b' }}>
                          {riskAssessment.factors.map((factor: string, idx: number) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Заключение */}
              <Card
                size="small"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileTextOutlined style={{ color: '#ec4899' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                        Медицинское заключение
                      </span>
                    </div>
                    {!approvedByDoctor && (
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setIsEditing(!isEditing)}
                        style={{
                          borderColor: '#ec4899',
                          color: '#be185d'
                        }}
                      >
                        {isEditing ? 'Отменить' : 'Редактировать'}
                      </Button>
                    )}
                  </div>
                }
                headStyle={{ 
                  padding: '8px 12px',
                  background: 'transparent',
                  borderBottom: '1px solid #f3e8ff'
                }}
                bodyStyle={{ padding: '16px' }}
              >
                {isEditing ? (
                  <TextArea
                    value={aiConclusion}
                    onChange={(e) => setAiConclusion(e.target.value)}
                    rows={12}
                    style={{ fontSize: '13px', lineHeight: '1.6' }}
                  />
                ) : (
                  <div style={{ 
                    fontSize: '13px', 
                    lineHeight: '1.8', 
                    whiteSpace: 'pre-line',
                    color: '#1e293b'
                  }}>
                    {aiConclusion}
                  </div>
                )}
              </Card>

              {/* Рекомендации для врача */}
              <Card
                size="small"
                title={
                  <div className="flex items-center gap-2">
                    <SafetyOutlined style={{ color: '#be185d' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                      Рекомендации для врача
                    </span>
                  </div>
                }
                headStyle={{ 
                  padding: '8px 12px',
                  background: 'transparent',
                  borderBottom: '1px solid #f3e8ff'
                }}
                bodyStyle={{ padding: '16px' }}
              >
                {isEditing ? (
                  <TextArea
                    value={aiRecommendationsForDoctor}
                    onChange={(e) => setAiRecommendationsForDoctor(e.target.value)}
                    rows={10}
                    style={{ fontSize: '13px', lineHeight: '1.6' }}
                  />
                ) : (
                  <div style={{ 
                    fontSize: '13px', 
                    lineHeight: '1.8', 
                    whiteSpace: 'pre-line',
                    color: '#1e293b'
                  }}>
                    {aiRecommendationsForDoctor}
                  </div>
                )}
              </Card>

              {/* Рекомендации для пациентки */}
              <Card
                size="small"
                title={
                  <div className="flex items-center gap-2">
                    <HeartOutlined style={{ color: '#ec4899' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
                      Рекомендации для пациентки
                    </span>
                    <Badge 
                      count="Для пациента"
                      style={{ 
                        backgroundColor: '#fce7f3',
                        color: '#be185d',
                        fontSize: '10px'
                      }}
                    />
                  </div>
                }
                headStyle={{ 
                  padding: '8px 12px',
                  background: 'transparent',
                  borderBottom: '1px solid #f3e8ff'
                }}
                bodyStyle={{ padding: '16px' }}
              >
                {isEditing ? (
                  <TextArea
                    value={aiRecommendationsForPatient}
                    onChange={(e) => setAiRecommendationsForPatient(e.target.value)}
                    rows={15}
                    style={{ fontSize: '13px', lineHeight: '1.6' }}
                  />
                ) : (
                  <div style={{ 
                    fontSize: '13px', 
                    lineHeight: '1.8', 
                    whiteSpace: 'pre-line',
                    color: '#1e293b'
                  }}>
                    {aiRecommendationsForPatient}
                  </div>
                )}
              </Card>

              {/* Кнопки действий */}
              <Card bodyStyle={{ padding: '16px' }}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                      {isEditing && (
                        <Button
                          icon={<SaveOutlined />}
                          onClick={handleSaveReport}
                          style={{
                            borderColor: '#ec4899',
                            color: '#be185d'
                          }}
                        >
                          Сохранить изменения
                        </Button>
                      )}
                      {!approvedByDoctor && (
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={handleApproveReport}
                          disabled={isEditing}
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none'
                          }}
                        >
                          Утвердить отчёт
                        </Button>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Space>
          )}
        </Col>
      </Row>
    </div>
  );
}
