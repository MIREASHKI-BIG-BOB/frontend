import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Col, Row, Space, Tag, Typography, message } from "antd";
import {
  ClockCircleOutlined,
  FlagOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SyncOutlined,
  WifiOutlined,
} from "@ant-design/icons";

import CTGCombinedStrip from "../components/ctg/CTGCombinedStrip";
import CTGStatsBar from "../components/ctg/CTGStatsBar";
import CTGStaticWindow from "../components/ctg/CTGStaticWindow";
import { CTGEvent, CTGSample, StaticWindowState } from "../components/ctg/types";
import MLPredictionPanel from "../components/MLPredictionPanel";
import { useMLWebSocket } from "../hooks/useMLWebSocket";
import { startGenerator, stopGenerator } from "../services/sensorApi";
import { buildSample, computeCTGMetrics } from "../utils/ctgMetrics";

const { Text, Title } = Typography;

const MAX_HISTORY_SEC = 40 * 60;
const STATIC_WINDOW_HALF = 90;
const FHR_NORM = { from: 110, to: 160 };

interface Range {
  start: number;
  end: number;
}

const emptyMetrics = () => ({
  baseline: null,
  shortTermVariability: null,
  variabilityAmplitude: null,
  accelerations: { count: 0, totalDuration: 0 },
  decelerations: { count: 0, totalDuration: 0 },
  contractionFrequency: null,
  category: "Normal" as const,
  reasons: ["Нет данных"],
  hasUnstableBaseline: false,
});

const severityColor: Record<CTGEvent["severity"], string> = {
  info: "blue",
  warning: "orange",
  critical: "red",
};

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

