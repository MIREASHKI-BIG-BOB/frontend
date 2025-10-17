import React, { useMemo, useRef, useState } from "react";
import CTGGrid, { TrackGridConfig } from "./CTGGrid";
import CTGTrack from "./CTGTrack";
import { PX_PER_CM } from "./constants";
import { CTGChannel, CTGEvent, CTGQualitySegment } from "./types";

interface CTGCombinedStripProps {
  samples: Array<{
    time: number;
    fhr: number | null;
    toco: number | null;
    uc: number | null;
    tone: number | null;
    quality: "good" | "poor" | "lost";
  }>;
  visibleStart: number;
  visibleEnd: number;
  events: CTGEvent[];
  qualitySegments: CTGQualitySegment[];
  baseline: number | null;
  normZone: { from: number; to: number } | null;
  paperSpeed: 1 | 3;
  onSelectEvent: (event: CTGEvent) => void;
  onPan: (deltaSeconds: number) => void;
  onToggleLive: (isLive: boolean) => void;
  combinedHeight?: number; // высота объединённого блока FHR + UC
  toneHeight?: number; // высота отдельного графика Tone
}

// Диапазоны значений согласно ТЗ
const FHR_RANGE = { min: 50, max: 210 };
const UC_RANGE = { min: 0, max: 100 };
const TONE_RANGE = { min: 0, max: 40 };

