import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Badge, Space, Typography } from 'antd';
import { 
  ThunderboltOutlined, 
  WifiOutlined, 
  ThunderboltFilled,
  DashboardOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface DeviceData {
  status: 'online' | 'warning' | 'offline';
  wifi: { strength: number; status: 'ok' | 'weak' | 'lost' };
  battery: number;
  signalQuality: number;
  temperature: number;
  lastDataTime: number;
}

export default function DeviceSchematic() {
  const [deviceData, setDeviceData] = useState<DeviceData>({
    status: 'online',
    wifi: { strength: 92, status: 'ok' },
    battery: 87,
    signalQuality: 95,
    temperature: 36.8,
    lastDataTime: 2,
  });

  // Симуляция обновления данных в реальном времени
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceData((prev) => {
        // Случайные флуктуации для демонстрации
        const newBattery = Math.max(0, Math.min(100, prev.battery + (Math.random() - 0.5) * 2));
        const newWifiStrength = Math.max(0, Math.min(100, prev.wifi.strength + (Math.random() - 0.5) * 5));
        const newSignal = Math.max(0, Math.min(100, prev.signalQuality + (Math.random() - 0.5) * 3));
        const newTemp = Math.max(35, Math.min(40, prev.temperature + (Math.random() - 0.5) * 0.2));
        
        // Определяем статусы
        const wifiStatus = newWifiStrength > 70 ? 'ok' : newWifiStrength > 30 ? 'weak' : 'lost';
        const status = 
          newBattery < 20 || wifiStatus === 'lost' || newSignal < 50 
            ? 'warning' 
            : newBattery < 10 || prev.lastDataTime > 10 
            ? 'offline' 
            : 'online';

        return {
          status,
          wifi: { strength: newWifiStrength, status: wifiStatus },
          battery: newBattery,
          signalQuality: newSignal,
          temperature: newTemp,
          lastDataTime: Math.floor(Math.random() * 5) + 1,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Цветовая схема
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'ok':
        return '#10b981';
      case 'warning':
      case 'weak':
        return '#f59e0b';
      case 'offline':
      case 'lost':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const statusColor = getStatusColor(deviceData.status);
  const wifiColor = getStatusColor(deviceData.wifi.status);
  const batteryColor = deviceData.battery > 30 ? '#10b981' : deviceData.battery > 15 ? '#f59e0b' : '#ef4444';

  const StatusIcon = deviceData.status === 'online' ? CheckCircleOutlined : deviceData.status === 'warning' ? WarningOutlined : CloseCircleOutlined;

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Левая колонка - SVG схема устройства */}
        <Col xs={24} lg={14}>
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(236, 72, 153, 0.12)',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)'
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 512 512"
                aria-labelledby="device-title device-desc"
                role="img"
                style={{ filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1))' }}
              >
                <title id="device-title">FIMEA IoT Устройство</title>
                <desc id="device-desc">Интерактивная схема устройства FIMEA с индикаторами состояния</desc>

                {/* КОРПУС УСТРОЙСТВА */}
                <circle cx="256" cy="256" r="236" fill="#FFFFFF"/>
                <circle cx="256" cy="256" r="236" fill="none" stroke="#E5E7EB" strokeWidth="8"/>

                {/* ГРАДИЕНТНЫЙ БЛИК */}
                <defs>
                  <radialGradient id="shine" cx="40%" cy="40%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                  </radialGradient>
                  
                  {/* Пульсация для активных индикаторов */}
                  <animate 
                    id="pulse"
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </defs>
                <circle cx="256" cy="256" r="236" fill="url(#shine)"/>

                {/* ЛОГОТИП FIMEA */}
                <g id="logo-area">
                  {/* Иконка сердца */}
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
                      filter: 'drop-shadow(0 2px 8px rgba(216, 98, 136, 0.3))',
                      transformOrigin: 'center',
                      animation: 'heartbeat 1.5s ease-in-out infinite'
                    }}
                  />
                  
                  {/* Текст FIMEA */}
                  <text 
                    x="256" 
                    y="280" 
                    textAnchor="middle"
                    fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
                    fontSize="42" 
                    fontWeight="700" 
                    fill="#D86288" 
                    letterSpacing="4"
                  >
                    FIMEA
                  </text>
                </g>

                {/* ИНДИКАТОРЫ В РЯД */}
                {/* Левый индикатор (СТАТУС) */}
                <g id="status-indicator">
                  <circle 
                    cx="182" 
                    cy="340" 
                    r="28" 
                    fill={statusColor}
                    style={{
                      filter: `drop-shadow(0 4px 16px ${statusColor}80)`,
                      transition: 'all 0.5s ease'
                    }}
                  >
                    {deviceData.status === 'online' && (
                      <animate 
                        attributeName="opacity"
                        values="0.7;1;0.7"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                  <text 
                    x="182" 
                    y="385" 
                    textAnchor="middle" 
                    fontSize="14" 
                    fontWeight="600" 
                    fill="#64748b"
                  >
                    STATUS
                  </text>
                </g>

                {/* Центральный индикатор-кольцо (СЕНСОР) */}
                <g id="sensor-indicator">
                  <circle 
                    cx="256" 
                    cy="340" 
                    r="28" 
                    fill="none" 
                    stroke={getStatusColor('ok')} 
                    strokeWidth="6"
                    style={{
                      filter: `drop-shadow(0 4px 16px ${getStatusColor('ok')}60)`,
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <animate 
                      attributeName="stroke-dasharray"
                      values="0 180;180 180;0 180"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="256" cy="340" r="8" fill={getStatusColor('ok')} />
                  <text 
                    x="256" 
                    y="385" 
                    textAnchor="middle" 
                    fontSize="14" 
                    fontWeight="600" 
                    fill="#64748b"
                  >
                    SENSOR
                  </text>
                </g>

                {/* Правый индикатор (WiFi) */}
                <g id="wifi-indicator" transform="translate(330, 312)">
                  <g fill="none" stroke={wifiColor} strokeWidth="6" strokeLinecap="round">
                    {/* Внешняя дуга */}
                    <path 
                      d="M -36 12 a 40 40 0 0 1 72 0"
                      style={{ 
                        opacity: deviceData.wifi.strength > 60 ? 1 : 0.3,
                        transition: 'opacity 0.5s ease',
                        filter: deviceData.wifi.strength > 60 ? `drop-shadow(0 2px 8px ${wifiColor}60)` : 'none'
                      }}
                    />
                    {/* Средняя дуга */}
                    <path 
                      d="M -26 22 a 28 28 0 0 1 52 0"
                      style={{ 
                        opacity: deviceData.wifi.strength > 30 ? 1 : 0.3,
                        transition: 'opacity 0.5s ease',
                        filter: deviceData.wifi.strength > 30 ? `drop-shadow(0 2px 6px ${wifiColor}60)` : 'none'
                      }}
                    />
                    {/* Внутренняя дуга */}
                    <path 
                      d="M -16 32 a 16 16 0 0 1 32 0"
                      style={{ 
                        opacity: 1,
                        transition: 'opacity 0.5s ease',
                        filter: `drop-shadow(0 2px 4px ${wifiColor}60)`
                      }}
                    />
                    {/* Точка */}
                    <circle 
                      cx="0" 
                      cy="48" 
                      r="6" 
                      fill={wifiColor} 
                      stroke="none"
                      style={{
                        filter: `drop-shadow(0 2px 8px ${wifiColor}80)`
                      }}
                    >
                      <animate 
                        attributeName="opacity"
                        values="0.6;1;0.6"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                  <text 
                    x="0" 
                    y="73" 
                    textAnchor="middle" 
                    fontSize="14" 
                    fontWeight="600" 
                    fill="#64748b"
                  >
                    WiFi
                  </text>
                </g>
              </svg>

              {/* CSS для анимации сердцебиения */}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes heartbeat {
                  0%, 100% { transform: scale(1); }
                  10% { transform: scale(1.1); }
                  20% { transform: scale(1); }
                  30% { transform: scale(1.15); }
                  40% { transform: scale(1); }
                }
              `}} />
            </div>
          </Card>
        </Col>

        {/* Правая колонка - Данные и статистика */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Статус устройства */}
            <Card 
              bordered={false}
              style={{
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${statusColor}10 0%, #ffffff 100%)`,
                border: `2px solid ${statusColor}40`
              }}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <StatusIcon style={{ fontSize: '48px', color: statusColor }} />
                <Text strong style={{ fontSize: '20px', color: statusColor }}>
                  {deviceData.status === 'online' ? 'УСТРОЙСТВО ПОДКЛЮЧЕНО' : 
                   deviceData.status === 'warning' ? 'ПРЕДУПРЕЖДЕНИЕ' : 
                   'НЕТ СВЯЗИ'}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Последние данные: {deviceData.lastDataTime} сек назад
                </Text>
              </Space>
            </Card>

            {/* Метрики устройства */}
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card 
                  bordered={false} 
                  style={{ 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
                    border: '1px solid #f3e8ff'
                  }}
                >
                  <Statistic
                    title={<Space><WifiOutlined style={{ color: wifiColor }} />WiFi Сигнал</Space>}
                    value={deviceData.wifi.strength}
                    suffix="%"
                    valueStyle={{ color: wifiColor, fontSize: '24px', fontWeight: 700 }}
                  />
                  <Badge 
                    status={deviceData.wifi.status === 'ok' ? 'success' : deviceData.wifi.status === 'weak' ? 'warning' : 'error'} 
                    text={deviceData.wifi.status === 'ok' ? 'Отлично' : deviceData.wifi.status === 'weak' ? 'Слабый' : 'Потерян'}
                    style={{ fontSize: '11px' }}
                  />
                </Card>
              </Col>

              <Col span={12}>
                <Card 
                  bordered={false} 
                  style={{ 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
                    border: '1px solid #f3e8ff'
                  }}
                >
                  <Statistic
                    title={<Space><ThunderboltFilled style={{ color: batteryColor }} />Батарея</Space>}
                    value={deviceData.battery}
                    suffix="%"
                    precision={0}
                    valueStyle={{ color: batteryColor, fontSize: '24px', fontWeight: 700 }}
                  />
                  <Badge 
                    status={deviceData.battery > 30 ? 'success' : deviceData.battery > 15 ? 'warning' : 'error'} 
                    text={deviceData.battery > 30 ? 'Хороший' : deviceData.battery > 15 ? 'Низкий' : 'Критический'}
                    style={{ fontSize: '11px' }}
                  />
                </Card>
              </Col>

              <Col span={12}>
                <Card 
                  bordered={false} 
                  style={{ 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
                    border: '1px solid #f3e8ff'
                  }}
                >
                  <Statistic
                    title={<Space><DashboardOutlined style={{ color: '#8b5cf6' }} />Качество данных</Space>}
                    value={deviceData.signalQuality}
                    suffix="%"
                    precision={0}
                    valueStyle={{ color: '#8b5cf6', fontSize: '24px', fontWeight: 700 }}
                  />
                  <Badge 
                    status="success" 
                    text="Отличное"
                    style={{ fontSize: '11px' }}
                  />
                </Card>
              </Col>

              <Col span={12}>
                <Card 
                  bordered={false} 
                  style={{ 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
                    border: '1px solid #f3e8ff'
                  }}
                >
                  <Statistic
                    title={<Space><FireOutlined style={{ color: '#ec4899' }} />Температура</Space>}
                    value={deviceData.temperature}
                    suffix="°C"
                    precision={1}
                    valueStyle={{ color: '#ec4899', fontSize: '24px', fontWeight: 700 }}
                  />
                  <Badge 
                    status="success" 
                    text="Норма"
                    style={{ fontSize: '11px' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Информация о сеансе */}
            <Card 
              bordered={false}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
                border: '1px solid #f3e8ff'
              }}
              title={<Text strong style={{ fontSize: '14px', color: '#831843' }}>Текущий сеанс</Text>}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <Text type="secondary">Начало:</Text>
                  <Text strong>14:23</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <Text type="secondary">Пациентка:</Text>
                  <Text strong>Иванова М.П.</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <Text type="secondary">Срок:</Text>
                  <Text strong>36н 4д</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <Text type="secondary">Версия ПО:</Text>
                  <Text strong style={{ color: '#06b6d4' }}>v2.1.3</Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
