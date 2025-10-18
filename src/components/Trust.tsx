import { Card, Typography, Row, Col, Avatar, Rate, Button } from 'antd';
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
    text: 'Была на приёме у врача, использовали технологию FIMEA, благодаря которой были вовремя обнаружены и устранены проблемы и у меня родился здоровый ребенок. Сын родился сразу с бакенбардами и усами — станет волшебником.'
  },
  {
    name: 'Анна Йожановна',
    role: 'Заведующий отделением',
    avatar: 'И',
    rating: 5,
    text: 'Использовала FIMEA во время четвертой беременности — это оказалось надежнее, чем муж. Огромное спокойствие от возможности контролировать состояние малыша дома.'
  }
];

export default function Trust() {
  return (
    <section style={{ background: colors.background.secondary }}>
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
        </div>

        <Row gutter={[24, 32]}>
          {testimonials.map((t, i) => (
            <Col key={i} xs={24} md={8}>
              <Card
                style={{
                  height: '100%',
                  borderRadius: '16px',
                  border: `1px solid ${colors.border.light}`,
                  background: colors.background.primary,
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all .3s'
                }}
                bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ flexGrow: 1 }}>
                  <Rate disabled value={t.rating} style={{ fontSize: 16, color: colors.warning, marginBottom: 16 }} />
                  <Paragraph style={{ color: colors.text.secondary, fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{t.text}"
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                  <Avatar size={48} style={{ background: colors.primary, fontSize: 20, fontWeight: 600 }}>
                    {t.avatar}
                  </Avatar>
                  <div>
                    <div style={{ fontWeight: 600, color: colors.text.primary }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: colors.text.tertiary }}>{t.role}</div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div
          style={{
            textAlign: 'center',
            marginTop: '64px',
            padding: '40px',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            borderRadius: '24px',
            color: 'white'
          }}
        >
          <Title level={3} style={{ color: 'white', marginBottom: '16px', fontWeight: 700 }}>
            Присоединяйтесь к тем, кто уже наблюдает беременность дома с FIMEA
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
              maxWidth: '520px',
              margin: '0 auto 32px',
              lineHeight: 1.6
            }}
          >
            Клиническая точность, ИИ-анализ, передача врачу — без похода в клинику
          </Paragraph>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              size="large"
              style={{
                height: 48,
                padding: '0 32px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                background: 'white',
                color: colors.primary,
                border: 'none'
              }}
            >
              Заказать FIMEA
            </Button>
            <Button
              size="large"
              style={{
                height: 48,
                padding: '0 32px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                background: 'transparent',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)'
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
