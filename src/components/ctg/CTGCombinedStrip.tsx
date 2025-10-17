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
  currentValues?: {
    fhr: number | null;
    toco: number | null;
    uc: number | null;
  };
}

// Диапазоны значений согласно ТЗ
const FHR_RANGE = { min: 30, max: 210 };
const UC_TONE_RANGE = { min: 0, max: 30 }; // Объединенный диапазон для UC и Tone
const SECOND_SPACING_CM: Record<1 | 3, number> = {
  1: 5,
  3: 3,
};

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
  combinedHeight = 600,
}) => {
  const [hoverState, setHoverState] = useState<{
    time: number | null;
    value: number | null;
    channel: CTGChannel | null;
  }>({ time: null, value: null, channel: null });

  // Разделение объединённого блока: верхняя половина FHR, временная полоса, нижняя UC
  const timeStripHeight = 24; // высота временной полосы между графиками
  const graphsHeight = combinedHeight - timeStripHeight;
  const fhrHeight = Math.floor(graphsHeight * 0.5);
  const ucHeight = graphsHeight - fhrHeight;
  const totalHeight = combinedHeight;

  // Фиксируем геометрию: один интервал времени = строго заданные сантиметры
  const cmPerSecond = SECOND_SPACING_CM[paperSpeed];
  const pxPerSecond = cmPerSecond * PX_PER_CM;
  
  const duration = Math.max(1, visibleEnd - visibleStart);
  // Ширина ленты = длительность × пиксели/сек (НЕ зависит от ширины контейнера!)
  const width = Math.max(1, Math.round(duration * pxPerSecond));
  const secondsPerPixel = 1 / pxPerSecond;

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
  const tocoValues = visibleSamples.map((sample) => sample.toco ?? null);

  const trackQuality = useMemo(
    () =>
      qualitySegments.map((segment) => ({
        start: segment.start,
        end: segment.end,
        quality: segment.quality,
      })),
    [qualitySegments]
  );

  // Конфигурация для объединённого блока (FHR + временная полоса + UC)
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
      gridValues: [210, 180, 150, 120, 90, 60, 30],
    },
    {
      channel: "uc",
      top: fhrHeight + timeStripHeight, // смещаем вниз на высоту временной полосы
      height: ucHeight,
      minValue: UC_TONE_RANGE.min,
      maxValue: UC_TONE_RANGE.max,
      minorStep: 5,
      majorStep: 5,
      unit: "mmHg",
      label: "UC/TOCO",
      gridValues: [30, 25, 20, 15, 10, 5, 0],
    },
  ];

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startVisibleStart: number;
    startVisibleEnd: number;
  } | null>(null);

  // Автоматическая прокрутка к правому краю (только для live режима)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    // Прокручиваем к правому краю при новых данных (имитируя движение ленты)
    if (scrollContainerRef.current && samples.length > 0) {
      const container = scrollContainerRef.current;
      // Прокрутка к правому краю
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    }
  }, [samples.length, visibleEnd]);

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
    <div style={{ position: "relative", width: "100%", height: totalHeight }}>
      {/* Фиксированная левая панель с метками */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "80px",
          background: "linear-gradient(to right, #fef9f5 85%, transparent)",
          borderRight: "1px solid rgba(220, 165, 140, 0.3)",
          zIndex: 10,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* FHR метка */}
        <div
          style={{
            height: fhrHeight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "12px 8px",
            borderBottom: "1px solid rgba(220, 165, 140, 0.3)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>
            FHR
          </div>
          {[210, 180, 150, 120, 90, 60, 30].map((val) => (
            <div
              key={val}
              style={{
                fontSize: 10,
                color: "#64748b",
                textAlign: "right",
                fontFamily: "monospace",
              }}
            >
              {val}
            </div>
          ))}
          <div style={{ fontSize: 9, color: "#94a3b8" }}>bpm</div>
        </div>

        {/* Временная полоса */}
        <div
          style={{
            height: timeStripHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 8px",
            borderBottom: "1px solid rgba(220, 165, 140, 0.3)",
          }}
        >
          <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>TIME</div>
        </div>

        {/* UC метка */}
        <div
          style={{
            height: ucHeight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "12px 8px",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: "#2563eb", marginBottom: 4 }}>
            UC
          </div>
          {[30, 25, 20, 15, 10, 5, 0].map((val) => (
            <div
              key={val}
              style={{
                fontSize: 10,
                color: "#64748b",
                textAlign: "right",
                fontFamily: "monospace",
              }}
            >
              {val}
            </div>
          ))}
          <div style={{ fontSize: 9, color: "#94a3b8" }}>mmHg</div>
        </div>
      </div>

      {/* Прокручиваемый контейнер */}
      <div
        ref={scrollContainerRef}
        style={{
          position: "relative",
          width: "100%",
          height: totalHeight,
          backgroundColor: "#fef9f5",
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

          {/* Временная полоса между графиками */}
          <div
            style={{
              width: `${width}px`,
              height: timeStripHeight,
              position: "relative",
              background: "#fef9f5",
              borderTop: "1px solid rgba(220, 165, 140, 0.3)",
              borderBottom: "1px solid rgba(220, 165, 140, 0.3)",
            }}
          >
            <svg width={width} height={timeStripHeight} style={{ position: "absolute", inset: 0 }}>
              {/* Временные метки */}
              {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => {
                const t = Math.floor(visibleStart) + i;
                const x = (t - visibleStart) / secondsPerPixel;
                if (x < 0 || x > width) return null;
                
                const minutes = Math.floor(t / 60);
                const seconds = t % 60;
                const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                return (
                  <g key={i}>
                    {/* Вертикальная метка */}
                    <line
                      x1={x}
                      x2={x}
                      y1={0}
                      y2={timeStripHeight}
                      stroke="rgba(220, 165, 140, 0.4)"
                      strokeWidth={0.5}
                    />
                    {/* Текст времени */}
                    <text
                      x={x + 2}
                      y={timeStripHeight / 2 + 4}
                      fontSize={10}
                      fill="#64748b"
                      fontFamily="monospace"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* График UC (нижняя половина) */}
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
            color="#7c3aed" // фиолетовая линия
            label="UC/TOCO"
            unit="mmHg"
            baseline={null}
            normZone={null}
            events={events}
            qualitySegments={trackQuality}
            onSelectEvent={onSelectEvent}
            hoverTime={hoverState.time}
            onHover={(payload) => setHoverState(payload)}
            overlays={[
              {
                values: tocoValues,
                color: "#f97316",
                strokeWidth: 1.5,
              },
            ]}
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
    </div>
  );
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export default CTGCombinedStrip;
