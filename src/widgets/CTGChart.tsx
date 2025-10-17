import { Card, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { colors, typography } from '../theme';

type Point = { t: number; fhr: number; uc: number };

// Parameters for generation
const FHR_BASE_MIN = 120;
const FHR_BASE_MAX = 160;
const FHR_SAFE_MIN = 100;
const FHR_SAFE_MAX = 180;

const UC_MIN = 0;
const UC_MAX = 100;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Generates a realistic initial series with baseline variability and occasional events
function initSeries(n = 150): Point[] {
  const now = Date.now();
  const arr: Point[] = [];
  let baseline = 140; // will wander within 120-160 slowly
  let fhr = 140;
  let uc = 5;
  let accelTimer = 0; // samples remaining in current acceleration
  let decelTimer = 0; // samples remaining in current deceleration
  let contractionPhase = 0; // 0..1 phase of contraction curve

  for (let i = 0; i < n; i++) {
    // baseline slow drift
    baseline += (Math.random() - 0.5) * 0.2;
    baseline = clamp(baseline, FHR_BASE_MIN, FHR_BASE_MAX);

    // stochastic start of events
    if (accelTimer <= 0 && decelTimer <= 0) {
      const r = Math.random();
      if (r < 0.02) {
        // start acceleration 10–30s, +10..+25 bpm peak
        accelTimer = 10 + Math.floor(Math.random() * 20);
      } else if (r < 0.035) {
        // start deceleration 10–30s, -10..-30 bpm
        decelTimer = 10 + Math.floor(Math.random() * 20);
      }
    }

    // intrinsic variability 5–25 bpm per minute => small per second
    const variability = (Math.random() - 0.5) * 4;

    if (accelTimer > 0) {
      // bell-like acceleration using half-sine
      const total = Math.max(accelTimer, 1);
      const phase = 1 - accelTimer / total;
      const amp = 10 + Math.random() * 15;
      fhr = baseline + Math.sin(Math.PI * phase) * amp + variability;
      accelTimer--;
    } else if (decelTimer > 0) {
      const total = Math.max(decelTimer, 1);
      const phase = 1 - decelTimer / total;
      const amp = 10 + Math.random() * 20;
      fhr = baseline - Math.sin(Math.PI * phase) * amp + variability;
      decelTimer--;
    } else {
      fhr = baseline + variability;
    }
    fhr = clamp(fhr, FHR_SAFE_MIN, FHR_SAFE_MAX);

    // UC: model contractions every 2–5 minutes with bell shape over 45–90s
    if (contractionPhase <= 0) {
      // 2% chance per second to start a contraction
      if (Math.random() < 0.02) {
        // set duration and amplitude indirectly via speed and peak
        const durationSec = 45 + Math.floor(Math.random() * 45); // 45–90s
        const speed = Math.PI / durationSec; // one half-sine over duration
        // store speed in phase negative space using trick; else keep a separate var
        (contractionPhase as any) = { value: 0, speed, peak: 30 + Math.random() * 50 };
      }
    }
    if (typeof (contractionPhase as any) === 'object') {
      const st = contractionPhase as any;
      st.value += st.speed;
      if (st.value >= Math.PI) {
        contractionPhase = 0;
        uc = UC_MIN + Math.random() * 5; // back to baseline
      } else {
        const bell = Math.sin(st.value); // 0..1..0
        uc = bell * st.peak + Math.random() * 3; // add noise
      }
    } else {
      // mild baseline noise
      uc = clamp(uc + (Math.random() - 0.5) * 2, UC_MIN, 15);
    }

    arr.push({ t: now - (n - i) * 1000, fhr, uc: clamp(uc, UC_MIN, UC_MAX) });
  }
  return arr;
}

interface CTGChartProps {
  fpsMs?: number; // 250–500 ms
  windowLengthSec?: number; // 120 or 180
  onRiskChange?: (risk: 'ok' | 'warn' | 'danger', score: number) => void;
}

export default function CTGChart({ fpsMs = 250, windowLengthSec = 180, onRiskChange }: CTGChartProps) {
  const [data, setData] = useState<Point[]>(initSeries(150));

  // simple risk estimator based on recent FHR extremes and UC height
  const estimateRisk = (slice: Point[]): { risk: 'ok' | 'warn' | 'danger'; score: number } => {
    if (slice.length === 0) return { risk: 'ok', score: 0 };
    const fhrs = slice.map(p => p.fhr);
    const ucs = slice.map(p => p.uc);
    const minF = Math.min(...fhrs);
    const maxF = Math.max(...fhrs);
    const maxU = Math.max(...ucs);
    let score = 0;
    if (minF < 110) score += 30;
    if (maxF > 170) score += 25;
    if (maxU > 70) score += 20;
    if (maxU > 85) score += 10;
    const risk: 'ok' | 'warn' | 'danger' = score < 30 ? 'ok' : score < 60 ? 'warn' : 'danger';
    return { risk, score: Math.min(100, score) };
  };

  // emulate stream at configurable FPS
  useEffect(() => {
    const interval = Math.max(50, fpsMs);
    const id = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];

        // advance one second in timeline regardless of FPS to keep X scale as seconds
        const nextT = last.t + 1000;

        // update baseline slowly
        const recent = prev.slice(-60); // last minute for baseline estimation
        const mean = recent.reduce((acc, p) => acc + p.fhr, 0) / Math.max(1, recent.length);
        let baseline = clamp(mean + (Math.random() - 0.5) * 0.5, FHR_BASE_MIN, FHR_BASE_MAX);

        // decide event with small probability
        const r = Math.random();
        let fhr = baseline + (Math.random() - 0.5) * 3;
        let uc = last.uc + (Math.random() - 0.5) * 2;

        if (r < 0.08) {
          // brief accel
          fhr = clamp(baseline + 10 + Math.random() * 15, FHR_SAFE_MIN, FHR_SAFE_MAX);
        } else if (r < 0.12) {
          // brief decel
          fhr = clamp(baseline - (10 + Math.random() * 20), FHR_SAFE_MIN, FHR_SAFE_MAX);
        }

        // UC contraction phases (approximate)
        const last60 = prev.slice(-60);
        const lastUcMax = Math.max(...last60.map(p => p.uc), 0);
        if (lastUcMax < 10 && Math.random() < 0.03) {
          // start a contraction: next ~60s rising to 30–80
          uc = 20 + Math.random() * 60;
        }
        uc = clamp(uc, UC_MIN, UC_MAX);

        const next = { t: nextT, fhr, uc } as Point;
        const arr = [...prev, next];
        const maxPoints = windowLengthSec; // 1 point per second
        const out = arr.length > maxPoints ? arr.slice(arr.length - maxPoints) : arr;

        // estimate and emit risk
        if (onRiskChange) {
          const { risk, score } = estimateRisk(out.slice(-60)); // last minute
          onRiskChange(risk, score);
        }

        return out;
      });
    }, interval);
    return () => clearInterval(id);
  }, [fpsMs, windowLengthSec, onRiskChange]);

  const timeFmt = (t: number) => new Date(t).toLocaleTimeString('ru-RU', { minute: '2-digit', second: '2-digit' });

  // compute dynamic vertical markers based on current window
  const markers = useMemo(() => {
    if (data.length === 0) return [] as Array<{ t: number; minute: boolean }>;
    const start = data[0].t;
    const end = data[data.length - 1].t;
    const startSec = Math.floor(start / 1000);
    const endSec = Math.floor(end / 1000);
    const arr: Array<{ t: number; minute: boolean }> = [];
    for (let s = startSec - (startSec % 10); s <= endSec; s += 10) {
      const isMinute = s % 60 === 0;
      arr.push({ t: s * 1000, minute: isMinute });
    }
    return arr;
  }, [data]);

  return (
    <Card title="КТГ" aria-label="График КТГ">
      <div className="h-[360px] bg-chartBg rounded-md">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border.grid} />
            <XAxis dataKey="t" tickFormatter={timeFmt} minTickGap={24} />
            <YAxis yAxisId="left" domain={[100, 180]} tickCount={5} label={{ value: 'FHR', position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickCount={5} label={{ value: 'UC', position: 'insideRight' }} />
            <Tooltip labelFormatter={(v) => timeFmt(v as number)} />
            <Legend />
            {markers.map(m => (
              <ReferenceLine key={m.t} x={m.t} stroke={m.minute ? colors.primary : colors.border.divider} strokeDasharray={m.minute ? undefined : '3 3'} strokeWidth={m.minute ? 2 : 1} label={m.minute ? { value: new Date(m.t).toLocaleTimeString('ru-RU', { minute: '2-digit' }), position: 'top', fill: colors.text.secondary } : undefined} />
            ))}
            <Line type="monotone" yAxisId="left" dataKey="fhr" name="FHR" stroke={colors.chart.fhr} dot={false} strokeWidth={2} />
            <Line type="monotone" yAxisId="right" dataKey="uc" name="UC" stroke={colors.chart.uc} dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Typography.Paragraph className="!mt-2 text-secondary text-sm">Окно: {windowLengthSec}с. Обновление — каждые {fpsMs} мс.</Typography.Paragraph>
    </Card>
  );
}
