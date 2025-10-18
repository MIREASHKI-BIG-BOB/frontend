import { Card, Typography, Row, Col } from 'antd';
import { MobileOutlined, AimOutlined, SoundOutlined, ShareAltOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { colors } from '../theme';
import FimeaLogo from './FimeaLogo';

const placeholderCtgUrl = new URL('../assets/placeholder-ctg-monitor.png', import.meta.url).href;

const { Title, Paragraph } = Typography;

const steps = [
  { 
    icon: <MobileOutlined />, 
    title: 'Подключите',
    desc: 'Включите FIMEA, подключите по Wi-Fi и откройте монитор КТГ с предиктивной аналитикой.',
    color: colors.primary
  },
  { 
    icon: <AimOutlined />, 
    title: 'Установите датчик',
    desc: 'Расположите датчик на животе. Система подскажет корректность сигнала и качество контакта.',
    color: colors.info
  },
  { 
    icon: <SoundOutlined />, 
    title: 'Наблюдайте онлайн',
    desc: 'На КТГ-ленте в реальном времени отображаются ЧСС плода, токограмма и автоматическая разметка событий.',
    color: colors.success
  },
  { 
    icon: <ShareAltOutlined />, 
    title: 'Получайте заключение',
    desc: 'ИИ анализирует эпизоды, вычисляет риски и формирует отчёт. Отправьте врачу или сохраните в облако.',
    color: colors.warning
  },
];

export default function HowItWorks() {
  return (
    <section style={{ 
    padding: '60px 0',
    background: `${colors.background.secondary}`,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.65), rgba(255,255,255,0.65)), url(${placeholderCtgUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',      // ← тянет по ширине и высоте с обрезкой
    }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        
        {/* Заголовок секции */}
        {/* Заголовок с лого */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <FimeaLogo size={48} color="#D86288" />

          </div>
          <Title level={2} style={{ 
            fontSize: 'clamp(2rem, 3vw, 2.5rem)',
            marginBottom: '16px',
            color: colors.text.primary
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #D86288, #B83280)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px',
              display: 'inline-block'
            }}>Как работает КТГ-монитор с ИИ</div>
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: colors.text.secondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            FIMEA записывает ЧСС плода и токограмму, нейросеть в реальном времени анализирует паттерны и формирует интерпретацию
          </Paragraph>
        </div>

        {/* Карточки шагов */}
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

                {/* Стрелка между шагами */}
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


      </div>
    </section>
  );
}
