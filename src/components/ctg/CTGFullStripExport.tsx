import React, { forwardRef } from "react";
import CTGGrid, { TrackGridConfig } from "./CTGGrid";
import CTGTrack from "./CTGTrack";
import { PX_PER_CM } from "./constants";
import { CTGEvent, CTGQualitySegment } from "./types";

interface CTGFullStripExportProps {
  samples: Array<{
    time: number;
    fhr: number | null;
    toco: number | null;
    uc: number | null;
    quality: "good" | "poor" | "lost";
  }>;
  events: CTGEvent[];
  qualitySegments: CTGQualitySegment[];
  baseline: number | null;
  normZone: { from: number; to: number } | null;
  paperSpeed: 1 | 3;
  combinedHeight?: number;
}

// Диапазоны значений
const FHR_RANGE = { min: 60, max: 210 };
const UC_TONE_RANGE = { min: 5, max: 30 };
const SECOND_SPACING_CM: Record<1 | 3, number> = {
  1: 5,
  3: 3,
};

/**
 * Компонент для экспорта полной CTG ленты в PDF/печать.
 * Отображает всю ленту целиком без UI элементов управления.
 */
const CTGFullStripExport = forwardRef<HTMLDivElement, CTGFullStripExportProps>(
  (
    {
      samples,
      events,
      qualitySegments,
      baseline,
      normZone,
      paperSpeed,
      combinedHeight = 600,
    },
    ref
  ) => {
    if (samples.length === 0) {
      return (
        <div
          ref={ref}
          style={{
            padding: 40,
            textAlign: "center",
            fontSize: 18,
            color: "#64748b",
          }}
        >
          Нет данных для экспорта
        </div>
      );
    }

    const timeStripHeight = 16;
    const graphsHeight = combinedHeight - timeStripHeight;
    const fhrHeight = Math.floor(graphsHeight * 0.5);
    const ucHeight = graphsHeight - fhrHeight;
    const totalHeight = combinedHeight;

    // Полная длительность записи
    const visibleStart = samples[0].time;
    const visibleEnd = samples[samples.length - 1].time;
    const duration = Math.max(1, visibleEnd - visibleStart);

    // Расчёт ширины ленты
    const cmPerSecond = SECOND_SPACING_CM[paperSpeed];
    const pxPerSecond = cmPerSecond * PX_PER_CM;
    const width = Math.max(1, Math.round(duration * pxPerSecond));
    const secondsPerPixel = 1 / pxPerSecond;

    const times = samples.map((sample) => sample.time);
    const fhrValues = samples.map((sample) => sample.fhr ?? null);
    const ucValues = samples.map((sample) => sample.uc ?? null);
    const tocoValues = samples.map((sample) => sample.toco ?? null);

    const trackQuality = qualitySegments.map((segment) => ({
      start: segment.start,
      end: segment.end,
      quality: segment.quality,
    }));

    const combinedTrackConfigs: TrackGridConfig[] = [
      {
        channel: "fhr",
        top: 0,
        height: fhrHeight,
        minValue: FHR_RANGE.min,
        maxValue: FHR_RANGE.max,
        minorStep: 30,
        majorStep: 30,
        unit: "bpm",
        label: "FHR",
        gridValues: [210, 180, 150, 120, 90, 60],
      },
      {
        channel: "uc",
        top: fhrHeight,
        height: ucHeight,
        minValue: UC_TONE_RANGE.min,
        maxValue: UC_TONE_RANGE.max,
        minorStep: 5,
        majorStep: 5,
        unit: "mmHg",
        label: "UC/TOCO",
        gridValues: [30, 25, 20, 15, 10],
      },
    ];

    return (
      <div
        ref={ref}
        style={{
          width: `${width}px`,
          height: `${totalHeight}px`,
          position: "relative",
          backgroundColor: "#fefdfbff",
        }}
      >
        {/* Объединённый блок FHR + UC */}
        <div
          style={{
            position: "relative",
            width: `${width}px`,
            height: combinedHeight,
          }}
        >
          <CTGGrid
            width={width}
            height={combinedHeight}
            visibleStart={visibleStart}
            visibleEnd={visibleEnd}
            minorSeconds={1}
            majorSeconds={60}
            trackConfigs={combinedTrackConfigs}
            paperSpeed={paperSpeed}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* График FHR */}
            <CTGTrack
              width={width}
              height={fhrHeight}
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              channel="fhr"
              data={fhrValues}
              times={times}
              minValue={FHR_RANGE.min}
              maxValue={FHR_RANGE.max}
              color="#ef4444"
              label="FHR"
              unit="bpm"
              baseline={baseline}
              normZone={normZone ?? { from: 110, to: 160 }}
              events={events}
              qualitySegments={trackQuality}
              hoverTime={null}
              onHover={() => {}}
            />

            {/* Временная полоса */}
            <div
              style={{
                width: `${width}px`,
                height: timeStripHeight,
                backgroundColor: "#ffffff",
                borderTop: "2px solid #94a3b8",
                borderBottom: "2px solid #94a3b8",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <svg width={width} height={timeStripHeight}>
                {/* Рисуем метки времени */}
                {(() => {
                  const labels: JSX.Element[] = [];
                  const startSecond = Math.floor(visibleStart);
                  const endSecond = Math.ceil(visibleEnd);

                  // Рисуем каждые 10 секунд
                  for (let sec = startSecond; sec <= endSecond; sec++) {
                    if (sec < 0) continue;
                    const x = (sec - visibleStart) / secondsPerPixel;
                    if (x < 0 || x > width) continue;

                    // Главные метки - каждую минуту
                    if (sec % 60 === 0) {
                      const minutes = Math.floor(sec / 60);
                      const seconds = sec % 60;
                      const label = `${minutes}:${String(seconds).padStart(2, "0")}`;

                      labels.push(
                        <g key={`main-${sec}`}>
                          <line
                            x1={x}
                            y1={0}
                            x2={x}
                            y2={timeStripHeight}
                            stroke="#475569"
                            strokeWidth={1.5}
                          />
                          <text
                            x={x}
                            y={timeStripHeight / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#1e293b"
                            fontSize={11}
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {label}
                          </text>
                        </g>
                      );
                    }
                    // Малые метки - каждые 10 секунд
                    else if (sec % 10 === 0) {
                      labels.push(
                        <line
                          key={`minor-${sec}`}
                          x1={x}
                          y1={timeStripHeight / 3}
                          x2={x}
                          y2={(timeStripHeight * 2) / 3}
                          stroke="#94a3b8"
                          strokeWidth={1}
                        />
                      );
                    }
                  }
                  return labels;
                })()}
              </svg>
            </div>

            {/* График UC */}
            <CTGTrack
              width={width}
              height={ucHeight}
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              channel="uc"
              data={ucValues}
              times={times}
              minValue={UC_TONE_RANGE.min}
              maxValue={UC_TONE_RANGE.max}
              color="#7c3aed"
              label="UC/TOCO"
              unit="mmHg"
              baseline={null}
              normZone={null}
              events={events}
              qualitySegments={trackQuality}
              hoverTime={null}
              onHover={() => {}}
              overlays={[
                {
                  values: tocoValues,
                  color: "#f97316",
                  strokeWidth: 1.5,
                },
              ]}
            />
          </div>
        </div>

        {/* Фиксированные цифры делений слева */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "50px",
            height: totalHeight,
            pointerEvents: "none",
            zIndex: 10,
            background:
              "linear-gradient(to right, rgba(254, 249, 245, 0.95) 70%, transparent)",
          }}
        >
          <svg width={50} height={totalHeight}>
            {/* FHR деления */}
            {[210, 180, 150, 120, 90, 60].map((val) => {
              const normalizedValue = (val - FHR_RANGE.min) / (FHR_RANGE.max - FHR_RANGE.min);
              const yPos = fhrHeight - (normalizedValue * fhrHeight);
              return (
                <text
                  key={`fhr-${val}`}
                  x={42}
                  y={yPos}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={10}
                  fill="#475569"
                  opacity={0.85}
                >
                  {val}
                </text>
              );
            })}

            {/* UC деления */}
            {[30, 25, 20, 15, 10].map((val) => {
              const normalizedValue = (val - UC_TONE_RANGE.min) / (UC_TONE_RANGE.max - UC_TONE_RANGE.min);
              const yPos = fhrHeight + timeStripHeight + ucHeight - (normalizedValue * ucHeight);
              return (
                <text
                  key={`uc-${val}`}
                  x={42}
                  y={yPos}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={10}
                  fill="#475569"
                  opacity={0.85}
                >
                  {val}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }
);

CTGFullStripExport.displayName = "CTGFullStripExport";

export default CTGFullStripExport;
