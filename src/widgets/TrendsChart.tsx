import React, { useState, useEffect } from 'react';
import { Card, Select, Space } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { colors, typography } from '../theme';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

interface DeviceTrendsData {
  time: string;
  battery: number;
  signalQuality: number;
  fetalActivity: number;
  deviceTemp: number;
}

interface TrendsChartProps {
  data?: DeviceTrendsData[];
  height?: number;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ height = 200 }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['battery', 'signalQuality', 'fetalActivity']);

  // Генерация данных трендов устройства
  const generateDeviceTrends = (range: 'today' | 'week' | 'month'): DeviceTrendsData[] => {
    const dataPoints = range === 'today' ? 24 : range === 'week' ? 7 : 30;
    const data: DeviceTrendsData[] = [];
    
    let battery = 90;
    let signal = 85;
    let activity = 6;
    let temp = 36.5;

    for (let i = 0; i < dataPoints; i++) {
      // Батарея постепенно разряжается
      battery = Math.max(15, battery - Math.random() * 2);
      
      // Качество сигнала варьируется
      signal = Math.max(40, Math.min(100, signal + (Math.random() - 0.5) * 15));
      
      // Активность плода меняется в течение дня
      const timeOfDay = range === 'today' ? i : (i * 24 / dataPoints);
      const activityMultiplier = Math.sin((timeOfDay / 24) * Math.PI * 2) * 0.5 + 1;
      activity = Math.max(2, Math.min(15, activityMultiplier * 8 + Math.random() * 4));
      
      // Температура устройства
      temp = Math.max(35, Math.min(38, 36.5 + Math.random() * 1.5));

      let timeLabel: string;
      if (range === 'today') {
        timeLabel = `${i.toString().padStart(2, '0')}:00`;
      } else if (range === 'week') {
        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        timeLabel = days[i % 7];
      } else {
        timeLabel = `${i + 1}`;
      }

      data.push({
        time: timeLabel,
        battery: Math.round(battery),
        signalQuality: Math.round(signal),
        fetalActivity: Math.round(activity * 10) / 10,
        deviceTemp: Math.round(temp * 10) / 10
      });
    }

    return data;
  };

  const [chartData, setChartData] = useState<DeviceTrendsData[]>(generateDeviceTrends('today'));

  useEffect(() => {
    setChartData(generateDeviceTrends(timeRange));
  }, [timeRange]);

  const metricConfig = {
    battery: { 
      name: 'Батарея (%)', 
      color: '#fa8c16', 
      yAxis: 'left',
      domain: [0, 100]
    },
    signalQuality: { 
      name: 'Качество сигнала (%)', 
      color: '#1890ff', 
      yAxis: 'left',
      domain: [0, 100]
    },
    fetalActivity: { 
      name: 'Активность плода (дв/ч)', 
      color: '#52c41a', 
      yAxis: 'right',
      domain: [0, 20]
    },
    deviceTemp: { 
      name: 'Температура устройства (°C)', 
      color: '#f5222d', 
      yAxis: 'right',
      domain: [35, 38]
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          padding: '8px',
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
            {timeRange === 'today' ? `Время: ${label}` : 
             timeRange === 'week' ? `День: ${label}` : 
             `День ${label}`}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '2px 0', color: entry.color }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      title={
        <Space>
          <ClockCircleOutlined style={{ color: colors.primary }} />
          <span>Анализ мониторинга</span>
        </Space>
      }
      className="h-full"
      extra={
        <Space>
          <Select
            size="small"
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 80 }}
          >
            <Option value="today">День</Option>
            <Option value="week">Неделя</Option>
            <Option value="month">Месяц</Option>
          </Select>
        </Space>
      }
      bodyStyle={{ 
        padding: typography.spacing.xs, 
        height: `calc(100% - ${typography.sizes.cardHeight.header})` 
      }}
      headStyle={{ 
        padding: typography.sizes.cardPadding, 
        minHeight: typography.sizes.cardHeight.header 
      }}
    >
      {/* Селектор метрик */}
      <div style={{ marginBottom: '8px' }}>
        <Select
          mode="multiple"
          size="small"
          placeholder="Выберите параметры"
          value={selectedMetrics}
          onChange={setSelectedMetrics}
          style={{ width: '100%' }}
          maxTagCount="responsive"
        >
          <Option value="battery">🔋 Батарея</Option>
          <Option value="signalQuality">📶 Сигнал</Option>
          <Option value="fetalActivity">💗 Активность плода</Option>
          <Option value="deviceTemp">🌡️ Температура</Option>
        </Select>
      </div>

      <div style={{ height: 'calc(100% - 40px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }} 
              stroke="#666"
              height={16}
              tickMargin={2}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 10 }} 
              stroke="#666"
              width={35}
              domain={[0, 100]}
              tickMargin={2}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10 }} 
              stroke="#666"
              width={35}
              domain={[0, 25]}
              tickMargin={2}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '10px' }}
              iconSize={8}
            />
            
            {selectedMetrics.includes('battery') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="battery"
                stroke={metricConfig.battery.color}
                strokeWidth={2}
                name={metricConfig.battery.name}
                dot={{ fill: metricConfig.battery.color, strokeWidth: 1, r: 1 }}
                activeDot={{ r: 3 }}
              />
            )}
            
            {selectedMetrics.includes('signalQuality') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="signalQuality"
                stroke={metricConfig.signalQuality.color}
                strokeWidth={2}
                name={metricConfig.signalQuality.name}
                dot={{ fill: metricConfig.signalQuality.color, strokeWidth: 1, r: 1 }}
                activeDot={{ r: 3 }}
                strokeDasharray="5 5"
              />
            )}
            
            {selectedMetrics.includes('fetalActivity') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fetalActivity"
                stroke={metricConfig.fetalActivity.color}
                strokeWidth={2}
                name={metricConfig.fetalActivity.name}
                dot={{ fill: metricConfig.fetalActivity.color, strokeWidth: 1, r: 1 }}
                activeDot={{ r: 3 }}
              />
            )}
            
            {selectedMetrics.includes('deviceTemp') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="deviceTemp"
                stroke={metricConfig.deviceTemp.color}
                strokeWidth={2}
                name={metricConfig.deviceTemp.name}
                dot={{ fill: metricConfig.deviceTemp.color, strokeWidth: 1, r: 1 }}
                activeDot={{ r: 3 }}
                strokeDasharray="2 2"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Подсказки */}
      <div style={{ 
        position: 'absolute', 
        bottom: '4px', 
        left: '8px', 
        fontSize: '9px', 
        color: '#999' 
      }}>
        💡 Выберите период и параметры для анализа
      </div>
    </Card>
  );
};

export default TrendsChart;