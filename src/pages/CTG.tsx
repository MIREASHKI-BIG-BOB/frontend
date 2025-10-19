import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Col, Row, Space, Tag, Typography, message, Modal, Alert } from "antd";
import {
  ClockCircleOutlined,
  FlagOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SyncOutlined,
  WifiOutlined,
  PrinterOutlined,
  LoadingOutlined,
  PushpinOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

import CTGCombinedStrip from "../components/ctg/CTGCombinedStrip";
import CTGFullStripExport from "../components/ctg/CTGFullStripExport";
import CTGStaticWindow from "../components/ctg/CTGStaticWindow";
import { CTGEvent, CTGSample, StaticWindowState } from "../components/ctg/types";
import MLPredictionPanel from "../components/MLPredictionPanel";
import { useMLWebSocket } from "../hooks/useMLWebSocket";
import { startGenerator, stopGenerator } from "../services/sensorApi";
import { buildSample, computeCTGMetrics } from "../utils/ctgMetrics";
import { exportLongCTGToPDF } from "../utils/ctgPdfExport";

const { Text, Title } = Typography;
type SessionStatus = "idle" | "recording" | "paused";

const [status, setStatus] = useState<SessionStatus>("idle");
const [sessionId, setSessionId] = useState<string | null>(null);

// isRecording теперь вычисляем из статуса:
const isRecording = status === "recording";
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
  const [isExporting, setIsExporting] = useState(false); // Состояние экспорта PDF

  const lastTimestampRef = useRef(0);
  const sessionOffsetRef = useRef<number | null>(null);
  const exportStripRef = useRef<HTMLDivElement>(null); // Ref для компонента экспорта

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

  // Остановка генератора при размонтировании компонента или обновлении страницы
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (isRecording) {
        try {
          await stopGenerator();
        } catch (error) {
          console.error("Ошибка при остановке генератора:", error);
        }
      }
    };

    // Обработчик для обновления/закрытия страницы
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup при размонтировании компонента
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (isRecording) {
        stopGenerator().catch((error) => {
          console.error("Ошибка при остановке генератора:", error);
        });
      }
    };
  }, [isRecording]);

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
    // Сбрасываем предикты при новой сессии
    if (latestData) {
      latestData.prediction = null;
    }
  }, [visibleWindowSec, latestData]);

  // Старт / Продолжить
const handleStart = useCallback(async () => {
  if (actionPending) return;
  try {
    setActionPending(true);

    if (status === "idle") {
      // Новая сессия — генерим id и чистим буферы
      setSessionId(String(Date.now()));
      resetSession();
    }
    // При paused НИЧЕГО не чистим — продолжаем ту же сессию

    await startGenerator();
    setStatus("recording");
    message.success(status === "idle" ? "Сессия начата" : "Продолжение записи");
  } catch (error) {
    console.error(error);
    message.error("Не удалось запустить генератор");
  } finally {
    setActionPending(false);
  }
}, [actionPending, status, resetSession]);

// Пауза
const handleStop = useCallback(async () => {
  if (actionPending || status !== "recording") return;
  try {
    setActionPending(true);
    await stopGenerator();
    setStatus("paused"); // Буферы не трогаем
    message.success("Пауза");
  } catch (error) {
    console.error(error);
    message.error("Не удалось остановить генератор");
  } finally {
    setActionPending(false);
  }
}, [actionPending, status]);

