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
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#ec4899',
            marginBottom: '8px'
          }}>
            Накопление данных
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#831843',
            opacity: 0.7
          }}>
            Анализирую поступающие данные, подождите ≈2 минуты...
          </div>
        </div>
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
      <div style={{ textAlign: 'center' }}>
        {/* Большой процент риска */}
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: risk.color,
          lineHeight: '1',
          marginBottom: '4px'
        }}>
          {probability}%
        </div>
        
        {/* Статус */}
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: risk.color,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          {risk.icon}
          {risk.text}
        </div>
        
        {/* Описание */}
        <div style={{
          fontSize: '14px',
          color: '#831843',
          marginBottom: '16px',
          opacity: 0.8
        }}>
          Риск гипоксии
        </div>

        {/* Прогресс бар */}
        <Progress 
          percent={probability} 
          strokeColor={{
            '0%': '#10b981',
            '50%': '#f59e0b', 
            '80%': '#f97316',
            '100%': '#ef4444',
          }}
          trailColor="rgba(255,255,255,0.5)"
          size="small"
          showInfo={false}
          strokeWidth={8}
          style={{ marginBottom: 16 }}
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

      {/* Рекомендации - показываем всегда когда есть */}
      {prediction.recommendations && prediction.recommendations.length > 0 && (
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
            Рекомендации:
          </div>
          {prediction.recommendations.map((rec, index) => (
            <div key={index} style={{ paddingLeft: '4px', marginBottom: 2 }}>
              • {rec}
            </div>
          ))}
        </div>
      )}

      {/* Уверенность модели */}
      <div style={{ 
        background: 'rgba(255,255,255,0.6)', 
        padding: '6px 12px', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#831843',
        marginTop: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(236, 72, 153, 0.15)'
      }}>
        <span>Уверенность модели:</span>
        <span style={{ fontWeight: 'bold' }}>
          {Math.round(prediction.confidence * 100)}%
        </span>
      </div>
    </Card>
  );
}
