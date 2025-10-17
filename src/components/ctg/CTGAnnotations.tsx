import React from "react";
import { CTGChannel, CTGEvent } from "./types";

interface CTGAnnotationsProps {
  width: number;
  height: number;
  visibleStart: number;
  visibleEnd: number;
  channel: CTGChannel;
  baseline?: number | null;
  normZone?: { from: number; to: number };
  minValue: number;
  maxValue: number;
  events: CTGEvent[];
  onSelectEvent?: (event: CTGEvent) => void;
  offsetX?: number;
  secondsPerPixel: number;
}

const CTGAnnotations: React.FC<CTGAnnotationsProps> = ({
  width,
  height,
  visibleStart,
  visibleEnd,
  channel,
  baseline,
  normZone,
  minValue,
  maxValue,
  events,
  onSelectEvent,
  offsetX = 0,
  secondsPerPixel,
}) => {
  const valueToY = (value: number) =>
    height - ((value - minValue) / (maxValue - minValue)) * height;

  return (
    <g>
      {normZone && (
        <rect
          x={0}
          y={valueToY(normZone.to)}
          width={width}
          height={valueToY(normZone.from) - valueToY(normZone.to)}
          fill="rgba(86, 186, 86, 0.15)"
        />
      )}

      {baseline !== null && baseline !== undefined && (
        <line
          x1={0}
          y1={valueToY(baseline)}
          x2={width}
          y2={valueToY(baseline)}
          stroke="#475569"
          strokeWidth={1}
          strokeDasharray="6 4"
        />
      )}

      {events
        .filter((event) => event.channel === channel)
        .map((event) => {
          const x1 = offsetX + (event.start - visibleStart) / secondsPerPixel;
          const x2 = offsetX + (event.end - visibleStart) / secondsPerPixel;
          const xPeak = offsetX + (event.peak - visibleStart) / secondsPerPixel;
          if (x2 < -10 || x1 > width + 10) {
            return null;
          }

          const color = getEventColor(event);

          return (
            <g key={event.id}>
              <rect
                x={Math.max(0, x1)}
                y={0}
                width={Math.min(width, x2) - Math.max(0, x1)}
                height={height}
                fill={color}
                opacity={0.1}
              />
              <line
                x1={xPeak}
                y1={0}
                x2={xPeak}
                y2={height}
                stroke={color}
                strokeWidth={1.2}
                strokeDasharray="4 3"
              />
              <circle
                cx={xPeak}
                cy={height / 2}
                r={6}
                fill={color}
                stroke="#fff"
                strokeWidth={2}
                onClick={() => onSelectEvent && onSelectEvent(event)}
                style={{ cursor: "pointer" }}
              />
            </g>
          );
        })}
    </g>
  );
};

function getEventColor(event: CTGEvent) {
  if (event.kind === "deceleration") {
    return event.classification === "late"
      ? "#dc2626"
      : event.classification === "variable"
      ? "#f97316"
      : "#ef4444";
  }
  if (event.kind === "acceleration") {
    return "#16a34a";
  }
  if (event.kind === "loss") {
    return "#6b7280";
  }
  if (event.kind === "mark") {
    return "#0ea5e9";
  }
  return "#f97316";
}

export default CTGAnnotations;
