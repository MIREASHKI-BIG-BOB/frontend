import { Button, Card, InputNumber, Space, Typography, message } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { startSensors, stopSensors } from '../services/sensorApi';

const { Title, Text } = Typography;

interface SensorControlProps {
  onStatusChange?: (isRunning: boolean) => void;
}

export default function SensorControl({ onStatusChange }: SensorControlProps) {
  const [sensorCount, setSensorCount] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await startSensors(sensorCount);
      if (response.message) {
        message.success(`Сенсор запущен: ${response.sensor?.uuid || 'unknown'}`);
        setIsRunning(true);
        onStatusChange?.(true);
      } else {
        message.error('Неожиданный ответ от сервера');
      }
    } catch (error) {
      message.error('Не удалось запустить сенсоры. Проверьте подключение к бэкенду.');
      console.error('❌ Failed to start sensors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const response = await stopSensors();
      if (response.message) {
        message.info('Все сенсоры остановлены');
        setIsRunning(false);
        onStatusChange?.(false);
      } else {
        message.error('Неожиданный ответ от сервера');
      }
    } catch (error) {
      message.error('Не удалось остановить сенсоры');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title="Управление сенсорами" 
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text>Количество сенсоров (макс. 3):</Text>
          <InputNumber
            min={1}
            max={3}
            value={sensorCount}
            onChange={(value) => setSensorCount(value || 1)}
            disabled={isRunning || loading}
            style={{ marginLeft: 8, width: 80 }}
          />
        </div>
        
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleStart}
            disabled={isRunning}
            loading={loading}
          >
            Запустить
          </Button>
          
          <Button
            danger
            icon={<StopOutlined />}
            onClick={handleStop}
            disabled={!isRunning}
            loading={loading}
          >
            Остановить
          </Button>
        </Space>

        <div>
          <Text type={isRunning ? 'success' : 'secondary'}>
            Статус: {isRunning ? '🟢 Работают' : '⚫ Остановлены'}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
