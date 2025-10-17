import React, { useEffect, useMemo, useRef, useState } from "react";
import CTGGrid, { TrackGridConfig } from "./CTGGrid";
import CTGTrack from "./CTGTrack";
import { CTGChannel, CTGEvent, CTGQualitySegment } from "./types";

interface CTGStripProps {
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
  trackHeight?: number;
  compact?: boolean;
  onSelectEvent: (event: CTGEvent) => void;
  onPan: (deltaSeconds: number) => void;
  onToggleLive: (isLive: boolean) => void;
}

const FHR_RANGE = { min: 50, max: 210 };
const TOCO_RANGE = { min: 0, max: 100 };
const UC_RANGE = { min: 0, max: 80 };

const DEFAULT_TRACK_HEIGHT = 220;

const CTGStrip: React.FC<CTGStripProps> = ({
  samples,
  visibleStart,
  visibleEnd,
  events,
  qualitySegments,
  baseline,
  normZone,
  paperSpeed,
  trackHeight,
  compact = false,
  onSelectEvent,
  onPan,
  onToggleLive,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hoverState, setHoverState] = useState<{
    time: number | null;
    value: number | null;
    channel: CTGChannel | null;
  }>({ time: null, value: null, channel: null });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<number | null>(null);

  const heightPerTrack = trackHeight ?? DEFAULT_TRACK_HEIGHT;
  const contentHeight = heightPerTrack * 3;
  const inset = 0;
  const verticalScale = 2;
  const outerHeight = contentHeight * verticalScale;

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) {
      return;
    }
    setWidth(element.getBoundingClientRect().width);
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [compact, trackHeight]);

  const visibleSamples = useMemo(() => {
    const startIdx = samples.findIndex((sample) => sample.time >= visibleStart);
    const sliceStart = startIdx >= 0 ? Math.max(0, startIdx - 1) : 0;
    return samples
      .slice(sliceStart)
      .filter((sample) => sample.time <= visibleEnd + 1);
  }, [samples, visibleStart, visibleEnd]);

  const times = visibleSamples.map((sample) => sample.time);
  const fhrValues = visibleSamples.map((sample) => sample.fhr ?? null);
  const tocoValues = visibleSamples.map((sample) => sample.toco ?? null);
  const ucValues = visibleSamples.map((sample) => sample.uc ?? null);

  const trackQuality = useMemo(
    () =>
      qualitySegments.map((segment) => ({
        start: segment.start,
        end: segment.end,
        quality: segment.quality,
      })),
    [qualitySegments]
  );

  const trackConfigs: TrackGridConfig[] = useMemo(
    () => [
      {
        channel: "fhr",
        top: 0,
        height: heightPerTrack,
        minValue: FHR_RANGE.min,
        maxValue: FHR_RANGE.max,
        minorStep: 10,
        majorStep: 20,
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
        label: "TOCO",
      },
      {
        channel: "uc",
        top: heightPerTrack * 2,
        height: heightPerTrack,
        minValue: UC_RANGE.min,
        maxValue: UC_RANGE.max,
        minorStep: 10,
        majorStep: 20,
        unit: "mmHg",
        label: "UC",
      },
    ],
    [heightPerTrack]
  );

  const duration = Math.max(1, visibleEnd - visibleStart);
  const secondsPerPixel = width > 0 ? duration / width : 0;
  const gridPatternId = useMemo(() => `ctg-grid-${Math.random().toString(36).slice(2)}`, []);
  const smallGridPatternId = useMemo(() => `ctg-grid-small-${Math.random().toString(36).slice(2)}`, []);

  return (
    <div
  style={{
    position: "relative",
    width: "100%",
    height: outerHeight,
    background: "#fff",             // чистый фон, без синевы
    border: "none",                 // убираем рамку
    borderRadius: 0,                // без скруглений
    overflow: "hidden",
    userSelect: "none",
  }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          <pattern id={smallGridPatternId} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
          <pattern id={gridPatternId} width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill={`url(#${smallGridPatternId})`} />
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#cbd5e1" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
      </svg>

      <div
        ref={canvasRef}
        style={{
          position: "absolute",
          top: inset,
          left: inset,
          right: inset,
          height: contentHeight * verticalScale,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={(event) => {
          setIsDragging(true);
          dragStartRef.current = event.clientX;
          onToggleLive(false);
        }}
        onMouseMove={(event) => {
          if (isDragging && dragStartRef.current !== null && secondsPerPixel > 0) {
            const deltaPx = event.clientX - dragStartRef.current;
            const deltaSeconds = -deltaPx * secondsPerPixel;
            if (Number.isFinite(deltaSeconds) && deltaSeconds !== 0) {
              onPan(deltaSeconds);
              dragStartRef.current = event.clientX;
            }
          }
        }}
        onMouseUp={() => {
          setIsDragging(false);
          dragStartRef.current = null;
        }}
        onMouseLeave={() => {
          setIsDragging(false);
          dragStartRef.current = null;
        }}
        onDoubleClick={() => onToggleLive(true)}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: contentHeight,
            transform: `scaleY(${verticalScale})`,
            transformOrigin: "top left",
          }}
        >
          <CTGGrid
            width={width}
            height={contentHeight}
            visibleStart={visibleStart}
            visibleEnd={visibleEnd}
            minorSeconds={paperSpeed === 3 ? 5 : 10}
            majorSeconds={60}
            trackConfigs={trackConfigs}
            paperSpeed={paperSpeed}
          />

          <div style={{
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  gap: 0, // убираем разрывы
}}>

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
              color="#e11d48"
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
              color="#9333ea"
              label="TOCO"
              unit="mmHg"
              baseline={0}
              normZone={null}
              events={events}
              qualitySegments={trackQuality}
              onSelectEvent={onSelectEvent}
              hoverTime={hoverState.time}
              onHover={(payload) => setHoverState(payload)}
            />

            <CTGTrack
              width={width}
              height={heightPerTrack}
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              channel="uc"
              data={ucValues}
              times={times}
              minValue={UC_RANGE.min}
              maxValue={UC_RANGE.max}
              color="#be185d"
              label="UC"
              unit="mmHg"
              baseline={0}
              normZone={null}
              events={events}
              qualitySegments={trackQuality}
              onSelectEvent={onSelectEvent}
              hoverTime={hoverState.time}
              onHover={(payload) => setHoverState(payload)}
            />
          </div>
        </div>
      </div>

      {hoverState.time !== null && hoverState.value !== null && (
        <div
          style={{
            position: "absolute",
            top: inset + 12,
            right: inset + 12,
            background: "rgba(255, 255, 255, 0.94)",
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
          <span style={{ opacity: 0.7 }}>{hoverState.channel?.toUpperCase()}</span>
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

export default CTGStrip;
