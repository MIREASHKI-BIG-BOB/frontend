import React, { useMemo, useRef, useState } from "react";
import CTGGrid, { TrackGridConfig } from "./CTGGrid";
import CTGTrack from "./CTGTrack";
import { PX_PER_CM } from ".";
import { CTGChannel, CTGEvent, CTGQualitySegment } from "./types";

interface CTGStripProps {
  samples: Array<{ time: number; fhr: number | null; toco: number | null; uc: number | null; quality: "good" | "poor" | "lost" }>;
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
  trackHeight?: number;
  isLive?: boolean;
}

const FHR_RANGE = { min: 50, max: 210 };
const TOCO_RANGE = { min: 0, max: 100 };
const UC_RANGE = { min: 0, max: 80 };

const CTGStrip: React.FC<CTGStripProps> = ({
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
  trackHeight,
  isLive,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverState, setHoverState] = useState<{
    time: number | null;
    value: number | null;
    channel: CTGChannel | null;
  }>({ time: null, value: null, channel: null });

  const heightPerTrack = trackHeight ?? 220;
  const totalHeight = heightPerTrack * 2;
  const duration = Math.max(1, visibleEnd - visibleStart);
  const pxPerSecond = (paperSpeed * PX_PER_CM) / 60;
  const width = Math.max(1, Math.round(duration * pxPerSecond));
  const secondsPerPixel = pxPerSecond > 0 ? 1 / pxPerSecond : duration / width;

  const visibleSamples = useMemo(() => {
    const startIdx = samples.findIndex((sample) => sample.time >= visibleStart);
    const sliceStart = startIdx >= 0 ? Math.max(0, startIdx - 1) : 0;
    const slice = samples.slice(sliceStart).filter((sample) => sample.time <= visibleEnd + 1);
    return slice;
  }, [samples, visibleStart, visibleEnd]);

  const times = visibleSamples.map((sample) => sample.time);
  const fhrValues = visibleSamples.map((sample) => sample.fhr ?? null);
  const tocoValues = visibleSamples.map((sample) => sample.toco ?? null);
  const ucValues = visibleSamples.map((sample) => sample.uc ?? null);
  const fhrSmoothed = useMemo(() => computeMovingAverage(fhrValues, 5), [fhrValues]);
  const showFhrMA = false; // по умолчанию сглаживание отключено
  const trackQuality = useMemo(
    () =>
      qualitySegments.map((segment) => ({
        start: segment.start,
        end: segment.end,
        quality: segment.quality,
      })),
    [qualitySegments]
  );

  const trackConfigs: TrackGridConfig[] = [
    {
      channel: "fhr",
      top: 0,
      height: heightPerTrack,
      minValue: FHR_RANGE.min,
      maxValue: FHR_RANGE.max,
      minorStep: 10,
      majorStep: 30,
      unit: "bpm",
      label: "FHR",
    },
    {
      channel: "toco",
      top: heightPerTrack,
      height: heightPerTrack,
      minValue: TOCO_RANGE.min,
      maxValue: TOCO_RANGE.max,
      minorStep: 10,
      majorStep: 20,
      unit: "mmHg",
      label: "UC/TOCO",
    },
  ];

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startVisibleStart: number; startVisibleEnd: number } | null>(null);

  // Автоприлипание к правому краю при live
  React.useEffect(() => {
    if (!containerRef.current) return;
    if (isLive) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [width, isLive]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: totalHeight,
        overflowX: "auto",
        overflowY: "hidden",
        userSelect: "none",
      }}
      onMouseDown={(event) => {
        setIsDragging(true);
        dragRef.current = {
          startX: event.clientX,
          startVisibleStart: visibleStart,
          startVisibleEnd: visibleEnd,
        };
        onToggleLive(false);
      }}
      onMouseMove={(event) => {
        if (isDragging && dragRef.current && width > 0) {
          const deltaPx = event.clientX - dragRef.current.startX;
          const deltaSeconds = -deltaPx * secondsPerPixel;
          onPan(deltaSeconds);
        }
      }}
      onMouseUp={() => {
        setIsDragging(false);
        dragRef.current = null;
      }}
      onMouseLeave={() => {
        setIsDragging(false);
        dragRef.current = null;
      }}
      onDoubleClick={() => onToggleLive(true)}
    >
  <div ref={containerRef} style={{ position: "relative", minWidth: "100%", width: `${width}px`, height: totalHeight, backgroundColor: "#fffaf7", border: "1px solid #d4d4d8", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)" }}>
        <CTGGrid
          width={width}
          height={totalHeight}
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          minorSeconds={10}
          majorSeconds={60}
          trackConfigs={trackConfigs}
          paperSpeed={paperSpeed}
        />

        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <CTGTrack
          width={width}
          height={heightPerTrack}
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
          onSelectEvent={onSelectEvent}
          hoverTime={hoverState.time}
          onHover={(payload) => setHoverState(payload)}

          overlays={
            showFhrMA
              ? [
                  {
                    values: fhrSmoothed,
                    color: "#7c3aed",
                    strokeWidth: 2,
                    opacity: 0.7,
                  },
                ]
              : undefined
          }
        />

        <CTGTrack
          width={width}
          height={heightPerTrack}
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          channel="toco"
          data={tocoValues}
          times={times}
          minValue={TOCO_RANGE.min}
          maxValue={TOCO_RANGE.max}
          color="#7c3aed"
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
              values: ucValues,
              color: "#be123c",
              strokeWidth: 1.6,
              opacity: 0.9,
              dasharray: "6 4",
            },
          ]}
        />
        </div>

        {width > 0 && (
          <svg
            width={width}
            height={totalHeight}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <line
              x1={width - 1}
              x2={width - 1}
              y1={0}
              y2={totalHeight}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              opacity={0.7}
            />

            {hoverState.time !== null && hoverState.time >= visibleStart && hoverState.time <= visibleEnd && (
              <line
                x1={(hoverState.time - visibleStart) / secondsPerPixel}
                x2={(hoverState.time - visibleStart) / secondsPerPixel}
                y1={0}
                y2={totalHeight}
                stroke="#2563eb"
                strokeDasharray="4 2"
                opacity={0.6}
              />
            )}
          </svg>
        )}
      </div>

      {hoverState.time !== null && hoverState.value !== null && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(255, 255, 255, 0.92)",
            border: "1px solid #cbd5f5",
            borderRadius: 4,
            padding: "6px 8px",
            fontSize: 12,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <span>
            {formatTime(hoverState.time)} · {hoverState.value?.toFixed(0)} {hoverState.channel === "fhr" ? "bpm" : "mmHg"}
          </span>
          <span style={{ opacity: 0.7 }}> {hoverState.channel?.toUpperCase()}</span>
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

  function computeMovingAverage(values: Array<number | null>, windowSize: number) {
    if (!values.length || windowSize <= 1) {
      return values;
    }
    const half = Math.floor(windowSize / 2);
    return values.map((value, idx) => {
      if (value === null) {
        return null;
      }
      let sum = 0;
      let count = 0;
      for (let offset = -half; offset <= half; offset += 1) {
        const candidate = values[idx + offset];
        if (candidate !== undefined && candidate !== null) {
          sum += candidate;
          count += 1;
        }
      }
      return count > 0 ? sum / count : value;
    });
  }

export default CTGStrip;