const CTGCombinedStrip: React.FC<CTGCombinedStripProps> = ({
  samples,
  visibleStart,
  visibleEnd,
  events,
  qualitySegments,
  baseline,
  normZone,
  paperSpeed,
  onSelectEvent,
  onPan,
  onToggleLive,
  combinedHeight = 380,
  toneHeight = 160,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverState, setHoverState] = useState<{
    time: number | null;
    value: number | null;
    channel: CTGChannel | null;
  }>({ time: null, value: null, channel: null });

  // Разделение объединённого блока: верхняя половина FHR, нижняя UC
  const fhrHeight = Math.floor(combinedHeight * 0.5);
  const ucHeight = combinedHeight - fhrHeight;
  const totalHeight = combinedHeight + toneHeight;

  const duration = Math.max(1, visibleEnd - visibleStart);
  const pxPerSecond = (paperSpeed * PX_PER_CM) / 60;
  const width = Math.max(1, Math.round(duration * pxPerSecond));
  const secondsPerPixel = pxPerSecond > 0 ? 1 / pxPerSecond : duration / width;

  // Фильтрация видимых данных
  const visibleSamples = useMemo(() => {
    const startIdx = samples.findIndex((sample) => sample.time >= visibleStart);
    const sliceStart = startIdx >= 0 ? Math.max(0, startIdx - 1) : 0;
    const slice = samples.slice(sliceStart).filter((sample) => sample.time <= visibleEnd + 1);
    return slice;
  }, [samples, visibleStart, visibleEnd]);

  const times = visibleSamples.map((sample) => sample.time);
  const fhrValues = visibleSamples.map((sample) => sample.fhr ?? null);
  const ucValues = visibleSamples.map((sample) => sample.uc ?? null);
  const toneValues = visibleSamples.map((sample) => sample.tone ?? null);

  const trackQuality = useMemo(
    () =>
      qualitySegments.map((segment) => ({
        start: segment.start,
        end: segment.end,
        quality: segment.quality,
      })),
    [qualitySegments]
  );

  // Конфигурация для объединённого блока (FHR + UC)
  const combinedTrackConfigs: TrackGridConfig[] = [
    {
      channel: "fhr",
      top: 0,
      height: fhrHeight,
      minValue: FHR_RANGE.min,
      maxValue: FHR_RANGE.max,
      minorStep: 10,
      majorStep: 30,
      unit: "bpm",
      label: "FHR",
    },
    {
      channel: "uc",
      top: fhrHeight,
      height: ucHeight,
      minValue: UC_RANGE.min,
      maxValue: UC_RANGE.max,
      minorStep: 10,
      majorStep: 20,
      unit: "mmHg",
      label: "UC/TOCO",
    },
  ];

  // Конфигурация для отдельного графика Tone
  const toneTrackConfig: TrackGridConfig = {
    channel: "tone",
    top: 0,
    height: toneHeight,
    minValue: TONE_RANGE.min,
    maxValue: TONE_RANGE.max,
    minorStep: 5,
    majorStep: 10,
    unit: "mmHg",
    label: "Tone",
  };

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startVisibleStart: number;
    startVisibleEnd: number;
  } | null>(null);

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: event.clientX,
      startVisibleStart: visibleStart,
      startVisibleEnd: visibleEnd,
    };
    onToggleLive(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && dragRef.current && width > 0) {
      const deltaPx = event.clientX - dragRef.current.startX;
      const deltaSeconds = -deltaPx * secondsPerPixel;
      onPan(deltaSeconds);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  const handleDoubleClick = () => onToggleLive(true);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: totalHeight,
        backgroundColor: "#fffaf7",
        border: "1px solid #d4d4d8",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
        overflowX: "auto",
        overflowY: "hidden",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* ==================== ОБЪЕДИНЁННЫЙ БЛОК FHR + UC ==================== */}
      <div
        style={{
          position: "relative",
          width: `${width}px`,
          height: combinedHeight,
          flexShrink: 0,
        }}
      >
        <CTGGrid
          width={width}
          height={combinedHeight}
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          minorSeconds={10}
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
          {/* График FHR (верхняя половина) */}
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
            color="#ef4444" // красная линия
            label="FHR"
            unit="bpm"
            baseline={baseline}
            normZone={normZone ?? { from: 110, to: 160 }}
            events={events}
            qualitySegments={trackQuality}
            onSelectEvent={onSelectEvent}
            hoverTime={hoverState.time}
            onHover={(payload) => setHoverState(payload)}
          />

          {/* График UC (нижняя половина) */}
          <CTGTrack
            width={width}
            height={ucHeight}
            visibleStart={visibleStart}
            visibleEnd={visibleEnd}
            channel="uc"
            data={ucValues}
            times={times}
            minValue={UC_RANGE.min}
            maxValue={UC_RANGE.max}
            color="#7c3aed" // фиолетовая линия
            label="UC/TOCO"
            unit="mmHg"
            baseline={15} // базовый уровень 15 mmHg
            normZone={null}
            events={events}
            qualitySegments={trackQuality}
            onSelectEvent={onSelectEvent}
            hoverTime={hoverState.time}
            onHover={(payload) => setHoverState(payload)}
          />
        </div>

        {/* Вертикальные линии-индикаторы для объединённого блока */}
        {width > 0 && (
          <svg
            width={width}
            height={combinedHeight}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {/* Линия края окна */}
            <line
              x1={width - 1}
              x2={width - 1}
              y1={0}
              y2={combinedHeight}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              opacity={0.7}
            />

            {/* Линия при наведении */}
            {hoverState.time !== null &&
              hoverState.time >= visibleStart &&
              hoverState.time <= visibleEnd && (
                <line
                  x1={(hoverState.time - visibleStart) / secondsPerPixel}
                  x2={(hoverState.time - visibleStart) / secondsPerPixel}
                  y1={0}
                  y2={combinedHeight}
                  stroke="#2563eb"
                  strokeDasharray="4 2"
                  opacity={0.6}
                />
              )}
          </svg>
        )}
      </div>

      {/* ==================== ТРЕТИЙ ГРАФИК: TONE ==================== */}
      <div
        style={{
          position: "relative",
          width: `${width}px`,
          height: toneHeight,
          flexShrink: 0,
          borderTop: "2px solid #d4d4d8",
        }}
      >
        <CTGGrid
          width={width}
          height={toneHeight}
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          minorSeconds={10}
          majorSeconds={60}
          trackConfigs={[toneTrackConfig]}
          paperSpeed={paperSpeed}
        />

        <div style={{ position: "absolute", inset: 0 }}>
          <CTGTrack
            width={width}
            height={toneHeight}
            visibleStart={visibleStart}
            visibleEnd={visibleEnd}
            channel="tone"
            data={toneValues}
            times={times}
            minValue={TONE_RANGE.min}
            maxValue={TONE_RANGE.max}
            color="#60a5fa" // светло-синяя тонкая линия
            label="Tone"
            unit="mmHg"
            baseline={null}
            normZone={null}
            events={[]} // нет событий для tone
            qualitySegments={trackQuality}
            onSelectEvent={onSelectEvent}
            hoverTime={hoverState.time}
            onHover={(payload) => setHoverState(payload)}
          />
        </div>

        {/* Вертикальные линии для Tone (синхронны с верхним блоком) */}
        {width > 0 && (
          <svg
            width={width}
            height={toneHeight}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {/* Линия края окна */}
            <line
              x1={width - 1}
              x2={width - 1}
              y1={0}
              y2={toneHeight}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              opacity={0.7}
            />

            {/* Линия при наведении */}
            {hoverState.time !== null &&
              hoverState.time >= visibleStart &&
              hoverState.time <= visibleEnd && (
                <line
                  x1={(hoverState.time - visibleStart) / secondsPerPixel}
                  x2={(hoverState.time - visibleStart) / secondsPerPixel}
                  y1={0}
                  y2={toneHeight}
                  stroke="#2563eb"
                  strokeDasharray="4 2"
                  opacity={0.6}
                />
              )}
          </svg>
        )}
      </div>

      {/* Информация при наведении */}
      {hoverState.time !== null && hoverState.value !== null && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #cbd5f5",
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 13,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {formatTime(hoverState.time)} · {hoverState.value.toFixed(1)}{" "}
            {hoverState.channel === "fhr" ? "bpm" : "mmHg"}
          </span>
          <span style={{ opacity: 0.7, fontSize: 11, textTransform: "uppercase" }}>
            {hoverState.channel}
          </span>
        </div>
      )}
    </div>
  );
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export default CTGCombinedStrip;
