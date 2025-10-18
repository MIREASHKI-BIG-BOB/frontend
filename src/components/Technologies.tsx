import { Card, Typography, Row, Col, Progress, Space } from 'antd';
import { WifiOutlined, SafetyCertificateOutlined, CloudOutlined, MobileOutlined, HeartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import FimeaLogo from './FimeaLogo';
import { colors } from '../theme';

const { Title, Paragraph } = Typography;

const technologies = [
  {
    icon: <WifiOutlined />,
    title: 'WiFi 5.0',
    desc: 'Стабильное подключение с низким энергопотреблением',
    progress: 95,
    color: colors.info
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Медицинская сертификация',
    desc: 'FDA одобрено, соответствует стандартам ISO 13485',
    progress: 100,
    color: colors.success
  },
  {
    icon: <CloudOutlined />,
    title: 'Облачное хранение',
    desc: 'Безопасное хранение данных с шифрованием AES-256',
    progress: 98,
    color: colors.primary
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'ИИ-анализ',
    desc: 'Машинное обучение для раннего выявления аномалий',
    progress: 90,
    color: colors.warning
  }
];

const features = [
  {
    icon: <HeartOutlined />,
    title: 'Точность 99.9%',
    desc: 'Клинический уровень точности измерений ЧСС плода'
  },
  {
    icon: <MobileOutlined />,
    title: 'Мобильное приложение',
    desc: 'Интуитивный интерфейс для iOS и Android'
  }
];

export default function Technologies() {
  return (
    <section style={{ 
      background: colors.background.primary
    }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
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
            }}>Передовые технологии</div>
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: colors.text.secondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Революционная система мониторинга использует новейшие достижения медицинских технологий для обеспечения максимальной безопасности и точности
          </Paragraph>
        </div>

        {/* Основные технологии */}
        <Row gutter={[24, 24]} style={{ marginBottom: '64px' }}>
          {technologies.map((tech, index) => (
            <Col key={index} xs={24} sm={12} lg={6}>
              <Card 
                style={{ 
                  height: '100%',
                  borderRadius: '16px',
                  border: `1px solid ${colors.border.light}`,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = tech.color;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${tech.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.light;
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)';
                }}
              >
                {/* Иконка */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: `${tech.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  fontSize: '24px',
                  color: tech.color
                }}>
                  {tech.icon}
                </div>

                {/* Контент */}
                <Title level={5} style={{ 
                  marginBottom: '8px',
                  color: colors.text.primary
                }}>
                  {tech.title}
                </Title>
                
                <Paragraph style={{ 
                  color: colors.text.secondary,
                  marginBottom: '16px',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  {tech.desc}
                </Paragraph>

                {/* Прогресс бар */}
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '8px' 
                  }}>
                    <span style={{ fontSize: '12px', color: colors.text.tertiary }}>
                      Готовность
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: tech.color }}>
                      {tech.progress}%
                    </span>
                  </div>
                  <Progress 
                    percent={tech.progress} 
                    strokeColor={tech.color}
                    trailColor={colors.border.light}
                    showInfo={false}
                    strokeWidth={6}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Дополнительные возможности */}
        <Row gutter={[48, 32]} align="middle">
          <Col xs={24} lg={12}>
            <div>
              <Title level={3} style={{ 
                marginBottom: '24px',
                color: colors.text.primary
              }}>
                Почему выбирают FIMEA?
              </Title>
              
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  style={{ 
                    marginBottom: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: colors.background.secondary,
                    boxShadow: 'none'
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: colors.primary,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {feature.icon}
                    </div>
                    <div>
                      <Title level={5} style={{ 
                        margin: '0 0 8px 0',
                        color: colors.text.primary
                      }}>
                        {feature.title}
                      </Title>
                      <Paragraph style={{ 
                        margin: 0,
                        color: colors.text.secondary
                      }}>
                        {feature.desc}
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div style={{
              background: `linear-gradient(135deg, ${colors.primaryPale} 0%, ${colors.primaryLighter} 100%)`,
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Декоративный элемент */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '100px',
                height: '100px',
                background: `${colors.primary}20`,
                borderRadius: '50%',
                filter: 'blur(20px)'
              }} />

              <Title level={4} style={{ 
                color: colors.primary,
                marginBottom: '16px'
              }}>
                Сертифицировано врачами
              </Title>
              
              <Paragraph style={{ 
                color: colors.text.secondary,
                marginBottom: '24px'
              }}>
                Протестировано в ведущих медицинских центрах России и одобрено ассоциацией акушеров-гинекологов
              </Paragraph>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                marginTop: '24px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: colors.primary 
                  }}>
                    500+
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: colors.text.secondary 
                  }}>
                    Врачей используют
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: colors.success 
                  }}>
                    99.9%
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: colors.text.secondary 
                  }}>
                    Точность диагностики
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
