import React, { useEffect, useState } from "react";
import { Card, Space, Button, Typography } from "antd";
import CTGCombinedStrip from "../components/ctg/CTGCombinedStrip";
import { CTGSample, CTGEvent, CTGQualitySegment } from "../components/ctg/types";

const { Title, Text } = Typography;

/**
 * Демонстрационная страница для нового компонента CTGCombinedStrip
 * Показывает три графика: FHR + UC (объединённые) и Tone (отдельно)
 */
const CTGCombinedDemo: React.FC = () => {
  const [samples, setSamples] = useState<CTGSample[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [paperSpeed, setPaperSpeed] = useState<1 | 3>(3);

  // Генерация реалистичных данных
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentTime((t) => t + 1);
      setSamples((prev) => {
        const time = prev.length > 0 ? prev[prev.length - 1].time + 1 : 0;

        // FHR: базовый уровень 140 ± вариабельность
        const fhrBaseline = 140;
        const fhrVariability = Math.sin(time * 0.1) * 10 + (Math.random() - 0.5) * 15;
        const fhr = Math.max(50, Math.min(210, fhrBaseline + fhrVariability));

        // UC: периодические схватки (синусоида с шумом)
        const contractionWave = Math.sin(time * 0.02) * 40;
        const ucNoise = (Math.random() - 0.5) * 5;
        const uc = Math.max(0, Math.min(100, contractionWave + 15 + ucNoise));

        // Tone: небольшие колебания тонуса (0-40 mmHg)
        const toneBaseline = 12;
        const toneOscillation = Math.sin(time * 0.05) * 3;
        const toneNoise = (Math.random() - 0.5) * 2;
        const tone = Math.max(0, Math.min(40, toneBaseline + toneOscillation + toneNoise));

        const sample: CTGSample = {
          time,
          fhr,
          toco: uc, // для совместимости
          uc,
          tone,
          quality: "good",
        };

        // Ограничиваем историю 10 минутами
        const maxHistory = 600;
        const updated = [...prev, sample];
        return updated.length > maxHistory ? updated.slice(-maxHistory) : updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const visibleWindow = 180; // 3 минуты
  const visibleStart = Math.max(0, currentTime - visibleWindow);
  const visibleEnd = currentTime;

  // Демо-события (ускорения, замедления)
  const events: CTGEvent[] = [
    {
      id: "demo-accel-1",
      kind: "acceleration",
      channel: "fhr",
      start: 60,
      end: 75,
      peak: 160,
      amplitude: 20,
      severity: "info",
      description: "Ускорение ЧСС",
    },
    {
      id: "demo-decel-1",
      kind: "deceleration",
      channel: "fhr",
      start: 120,
      end: 135,
      peak: 110,
      amplitude: -30,
      severity: "warning",
      description: "Замедление ЧСС",
    },
  ];

  const qualitySegments: CTGQualitySegment[] = [];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Space direction="vertical" size="small">
            <Title level={3}>Демо: CTGCombinedStrip - 3 графика КТГ</Title>
            <Text type="secondary">
              Объединённый блок FHR + UC (верх) и отдельный график Tone (низ)
            </Text>
            <Space>
              <Button
                type={isRunning ? "default" : "primary"}
                onClick={() => setIsRunning((prev) => !prev)}
              >
                {isRunning ? "Пауза" : "Старт"}
              </Button>
              <Button onClick={() => setSamples([])}>Сброс</Button>
              <Button.Group>
                <Button
                  type={paperSpeed === 1 ? "primary" : "default"}
                  onClick={() => setPaperSpeed(1)}
                >
                  1 см/мин
                </Button>
                <Button
                  type={paperSpeed === 3 ? "primary" : "default"}
                  onClick={() => setPaperSpeed(3)}
                >
                  3 см/мин
                </Button>
              </Button.Group>
              <Text>
                Время: {Math.floor(currentTime / 60)}:
                {(currentTime % 60).toString().padStart(2, "0")}
              </Text>
              <Text type="secondary">Образцов: {samples.length}</Text>
            </Space>
          </Space>
        </Card>

        <Card title="График КТГ" bodyStyle={{ padding: 16 }}>
          {samples.length > 0 ? (
            <CTGCombinedStrip
              samples={samples}
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              events={events}
              qualitySegments={qualitySegments}
              baseline={140}
              normZone={{ from: 110, to: 160 }}
              paperSpeed={paperSpeed}
              combinedHeight={380}
              toneHeight={160}
              onSelectEvent={(event) => console.log("Selected event:", event)}
              onPan={() => {}}
              onToggleLive={() => {}}
            />
          ) : (
            <div
              style={{
                height: 540,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafafa",
                border: "1px dashed #d9d9d9",
                borderRadius: 4,
              }}
            >
              <Text type="secondary">Нажмите "Старт" для начала мониторинга</Text>
            </div>
          )}
        </Card>

        <Card title="Техническое описание">
          <Space direction="vertical" size="small">
            <Text strong>Блок 1: Объединённый FHR + UC (380px)</Text>
            <ul style={{ marginLeft: 20 }}>
              <li>
                <Text>FHR (верхняя половина): 50-210 bpm, красная линия, зона нормы 110-160</Text>
              </li>
              <li>
                <Text>UC (нижняя половина): 0-100 mmHg, фиолетовая линия, базовый уровень 15</Text>
              </li>
              <li>
                <Text>Общая временная ось, сквозная вертикальная сетка</Text>
              </li>
            </ul>
            <Text strong>Блок 2: Tone (160px)</Text>
            <ul style={{ marginLeft: 20 }}>
              <li>
                <Text>Диапазон: 0-40 mmHg, светло-синяя тонкая линия (1.5px)</Text>
              </li>
              <li>
                <Text>Фоновый тонус матки, небольшая амплитуда колебаний</Text>
              </li>
              <li>
                <Text>Синхронный скролл с верхним блоком</Text>
              </li>
            </ul>
            <Text strong>Параметры:</Text>
            <ul style={{ marginLeft: 20 }}>
              <li>
                <Text>Масштаб: фиксированный (3 см/мин = {3 * 37.8}px/мин)</Text>
              </li>
              <li>
                <Text>Сетка: вертикальная через 10 сек, жирная через 1 мин</Text>
              </li>
              <li>
                <Text>Линии: без сглаживания (linear), резкие как на медицинском КТГ</Text>
              </li>
              <li>
                <Text>Фон: #fffaf7 (имитация бумаги)</Text>
              </li>
            </ul>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default CTGCombinedDemo;
