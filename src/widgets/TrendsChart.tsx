import React, { useState, useEffect } from 'react';
import { Card, Select, Space } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChartOutlined } from '@ant-design/icons';

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

  const [chartData, setChartData] = useState<DeviceTrendsData[]>([]);

  // Инициализация данных при монтировании
  useEffect(() => {
    const initialData = generateDeviceTrends('today');
    setChartData(initialData);
  }, []);

  // Обновление данных при смене периода
  useEffect(() => {
    const newData = generateDeviceTrends(timeRange);
    setChartData(newData);
  }, [timeRange]);

  const metricConfig = {
    battery: { 
      name: 'Батарея (%)', 
      color: '#ec4899', 
      yAxis: 'left',
      domain: [0, 100]
    },
    signalQuality: { 
      name: 'Качество сигнала (%)', 
      color: '#be185d', 
      yAxis: 'left',
      domain: [0, 100]
    },
    fetalActivity: { 
      name: 'Активность плода (дв/ч)', 
      color: '#a21caf', 
      yAxis: 'right',
      domain: [0, 20]
    },
    deviceTemp: { 
      name: 'Температура устройства (°C)', 
      color: '#831843', 
      yAxis: 'right',
      domain: [35, 38]
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fdf2f8',
          border: '1px solid #f3e8ff',
          borderRadius: '8px',
          padding: '8px',
          fontSize: '11px',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)',
          lineHeight: '1.3'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#831843' }}>
            {timeRange === 'today' ? `Время: ${label}` : 
             timeRange === 'week' ? `День: ${label}` : 
             `День ${label}`}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '2px 0', color: entry.color, fontSize: '10px' }}>
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
            >
              <BarChartOutlined style={{ fontSize: '12px' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#831843' }}>
              Анализ мониторинга
            </span>
          </div>
          <Select
            size="small"
            value={timeRange}
            onChange={setTimeRange}
            style={{ 
              width: 80,
              fontSize: '11px'
            }}
            dropdownStyle={{ fontSize: '11px' }}
          >
            <Option value="today">День</Option>
            <Option value="week">Неделя</Option>
            <Option value="month">Месяц</Option>
          </Select>
        </div>
      }
      className="h-full"
      size="small"
      bodyStyle={{ padding: '8px' }}
      headStyle={{ 
        padding: '6px 12px', 
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        borderBottom: '1px solid #f3e8ff'
      }}
    >
      {/* Селектор метрик в розовом стиле */}
      <div className="mb-2 p-2 rounded-lg" style={{ 
        background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
        border: '1px solid #f3e8ff'
      }}>
        <Select
          mode="multiple"
          size="small"
          placeholder="Выберите параметры"
          value={selectedMetrics}
          onChange={setSelectedMetrics}
          style={{ 
            width: '100%',
            fontSize: '11px'
          }}
          dropdownStyle={{ fontSize: '11px' }}
          maxTagCount="responsive"
        >
          <Option value="battery">Батарея</Option>
          <Option value="signalQuality">Сигнал</Option>
          <Option value="fetalActivity">Активность плода</Option>
          <Option value="deviceTemp">Температура</Option>
        </Select>
      </div>

      {/* График в розово-белом стиле */}
      <div 
        className="rounded-lg border"
        style={{ 
          height: '160px',
          background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
          borderColor: '#f3e8ff',
          padding: '6px'
        }}
      >
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 15, left: 10, bottom: 8 }}
            >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 9, fill: '#831843' }} 
              stroke="#ec4899"
              height={16}
              tickMargin={2}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 9, fill: '#831843' }} 
              stroke="#ec4899"
              width={35}
              domain={[0, 100]}
              tickMargin={2}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 9, fill: '#831843' }} 
              stroke="#ec4899"
              width={35}
              domain={[0, 25]}
              tickMargin={2}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '9px', color: '#831843' }}
              iconSize={6}
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <div style={{ fontSize: '12px', color: '#831843', opacity: 0.7 }}>
              Загрузка данных...
            </div>
          </div>
        )}
      </div>

    </Card>
  );
};

export default TrendsChart;