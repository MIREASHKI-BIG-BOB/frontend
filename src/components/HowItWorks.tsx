import { Card, Typography, Row, Col, Space } from 'antd';
import { MobileOutlined, AimOutlined, SoundOutlined, ShareAltOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { colors } from '../theme';

const { Title, Paragraph } = Typography;

const steps = [
  { 
    icon: <MobileOutlined />, 
    title: 'Подключите', 
    desc: 'Соедините FIMEA со смартфоном по Bluetooth и откройте приложение.',
    color: colors.primary
  },
  { 
    icon: <AimOutlined />, 
    title: 'Установите', 
    desc: 'Расположите датчик на животе — система автоматически подскажет оптимальное место.',
    color: colors.info
  },
  { 
    icon: <SoundOutlined />, 
    title: 'Слушайте', 
    desc: 'В реальном времени наблюдайте и записывайте сердцебиение малыша.',
    color: colors.success
  },
  { 
    icon: <ShareAltOutlined />, 
    title: 'Делитесь', 
    desc: 'Отправляйте результаты врачу или сохраняйте в облаке одним касанием.',
    color: colors.warning
  },
];

export default function HowItWorks() {
  return (
    <section style={{ 
      padding: '80px 0',
      background: colors.background.secondary
    }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Заголовок секции */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <Title level={2} style={{ 
            fontSize: 'clamp(2rem, 3vw, 2.5rem)',
            marginBottom: '16px',
            color: colors.text.primary
          }}>
            Как это работает
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: colors.text.secondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Простой процесс из 4 шагов для начала мониторинга здоровья вашего малыша
          </Paragraph>
        </div>

        {/* Шаги */}
        <Row gutter={[24, 32]}>
          {steps.map((step, index) => (
            <Col key={index} xs={24} sm={12} lg={6}>
              <Card 
                style={{ 
                  height: '100%',
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
                }}
              >
                {/* Номер шага */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '32px',
                  height: '32px',
                  background: `${step.color}20`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: step.color
                }}>
                  {index + 1}
                </div>

                {/* Иконка */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  fontSize: '28px',
                  color: 'white',
                  boxShadow: `0 8px 24px ${step.color}40`
                }}>
                  {step.icon}
                </div>

                {/* Контент */}
                <Title level={4} style={{ 
                  marginBottom: '12px',
                  color: colors.text.primary,
                  fontSize: '20px'
                }}>
                  {step.title}
                </Title>
                
                <Paragraph style={{ 
                  color: colors.text.secondary,
                  lineHeight: 1.6,
                  marginBottom: 0
                }}>
                  {step.desc}
                </Paragraph>

                {/* Стрелка для всех кроме последнего */}
                {index < steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-12px',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '24px',
                    background: colors.background.primary,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 2
                  }}>
                    <ArrowRightOutlined style={{ 
                      fontSize: '12px', 
                      color: colors.text.secondary 
                    }} />
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* Дополнительная информация */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '64px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <Title level={4} style={{ 
            color: colors.text.primary,
            marginBottom: '16px'
          }}>
            Готовы начать?
          </Title>
          <Paragraph style={{ 
            color: colors.text.secondary,
            marginBottom: '24px',
            fontSize: '16px'
          }}>
            Весь процесс займет не более 5 минут
          </Paragraph>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            background: colors.success,
            color: 'white',
            padding: '12px 24px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 600
          }}>
            ✓ Простая настройка без технических знаний
          </div>
        </div>
      </div>
    </section>
  );
}
