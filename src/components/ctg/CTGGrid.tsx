import React from "react";
import { CTGChannel } from "./types";

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
  minor: "rgba(148, 163, 184, 0.35)",
  major: "rgba(107, 114, 128, 0.6)",
  horizontalMinor: "rgba(148, 163, 184, 0.25)",
  horizontalMajor: "rgba(107, 114, 128, 0.45)",
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
  const pxPerSec = width / duration;

  const verticalLines: Array<{
    x: number;
    isMajor: boolean;
    label?: string;
  }> = [];

  const firstMinor = Math.floor(visibleStart / minorSeconds) * minorSeconds;
  for (let t = firstMinor; t <= visibleEnd + minorSeconds; t += minorSeconds) {
    const x = (t - visibleStart) * pxPerSec;
    if (x < -1 || x > width + 1) {
      continue;
    }
    const isMajor = t % majorSeconds === 0;
    verticalLines.push({
      x,
      isMajor,
      label: isMajor ? formatMinuteLabel(t) : undefined,
    });
  }

  const horizontalLines: Array<{
    y: number;
    isMajor: boolean;
    label: string;
  }> = [];

  trackConfigs.forEach((track) => {
    const scale = track.height / (track.maxValue - track.minValue);
    const minorCount = Math.floor(
      (track.maxValue - track.minValue) / track.minorStep
    );

    for (let i = 0; i <= minorCount; i += 1) {
      const value = track.minValue + i * track.minorStep;
      const y = track.top + track.height - (value - track.minValue) * scale;
      const isMajor = value % track.majorStep === 0;
      horizontalLines.push({
        y,
        isMajor,
        label: isMajor ? `${value}` : "",
      });
    }
  });

  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <rect width={width} height={height} fill="#fffaf7" />

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
              x={line.x + 3}
              y={height - 6}
              fontSize={11}
              fill="#475569"
              opacity={0.9}
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
              fontSize={9}
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

function formatMinuteLabel(seconds: number) {
  if (seconds < 0) {
    return "";
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export type { TrackGridConfig };
export default CTGGrid;
