import { Card, Typography, Row, Col, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  WifiOutlined,
  ThunderboltFilled,
  DashboardOutlined
} from '@ant-design/icons';
import { colors } from '../theme';
import { useState, useEffect } from 'react';

const { Title, Paragraph, Text } = Typography;

export default function DeviceShowcase() {
  const [isOnline, setIsOnline] = useState(true);
  const [wifiStrength, setWifiStrength] = useState(3);

  // Анимация переключения состояний
  useEffect(() => {
    const interval = setInterval(() => {
      setWifiStrength(prev => (prev === 3 ? 2 : prev === 2 ? 1 : 3));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const statusColor = isOnline ? colors.success : colors.error;
  const wifiColor = wifiStrength === 3 ? colors.success : wifiStrength === 2 ? colors.warning : colors.error;

  return (
    <section style={{ 
      padding: '80px 0',
      background: `linear-gradient(135deg, ${colors.primaryPale} 0%, ${colors.background.primary} 100%)`
    }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Row gutter={[48, 48]} align="middle">
          {/* Левая колонка - SVG устройство */}
          <Col xs={24} lg={12}>
            <Card 
              bordered={false}
              style={{ 
                borderRadius: '24px',
                background: colors.background.primary,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                padding: '40px'
              }}
            >
              <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 512 512"
                  style={{ filter: 'drop-shadow(0 10px 40px rgba(0, 0, 0, 0.15))' }}
                >
                  {/* КОРПУС */}
                  <circle cx="256" cy="256" r="236" fill="#FFFFFF"/>
                  <circle cx="256" cy="256" r="236" fill="none" stroke="#E5E7EB" strokeWidth="8"/>

                  {/* ГРАДИЕНТЫ */}
                  <defs>
                    <radialGradient id="showcase-shine" cx="40%" cy="40%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                    </radialGradient>
                  </defs>
                  <circle cx="256" cy="256" r="236" fill="url(#showcase-shine)"/>

                  {/* ЛОГОТИП */}
                  <g id="showcase-logo">
                    <path
                      d="M 256 180 
                         C 256 180, 236 160, 216 160
                         C 196 160, 186 170, 186 185
                         C 186 200, 196 210, 256 250
                         C 316 210, 326 200, 326 185
                         C 326 170, 316 160, 296 160
                         C 276 160, 256 180, 256 180 Z"
                      fill="#D86288"
                      style={{ 
                        filter: 'drop-shadow(0 4px 12px rgba(216, 98, 136, 0.4))',
                        transformOrigin: 'center',
                        animation: 'heartbeat-slow 2s ease-in-out infinite'
                      }}
                    />
                    
                    <text 
                      x="256" 
                      y="280" 
                      textAnchor="middle"
                      fontFamily="Inter, -apple-system, sans-serif"
                      fontSize="42" 
                      fontWeight="700" 
                      fill="#D86288" 
                      letterSpacing="4"
                    >
                      FIMEA
                    </text>
                  </g>

                  {/* ИНДИКАТОРЫ */}
                  {/* Статус */}
                  <g>
                    <circle 
                      cx="182" 
                      cy="340" 
                      r="28" 
                      fill={statusColor}
                      style={{
                        filter: `drop-shadow(0 4px 20px ${statusColor}60)`,
                        transition: 'all 0.5s ease'
                      }}
                    >
                      <animate 
                        attributeName="opacity"
                        values="0.7;1;0.7"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text 
                      x="182" 
                      y="385" 
                      textAnchor="middle" 
                      fontSize="13" 
                      fontWeight="600" 
                      fill="#64748b"
                      fontFamily="Inter, sans-serif"
                    >
                      STATUS
                    </text>
                  </g>

                  {/* Сенсор */}
                  <g>
                    <circle 
                      cx="256" 
                      cy="340" 
                      r="28" 
                      fill="none" 
                      stroke={colors.success} 
                      strokeWidth="6"
                      style={{
                        filter: `drop-shadow(0 4px 20px ${colors.success}40)`
                      }}
                    >
                      <animate 
                        attributeName="stroke-dasharray"
                        values="0 180;180 180;0 180"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx="256" cy="340" r="8" fill={colors.success}>
                      <animate 
                        attributeName="r"
                        values="8;12;8"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text 
                      x="256" 
                      y="385" 
                      textAnchor="middle" 
                      fontSize="13" 
                      fontWeight="600" 
                      fill="#64748b"
                      fontFamily="Inter, sans-serif"
                    >
                      SENSOR
                    </text>
                  </g>

                  {/* WiFi */}
                  <g transform="translate(330, 312)">
                    <g fill="none" stroke={wifiColor} strokeWidth="6" strokeLinecap="round">
                      <path 
                        d="M -36 12 a 40 40 0 0 1 72 0"
                        style={{ 
                          opacity: wifiStrength >= 3 ? 1 : 0.2,
                          transition: 'all 0.5s ease'
                        }}
                      />
                      <path 
                        d="M -26 22 a 28 28 0 0 1 52 0"
                        style={{ 
                          opacity: wifiStrength >= 2 ? 1 : 0.2,
                          transition: 'all 0.5s ease'
                        }}
                      />
                      <path 
                        d="M -16 32 a 16 16 0 0 1 32 0"
                        style={{ 
                          opacity: wifiStrength >= 1 ? 1 : 0.2,
                          transition: 'all 0.5s ease'
                        }}
                      />
                      <circle 
                        cx="0" 
                        cy="48" 
                        r="6" 
                        fill={wifiColor} 
                        stroke="none"
                      />
                    </g>
                    <text 
                      x="0" 
                      y="73" 
                      textAnchor="middle" 
                      fontSize="13" 
                      fontWeight="600" 
                      fill="#64748b"
                      fontFamily="Inter, sans-serif"
                    >
                      WiFi
                    </text>
                  </g>
                </svg>

                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes heartbeat-slow {
                    0%, 100% { transform: scale(1); }
                    15% { transform: scale(1.08); }
                    30% { transform: scale(1); }
                    45% { transform: scale(1.12); }
                    60% { transform: scale(1); }
                  }
                `}} />
              </div>
            </Card>
          </Col>

          {/* Правая колонка - Описание */}
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
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
                  <DashboardOutlined style={{ marginRight: '8px' }} />
                  Умное устройство
                </div>

                <Title level={2} style={{ 
                  fontSize: 'clamp(2rem, 3vw, 3rem)',
                  marginBottom: '16px',
                  color: colors.text.primary
                }}>
                  FIMEA MoniPuck
                </Title>
                
                <Title level={4} style={{ 
                  color: colors.primary,
                  fontWeight: 500,
                  marginBottom: '24px'
                }}>
                  Беспроводной фетальный монитор нового поколения
                </Title>
                
                <Paragraph style={{ 
                  fontSize: '16px', 
                  color: colors.text.secondary,
                  lineHeight: 1.8
                }}>
                  Компактное устройство для непрерывного мониторинга состояния плода 
                  в домашних условиях. Передает данные КТГ в режиме реального времени 
                  для мгновенного анализа и предиктивной оценки рисков.
                </Paragraph>
              </div>

              {/* Особенности */}
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {[
                  {
                    icon: <CheckCircleOutlined style={{ color: colors.success, fontSize: '20px' }} />,
                    title: 'Постоянный мониторинг',
                    description: 'Непрерывная запись ЧСС плода и маточных сокращений 24/7'
                  },
                  {
                    icon: <WifiOutlined style={{ color: colors.info, fontSize: '20px' }} />,
                    title: 'Беспроводная связь',
                    description: 'Передача данных по Wi-Fi с частотой дискретизации 250 Гц'
                  },
                  {
                    icon: <ThunderboltFilled style={{ color: colors.warning, fontSize: '20px' }} />,
                    title: 'Долгая автономность',
                    description: 'До 12 часов непрерывной работы от одного заряда'
                  },
                  {
                    icon: <DashboardOutlined style={{ color: colors.primary, fontSize: '20px' }} />,
                    title: 'Индикация состояния',
                    description: 'Визуальные индикаторы статуса, качества связи и уровня заряда'
                  }
                ].map((feature, index) => (
                  <Card 
                    key={index}
                    size="small"
                    style={{ 
                      borderRadius: '12px',
                      border: `1px solid ${colors.border.default}`,
                      background: colors.background.primary,
                      transition: 'all 0.3s ease'
                    }}
                    hoverable
                    bodyStyle={{ padding: '16px' }}
                  >
                    <Space align="start">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `${colors.primaryLight}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {feature.icon}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ 
                          display: 'block', 
                          marginBottom: '4px',
                          color: colors.text.primary,
                          fontSize: '15px'
                        }}>
                          {feature.title}
                        </Text>
                        <Text style={{ 
                          color: colors.text.secondary,
                          fontSize: '13px'
                        }}>
                          {feature.description}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Space>
          </Col>
        </Row>
      </div>
    </section>
  );
}
