import { Card, Progress, Tag, Typography, Space, Alert } from 'antd';
import { 
  HeartOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined 
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
            <HeartOutlined style={{ color: '#6b7280' }} />
            <span style={{ color: '#831843' }}>ML Анализ</span>
          </Space>
        }
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Alert
          message="Накопление данных"
          description="Необходимо минимум 5 минут данных для первого предсказания..."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  // Цветовая схема риска
  const riskConfig = {
    low: { color: '#10b981', text: 'Низкий', icon: <CheckCircleOutlined /> },
    medium: { color: '#f59e0b', text: 'Средний', icon: <WarningOutlined /> },
    high: { color: '#f97316', text: 'Высокий', icon: <ExclamationCircleOutlined /> },
    critical: { color: '#ef4444', text: 'Критический', icon: <ExclamationCircleOutlined /> }
  };

  const risk = riskConfig[prediction.hypoxia_risk as keyof typeof riskConfig] || riskConfig.low;
  const probability = Math.round(prediction.hypoxia_probability * 100);

  return (
    <Card 
      title={
        <Space>
          <HeartOutlined style={{ color: '#ec4899' }} />
          <span style={{ color: '#831843' }}>ML Анализ гипоксии</span>
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Уровень риска */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong>Уровень риска:</Text>
            <Tag 
              color={risk.color} 
              icon={risk.icon}
              style={{ fontSize: '14px', padding: '4px 12px' }}
            >
              {risk.text}
            </Tag>
          </div>
          
          {/* Вероятность гипоксии */}
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Вероятность гипоксии: {probability}%
            </Text>
            <Progress 
              percent={probability} 
              strokeColor={risk.color}
              size="small"
              showInfo={false}
              style={{ marginTop: 4 }}
            />
          </div>
        </div>

        {/* Уверенность модели */}
        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Уверенность модели: {Math.round(prediction.confidence * 100)}%
          </Text>
          <Progress 
            percent={Math.round(prediction.confidence * 100)} 
            strokeColor="#a21caf"
            size="small"
            showInfo={false}
            style={{ marginTop: 4 }}
          />
        </div>

        {/* Алерты */}
        {prediction.alerts && prediction.alerts.length > 0 && (
          <div>
            <Text strong style={{ fontSize: '13px', color: '#831843' }}>
              Предупреждения:
            </Text>
            <div style={{ marginTop: 8 }}>
              {prediction.alerts.map((alert, index) => (
                <Alert
                  key={index}
                  message={alert}
                  type="warning"
                  showIcon
                  style={{ marginBottom: 8, fontSize: '12px' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Рекомендации */}
        {prediction.recommendations && prediction.recommendations.length > 0 && (
          <div>
            <Text strong style={{ fontSize: '13px', color: '#831843' }}>
              Рекомендации:
            </Text>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              {prediction.recommendations.map((rec, index) => (
                <li key={index} style={{ fontSize: '12px', color: '#831843', marginBottom: 4 }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Space>
    </Card>
  );
}
