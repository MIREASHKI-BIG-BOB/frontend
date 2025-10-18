import { Button, Card, Typography, Space, Row, Col } from 'antd';
import { PlayCircleOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import FimeaLogo from './FimeaLogo';
import { colors } from '../theme';
import fimeaDeviceImg from '../assets/fimea-device.png';

const { Title, Paragraph } = Typography;

export default function Hero() {
  return (
    <section style={{ 
      position: 'relative',
      backgroundImage: `url(${fimeaDeviceImg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right center',
      backgroundSize: 'cover',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      {/* subtle left overlay to keep text readable but reveal device image on the right */}
      <div aria-hidden style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '25%',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.25) 55%, rgba(255,255,255,0) 80%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-16" style={{ height: '100%', paddingTop: 0, paddingBottom: 0 }}>
        <Row gutter={[48, 32]} style={{ height: '100%' }} align="stretch">
          <Col xs={24} lg={12} style={{ position: 'relative', zIndex: 3 }}>
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
                    FIMEA
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
                  onClick={() => (location.hash = '#/ctg')}
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

          <Col xs={24} lg={12} style={{ height: '100%', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch', justifyContent: 'center', height: '100%', overflow: 'hidden' }}>
              {/* Декоративные элементы */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
              
                borderRadius: '50%',

                zIndex: 0
              }} />
              
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                zIndex: 0
              }} />

              {/* декоративный фон-контейнер оставляем пустым (фон секции) */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 1 }} aria-hidden />
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
