import React, { useMemo } from "react";
import CTGAnnotations from "./CTGAnnotations";
import { CTGChannel, CTGEvent } from "./types";

interface CTGTrackProps {
  width: number;
  height: number;
  visibleStart: number;
  visibleEnd: number;
  channel: CTGChannel;
  data: Array<number | null>;
  times: number[];
  minValue: number;
  maxValue: number;
  color: string;
  label: string;
  unit: string;
  baseline?: number | null;
  normZone?: { from: number; to: number } | null;
  events: CTGEvent[];
  qualitySegments: Array<{ start: number; end: number; quality: "poor" | "lost" }>;
  onSelectEvent?: (event: CTGEvent) => void;
  hoverTime: number | null;
  onHover: (payload: { time: number | null; value: number | null; channel: CTGChannel }) => void;
  smooth?: boolean;
  strokeWidth?: number;
}

const CTGTrack: React.FC<CTGTrackProps> = ({
  width,
  height,
  visibleStart,
  visibleEnd,
  channel,
  data,
  times,
  minValue,
  maxValue,
  color,
  label,
  unit,
  baseline,
  normZone,
  events,
  qualitySegments,
    smooth = false,
  strokeWidth = 3.4,
  onSelectEvent,
  hoverTime,
  onHover,
}) => {
  const duration = Math.max(1, visibleEnd - visibleStart);
  const secondsPerPixel = width > 0 ? duration / width : 1;

  const valueToY = (value: number) =>
    height - ((value - minValue) / (maxValue - minValue)) * height;

  const points = useMemo(() => {
    if (!data.length || width === 0) {
      return [] as Array<{ x: number; y: number }>;
    }
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < data.length; i += 1) {
      const value = data[i];
      if (value === null || Number.isNaN(value)) {
        continue;
      }
      const x = (times[i] - visibleStart) / secondsPerPixel;
      if (x < -4 || x > width + 4) {
        continue;
      }
      const clamped = Math.max(minValue, Math.min(maxValue, value));
      pts.push({ x, y: valueToY(clamped) });
    }
    return pts;
  }, [data, times, visibleStart, secondsPerPixel, minValue, maxValue, width, valueToY]);

  const pathD = useMemo(
    () => (smooth ? buildSmoothPath(points) : buildLinearPath(points)),
    [points, smooth]
  );


  
  const qualityRects = useMemo(() => {
    return qualitySegments
      .filter((segment) => segment.end >= visibleStart && segment.start <= visibleEnd)
      .map((segment, idx) => {
        const x = Math.max(0, (segment.start - visibleStart) / secondsPerPixel);
        const w =
          Math.min(width, (segment.end - visibleStart) / secondsPerPixel) - x;
        return (
          <rect
            key={`quality-${idx}`}
            x={x}
            y={0}
            width={Math.max(0, w)}
            height={height}
            fill={
              segment.quality === "lost"
                ? "rgba(148, 163, 184, 0.35)"
                : "rgba(250, 204, 21, 0.18)"
            }
          />
        );
      });
  }, [qualitySegments, visibleStart, visibleEnd, secondsPerPixel, width, height]);
  
  const currentIndex = hoverTime
    ? times.findIndex((t) => Math.abs(t - hoverTime) <= secondsPerPixel)
    : -1;

  const currentValue = currentIndex >= 0 ? data[currentIndex] : null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        cursor: "crosshair",
      }}
      onMouseMove={(event) => {
        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const time = visibleStart + x * secondsPerPixel;
        const idx = findNearestIndex(times, time);
        const val = idx >= 0 ? data[idx] : null;
        onHover({ time, value: val, channel });
      }}
      onMouseLeave={() => onHover({ time: null, value: null, channel })}
    >
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {qualityRects}
        <CTGAnnotations
          width={width}
          height={height}
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          channel={channel}
          baseline={baseline}
          normZone={normZone ?? undefined}
          minValue={minValue}
          maxValue={maxValue}
          events={events}
          onSelectEvent={onSelectEvent}
        />

<path d={pathD} fill="none" stroke="#ffffff" strokeWidth={1.6} opacity={0.9}/>

        {hoverTime !== null && currentValue !== null && (
          <g>
            <line
              x1={(hoverTime - visibleStart) / secondsPerPixel}
              y1={0}
              x2={(hoverTime - visibleStart) / secondsPerPixel}
              y2={height}
              stroke="rgba(59, 130, 246, 0.5)"
              strokeDasharray="4 2"
            />
            <circle
              cx={(hoverTime - visibleStart) / secondsPerPixel}
              cy={
                height - ((currentValue - minValue) / (maxValue - minValue)) * height
              }
              r={6}
              fill="#fff"
              stroke={color}
              strokeWidth={3}
            />
          </g>
        )}
      </svg>

      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          fontSize: 12,
          fontWeight: 600,
          color: "#1f2937",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>{unit}</span>
      </div>
    </div>
  );
};

function findNearestIndex(times: number[], time: number) {
  if (!times.length) {
    return -1;
  }
  let left = 0;
  let right = times.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (times[mid] < time) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  const candidate = left;
  const prev = Math.max(0, candidate - 1);
  const diffCandidate = Math.abs(times[candidate] - time);
  const diffPrev = Math.abs(times[prev] - time);
  return diffCandidate <= diffPrev ? candidate : prev;
}
function buildLinearPath(points: Array<{x:number;y:number}>) {
  if (!points.length) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) {
    return "";
  }
  if (points.length < 3) {
    return points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const control1X = p1.x + (p2.x - p0.x) / 6;
    const control1Y = p1.y + (p2.y - p0.y) / 6;
    const control2X = p2.x - (p3.x - p1.x) / 6;
    const control2Y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${control1X.toFixed(2)} ${control1Y.toFixed(2)}, ${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}
export default CTGTrack;
