import React from "react";
import { CTGChannel } from "./types";
import { PX_PER_CM } from "./constants";

interface TrackGridConfig {
  channel: CTGChannel;
  top: number;
  height: number;
  minValue: number;
  maxValue: number;
  minorStep: number;
  majorStep: number;
  unit: string;
  label: string;
  gridValues?: number[];
}

interface CTGGridProps {
  width: number;
  height: number;
  visibleStart: number;
  visibleEnd: number;
  minorSeconds: number;
  majorSeconds: number;
  trackConfigs: TrackGridConfig[];
  paperSpeed: 1 | 3;
}

const lineColors = {
  minor: "rgba(0, 0, 0, 0.25)", // Теплый оранжевый, как на бумаге
  major: "rgba(200, 120, 90, 0.5)",   // Более темный оранжевый для жирных линий
  horizontalMinor: "rgba(0, 0, 0, 0.2)",
  horizontalMajor: "rgba(0, 0, 0, 0.4)",
};

const CTGGrid: React.FC<CTGGridProps> = ({
  width,
  height,
  visibleStart,
  visibleEnd,
  minorSeconds,
  majorSeconds,
  trackConfigs,
  paperSpeed,
}) => {
  if (width === 0 || height === 0) {
    return null;
  }

  const duration = Math.max(1, visibleEnd - visibleStart);
  // Используем тот же расчет пикселей, что и в CTGCombinedStrip
  const pxPerMinute = paperSpeed * PX_PER_CM;
  const pxPerSec = pxPerMinute / 60;
  
  // Проверка: ширина должна соответствовать длительности
  const expectedWidth = duration * pxPerSec;
  const actualPxPerSec = width / duration;

  const verticalLines: Array<{
    x: number;
    isMajor: boolean;
    label?: string;
  }> = [];

  const firstMinor = Math.floor(visibleStart / minorSeconds) * minorSeconds;
  for (let t = firstMinor; t <= visibleEnd + minorSeconds; t += minorSeconds) {
    const x = (t - visibleStart) * actualPxPerSec;
    if (x < -1 || x > width + 1) {
      continue;
    }
    const isMajor = t % majorSeconds === 0;
    // Метки времени на каждой секунде
    const hasLabel = t % 1 === 0; // каждую секунду
    verticalLines.push({
      x,
      isMajor,
      label: hasLabel ? formatSecondLabel(t) : undefined,
    });
  }

  const horizontalLines: Array<{
    y: number;
    isMajor: boolean;
    label: string;
  }> = [];

  trackConfigs.forEach((track) => {
    const extent = track.maxValue - track.minValue;
    if (extent <= 0) {
      return;
    }
    const scale = track.height / extent;
    const values = track.gridValues && track.gridValues.length > 0
      ? [...new Set(track.gridValues)]
          .filter((value) => value >= track.minValue && value <= track.maxValue)
          .sort((a, b) => b - a)
      : [];

    if (values.length) {
      values.forEach((value) => {
        const y = track.top + track.height - (value - track.minValue) * scale;
        horizontalLines.push({
          y,
          isMajor: true,
          label: `${value}`,
        });
      });
      return;
    }

    const majorCount = Math.floor(extent / track.majorStep);
    for (let i = 0; i <= majorCount; i += 1) {
      const value = track.minValue + i * track.majorStep;
      const y = track.top + track.height - (value - track.minValue) * scale;
      horizontalLines.push({
        y,
        isMajor: true,
        label: `${value}`,
      });
    }
  });

  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <rect width={width} height={height} fill="#fdf2ee" />

      {verticalLines.map((line, idx) => (
        <React.Fragment key={`v-${idx}`}>
          <line
            x1={line.x}
            y1={0}
            x2={line.x}
            y2={height}
            stroke={line.isMajor ? lineColors.major : lineColors.minor}
            strokeWidth={line.isMajor ? 1.2 : 0.6}
          />
          {line.label && (
            <text
              x={line.x + 2}
              y={height - 4}
              fontSize={10}
              fill="#64748b"
              opacity={0.8}
              style={{ fontFamily: 'monospace' }}
            >
              {line.label}
            </text>
          )}
        </React.Fragment>
      ))}

      {horizontalLines.map((line, idx) => (
        <React.Fragment key={`h-${idx}`}>
          <line
            x1={0}
            y1={line.y}
            x2={width}
            y2={line.y}
            stroke={
              line.isMajor ? lineColors.horizontalMajor : lineColors.horizontalMinor
            }
            strokeWidth={line.isMajor ? 1 : 0.5}
          />
          {line.label && (
            <text
              x={8}
              y={line.y - 4}
              fontSize={11}
              fill="#475569"
              opacity={0.85}
            >
              {line.label}
            </text>
          )}
        </React.Fragment>
      ))}

      {/* Paper speed annotation */}
      <text
        x={width - 8}
        y={height - 6}
        textAnchor="end"
        fontSize={10}
        fill="#555"
      >
        {`${paperSpeed} cm/min`}
      </text>
    </svg>
  );
};

function formatSecondLabel(seconds: number) {
  if (seconds < 0) {
    return "";
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

export type { TrackGridConfig };
export default CTGGrid;
