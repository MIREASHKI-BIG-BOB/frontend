import { Card, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { useEffect, useState } from 'react';
import { AlertSystem } from '../utils/AlertSystem';

type Point = { t: number; fhr: number; uc: number };

// Simple data generation with more realistic patterns
function initSimpleData(n = 100): Point[] {
  const now = Date.now();
  const data: Point[] = [];
  
  let baseline = 140;
  let contractionPhase = 0;
  
  for (let i = 0; i < n; i++) {
    // Baseline drift
    baseline += (Math.random() - 0.5) * 0.5;
    baseline = Math.max(120, Math.min(160, baseline));
    
    // FHR with occasional events
    let fhr = baseline + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 8;
    
    // Occasional decelerations
    if (Math.random() < 0.02) {
      fhr -= 20 + Math.random() * 15; // deceleration
    }
    
    // UC with contraction pattern
    let uc = 5 + Math.sin(i * 0.03) * 15 + (Math.random() - 0.5) * 3;
    
    // Periodic contractions
    if (Math.sin(i * 0.02) > 0.7) {
      uc += Math.sin(contractionPhase) * 40;
      contractionPhase += 0.3;
    } else {
      contractionPhase = 0;
    }
    
    data.push({
      t: now - (n - i) * 1000,
      fhr: Math.max(90, Math.min(180, fhr)),
      uc: Math.max(0, Math.min(100, uc))
    });
  }
  
  return data;
}

interface CTGChartSimpleProps {
  fpsMs?: number;
  windowLengthSec?: number;
  onRiskChange?: (risk: 'ok' | 'warn' | 'danger', score: number) => void;
  alertSystem?: AlertSystem;
}

export default function CTGChartSimple({ 
  fpsMs = 250, 
  windowLengthSec = 180, 
  onRiskChange,
  alertSystem 
}: CTGChartSimpleProps) {
  const [data, setData] = useState<Point[]>(initSimpleData(100));
  const [anomalyZones, setAnomalyZones] = useState<Array<{start: number, end: number, type: string}>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const lastTime = prev[prev.length - 1]?.t || Date.now();
        const nextTime = lastTime + 1000;
        
        // More realistic generation
        const lastFhr = prev[prev.length - 1]?.fhr || 140;
        const lastUc = prev[prev.length - 1]?.uc || 10;
        
        let fhr = lastFhr + (Math.random() - 0.5) * 6;
        let uc = lastUc + (Math.random() - 0.5) * 4;
        
        // Occasional events for testing alerts
        if (Math.random() < 0.005) {
          fhr = Math.max(90, fhr - 25); // bradycardia event
        }
        if (Math.random() < 0.003) {
          fhr = Math.min(180, fhr + 30); // tachycardia event
        }
        if (Math.random() < 0.008) {
          uc = Math.min(100, uc + 40); // strong contraction
        }
        
        fhr = Math.max(90, Math.min(180, fhr));
        uc = Math.max(0, Math.min(100, uc));
        
        const newPoint = { t: nextTime, fhr, uc };
        const newData = [...prev, newPoint];
        const maxPoints = windowLengthSec || 180;
        const finalData = newData.length > maxPoints ? newData.slice(-maxPoints) : newData;
        
        // Check for alerts if system provided
        if (alertSystem) {
          const fhrValues = finalData.map(p => p.fhr);
          const ucValues = finalData.map(p => p.uc);
          
          const newAlerts = alertSystem.checkForAlerts(fhrValues, ucValues);
          
          // Create anomaly zones for visualization
          if (newAlerts.length > 0) {
            const now = Date.now();
            const newZones = newAlerts.map(alert => ({
              start: now - 30000, // last 30 seconds
              end: now,
              type: alert.level
            }));
            setAnomalyZones(prev => [...prev, ...newZones].slice(-10)); // keep last 10 zones
          }
        }
        
        // Simple risk calculation
        if (onRiskChange) {
          const avgFhr = finalData.slice(-10).reduce((sum, p) => sum + p.fhr, 0) / 10;
          const maxUc = Math.max(...finalData.slice(-10).map(p => p.uc));
          
          let risk: 'ok' | 'warn' | 'danger' = 'ok';
          let score = 0;
          
          if (avgFhr < 110 || avgFhr > 170) score += 40;
          else if (avgFhr < 120 || avgFhr > 160) score += 20;
          
          if (maxUc > 80) score += 30;
          else if (maxUc > 60) score += 15;
          
          if (score < 25) risk = 'ok';
          else if (score < 50) risk = 'warn';
          else risk = 'danger';
          
          onRiskChange(risk, score);
        }
        
        return finalData;
      });
    }, fpsMs);

    return () => clearInterval(interval);
  }, [fpsMs, windowLengthSec, onRiskChange, alertSystem]);

  const timeFmt = (t: number) => new Date(t).toLocaleTimeString('ru-RU', { minute: '2-digit', second: '2-digit' });

  return (
    <Card title="КТГ мониторинг" aria-label="График КТГ">
      <div className="h-[300px] bg-gray-50 rounded-md">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 10, left: 10, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="t" 
              tickFormatter={timeFmt} 
              minTickGap={25} 
              fontSize={11}
              height={18}
            />
            <YAxis 
              yAxisId="left" 
              domain={[100, 180]} 
              tickCount={4} 
              fontSize={11}
              width={28}
              label={{ value: 'FHR', position: 'insideLeft', style: { fontSize: 10 } }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 100]} 
              tickCount={4} 
              fontSize={11}
              width={28}
              label={{ value: 'UC', position: 'insideRight', style: { fontSize: 10 } }} 
            />
            <Tooltip labelFormatter={(v) => timeFmt(v as number)} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
              iconSize={12}
            />
            
            {/* Anomaly zones highlighting */}
            {anomalyZones.map((zone, index) => (
              <ReferenceArea
                key={index}
                x1={zone.start}
                x2={zone.end}
                fill={zone.type === 'critical' ? '#ff4d4f' : zone.type === 'warning' ? '#faad14' : '#1890ff'}
                fillOpacity={0.2}
              />
            ))}
            
            {/* Reference lines for normal ranges */}
            <ReferenceLine yAxisId="left" y={110} stroke="#ff4d4f" strokeDasharray="2 2" strokeWidth={1} />
            <ReferenceLine yAxisId="left" y={160} stroke="#ff4d4f" strokeDasharray="2 2" strokeWidth={1} />
            <ReferenceLine yAxisId="right" y={70} stroke="#faad14" strokeDasharray="2 2" strokeWidth={1} />
            
            <Line 
              type="monotone" 
              yAxisId="left" 
              dataKey="fhr" 
              name="FHR (ЧСС плода)" 
              stroke="#6a4162" 
              dot={false} 
              strokeWidth={1.5} 
            />
            <Line 
              type="monotone" 
              yAxisId="right" 
              dataKey="uc" 
              name="UC (Схватки)" 
              stroke="#f39db6" 
              dot={false} 
              strokeWidth={1.5} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="!mt-2 text-gray-600 text-xs px-2 py-1 bg-gray-50 rounded border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span>Окно: {windowLengthSec}с • {fpsMs}мс</span>
          {anomalyZones.length > 0 && (
            <span className="text-orange-600 font-medium flex items-center gap-1">
              <ExclamationCircleOutlined className="text-orange-500" />
              {anomalyZones.length} аномалий
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}