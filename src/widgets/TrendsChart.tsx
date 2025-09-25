import React from 'react';
import { Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colors, typography } from '../theme';

interface TrendsData {
  time: string;
  heartRate: number;
  bloodPressure: number;
  movements: number;
}

interface TrendsChartProps {
  data?: TrendsData[];
  height?: number;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data, height = 200 }) => {
  const defaultData: TrendsData[] = [
    { time: '09:00', heartRate: 70, bloodPressure: 118, movements: 8 },
    { time: '09:30', heartRate: 72, bloodPressure: 120, movements: 10 },
    { time: '10:00', heartRate: 75, bloodPressure: 122, movements: 12 },
    { time: '10:30', heartRate: 73, bloodPressure: 119, movements: 9 },
    { time: '11:00', heartRate: 71, bloodPressure: 121, movements: 11 },
    { time: '11:30', heartRate: 74, bloodPressure: 123, movements: 13 },
    { time: '12:00', heartRate: 72, bloodPressure: 120, movements: 10 },
  ];

  const chartData = data || defaultData;

  return (
    <Card 
      title="Динамика показателей" 
      className="h-full" 
      bodyStyle={{ padding: typography.spacing.xs, height: `calc(100% - ${typography.sizes.cardHeight.header})` }}
      headStyle={{ padding: typography.sizes.cardPadding, minHeight: typography.sizes.cardHeight.header }}
    >
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
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
              tick={{ fontSize: 10 }} 
              stroke="#666"
              width={25}
              tickMargin={2}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: typography.fontSize.xs,
                padding: typography.spacing.xs + ' ' + typography.spacing.sm
              }}
            />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="#e91e63"
              strokeWidth={1.5}
              name="ЧСС (уд/мин)"
              dot={{ fill: '#e91e63', strokeWidth: 1, r: 1.5 }}
              activeDot={{ r: 2.5 }}
            />
            <Line
              type="monotone"
              dataKey="bloodPressure"
              stroke="#1890ff"
              strokeWidth={1.5}
              name="АД сист. (мм рт.ст.)"
              dot={{ fill: '#1890ff', strokeWidth: 1, r: 1.5 }}
              activeDot={{ r: 2.5 }}
            />
            <Line
              type="monotone"
              dataKey="movements"
              stroke="#52c41a"
              strokeWidth={1.5}
              name="Движения плода"
              dot={{ fill: '#52c41a', strokeWidth: 1, r: 1.5 }}
              activeDot={{ r: 2.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TrendsChart;