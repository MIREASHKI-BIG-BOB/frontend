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
    <section
      style={{
        background: colors.background.primary,
        paddingTop: '24px',
        paddingBottom: '48px'
      }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: colors.primaryLight,
              color: colors.primaryDark,
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 600,
              padding: '8px 16px',
              marginBottom: '16px'
            }}
          >
            <ExperimentOutlined style={{ marginRight: '8px' }} />
            Наша миссия
          </div>

          <Title
            level={2}
            style={{
              fontSize: 'clamp(2rem,3vw,3rem)',
              marginBottom: '12px',
              background: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.primary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Решаем важнейшую задачу перинатальной медицины
          </Title>

          <Paragraph
            style={{
              fontSize: '18px',
              color: colors.text.secondary,
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            Центр КТГ-мониторинга с предиктивным анализом для домашнего наблюдения беременности
          </Paragraph>
        </div>

        <Card
          style={{
            borderRadius: '16px',
            border: `1px solid ${colors.border.default}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: '32px'
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${colors.error}10 0%, ${colors.warning}10 100%)`,
                  borderRadius: '12px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '24px'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    background: colors.error,
                    opacity: 0.1,
                    borderRadius: '50%',
                    filter: 'blur(30px)'
                  }}
                />
                <AlertOutlined
                  style={{
                    fontSize: '56px',
                    color: colors.error,
                    marginBottom: '20px'
                  }}
                />
                <Title
                  level={3}
                  style={{
                    color: colors.error,
                    marginBottom: '12px',
                    textAlign: 'center',
                    fontSize: '22px'
                  }}
                >
                  Актуальность проблемы
                </Title>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Statistic
                    title={<Text strong style={{ color: colors.text.secondary }}>Рождений в России (2024)</Text>}
                    value="1.22"
                    suffix="млн"
                    valueStyle={{ color: colors.error, fontWeight: 700, fontSize: '28px' }}
                  />
                  <Statistic
                    title={<Text strong style={{ color: colors.text.secondary }}>Осложнения гипоксией</Text>}
                    value="до 20"
                    suffix="%"
                    valueStyle={{ color: colors.warning, fontWeight: 700, fontSize: '28px' }}
                  />
                  <Statistic
                    title={<Text strong style={{ color: colors.text.secondary }}>Кесарево из-за аномалий КТГ</Text>}
                    value="до 30"
                    suffix="%"
                    valueStyle={{ color: colors.error, fontWeight: 700, fontSize: '28px' }}
                  />
                </Space>
              </div>
            </Col>

            <Col xs={24} lg={14}>
              <Space direction="vertical" size="large">
                <div>
                  <Title level={4} style={{ color: colors.primary, marginBottom: '12px' }}>
                    <HeartOutlined style={{ marginRight: '10px' }} />
                    Контекст и актуальность задачи
                  </Title>

                  <Paragraph style={{ fontSize: '15px', color: colors.text.secondary, lineHeight: 1.7 }}>
                    Своевременное выявление рисков для здоровья матери и плода — важнейшая задача в акушерской практике.
                    В России в 2024 году родилось около <strong style={{ color: colors.primary }}>1,22 млн детей</strong>. При этом{" "}
                    <strong style={{ color: colors.error }}>до 20% беременностей осложняются гипоксией плода</strong>.
                  </Paragraph>

                  <Paragraph style={{ fontSize: '15px', color: colors.text.secondary, lineHeight: 1.7 }}>
                    Современные фетальные мониторы фиксируют ключевые физиологические сигналы: частоту сердечных сокращений
                    плода и сократительную активность матки. Даже небольшие изменения в их динамике могут указывать на
                    развивающиеся осложнения — гипоксию, нарушения ритма, слабость родовой деятельности.
                  </Paragraph>

                  <Paragraph style={{ fontSize: '15px', color: colors.text.secondary, lineHeight: 1.7 }}>
                    По клиническим данным, <strong style={{ color: colors.warning }}>до 30% случаев кесарева сечения</strong> связаны
                    с нарушениями ритма или признаками гипоксии. Несмотря на снижение младенческой смертности до{" "}
                    <strong>3,7 на 1000</strong>, значительная часть осложнений обусловлена несвоевременным выявлением патологий.
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

        <Card
          style={{
            marginBottom: '32px',
            borderRadius: '16px',
            border: `1px solid ${colors.primary}20`,
            boxShadow: `0 4px 24px ${colors.primary}10`,
            background: `linear-gradient(135deg, ${colors.primaryPale} 0%, ${colors.background.primary} 100%)`
          }}
        >
          <Title
            level={3}
            style={{
              color: colors.primary,
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            <SafetyOutlined style={{ marginRight: '10px' }} />
            Наше решение: «Цифровой ассистент врача»
          </Title>

          <Row gutter={[20, 20]}>
            {[
              {
                icon: <RiseOutlined style={{ fontSize: '28px', color: colors.success }} />,
                title: 'Потоковый анализ данных',
                description: 'Система принимает потоковые и архивированные данные в реальном времени'
              },
              {
                icon: <ThunderboltOutlined style={{ fontSize: '28px', color: colors.warning }} />,
                title: 'Автоматическое распознавание',
                description: 'ИИ выявляет паттерны: децелерации, тахикардию, брадикардию, вариабельности'
              },
              {
                icon: <CheckCircleOutlined style={{ fontSize: '28px', color: colors.info }} />,
                title: 'Клинические данные',
                description: 'Использование реальных записей КТГ с аннотациями врачей'
              },
              {
                icon: <CloudServerOutlined style={{ fontSize: '28px', color: colors.primary }} />,
                title: 'Развернуто на Orange Pi',
                description: 'Рабочая система на Orange Pi 5 Plus (16GB) с высокой производительностью'
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
                >
                  <Space direction="vertical" size="middle">
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: `${colors.primaryLight}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <Title
                        level={5}
                        style={{
                          marginBottom: '6px',
                          color: colors.text.primary
                        }}
                      >
                        {item.title}
                      </Title>
                      <Paragraph
                        style={{
                          marginBottom: 0,
                          color: colors.text.secondary,
                          fontSize: '14px',
                          lineHeight: 1.6
                        }}
                      >
                        {item.description}
                      </Paragraph>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
                </Card>
              </div>
            </section>
          );
        }