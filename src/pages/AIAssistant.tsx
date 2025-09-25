import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Card, Input, Button, Avatar, Typography, Tag, Divider, Space, Select, Badge } from 'antd';
import { 
  RobotOutlined, 
  SendOutlined, 
  UserOutlined, 
  BulbOutlined, 
  AlertOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface AIRecommendation {
  id: number;
  patientName: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  category: 'vitals' | 'medication' | 'lifestyle' | 'followup';
  title: string;
  description: string;
  confidence: number;
  actions: string[];
  timestamp: string;
}

// Моковые данные рекомендаций ИИ
const aiRecommendations: AIRecommendation[] = [
  {
    id: 1,
    patientName: 'Анна Петрова',
    type: 'warning',
    category: 'vitals',
    title: 'Повышенная ЧСС в покое',
    description: 'Анализ данных за последние 3 дня показывает устойчивое повышение частоты сердечных сокращений в состоянии покоя (74-78 уд/мин). Рекомендуется дополнительное обследование.',
    confidence: 85,
    actions: [
      'Назначить ЭКГ',
      'Контроль артериального давления 2 раза в день',
      'Консультация кардиолога',
      'Исключить физические нагрузки'
    ],
    timestamp: '2024-09-20 09:15'
  },
  {
    id: 2,
    patientName: 'Мария Иванова',
    type: 'urgent',
    category: 'vitals',
    title: 'Критическое повышение АД',
    description: 'Зафиксировано артериальное давление 125/85, что превышает норму для беременных. Требуется немедленное вмешательство для предотвращения преэклампсии.',
    confidence: 92,
    actions: [
      'Экстренная консультация акушера-гинеколога',
      'Анализ мочи на белок',
      'Контроль веса и отеков',
      'Возможная госпитализация'
    ],
    timestamp: '2024-09-20 10:30'
  },
  {
    id: 3,
    patientName: 'Анна Петрова',
    type: 'info',
    category: 'lifestyle',
    title: 'Рекомендации по питанию',
    description: 'На основе анализа показателей глюкозы (5.2 ммоль/л) и прибавки веса, рекомендуется корректировка диеты для поддержания оптимальных показателей.',
    confidence: 78,
    actions: [
      'Консультация диетолога',
      'Дробное питание 5-6 раз в день',
      'Исключить быстрые углеводы',
      'Увеличить потребление клетчатки'
    ],
    timestamp: '2024-09-20 08:45'
  }
];

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Добро пожаловать в ИИ Ассистент! Я помогу вам с анализом данных пациенток, предложу рекомендации по лечению и отвечу на ваши вопросы. О чем хотели бы узнать?',
      timestamp: '09:00',
      suggestions: [
        'Анализ показателей Анны Петровой',
        'Рекомендации по питанию для беременных',
        'Критические показатели АД',
        'План обследования при повышенной ЧСС'
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Симуляция ответа ИИ
  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('анна') || lowerMessage.includes('петрова')) {
      return 'По данным Анны Петровой: ЧСС немного повышена (72-74 уд/мин), что может указывать на легкий стресс или изменения в организме. Рекомендую: 1) Контроль ЧСС 2-3 раза в день, 2) Техники релаксации, 3) Консультация при ЧСС >80 уд/мин. Остальные показатели в норме.';
    }
    
    if (lowerMessage.includes('давление') || lowerMessage.includes('гипертония')) {
      return 'При повышенном АД у беременных важно: 1) Контроль 2 раза в день, 2) Анализ мочи на белок каждую неделю, 3) Контроль веса и отеков, 4) При АД >140/90 - немедленная госпитализация. Помните: преэклампсия развивается быстро!';
    }
    
    if (lowerMessage.includes('питание') || lowerMessage.includes('диета')) {
      return 'Рекомендации по питанию для беременных: 1) 5-6 приемов пищи в день небольшими порциями, 2) Белки: 1.1г/кг веса, 3) Фолиевая кислота 400мкг/день, 4) Ограничить сахар и соль, 5) Исключить алкоголь полностью. При ГСД - консультация эндокринолога обязательна.';
    }
    
    if (lowerMessage.includes('чсс') || lowerMessage.includes('пульс')) {
      return 'Нормальная ЧСС при беременности: 60-90 уд/мин в покое. При устойчивом повышении >90 уд/мин рекомендую: 1) ЭКГ для исключения аритмий, 2) Анализ крови (гемоглобин, гормоны щитовидной железы), 3) Эхокардиография при необходимости, 4) Контроль АД.';
    }
    
    return 'Благодарю за ваш вопрос. На основе анализа данных рекомендую: 1) Регулярный мониторинг жизненно важных показателей, 2) Соблюдение протоколов наблюдения, 3) При отклонениях - немедленную консультацию специалистов. Могу предоставить более детальный анализ по конкретной пациентке.';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Симуляция задержки ответа ИИ
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: generateAIResponse(inputValue),
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Подробнее об этой пациентке',
          'Критерии для госпитализации',
          'Протокол экстренных действий',
          'Консультация специалистов'
        ]
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const getRecommendationIcon = (category: string) => {
    switch (category) {
      case 'vitals': return <HeartOutlined />;
      case 'medication': return <MedicineBoxOutlined />;
      case 'lifestyle': return <BulbOutlined />;
      case 'followup': return <FileTextOutlined />;
      default: return <AlertOutlined />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'red';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      case 'success': return 'green';
      default: return 'default';
    }
  };

  const urgentRecommendations = aiRecommendations.filter(r => r.type === 'urgent' || r.type === 'warning');
  const infoRecommendations = aiRecommendations.filter(r => r.type === 'info' || r.type === 'success');

  return (
    <div className="space-y-6 p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="!mb-1 flex items-center gap-2">
            <RobotOutlined style={{ color: '#e91e63' }} />
            ИИ Ассистент
          </Title>
          <Text type="secondary">Персонализированные рекомендации и умные подсказки</Text>
        </div>
        <Select
          value={selectedPatient}
          onChange={setSelectedPatient}
          className="w-48"
          placeholder="Выберите пациентку"
        >
          <Select.Option value="all">Все пациентки</Select.Option>
          <Select.Option value="anna">Анна Петрова</Select.Option>
          <Select.Option value="maria">Мария Иванова</Select.Option>
        </Select>
      </div>

      <Row gutter={[16, 16]}>
        {/* Чат с ИИ */}
        <Col xs={24} lg={14}>
          <Card title="Интерактивный ассистент" className="shadow-sm" bodyStyle={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Область сообщений */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4" style={{ maxHeight: '500px' }}>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar 
                      size="small" 
                      icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{ backgroundColor: message.type === 'user' ? '#e91e63' : '#52c41a' }}
                    />
                    <div>
                      <div 
                        className={`p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <Text className={message.type === 'user' ? 'text-white' : 'text-gray-900'}>
                          {message.content}
                        </Text>
                      </div>
                      <Text type="secondary" className="text-xs ml-2">
                        {message.timestamp}
                      </Text>
                      
                      {/* Предложения от ИИ */}
                      {message.suggestions && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, idx) => (
                            <Tag
                              key={idx}
                              className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Индикатор печатания */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
            <div className="flex gap-2">
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Задайте вопрос ИИ ассистенту..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                style={{ backgroundColor: '#e91e63', borderColor: '#e91e63' }}
              />
            </div>
          </Card>
        </Col>

        {/* Рекомендации ИИ */}
        <Col xs={24} lg={10}>
          <div className="space-y-4">
            {/* Критические рекомендации */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <Badge count={urgentRecommendations.length} style={{ backgroundColor: '#ff4d4f' }}>
                    <ThunderboltOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
                  </Badge>
                  <span>Критические рекомендации</span>
                </div>
              } 
              className="shadow-sm"
            >
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {urgentRecommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.category)}
                        <Text strong className="text-sm">{rec.title}</Text>
                      </div>
                      <Tag color={getRecommendationColor(rec.type)} className="text-xs">
                        {rec.confidence}%
                      </Tag>
                    </div>
                    <Text type="secondary" className="text-xs block mb-2">
                      {rec.patientName}
                    </Text>
                    <Text className="text-sm block mb-2">
                      {rec.description}
                    </Text>
                    <div className="space-y-1">
                      {rec.actions.slice(0, 2).map((action, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Общие рекомендации */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <BulbOutlined style={{ color: '#1890ff' }} />
                  <span>Умные подсказки</span>
                </div>
              } 
              className="shadow-sm"
            >
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {infoRecommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.category)}
                        <Text strong className="text-sm">{rec.title}</Text>
                      </div>
                      <Tag color={getRecommendationColor(rec.type)} className="text-xs">
                        {rec.confidence}%
                      </Tag>
                    </div>
                    <Text type="secondary" className="text-xs block mb-2">
                      {rec.patientName}
                    </Text>
                    <Text className="text-sm">
                      {rec.description}
                    </Text>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Быстрые действия" className="shadow-sm">
              <Space wrap>
                <Button size="small" onClick={() => handleSuggestionClick('Анализ критических показателей')}>
                  Критические показатели
                </Button>
                <Button size="small" onClick={() => handleSuggestionClick('Рекомендации по лечению')}>
                  Рекомендации по лечению
                </Button>
                <Button size="small" onClick={() => handleSuggestionClick('План обследования')}>
                  План обследования
                </Button>
                <Button size="small" onClick={() => handleSuggestionClick('Консультации специалистов')}>
                  Консультации
                </Button>
              </Space>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AIAssistant;