// Полный сброс
const handleDelete = useCallback(async () => {
  if (actionPending) return;
  setActionPending(true);
  try {
    // Пробуем стопнуть (если и так остановлен — ок)
    await stopGenerator().catch(() => {});
  } finally {
    // Полная очистка
    setSessionId(null);
    resetSession();
    setStatus("idle");
    setActionPending(false);
    message.success("Сессия удалена");
  }
}, [actionPending, resetSession]);


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
      durationSeconds: recordingSeconds, // длительность в секундах
      duration: Math.round(recordingSeconds / 60), // в минутах для совместимости
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

  const handlePrintFullStrip = useCallback(async () => {
    if (!hasSamples) {
      message.warning("Нет данных для печати");
      return;
    }

    try {
      setIsExporting(true);
      message.loading({ content: 'Подготовка ленты для печати...', key: 'export', duration: 0 });

      // Ждём немного для рендера компонента
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!exportStripRef.current) {
        throw new Error('Не удалось подготовить ленту для экспорта');
      }

      await exportLongCTGToPDF(
        exportStripRef.current,
        `CTG-Strip-${new Date().toISOString().split('T')[0]}.pdf`
      );

      message.success({ content: 'PDF успешно создан!', key: 'export' });
    } catch (error) {
      console.error('Ошибка при экспорте в PDF:', error);
      message.error({ content: 'Не удалось создать PDF', key: 'export' });
    } finally {
      setIsExporting(false);
    }
  }, [hasSamples, samples, combinedEvents, qualitySegments, metrics]);

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
    if (!hasSamples) return;

    const latest = lastTimestampRef.current;
    const earliest = samples.length ? samples[0].time : 0;

    // Минимально допустимый offset (нельзя уйти левее earliest+window)
    // X_min = (earliest + visibleWindowSec) - latest
    // Но не разрешаем скроллить в "будущее": offset ≤ 0
    const minOffset = Math.min(0, (earliest + visibleWindowSec) - latest);
    const maxOffset = 0; // нельзя правее "текущего момента"

    setScrollOffset(prev => {
      const next = prev + deltaSeconds;
      const clamped = Math.max(minOffset, Math.min(maxOffset, next));
      return clamped;
    });

    // Любой ручной пан выключает live (и влево, и вправо)
    setIsLive(false);
  },
  [hasSamples, samples, visibleWindowSec]
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
    
  }, [scrollOffset, isRecording, visibleWindowSec]);

  const handlePaperSpeed = useCallback((speed: 1 | 3) => {
    setPaperSpeed(speed);
  }, []);

  const handleClearSession = useCallback(async () => {
    try {
      // Останавливаем генератор если он запущен
      if (isRecording) {
        await stopGenerator();
        setIsRecording(false);
      }
      resetSession();
      message.success("Сессия очищена");
    } catch (error) {
      console.error("Ошибка при очистке сессии:", error);
      message.error("Не удалось остановить генератор");
    }
  }, [resetSession, isRecording]);

  const windowLabel = `${formatClock(Math.max(0, visibleRange.start))} – ${formatClock(
    Math.max(0, visibleRange.end)
  )}`;

  // Состояние для sticky header
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  // Отслеживаем прокрутку
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsHeaderSticky(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                isLive={isLive && scrollOffset === 0}
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

                <div style={{ display: "flex", gap: 12 }}>
  <Button
    type="primary"
    icon={<PlayCircleOutlined />}
    onClick={handleStart}
    loading={actionPending}
    size="large"
    style={{ minWidth: 120 }}
    disabled={status === "recording"}
  >
    {status === "paused" ? "Продолжить" : "Старт"}
  </Button>

  <Button
    icon={<PauseCircleOutlined />}
    onClick={handleStop}
    loading={actionPending}
    size="large"
    style={{ minWidth: 100 }}
    disabled={status !== "recording"}
  >
    Стоп
  </Button>

  <Button
    icon={<SyncOutlined />}
    onClick={handleDelete}
    loading={actionPending}
    danger
    size="large"
    style={{ minWidth: 100 }}
  >
    Удалить
  </Button>

  <Button
    icon={<SaveOutlined />}
    onClick={handleExportReport}
    disabled={!hasSamples}
    size="large"
    style={{ minWidth: 120 }}
  >
    Сохранить
  </Button>

  <Button
    icon={<PrinterOutlined />}
    onClick={handlePrintFullStrip}
    disabled={!hasSamples}
    loading={isExporting}
    size="large"
    style={{ minWidth: 140 }}
  >
    Печать ленты
  </Button>

  <Button
    icon={<VideoCameraOutlined />}
    onClick={() => {
      setScrollOffset(0);
      setIsLive(true);
    }}
    disabled={!hasSamples || (isLive && scrollOffset === 0)}
    size="large"
    type={isLive && scrollOffset === 0 ? "primary" : "default"}
    style={{ minWidth: 120 }}
  >
    {isLive && scrollOffset === 0 ? "● Эфир" : "Эфир"}
  </Button>
</div>

              </div>
            </Card>
          </Space>
        </Col>

        <Col span={6}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Блок метрик (плитки 3 в ряд, как "Текущие значения") */}
              {(() => {
                const now = lastTimestampRef.current;
                const windowStart = Math.max(0, now - 60); // последние 60 секунд
                const recentSamples = samples.filter(s => s.time >= windowStart && s.fhr != null);
                const baseline = recentSamples.length
                  ? Math.round(recentSamples.reduce((sum, s) => sum + (s.fhr || 0), 0) / recentSamples.length)
                  : null;

                const accelCount = combinedEvents.filter(e => e.kind === "acceleration").length;
                const decelCount = combinedEvents.filter(e => e.kind === "deceleration").length;
                const goodSamples = samples.filter(s => s.quality === "good").length;
                const qualityPercent = samples.length ? (goodSamples / samples.length * 100).toFixed(1) : null;
                const movementsCount = manualEvents.filter(e => e.kind === 'mark').length;

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
                    {/* Baseline */}
                    <div style={{ textAlign: "center", padding: "12px" }}>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>Baseline</div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: "#0f172a", fontFamily: "monospace", lineHeight: 1 }}>
                        {baseline != null ? `${baseline}` : '—'}
                      </div>
                    </div>

                    {/* Акцелерации */}
                    <div style={{ textAlign: "center", padding: "12px" }}>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>Акцелерации</div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: "#16a34a", fontFamily: "monospace", lineHeight: 1 }}>
                        {accelCount > 0 ? accelCount : '—'}
                      </div>
                    </div>

                    {/* Децелерации */}
                    <div style={{ textAlign: "center", padding: "12px" }}>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>Децелерации</div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: "#dc2626", fontFamily: "monospace", lineHeight: 1 }}>
                        {decelCount > 0 ? decelCount : '—'}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Текущие значения - 3 блока без заголовка */}
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
          </Space>
        </Col>
      </Row>

      {/* Скрытый компонент для экспорта в PDF */}
      {isExporting && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <CTGFullStripExport
            ref={exportStripRef}
            samples={samples}
            events={combinedEvents}
            qualitySegments={qualitySegments}
            baseline={metrics.baseline}
            normZone={FHR_NORM}
            paperSpeed={paperSpeed}
            combinedHeight={600}
          />
        </div>
      )}
    </div>
  );
};

export default CTGPage;