const CTGPage: React.FC = () => {
  const { isConnected, latestData, error: wsError } = useMLWebSocket();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [visibleWindowSec, setVisibleWindowSec] = useState(600);
  const [paperSpeed, setPaperSpeed] = useState<1 | 3>(3);
  const [visibleRange, setVisibleRange] = useState<Range>({ start: 0, end: 600 });
  const [samples, setSamples] = useState<CTGSample[]>([]);
  const [manualEvents, setManualEvents] = useState<CTGEvent[]>([]);
  const [staticWindow, setStaticWindow] = useState<StaticWindowState | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [actionPending, setActionPending] = useState(false);

  const lastTimestampRef = useRef(0);
  const sessionOffsetRef = useRef<number | null>(null);

  const hasSamples = samples.length > 0;
  const earliestAvailable = samples.length ? samples[0].time : 0;

  const detection = useMemo(() => {
    if (!samples.length) {
      return {
        events: [],
        qualitySegments: [],
        metrics: emptyMetrics(),
      };
    }
    const reference = lastTimestamp || samples[samples.length - 1].time;
    return computeCTGMetrics(samples, reference, {
      windowSec: visibleWindowSec,
      contractionWindowSec: 600,
    });
  }, [samples, lastTimestamp, visibleWindowSec]);

  const metrics = samples.length ? detection.metrics : emptyMetrics();
  const qualitySegments = samples.length ? detection.qualitySegments : [];
  const combinedEvents = useMemo(() => {
    const base = samples.length ? detection.events : [];
    return [...base, ...manualEvents].sort((a, b) => a.start - b.start);
  }, [samples.length, detection.events, manualEvents]);

  const navigableEvents = useMemo(
    () => combinedEvents.filter((event) => event.kind !== "loss"),
    [combinedEvents]
  );

  const eventsSidebar = useMemo(
    () =>
      combinedEvents
        .filter((event) => event.kind !== "mark")
        .slice(-8)
        .reverse(),
    [combinedEvents]
  );

  useEffect(() => {
    if (!isRecording || !latestData) {
      return;
    }

    const bpm = latestData.data?.BPMChild ?? latestData.data?.bpmChild ?? null;
    const toco = latestData.data?.uterus ?? null;
    const uc = latestData.data?.spasms ?? null;

    if (bpm === null && toco === null && uc === null) {
      return;
    }

    const rawTime = typeof latestData.secFromStart === "number" ? latestData.secFromStart : null;
    if (rawTime !== null) {
      if (sessionOffsetRef.current === null || rawTime < (sessionOffsetRef.current ?? 0)) {
        sessionOffsetRef.current = rawTime;
      }
    }

    const time =
      rawTime !== null && sessionOffsetRef.current !== null
        ? Math.max(0, rawTime - sessionOffsetRef.current)
        : lastTimestampRef.current + 1;

    const sample = buildSample(
      time,
      typeof bpm === "number" ? bpm : null,
      typeof toco === "number" ? toco : null,
      typeof uc === "number" ? uc : null
    );

    lastTimestampRef.current = time;
    setLastTimestamp(time);
    setRecordingSeconds((prev) => Math.max(prev, Math.floor(time)));

    setSamples((prev) => {
      const cutoff = time - MAX_HISTORY_SEC;
      const trimmed = prev.filter((item) => item.time >= cutoff);
      return [...trimmed, sample];
    });

    setManualEvents((prev) => prev.filter((event) => event.end >= time - MAX_HISTORY_SEC));

    if (isLive) {
      const end = time;
      const start = Math.max(0, end - visibleWindowSec);
      setVisibleRange({ start, end });
    }
  }, [latestData, isRecording, isLive, visibleWindowSec]);

  const resetSession = useCallback(() => {
    setSamples([]);
    setManualEvents([]);
    setStaticWindow(null);
    setRecordingSeconds(0);
    setLastTimestamp(0);
    lastTimestampRef.current = 0;
    sessionOffsetRef.current = null;
    setVisibleRange({ start: 0, end: visibleWindowSec });
    setIsLive(true);
  }, [visibleWindowSec]);

  const handleStartStop = useCallback(async () => {
    if (actionPending) {
      return;
    }
    try {
      setActionPending(true);
      if (isRecording) {
        await stopGenerator();
        setIsRecording(false);
        message.success("Генератор остановлен");
      } else {
        await startGenerator();
        resetSession();
        setIsRecording(true);
        message.success("Генератор запущен");
      }
    } catch (error) {
      message.error("Не удалось выполнить операцию");
      console.error(error);
    } finally {
      setActionPending(false);
    }
  }, [actionPending, isRecording, resetSession]);

  const handleMarkFetalMovement = useCallback(() => {
    if (!hasSamples) {
      message.warning("Нет данных для отметки");
      return;
    }
    const time = lastTimestampRef.current;
    const mark: CTGEvent = {
      id: `mark-${Date.now()}`,
      kind: "mark",
      channel: "fhr",
      start: time,
      end: time + 1,
      peak: time,
      amplitude: 0,
      severity: "info",
      description: "Отмечено движение плода",
    };
    setManualEvents((prev) => [...prev, mark]);
  }, [hasSamples]);

  const handleSelectEvent = useCallback((event: CTGEvent) => {
    const center = event.peak || event.start;
    const start = Math.max(0, center - STATIC_WINDOW_HALF);
    const end = center + STATIC_WINDOW_HALF;
    setStaticWindow({ center, start, end, eventId: event.id });
    setIsLive(false);
  }, []);

  const handleNavigateStatic = useCallback(
    (direction: "prev" | "next") => {
      if (!staticWindow) {
        return;
      }
      const idx = navigableEvents.findIndex((event) => event.id === staticWindow.eventId);
      if (idx === -1) {
        return;
      }
      const nextIndex = direction === "prev" ? idx - 1 : idx + 1;
      const target = navigableEvents[nextIndex];
      if (!target) {
        return;
      }
      const center = target.peak || target.start;
      const start = Math.max(0, center - STATIC_WINDOW_HALF);
      const end = center + STATIC_WINDOW_HALF;
      setStaticWindow({ center, start, end, eventId: target.id });
    },
    [staticWindow, navigableEvents]
  );

  const handleCloseStatic = useCallback(() => {
    setStaticWindow(null);
    setIsLive(true);
    const end = lastTimestampRef.current;
    const start = Math.max(0, end - visibleWindowSec);
    setVisibleRange({ start, end });
  }, [visibleWindowSec]);

  const handleToggleLive = useCallback(
    (nextLive: boolean) => {
      setIsLive(nextLive);
      if (nextLive) {
        const end = lastTimestampRef.current;
        const start = Math.max(0, end - visibleWindowSec);
        setVisibleRange({ start, end });
        setStaticWindow(null);
      }
    },
    [visibleWindowSec]
  );

  const handlePan = useCallback(
    (deltaSeconds: number) => {
      if (!hasSamples) {
        return;
      }
      const latest = lastTimestampRef.current;
      const width = visibleWindowSec;
      setVisibleRange((range) => {
        const maxStart = Math.max(earliestAvailable, latest - width);
        let start = clamp(range.start + deltaSeconds, earliestAvailable, maxStart);
        let end = start + width;
        if (end > latest) {
          end = latest;
          start = Math.max(earliestAvailable, end - width);
        }
        setIsLive(Math.abs(end - latest) < 1);
        return { start, end };
      });
    },
    [hasSamples, earliestAvailable, visibleWindowSec]
  );

  const handleChangeWindow = useCallback(
    (seconds: number) => {
      setVisibleWindowSec(seconds);
      setVisibleRange((range) => {
        const end = isLive ? lastTimestampRef.current : range.end;
        const start = Math.max(earliestAvailable, end - seconds);
        return { start, end };
      });
    },
    [isLive, earliestAvailable]
  );

  const handlePaperSpeed = useCallback((speed: 1 | 3) => {
    setPaperSpeed(speed);
  }, []);

  const handleClearSession = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const windowLabel = `${formatClock(Math.max(0, visibleRange.start))} – ${formatClock(
    Math.max(0, visibleRange.end)
  )}`;

  return (
    <div style={{ padding: 16, background: "#f5f7fa", minHeight: "100%" }}>
      {staticWindow && (
        <CTGStaticWindow
          open
          samples={samples}
          events={combinedEvents}
          qualitySegments={qualitySegments}
          baseline={metrics.baseline}
          normZone={FHR_NORM}
          start={staticWindow.start}
          end={staticWindow.end}
          paperSpeed={paperSpeed}
          onClose={handleCloseStatic}
          onNavigate={handleNavigateStatic}
        />
      )}

      <Row gutter={16}>
        <Col span={18}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card bodyStyle={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space size="middle" align="center">
                  <Title level={5} style={{ margin: 0 }}>
                    Кардиотокография
                  </Title>
                  <Tag color={isRecording ? "red" : "default"}>{isRecording ? "Запись" : "Пауза"}</Tag>
                  <Tag icon={<WifiOutlined />} color={isConnected ? "green" : "volcano"}>
                    {isConnected ? "WS: онлайн" : "WS: офлайн"}
                  </Tag>
                  <Tag icon={<ClockCircleOutlined />}>{formatClock(recordingSeconds)}</Tag>
                  {wsError && <Tag color="red">{wsError}</Tag>}
                </Space>
                <Space>
                  <Button
                    type="primary"
                    icon={isRecording ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={handleStartStop}
                    loading={actionPending}
                  >
                    {isRecording ? "Стоп" : "Старт"}
                  </Button>
                  <Button icon={<FlagOutlined />} onClick={handleMarkFetalMovement} disabled={!hasSamples}>
                    MARK
                  </Button>
                  <Button icon={<SyncOutlined />} onClick={handleClearSession} disabled={!hasSamples && !isRecording}>
                    Сбросить
                  </Button>
                </Space>
              </div>
            </Card>

            <Card bodyStyle={{ padding: 16 }}>
              <CTGStatsBar
                metrics={metrics}
                visibleWindowSec={visibleWindowSec}
                windowLabel={windowLabel}
                onChangeWindow={handleChangeWindow}
                paperSpeed={paperSpeed}
                onPaperSpeedChange={handlePaperSpeed}
                onMarkFetalMovement={handleMarkFetalMovement}
              />
              <CTGCombinedStrip
                samples={samples}
                visibleStart={visibleRange.start}
                visibleEnd={visibleRange.end}
                events={combinedEvents}
                qualitySegments={qualitySegments}
                baseline={metrics.baseline}
                normZone={FHR_NORM}
                paperSpeed={paperSpeed}
                combinedHeight={380}
                toneHeight={160}
                onSelectEvent={handleSelectEvent}
                onPan={handlePan}
                onToggleLive={handleToggleLive}
              />
            </Card>

            <Card title="Последние события" bodyStyle={{ padding: 16 }}>
              {eventsSidebar.length === 0 ? (
                <Text type="secondary">Пока событий нет</Text>
              ) : (
                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  {eventsSidebar.map((event) => (
                    <div
                      key={event.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 8px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        background: "#fff",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSelectEvent(event)}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Text strong>{event.description}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {event.kind.toUpperCase()} · {formatClock(event.start)}
                        </Text>
                      </div>
                      <Tag color={severityColor[event.severity]}>{event.severity}</Tag>
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </Space>
        </Col>

        <Col span={6}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <MLPredictionPanel
              prediction={latestData?.prediction ?? null}
              isAccumulating={!latestData?.prediction}
            />
            <Card title="Статус подключения" bodyStyle={{ padding: 16 }}>
              <Space direction="vertical">
                <Text>
                  WebSocket: <Text strong>{isConnected ? "активен" : "нет сигнала"}</Text>
                </Text>
                <Text>
                  Поток данных: <Text strong>{hasSamples ? "идёт" : "ожидание"}</Text>
                </Text>
                <Text>
                  Окно обзора: <Text strong>{visibleWindowSec / 60} мин</Text>
                </Text>
                <Text>
                  Скорость бумаги: <Text strong>{paperSpeed} см/мин</Text>
                </Text>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CTGPage;
