import { Card, Typography, Row, Col, Avatar, Rate, Button } from 'antd';
import { SafetyCertificateOutlined, TeamOutlined, HeartOutlined, StarFilled } from '@ant-design/icons';
import FimeaLogo from './FimeaLogo';
import { colors } from '../theme';

const { Title, Paragraph } = Typography;

const testimonials = [
  {
    name: 'Др. Евлампия Васильева',
    role: 'Акушер-гинеколог, к.м.н.',
    avatar: 'А',
    rating: 5,
    text: 'FIMEA позволяет моим пациенткам чувствовать себя увереннее дома. Точность измерений сопоставима с больничным оборудованием. И причем даже очень удобно!'
  },
  {
    name: 'Мария Землянская (мать героина)',
    role: 'Мама пяти детей',
    avatar: 'М',
    rating: 5,
    text: 'Была на приёме у врача, использовали новую технологию FIMEA, благодаря которой были вовремя обнаружены и устранены проблемы и у меня родился здоровый ребенок который теперь будет как и его отец посещать все лекции в университете и проводить вебинары. Сын, кстати, родился сразу с бакенбардами и усами, станет волшебником'
  },
  {
    name: 'Анна Йожановна',
    role: 'Заведующий отделением',
    avatar: 'И',
    rating: 5,
    text: 'Использовала FIMEA во время четвертой беременности, это оказалось надежнее, чем мой муж, Иван. Огромное спокойствие от возможности контролировать состояние малыша дома.'
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
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #D86288, #B83280)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px'
            }}>
              FIMEA
            </div>
          </div>
        </div>


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
            Начните следить за здоровьем малыша уже сегодня с помощью{' '}
            <span style={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '20px'
            }}>
              FIMEA
            </span>
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <FimeaLogo size={20} color="#D86288" />
                Заказать FIMEA
              </span>
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
