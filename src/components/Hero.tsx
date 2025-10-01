import { Button, Card, Typography, Space, Row, Col } from 'antd';
import { PlayCircleOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import FimeaLogo from './FimeaLogo';
import { colors } from '../theme';

const { Title, Paragraph } = Typography;

export default function Hero() {
  return (
    <section style={{ 
      background: `linear-gradient(135deg, ${colors.primaryPale} 0%, ${colors.primaryLighter} 50%, ${colors.background.primary} 100%)`,
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-16">
        <Row gutter={[48, 32]} align="middle">
          <Col xs={24} lg={12}>
            <div>
              {/* Верхний бейдж */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: colors.primaryLight,
                color: colors.primaryDark,
                padding: '8px 16px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '24px'
              }}>
                <CheckCircleOutlined style={{ marginRight: '8px' }} />
                Клинически протестировано
              </div>

              {/* Главный заголовок */}
              <Title level={1} style={{ 
                fontSize: 'clamp(2.5rem, 4vw, 4rem)', 
                lineHeight: 1.1,
                marginBottom: '24px',
                background: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Медицинская технология{' '}
                <span style={{ 
                  color: colors.primary,
                  WebkitTextFillColor: colors.primary 
                }}>
                  будущего
                </span>
              </Title>

              {/* Подзаголовок */}
              <Paragraph style={{ 
                fontSize: '20px', 
                color: colors.text.secondary, 
                marginBottom: '32px',
                lineHeight: 1.6
              }}>
                FIMEA — революционный фетальный монитор, который позволяет 
                отслеживать здоровье малыша в реальном времени. 
                Точность больничного оборудования у вас дома.
              </Paragraph>

              {/* Ключевые преимущества */}
              <div style={{ marginBottom: '40px' }}>
                <Space direction="vertical" size="small">
                  {[
                    'Мониторинг 24/7 в домашних условиях',
                    'Мгновенные уведомления о состоянии',
                    'Прямая связь с лечащим врачом'
                  ].map((feature, index) => (
                    <Space key={index} align="start">
                      <CheckCircleOutlined style={{ color: colors.success, marginTop: '2px' }} />
                      <span style={{ color: colors.text.secondary }}>{feature}</span>
                    </Space>
                  ))}
                </Space>
              </div>

              {/* Кнопки CTA */}
              <Space size="large" wrap>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ArrowRightOutlined />}
                  style={{
                    height: '56px',
                    padding: '0 32px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    boxShadow: `0 8px 24px ${colors.primary}40`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 12px 32px ${colors.primary}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primary}40`;
                  }}
                >
                  Начать мониторинг
                </Button>
                
                <Button 
                  size="large"
                  icon={<PlayCircleOutlined />}
                  style={{
                    height: '56px',
                    padding: '0 32px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: `2px solid ${colors.border.default}`,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border.default;
                    e.currentTarget.style.color = colors.text.primary;
                  }}
                >
                  Посмотреть демо
                </Button>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div style={{ position: 'relative' }}>
              {/* Декоративные элементы */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: `linear-gradient(135deg, ${colors.primary}20, ${colors.primaryLight}40)`,
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0
              }} />
              
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${colors.success}20, ${colors.info}20)`,
                borderRadius: '50%',
                filter: 'blur(30px)',
                zIndex: 0
              }} />

              {/* Главная карточка */}
              <Card 
                style={{ 
                  borderRadius: '24px',
                  border: 'none',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 1,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div style={{ 
                  aspectRatio: '16/10', 
                  background: `linear-gradient(135deg, ${colors.primaryPale} 0%, ${colors.primaryLighter} 100%)`,
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Лого в центре */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    marginBottom: '16px'
                  }}>
                    <FimeaLogo size={64} />
                  </div>
                  
                  <Title level={4} style={{ color: colors.primary, margin: 0 }}>
                    FIMEA Device
                  </Title>
                  <Paragraph style={{ color: colors.text.secondary, margin: '8px 0 0 0' }}>
                    Беспроводной монитор нового поколения
                  </Paragraph>

                  {/* Декоративные элементы на карточке */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '40px',
                    height: '40px',
                    border: `2px solid ${colors.primary}30`,
                    borderRadius: '50%'
                  }} />
                  
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    width: '24px',
                    height: '24px',
                    background: colors.success,
                    borderRadius: '50%',
                    opacity: 0.6
                  }} />
                </div>

                {/* Статистика внизу карточки */}
                <div style={{ 
                  marginTop: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  textAlign: 'center'
                }}>
                  {[
                    { value: '99.9%', label: 'Точность' },
                    { value: '24/7', label: 'Мониторинг' },
                    { value: '5000+', label: 'Семей' }
                  ].map((stat, index) => (
                    <div key={index}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 700, 
                        color: colors.primary,
                        marginBottom: '4px'
                      }}>
                        {stat.value}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.text.secondary 
                      }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
