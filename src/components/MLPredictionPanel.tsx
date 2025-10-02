import { Card, Progress, Tag, Typography, Space, Alert } from 'antd';
import { 
  HeartOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  BulbOutlined 
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface MLPrediction {
  hypoxia_probability: number;
  hypoxia_risk: string;
  alerts: string[];
  confidence: number;
  recommendations: string[];
}

interface MLPredictionPanelProps {
  prediction: MLPrediction | null;
  isAccumulating?: boolean;
}

export default function MLPredictionPanel({ prediction, isAccumulating = false }: MLPredictionPanelProps) {
  if (isAccumulating || !prediction) {
    return (
      <Card 
        title={
          <Space>
            <HeartOutlined style={{ color: '#ec4899' }} />
            <span style={{ color: '#831843' }}>AI Прогноз</span>
          </Space>
        }
        size="small"
        style={{ 
          marginBottom: 16,
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          border: '1px solid #f9a8d4',
          borderRadius: '8px'
        }}
      >
        <Alert
          message="Анализирую данные..."
          description="Накопление данных для точного прогноза"
          type="info"
          showIcon
          style={{ border: 'none', background: 'transparent' }}
        />
      </Card>
    );
  }

  // Цветовая схема риска
  const riskConfig = {
    low: { 
      color: '#10b981', 
      text: 'Норма', 
      icon: <CheckCircleOutlined />,
      bgColor: '#ecfdf5'
    },
    medium: { 
      color: '#f59e0b', 
      text: 'Внимание', 
      icon: <WarningOutlined />,
      bgColor: '#fffbeb'
    },
    high: { 
      color: '#f97316', 
      text: 'Риск', 
      icon: <ExclamationCircleOutlined />,
      bgColor: '#fff7ed'
    },
    critical: { 
      color: '#ef4444', 
      text: 'Критично', 
      icon: <FireOutlined />,
      bgColor: '#fef2f2'
    }
  };

  const risk = riskConfig[prediction.hypoxia_risk as keyof typeof riskConfig] || riskConfig.low;
  const probability = Math.round(prediction.hypoxia_probability * 100);

  return (
    <Card 
      title={
        <Space>
          <HeartOutlined style={{ color: '#ec4899' }} />
          <span style={{ color: '#831843' }}>AI Прогноз</span>
        </Space>
      }
      size="small"
      style={{ 
        marginBottom: 16,
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        border: '1px solid #f9a8d4',
        borderRadius: '8px'
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Статус с иконкой */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: 8
          }}>
            {risk.icon}
            <span style={{
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: risk.color
            }}>
              {risk.text}
            </span>
          </div>
          
          <div style={{ 
            fontSize: '14px', 
            color: '#831843',
            marginBottom: 8
          }}>
            Риск гипоксии: <strong>{probability}%</strong>
          </div>

          <Progress 
            percent={probability} 
            strokeColor={{
              '0%': '#ec4899',
              '100%': risk.color,
            }}
            trailColor="rgba(255,255,255,0.5)"
            size="small"
            showInfo={false}
            strokeWidth={6}
            style={{ marginBottom: 12 }}
          />
        </div>

        {/* Алерты */}
        {prediction.alerts && prediction.alerts.length > 0 && (
          <div style={{ 
            background: 'rgba(255,255,255,0.7)', 
            padding: '8px 12px', 
            borderRadius: '6px',
            fontSize: '13px',
            color: '#831843',
            border: '1px solid rgba(236, 72, 153, 0.2)'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <WarningOutlined style={{ color: '#f59e0b' }} />
              Обнаружено:
            </div>
            {prediction.alerts.slice(0, 2).map((alert, index) => (
              <div key={index} style={{ marginBottom: 2, paddingLeft: '4px' }}>
                • {alert}
              </div>
            ))}
          </div>
        )}

        {/* Рекомендации */}
        {prediction.recommendations && prediction.recommendations.length > 0 && prediction.hypoxia_risk !== 'low' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.8)', 
            padding: '8px 12px', 
            borderRadius: '6px',
            fontSize: '13px',
            color: '#831843',
            marginTop: 8,
            border: '1px solid rgba(236, 72, 153, 0.2)'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <BulbOutlined style={{ color: '#ec4899' }} />
              Действия:
            </div>
            <div style={{ paddingLeft: '4px' }}>
              {prediction.recommendations[0]}
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
}
