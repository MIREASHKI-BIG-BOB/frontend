import { Card, Typography, Space, Row, Col, Statistic } from 'antd';
import { 
  AlertOutlined, 
  HeartOutlined, 
  RiseOutlined, 
  SafetyOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  CloudServerOutlined
} from '@ant-design/icons';
import { colors } from '../theme';

const { Title, Paragraph, Text } = Typography;

export default function ProblemSolution() {
  return (
    <section style={{ 
      padding: '80px 0',
      background: colors.background.primary
    }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Заголовок секции */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: colors.primaryLight,
            color: colors.primaryDark,
            padding: '8px 20px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '24px'
          }}>
            <ExperimentOutlined style={{ marginRight: '8px' }} />
            Наша миссия
          </div>
          
          <Title level={2} style={{ 
            fontSize: 'clamp(2rem, 3vw, 3rem)',
            marginBottom: '16px',
            background: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.primary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Решаем важнейшую задачу перинатальной медицины
          </Title>
          
          <Paragraph style={{ 
            fontSize: '18px', 
            color: colors.text.secondary,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            Центр КТГ-мониторинга с предиктивным анализом для домашнего наблюдения беременности
          </Paragraph>
        </div>

        {/* Контекст и актуальность */}
        <Card 
          style={{ 
            marginBottom: '32px',
            borderRadius: '16px',
            border: `1px solid ${colors.border.default}`,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
          }}
          bodyStyle={{ padding: '40px' }}
        >
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={10}>
              <div style={{
                background: `linear-gradient(135deg, ${colors.error}10 0%, ${colors.warning}10 100%)`,
                borderRadius: '12px',
                padding: '32px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: colors.error,
                  opacity: 0.1,
                  borderRadius: '50%',
                  filter: 'blur(30px)'
                }} />
                
                <AlertOutlined style={{ 
                  fontSize: '64px', 
                  color: colors.error,
                  marginBottom: '24px'
                }} />
                
                <Title level={3} style={{ 
                  color: colors.error, 
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  Актуальность проблемы
                </Title>
                
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Statistic
                    title={<Text strong style={{ color: colors.text.secondary }}>Рождений в России (2024)</Text>}
                    value="1.22"
                    suffix="млн"
                    valueStyle={{ color: colors.error, fontWeight: 700, fontSize: '32px' }}
                  />
                  
                  <Statistic
                    title={<Text strong style={{ color: colors.text.secondary }}>Осложнения гипоксией</Text>}
                    value="до 20"
                    suffix="%"
                    valueStyle={{ color: colors.warning, fontWeight: 700, fontSize: '32px' }}
                  />
                  
                  <Statistic
                    title={<Text strong style={{ color: colors.text.secondary }}>Кесарево из-за аномалий КТГ</Text>}
                    value="до 30"
                    suffix="%"
                    valueStyle={{ color: colors.error, fontWeight: 700, fontSize: '32px' }}
                  />
                </Space>
              </div>
            </Col>

            <Col xs={24} lg={14}>
              <Space direction="vertical" size="large">
                <div>
                  <Title level={4} style={{ color: colors.primary, marginBottom: '16px' }}>
                    <HeartOutlined style={{ marginRight: '12px' }} />
                    Контекст и актуальность задачи
                  </Title>
                  <Paragraph style={{ fontSize: '15px', color: colors.text.secondary, lineHeight: 1.8 }}>
                    Своевременное выявление рисков для здоровья матери и плода — важнейшая задача в 
                    акушерской практике. В России в 2024 году родилось около <strong style={{ color: colors.primary }}>1,22 млн детей</strong>. 
                    При этом <strong style={{ color: colors.error }}>до 20% беременностей осложняются гипоксией плода</strong>.
                  </Paragraph>
                  
                  <Paragraph style={{ fontSize: '15px', color: colors.text.secondary, lineHeight: 1.8 }}>
                    Современные фетальные мониторы фиксируют ключевые физиологические сигналы: 
                    частоту сердечных сокращений плода и сократительную активность матки. 
                    Даже небольшие изменения в их динамике могут указывать на развивающиеся 
                    осложнения — гипоксию, нарушения ритма, слабость родовой деятельности.
                  </Paragraph>

                  <Paragraph style={{ fontSize: '15px', color: colors.text.secondary, lineHeight: 1.8 }}>
                    По клиническим данным, <strong style={{ color: colors.warning }}>до 30% случаев кесарева сечения</strong> связаны 
                    именно с нарушениями сердечного ритма или признаками гипоксии. Несмотря на то что уровень 
                    младенческой смертности в России снизился до <strong>3,7 на 1000 живорожденных</strong>, 
                    значительная часть случаев гибели или тяжёлых осложнений у новорождённых всё ещё обусловлена 
                    несвоевременным выявлением патологий.
                  </Paragraph>
                </div>

                <Card 
                  size="small"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.warning}10 0%, ${colors.error}05 100%)`,
                    border: `1px solid ${colors.warning}30`,
                    borderRadius: '8px'
                  }}
                >
                  <Space>
                    <AlertOutlined style={{ color: colors.warning, fontSize: '18px' }} />
                    <Text strong style={{ color: colors.text.primary }}>
                      Высокая нагрузка на медперсонал увеличивает риск ошибок при ручной интерпретации КТГ
                    </Text>
                  </Space>
                </Card>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Описание решения */}
        <Card 
          style={{ 
            marginBottom: '32px',
            borderRadius: '16px',
            border: `1px solid ${colors.primary}20`,
            boxShadow: `0 4px 24px ${colors.primary}10`,
            background: `linear-gradient(135deg, ${colors.primaryPale} 0%, ${colors.background.primary} 100%)`
          }}
          bodyStyle={{ padding: '40px' }}
        >
          <Title level={3} style={{ 
            color: colors.primary, 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <SafetyOutlined style={{ marginRight: '12px' }} />
            Наше решение: «Цифровой ассистент врача»
          </Title>

          <Row gutter={[24, 24]}>
            {[
              {
                icon: <RiseOutlined style={{ fontSize: '32px', color: colors.success }} />,
                title: 'Потоковый анализ данных',
                description: 'Система принимает потоковые и архивированные данные с фетальных мониторов в режиме реального времени'
              },
              {
                icon: <ThunderboltOutlined style={{ fontSize: '32px', color: colors.warning }} />,
                title: 'Автоматическое распознавание',
                description: 'ИИ распознает и вычисляет паттерны: децелерации, тахикардию, брадикардию, вариабельности ритма'
              },
              {
                icon: <CheckCircleOutlined style={{ fontSize: '32px', color: colors.info }} />,
                title: 'Клинические данные',
                description: 'Использование датасета с реальными записями КТГ, аннотациями и деперсонализированными данными пациентов'
              },
              {
                icon: <CloudServerOutlined style={{ fontSize: '32px', color: colors.primary }} />,
                title: 'Развернуто на Orange Pi',
                description: 'Полностью рабочая система развернута на Orange Pi 5 Plus (16GB) с отличной производительностью'
              }
            ].map((item, index) => (
              <Col xs={24} md={12} key={index}>
                <Card 
                  size="small"
                  style={{ 
                    height: '100%',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border.default}`,
                    background: colors.background.primary,
                    transition: 'all 0.3s ease'
                  }}
                  hoverable
                  bodyStyle={{ padding: '24px' }}
                >
                  <Space direction="vertical" size="middle">
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: `${colors.primaryLight}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.icon}
                    </div>
                    
                    <div>
                      <Title level={5} style={{ marginBottom: '8px', color: colors.text.primary }}>
                        {item.title}
                      </Title>
                      <Paragraph style={{ 
                        marginBottom: 0, 
                        color: colors.text.secondary,
                        fontSize: '14px',
                        lineHeight: 1.6
                      }}>
                        {item.description}
                      </Paragraph>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Консультации с врачами */}
        <Card 
          style={{ 
            borderRadius: '16px',
            border: `1px solid ${colors.success}20`,
            boxShadow: `0 4px 24px ${colors.success}10`,
            background: `linear-gradient(135deg, ${colors.success}05 0%, ${colors.background.primary} 100%)`
          }}
          bodyStyle={{ padding: '32px', textAlign: 'center' }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.success}20 0%, ${colors.success}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HeartOutlined style={{ fontSize: '40px', color: colors.success }} />
            </div>
            
            <div>
              <Title level={4} style={{ color: colors.success, marginBottom: '12px' }}>
                Разработано совместно с медицинскими экспертами
              </Title>
              <Paragraph style={{ 
                fontSize: '16px', 
                color: colors.text.secondary,
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Система создана при активных консультациях с практикующими акушерами-гинекологами 
                и врачами перинатальных центров для обеспечения максимальной клинической точности
              </Paragraph>
            </div>
          </Space>
        </Card>
      </div>
    </section>
  );
}
