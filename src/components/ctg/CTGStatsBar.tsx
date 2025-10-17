import React from "react";
import { CTGMetrics } from "./types";

interface CTGStatsBarProps {
  metrics: CTGMetrics;
  visibleWindowSec: number;
  windowLabel: string;
  onChangeWindow: (seconds: number) => void;
  paperSpeed: 1 | 3;
  onPaperSpeedChange: (speed: 1 | 3) => void;
  onMarkFetalMovement: () => void;
}

const presets = [600, 1200, 1800];

const CTGStatsBar: React.FC<CTGStatsBarProps> = ({
  metrics,
  visibleWindowSec,
  windowLabel,
  onChangeWindow,
  paperSpeed,
  onPaperSpeedChange,
  onMarkFetalMovement,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        border: "1px solid #d4d4d8",
        borderRadius: 6,
        background: "linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
        <Metric label="Baseline" value={formatMetric(metrics.baseline, "bpm")}
          secondary={metrics.hasUnstableBaseline ? "неустойчиво" : undefined}
        />
        <Metric
          label="Variability"
          value={formatMetric(metrics.shortTermVariability, "bpm")}
          secondary={
            metrics.variabilityAmplitude !== null
              ? `Δ ${metrics.variabilityAmplitude.toFixed(0)} bpm`
              : undefined
          }
        />
        <Metric
          label="Accelerations (10 мин)"
          value={`${metrics.accelerations.count}`}
          secondary={`${metrics.accelerations.totalDuration}s`}
        />
        <Metric
          label="Decelerations (10 мин)"
          value={`${metrics.decelerations.count}`}
          secondary={`${metrics.decelerations.totalDuration}s`}
        />
        <Metric
          label="Частота схваток"
          value={
            metrics.contractionFrequency !== null
              ? `${metrics.contractionFrequency.toFixed(1)} /10 мин`
              : "–"
          }
        />
        <Metric
          label="Категория"
          value={metrics.category}
          secondary={metrics.reasons.join(" · ")}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, minWidth: 110 }}>
          {windowLabel}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {presets.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => onChangeWindow(seconds)}
              style={windowButtonStyle(seconds === visibleWindowSec)}
            >
              {seconds / 60} мин
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 3].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => onPaperSpeedChange(speed as 1 | 3)}
              style={windowButtonStyle(speed === paperSpeed)}
            >
              {speed} см/мин
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onMarkFetalMovement}
          style={{
            border: "1px solid #0ea5e9",
            background: "#e0f2fe",
            color: "#0369a1",
            padding: "6px 10px",
            borderRadius: 4,
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          MARK движение плода
        </button>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; secondary?: string }> = ({
  label,
  value,
  secondary,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#475569" }}>
      {label}
    </span>
    <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{value}</span>
    {secondary && <span style={{ fontSize: 11, color: "#6b7280" }}>{secondary}</span>}
  </div>
);

function formatMetric(value: number | null, unit: string) {
  if (value === null || Number.isNaN(value)) {
    return "–";
  }
  return `${value.toFixed(0)} ${unit}`;
}

function windowButtonStyle(active: boolean): React.CSSProperties {
  return {
    border: active ? "1px solid #2563eb" : "1px solid #d4d4d8",
    background: active ? "#dbeafe" : "#fff",
    color: active ? "#1d4ed8" : "#475569",
    padding: "6px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: active ? 700 : 500,
  };
}

export default CTGStatsBar;
