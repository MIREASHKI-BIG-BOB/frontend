import React, { useCallback, useMemo } from "react";
import CTGAnnotations from "./CTGAnnotations";
import { CTGChannel, CTGEvent } from "./types";

interface LineOverlay {
  values: Array<number | null>;
  color: string;
  strokeWidth: number;
  opacity?: number;
  dasharray?: string;
}

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
  overlays?: LineOverlay[];
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
  onSelectEvent,
  hoverTime,
  onHover,
  overlays,
}) => {
  const duration = Math.max(1, visibleEnd - visibleStart);
  const secondsPerPixel = width > 0 ? duration / width : duration;

  const valueToY = useCallback(
    (value: number) => height - ((value - minValue) / (maxValue - minValue)) * height,
    [height, minValue, maxValue]
  );

  const buildPath = useCallback(
    (series: Array<number | null>) => {
      if (!series.length || width === 0) {
        return "";
      }
      let d = "";
      let hasSegment = false;
      for (let i = 0; i < series.length; i += 1) {
        const value = series[i];
        const x = (times[i] - visibleStart) / secondsPerPixel;
        if (value === null || Number.isNaN(value)) {
          // разрыв сегмента
          hasSegment = false;
          continue;
        }
        if (x < -2) {
          continue;
        }
        const clamped = Math.max(minValue, Math.min(maxValue, value));
        const y = valueToY(clamped);
        if (!hasSegment) {
          d += ` ${d ? "" : ""}M ${x.toFixed(2)} ${y.toFixed(2)}`;
          hasSegment = true;
        } else {
          d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
      }
      return d.trim();
    },
    [width, times, visibleStart, secondsPerPixel, minValue, maxValue, valueToY]
  );

  const pathD = useMemo(() => buildPath(data), [buildPath, data]);

  const overlayPaths = useMemo(
    () =>
      (overlays ?? []).map((overlay) => ({
        path: buildPath(overlay.values),
        config: overlay,
      })),
    [overlays, buildPath]
  );

  const qualityRects = useMemo(() => {
    return qualitySegments
      .filter((segment) => segment.end >= visibleStart && segment.start <= visibleEnd)
      .map((segment, idx) => {
        const x = Math.max(0, (segment.start - visibleStart) / secondsPerPixel);
        const w =
          Math.min(width, (segment.end - visibleStart) / secondsPerPixel) - x;
        return (
            <path
            key={`quality-${idx}`}
            x={x}
            y={0}
            width={Math.max(0, w)}
              strokeLinecap="butt"
              strokeLinejoin="miter"
          />
        );
      });
  }, [qualitySegments, visibleStart, visibleEnd, secondsPerPixel, width, height]);

  const currentIndex = hoverTime
    ? times.findIndex((t) => Math.abs(t - hoverTime) <= secondsPerPixel)
    : -1;

  const currentValue = currentIndex >= 0 ? data[currentIndex] : null;

  // Получаем последнее непустое значение для отображения справа
  const lastValidValue = useMemo(() => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i] !== null && !Number.isNaN(data[i])) {
        return data[i];
      }
    }
    return null;
  }, [data]);

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
          secondsPerPixel={secondsPerPixel}
        />

        {overlayPaths.map(({ path, config }, idx) =>
          path ? (
            <path
              key={`overlay-${idx}`}
              d={path}
              fill="none"
              stroke={config.color}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={config.opacity ?? 1}
              strokeDasharray={config.dasharray}
            />
          ) : null
        )}

        {pathD && (
          <>
            {/* Белая обводка для контраста */}
            <path
              d={pathD}
              fill="none"
              stroke="#fff"
              strokeWidth={channel === "tone" ? 0.5 : 0.8}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              opacity={0.9}
            />
            {/* Основная линия - тонкая */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={channel === "tone" ? 1 : 1.5}
              strokeLinejoin="miter"
              strokeLinecap="butt"
            />
          </>
        )}

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
              r={5}
              fill="#fff"
              stroke={color}
              strokeWidth={2}
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

      {/* Большие цифры текущего значения справа сверху */}
      {lastValidValue !== null && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            fontSize: channel === "fhr" ? 56 : 42,
            fontWeight: 700,
            color: color,
            textShadow: "0 2px 4px rgba(0,0,0,0.1), 0 0 2px rgba(255,255,255,0.8)",
            fontFamily: "'Roboto Mono', monospace",
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          {Math.round(lastValidValue)}
        </div>
      )}
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

export default CTGTrack;
