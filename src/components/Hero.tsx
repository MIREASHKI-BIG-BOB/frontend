import { Button, Card, Typography, Space, Row, Col } from 'antd';
import { PlayCircleOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import FimeaLogo from './FimeaLogo';
import { colors } from '../theme';
import fimeaDeviceImg from '../assets/fimea-device.png';

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
              {/* Логотип и брендинг */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '20px',
                  padding: '16px',
                  boxShadow: '0 8px 32px rgba(216, 98, 136, 0.15)',
                  transform: 'rotate(-3deg)',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(-3deg) scale(1)'}
                >
                  <FimeaLogo size={72} color="#D86288" />
                </div>
                <div>
                  <div style={{
                    fontSize: '3.5rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #D86288, #B83280, #9F2B68)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    textShadow: '0 4px 8px rgba(216, 98, 136, 0.3)'
                  }}>
                    FIMEA CTG
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: colors.text.secondary,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    Медицинские технологии будущего
                  </div>
                </div>
              </div>

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
                Революционная система{' '}
                <span style={{ 
                  color: colors.primary,
                  WebkitTextFillColor: colors.primary 
                }}>
                  мониторинга КТГ
                </span>
              </Title>

              {/* Подзаголовок */}
              <Paragraph style={{ 
                fontSize: '20px', 
                color: colors.text.secondary, 
                marginBottom: '32px',
                lineHeight: 1.6
              }}>
                Передовые алгоритмы искусственного интеллекта для анализа кардиотокографии 
                в режиме реального времени. Обеспечиваем безопасность матери и ребенка 
                на каждом этапе беременности.
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
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '0px'
                }}>
                  <img
                    src={fimeaDeviceImg}
                    alt="FIMEA Device"
                    style={{
                      width: '1000%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                  />
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
                    { value: '99.7%', label: 'Точность ИИ' },
                    { value: '24/7', label: 'Мониторинг' },
                    { value: '250+', label: 'Клиник' }
                  ].map((stat, index) => (
                    <div key={index}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #D86288, #B83280)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
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
