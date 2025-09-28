import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Progress } from 'antd';
import { 
  ThunderboltOutlined, 
  ClockCircleOutlined, 
  WifiOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { colors, typography } from '../theme';

interface QuickStatsProps {
  sessionsToday?: number;
  deviceUptime?: number;
  dataQuality?: number;
  alertsToday?: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  sessionsToday = 3,
  deviceUptime = 847, // минуты
  dataQuality = 94,
  alertsToday = 2
}) => {
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalQuality, setSignalQuality] = useState(92);

  // Симуляция изменения параметров устройства
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(10, prev - Math.random() * 0.5));
      setSignalQuality(prev => Math.max(50, Math.min(100, prev + (Math.random() - 0.5) * 10)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return colors.status.success;
    if (batteryLevel > 20) return colors.chart.warning;
    return colors.risk.high;
  };

  const getSignalColor = () => {
    if (signalQuality > 80) return colors.status.success;
    if (signalQuality > 60) return colors.chart.warning;
    return colors.risk.high;
  };

  return (
    <Card 
      title="Статистика устройства" 
      className="h-full" 
      bodyStyle={{ padding: typography.spacing.sm }}
    >
      <Row gutter={[4, 12]}>
        {/* Батарея устройства */}
        <Col span={12}>
          <div className="text-center">
            <ThunderboltOutlined 
              style={{ 
                color: getBatteryColor(), 
                fontSize: '16px', 
                marginBottom: '4px' 
              }} 
            />
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: getBatteryColor() }}>
              {Math.round(batteryLevel)}%
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>Батарея</div>
            <Progress 
              percent={batteryLevel} 
              size="small" 
              strokeColor={getBatteryColor()}
              showInfo={false}
              style={{ marginTop: '2px' }}
            />
          </div>
        </Col>
        
        {/* Качество сигнала */}
        <Col span={12}>
          <div className="text-center">
            <WifiOutlined 
              style={{ 
                color: getSignalColor(), 
                fontSize: '16px', 
                marginBottom: '4px' 
              }} 
            />
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: getSignalColor() }}>
              {Math.round(signalQuality)}%
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>Сигнал</div>
            <Progress 
              percent={signalQuality} 
              size="small" 
              strokeColor={getSignalColor()}
              showInfo={false}
              style={{ marginTop: '2px' }}
            />
          </div>
        </Col>

        {/* Сеансы сегодня */}
        <Col span={12}>
          <Statistic
            title="Сеансов сегодня"
            value={sessionsToday}
            prefix={<ClockCircleOutlined style={{ color: colors.status.info, fontSize: typography.fontSize.sm }} />}
            valueStyle={{ fontSize: typography.fontSize.base, color: colors.status.info, fontWeight: typography.fontWeight.bold }}
            className="text-center"
          />
        </Col>

        {/* Время работы */}
        <Col span={12}>
          <div className="text-center">
            <CheckCircleOutlined 
              style={{ 
                color: colors.status.success, 
                fontSize: typography.fontSize.sm,
                marginBottom: '4px',
                display: 'block'
              }} 
            />
            <div style={{ fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.status.success }}>
              {formatUptime(deviceUptime)}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>Время работы</div>
          </div>
        </Col>

        {/* Качество данных */}
        <Col span={12}>
          <div className="text-center">
            <HeartOutlined 
              style={{ 
                color: dataQuality > 90 ? colors.status.success : colors.chart.warning, 
                fontSize: typography.fontSize.sm,
                marginBottom: '4px',
                display: 'block'
              }} 
            />
            <div style={{ 
              fontSize: typography.fontSize.base, 
              fontWeight: 'bold', 
              color: dataQuality > 90 ? colors.status.success : colors.chart.warning
            }}>
              {dataQuality}%
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>Качество данных</div>
          </div>
        </Col>

        {/* Уведомления сегодня */}
        <Col span={12}>
          <Statistic
            title="Уведомлений"
            value={alertsToday}
            prefix={<ExclamationCircleOutlined style={{ 
              color: alertsToday > 0 ? colors.chart.warning : colors.status.success, 
              fontSize: typography.fontSize.sm 
            }} />}
            valueStyle={{ 
              fontSize: typography.fontSize.base, 
              color: alertsToday > 0 ? colors.chart.warning : colors.status.success, 
              fontWeight: typography.fontWeight.bold 
            }}
            className="text-center"
          />
        </Col>
      </Row>

      {/* Общий статус */}
      <div className="mt-3 pt-2 border-t border-gray-200 text-center">
        <div style={{ fontSize: '11px', color: '#666' }}>
          Статус устройства: <span style={{ 
            color: batteryLevel > 20 && signalQuality > 60 ? colors.status.success : colors.chart.warning,
            fontWeight: 'bold'
          }}>
            {batteryLevel > 20 && signalQuality > 60 ? '✓ Активно' : '⚠ Требует внимания'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default QuickStats;