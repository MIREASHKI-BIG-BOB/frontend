import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Col, Row, Space, Tag, Typography, message } from "antd";
import {
  ClockCircleOutlined,
  FlagOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SyncOutlined,
  WifiOutlined,
} from "@ant-design/icons";

import CTGCombinedStrip from "../components/ctg/CTGCombinedStrip";
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
  const [scrollOffset, setScrollOffset] = useState(0); // Смещение для прокрутки назад/вперед

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

  // Восстановление состояния при возврате со страницы анализа
  useEffect(() => {
    const savedState = sessionStorage.getItem('ctg_state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setSamples(state.samples || []);
        setManualEvents(state.events?.filter((e: CTGEvent) => e.kind === 'mark') || []);
        setScrollOffset(state.scrollOffset || 0);
        setIsLive(state.isLive !== undefined ? state.isLive : true);
        setRecordingSeconds(state.recordingSeconds || 0);
        if (state.staticWindow) {
          setStaticWindow(state.staticWindow);
        }
        // Очищаем сохранённое состояние
        sessionStorage.removeItem('ctg_state');
      } catch (e) {
        console.error('Failed to restore CTG state:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isRecording || !latestData) {
      return;
    }

    const bpm = latestData.data?.BPMChild ?? latestData.data?.bpmChild ?? null;
    const toco = latestData.data?.uterus ?? null;
    const uc = latestData.data?.spasms ?? null;
    const tone = latestData.data?.tone ?? null;

    if (bpm === null && toco === null && uc === null && tone === null) {
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
      typeof uc === "number" ? uc : null,
      typeof tone === "number" ? tone : null
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

    if (isLive && scrollOffset === 0) {
      // В режиме live правый край всегда = текущее время
      const end = time;
      const start = Math.max(0, end - visibleWindowSec);
      setVisibleRange({ start, end });
    }
  }, [latestData, isRecording, isLive, visibleWindowSec, scrollOffset]);

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
    setScrollOffset(0);
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

  const handleExportReport = useCallback(() => {
    if (!hasSamples) {
      message.warning("Нет данных для экспорта");
      return;
    }
    
    // Определяем опасные участки (decelerations, anomalies)
    const criticalEvents = combinedEvents.filter(e => 
      e.severity === 'critical' || e.severity === 'warning'
    );
    
    // Создаем объект в формате ctgSessions для Reports
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      duration: Math.round(recordingSeconds / 60), // в минутах
      basalFHR: Math.round(metrics.baseline || 140),
      variability: Math.round(metrics.variabilityAmplitude || 15),
      accelerations: metrics.accelerations?.count || 0,
      decelerations: metrics.decelerations?.count || 0,
      movements: manualEvents.filter(e => e.kind === 'mark').length,
      score: latestData?.prediction?.hypoxia_risk === 'low' ? 10 : 
             latestData?.prediction?.hypoxia_risk === 'medium' ? 8 :
             latestData?.prediction?.hypoxia_risk === 'high' ? 6 : 4,
      conclusion: latestData?.prediction?.hypoxia_risk === 'low' ? 'Нормальный' :
                  latestData?.prediction?.hypoxia_risk === 'medium' ? 'Подозрительный' :
                  latestData?.prediction?.hypoxia_risk === 'high' ? 'Патологический' : 'Критический',
      risk: latestData?.prediction?.hypoxia_risk || 'low',
      anomalies: criticalEvents.map(e => ({
        type: e.kind === 'deceleration' ? 'decel' : e.kind,
        time: `${Math.floor(e.start / 60)}:${String(Math.floor(e.start % 60)).padStart(2, '0')}`,
        severity: e.severity,
        description: e.description || 'Обнаружена аномалия',
      })),
      // Сохраняем полные данные для детального просмотра
      fullData: {
        samples: samples,
        events: combinedEvents,
        metrics: metrics,
        prediction: latestData?.prediction || null,
      }
    };

    // Сохраняем в localStorage
    const existingSessions = JSON.parse(localStorage.getItem('ctg_sessions') || '[]');
    existingSessions.push(newSession);
    localStorage.setItem('ctg_sessions', JSON.stringify(existingSessions));

    message.success('Сессия сохранена! Перейдите во вкладку "Отчеты" для просмотра.');
  }, [hasSamples, recordingSeconds, samples, combinedEvents, metrics, latestData, manualEvents]);

  const handleSelectEvent = useCallback((event: CTGEvent) => {
    // Если событие опасное (critical/warning) - переходим на страницу анализа
    const isDangerous = event.severity === 'critical' || event.severity === 'warning';
    
    if (isDangerous) {
      // Сохраняем текущее состояние CTG для возврата
      const ctgState = {
        samples,
        events: combinedEvents,
        metrics,
        scrollOffset,
        isLive,
        recordingSeconds,
        staticWindow,
      };
      sessionStorage.setItem('ctg_state', JSON.stringify(ctgState));
      
      // Сохраняем данные опасного события
      const center = event.peak || event.start;
      const start = Math.max(0, center - STATIC_WINDOW_HALF);
      const end = center + STATIC_WINDOW_HALF;
      const eventSamples = samples.filter(s => s.time >= start && s.time <= end);
      
      const analysisData = {
        event,
        samples: eventSamples,
        center,
        start,
        end,
        metrics,
      };
      sessionStorage.setItem('ctg_analysis_data', JSON.stringify(analysisData));
      
      // Переход на страницу анализа
      location.hash = '#/ctg-analysis';
    } else {
      // Обычное событие - показываем в статичном окне
      const center = event.peak || event.start;
      const start = Math.max(0, center - STATIC_WINDOW_HALF);
      const end = center + STATIC_WINDOW_HALF;
      setStaticWindow({ center, start, end, eventId: event.id });
      setIsLive(false);
    }
  }, [samples, combinedEvents, metrics, scrollOffset, isLive, recordingSeconds, staticWindow]);

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
        setScrollOffset(0);
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
      
      // Изменяем смещение прокрутки
      setScrollOffset((prevOffset) => {
        const newOffset = prevOffset + deltaSeconds;
        // Ограничиваем: не можем прокрутить дальше текущего момента и не дальше начала данных
        const maxOffset = 0; // Не дальше текущего момента
        const minOffset = -(latest - visibleWindowSec); // Не дальше начала данных
        return Math.max(minOffset, Math.min(maxOffset, newOffset));
      });
      
      // Если прокручиваем назад, выходим из live режима
      if (deltaSeconds < 0) {
        setIsLive(false);
      }
    },
    [hasSamples, visibleWindowSec]
  );

  const handleChangeWindow = useCallback(
    (seconds: number) => {
      setVisibleWindowSec(seconds);
      if (isLive && scrollOffset === 0) {
        const end = lastTimestampRef.current;
        const start = Math.max(0, end - seconds);
        setVisibleRange({ start, end });
      }
    },
    [isLive, scrollOffset]
  );

  // Обновляем visibleRange при изменении scrollOffset
  useEffect(() => {
    if (!isRecording) return;
    
    const latest = lastTimestampRef.current;
    const end = latest + scrollOffset;
    const start = Math.max(0, end - visibleWindowSec);
    setVisibleRange({ start, end });
    
    // Если scrollOffset = 0, включаем live режим
    if (scrollOffset === 0) {
      setIsLive(true);
    }
  }, [scrollOffset, isRecording, visibleWindowSec]);

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
                  <Button icon={<SyncOutlined />} onClick={handleClearSession} disabled={!hasSamples && !isRecording}>
                    Сбросить
                  </Button>
                </Space>
              </div>
            </Card>

            <Card bodyStyle={{ padding: 16 }}>
              <CTGCombinedStrip
                samples={samples}
                visibleStart={visibleRange.start}
                visibleEnd={visibleRange.end}
                events={combinedEvents}
                qualitySegments={qualitySegments}
                baseline={metrics.baseline}
                normZone={FHR_NORM}
                paperSpeed={paperSpeed}
                combinedHeight={600}
                onSelectEvent={handleSelectEvent}
                onPan={handlePan}
                onToggleLive={handleToggleLive}
              />
              
              {/* Кнопки управления под графиками */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #e5e7eb"
              }}>
                {/* Информация о позиции */}
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  <Text type="secondary">
                    Записано: <Text strong>{formatClock(recordingSeconds)}</Text>
                    {scrollOffset !== 0 && (
                      <span> • Смещение: <Text strong>{scrollOffset > 0 ? '+' : ''}{scrollOffset}с</Text></span>
                    )}
                  </Text>
                </div>

                {/* Кнопки навигации */}
                <div style={{ display: "flex", gap: 12 }}>
                  <Button 
                    icon={<FlagOutlined />} 
                    onClick={handleMarkFetalMovement} 
                    disabled={!hasSamples}
                    size="large"
                    type="primary"
                    style={{ minWidth: 120 }}
                  >
                    MARK
                  </Button>
                  <Button 
                    icon={<SaveOutlined />} 
                    onClick={handleExportReport} 
                    disabled={!hasSamples}
                    size="large"
                    style={{ minWidth: 120 }}
                  >
                    Export
                  </Button>
                  <Button 
                    onClick={() => handlePan(-30)} 
                    disabled={!hasSamples}
                    size="large"
                    style={{ minWidth: 120 }}
                  >
                    ← Назад (30с)
                  </Button>
                  <Button 
                    onClick={() => {
                      setScrollOffset(0);
                      setIsLive(true);
                    }} 
                    disabled={!hasSamples || (isLive && scrollOffset === 0)}
                    size="large"
                    type={isLive && scrollOffset === 0 ? "primary" : "default"}
                    style={{ minWidth: 140 }}
                  >
                    {isLive && scrollOffset === 0 ? "● LIVE" : "⟳ В LIVE"}
                  </Button>
                  <Button 
                    onClick={() => handlePan(30)} 
                    disabled={!hasSamples || scrollOffset >= 0}
                    size="large"
                    style={{ minWidth: 120 }}
                  >
                    Вперед (30с) →
                  </Button>
                </div>
              </div>
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
            {/* Текущие значения - 4 блока без заголовка */}
            {(() => {
              const lastSample = samples.length > 0 ? samples[samples.length - 1] : null;
              return (
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(3, 1fr)", 
                  gap: "1px",
                  padding: "12px",
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb"
                }}>
                  
                  {/* BPM (FHR) */}
                  {lastSample?.fhr != null && (
                    <div style={{ textAlign: "center", padding: "8px" }}>
                      <div style={{ fontSize: 10, color: "#991b1b", fontWeight: 600, marginBottom: 4 }}>
                        BPM
                      </div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: "#dc2626", fontFamily: "monospace", lineHeight: 1 }}>
                        {Math.round(lastSample.fhr)}
                      </div>
                    </div>
                  )}
                  
                  {/* UTERUS (TOCO) */}
                  {lastSample?.toco != null && (
                    <div style={{ textAlign: "center", padding: "8px" }}>
                      <div style={{ fontSize: 10, color: "#c2410c", fontWeight: 600, marginBottom: 4 }}>
                        UTERUS
                      </div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: "#f97316", fontFamily: "monospace", lineHeight: 1 }}>
                        {Math.round(lastSample.toco)}
                      </div>
                    </div>
                  )}

                  {/* SPASMS (UC) */}
                  {lastSample?.uc != null && (
                    <div style={{ textAlign: "center", padding: "8px" }}>
                      <div style={{ fontSize: 10, color: "#1e40af", fontWeight: 600, marginBottom: 4 }}>
                        SPASMS
                      </div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: "#2563eb", fontFamily: "monospace", lineHeight: 1 }}>
                        {Math.round(lastSample.uc)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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
