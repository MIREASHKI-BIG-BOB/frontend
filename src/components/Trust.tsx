import { Card, Typography, Row, Col, Avatar, Rate, Button } from 'antd';
import { SafetyCertificateOutlined, TeamOutlined, HeartOutlined, StarFilled } from '@ant-design/icons';
import { colors } from '../theme';

const { Title, Paragraph } = Typography;

const trustItems = [
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Медицинская сертификация',
    desc: 'Одобрено Минздравом РФ и FDA',
    color: colors.success
  },
  {
    icon: <TeamOutlined />,
    title: 'Доверие врачей',
    desc: '500+ специалистов рекомендуют',
    color: colors.info
  },
  {
    icon: <HeartOutlined />,
    title: 'Безопасность данных',
    desc: 'Шифрование банковского уровня',
    color: colors.primary
  }
];

const testimonials = [
  {
    name: 'Др. Анна Петрова',
    role: 'Акушер-гинеколог, к.м.н.',
    avatar: 'А',
    rating: 5,
    text: 'FIMEA позволяет моим пациенткам чувствовать себя увереннее дома. Точность измерений сопоставима с больничным оборудованием.'
  },
  {
    name: 'Мария Сидорова',
    role: 'Мама двоих детей',
    avatar: 'М',
    rating: 5,
    text: 'Использовала FIMEA во время второй беременности. Огромное спокойствие от возможности контролировать состояние малыша дома.'
  },
  {
    name: 'Др. Игорь Волков',
    role: 'Заведующий отделением',
    avatar: 'И',
    rating: 5,
    text: 'Внедрили FIMEA в нашей клинике для домашнего мониторинга. Качество данных впечатляет, пациенты довольны.'
  }
];

export default function Trust() {
  return (
    <section style={{ 
      padding: '80px 0',
      background: colors.background.secondary
    }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <Title level={2} style={{ 
            fontSize: 'clamp(2rem, 3vw, 2.5rem)',
            marginBottom: '16px',
            color: colors.text.primary
          }}>
            Доверие и безопасность
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: colors.text.secondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Тысячи семей и сотни врачей доверяют FIMEA заботу о самом важном
          </Paragraph>
        </div>

        {/* Элементы доверия */}
        <Row gutter={[24, 24]} style={{ marginBottom: '80px' }}>
          {trustItems.map((item, index) => (
            <Col key={index} xs={24} md={8}>
              <Card 
                style={{ 
                  height: '100%',
                  borderRadius: '16px',
                  border: 'none',
                  background: colors.background.primary,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                bodyStyle={{ padding: '32px 24px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '28px',
                  color: 'white',
                  boxShadow: `0 8px 24px ${item.color}40`
                }}>
                  {item.icon}
                </div>
                
                <Title level={4} style={{ 
                  marginBottom: '12px',
                  color: colors.text.primary
                }}>
                  {item.title}
                </Title>
                
                <Paragraph style={{ 
                  color: colors.text.secondary,
                  marginBottom: 0,
                  fontSize: '16px'
                }}>
                  {item.desc}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Отзывы */}
        <div>
          <Title level={3} style={{ 
            textAlign: 'center',
            marginBottom: '48px',
            color: colors.text.primary
          }}>
            Что говорят наши пользователи
          </Title>
          
          <Row gutter={[24, 24]}>
            {testimonials.map((testimonial, index) => (
              <Col key={index} xs={24} lg={8}>
                <Card 
                  style={{ 
                    height: '100%',
                    borderRadius: '16px',
                    border: `1px solid ${colors.border.light}`,
                    background: colors.background.primary,
                    boxShadow: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '24px' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primary}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border.light;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Рейтинг */}
                  <div style={{ marginBottom: '16px' }}>
                    <Rate 
                      disabled 
                      value={testimonial.rating} 
                      style={{ fontSize: '16px', color: colors.warning }}
                    />
                  </div>
                  
                  {/* Текст отзыва */}
                  <Paragraph style={{ 
                    color: colors.text.secondary,
                    fontStyle: 'italic',
                    marginBottom: '24px',
                    lineHeight: 1.6
                  }}>
                    "{testimonial.text}"
                  </Paragraph>
                  
                  {/* Автор */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar 
                      size={48}
                      style={{ 
                        background: colors.primary,
                        fontSize: '20px',
                        fontWeight: 600
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <div>
                      <div style={{ 
                        fontWeight: 600, 
                        color: colors.text.primary,
                        marginBottom: '2px'
                      }}>
                        {testimonial.name}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.text.tertiary 
                      }}>
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* CTA секция */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '80px',
          padding: '48px',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          borderRadius: '24px',
          color: 'white'
        }}>
          <Title level={3} style={{ 
            color: 'white',
            marginBottom: '16px'
          }}>
            Присоединяйтесь к тысячам довольных семей
          </Title>
          
          <Paragraph style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '18px',
            marginBottom: '32px',
            maxWidth: '500px',
            margin: '0 auto 32px'
          }}>
            Начните следить за здоровьем малыша уже сегодня с помощью FIMEA
          </Paragraph>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              size="large"
              style={{
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '12px',
                background: 'white',
                color: colors.primary,
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Заказать FIMEA
            </Button>
            
            <Button 
              size="large"
              style={{
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '12px',
                background: 'transparent',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Консультация врача
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
