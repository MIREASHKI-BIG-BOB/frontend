import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Typography,
  Input,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Collapse,
  Avatar,
} from "antd";
import { colors } from "../theme";
import { useMLWebSocket } from "../hooks/useMLWebSocket";
import MLPredictionPanel from "../components/MLPredictionPanel";
import { startGenerator, stopGenerator } from "../services/sensorApi";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HeartOutlined,
  AlertOutlined,
  SettingOutlined,
  CalendarOutlined,
  LineChartOutlined,
  UpOutlined,
  DownOutlined,
  WifiOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import AnomalyAnalysisPage from "./AnomalyAnalysis";
import DetailedAnomalyAnalysis from "./DetailedAnomalyAnalysis";

// CSS стили для анимаций
const styles = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .anomaly-indicator {
    animation: blink 1s infinite;
  }
  
  .anomaly-pulse {
    animation: pulse 2s infinite;
  }
`;

// Добавляем стили в документ
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const { Text, Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Компонент для интерактивного графика КТГ в розовой палитре
interface CTGChartProps {
  title: string;
  unit: string;
  color: string;
  minValue: number;
  maxValue: number;
  height: string;
  data: number[];
  dangerRanges?: { min: number; max: number }[];
  chartType?: "fhr" | "uc" | "contractions";
  anomalies?: Array<{
    time: number;
    type: "fhr" | "uc" | "contractions";
    severity: "warning" | "critical";
    description: string;
  }>;
  onAnomalyClick?: (anomaly: any) => void;
}

const CTGChart: React.FC<CTGChartProps> = ({
  title,
  unit,
  color,
  minValue,
  maxValue,
  height,
  data,
  dangerRanges = [],
  chartType = "fhr",
  anomalies = [],
  onAnomalyClick,
}) => {
  // Преобразуем данные для Recharts
  const chartData = data.map((value, index) => ({
    time: index,
    value: value,
    timestamp: `${Math.floor(index / 60)}:${(index % 60)
      .toString()
      .padStart(2, "0")}`,
  }));

  // Функция для определения опасности значения
  const isDangerValue = (value: number) => {
    return dangerRanges.some((range) => value < range.min || value > range.max);
  };

  // Кастомный Tooltip в розовой палитре
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const isDanger = isDangerValue(data.value);
      return (
        <div
          style={{
            background: "linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)",
            border: `1px solid ${isDanger ? "#f43f5e" : "#ec4899"}`,
            borderRadius: "6px",
            padding: "8px 12px",
            boxShadow: "0 4px 12px rgba(236, 72, 153, 0.15)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              color: "#831843",
              fontSize: "11px",
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "14px",
              fontWeight: "bold",
              color: isDanger ? "#f43f5e" : "#a21caf",
            }}
          >
            {Math.round(data.value)} {unit}
          </p>
          <p
            style={{
              margin: "2px 0 0 0",
              fontSize: "10px",
              color: "#831843",
              opacity: 0.8,
            }}
          >
            {data.payload.timestamp}
          </p>
          {isDanger && (
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "10px",
                color: "#f43f5e",
                fontWeight: "bold",
              }}
            >
              ⚠️ ВНИМАНИЕ!
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        height,
        position: "relative",
        background: "linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)",
        border: "1px solid #f3e8ff",
        borderRadius: "6px",
        padding: "8px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "10px",
          background: "rgba(255,255,255,0.95)",
          padding: "3px 6px",
          borderRadius: "4px",
          zIndex: 10,
          boxShadow: "0 1px 3px rgba(236, 72, 153, 0.1)",
          border: "1px solid #f3e8ff",
        }}
      >
        <Text strong style={{ color: "#831843", fontSize: "12px" }}>
          {title}
        </Text>
        <Text
          style={{
            marginLeft: "4px",
            fontSize: "11px",
            color: "#831843",
            opacity: 0.7,
          }}
        >
          ({unit})
        </Text>
        {/* Индикатор аномалий в заголовке */}
        {anomalies &&
          anomalies.filter((a) => a.type === chartType).length > 0 && (
            <WarningOutlined
              className="anomaly-indicator"
              style={{
                marginLeft: "6px",
                fontSize: "14px",
                color: "#dc2626",
              }}
            />
          )}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 32, right: 20, left: 20, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="2 2" stroke="#f3e8ff" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#831843" }}
            tickFormatter={(value) =>
              `${Math.floor(value / 60)}:${(value % 60)
                .toString()
                .padStart(2, "0")}`
            }
          />
          <YAxis
            domain={[minValue, maxValue]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#831843" }}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Опасные зоны как фоновая заливка в розовых тонах */}
          {dangerRanges.map((range, index) => (
            <React.Fragment key={index}>
              <ReferenceArea
                y1={minValue}
                y2={range.min}
                fill="#f43f5e"
                fillOpacity={0.08}
              />
              <ReferenceArea
                y1={range.max}
                y2={maxValue}
                fill="#f43f5e"
                fillOpacity={0.08}
              />
            </React.Fragment>
          ))}

          {/* Отображение реальных аномалий - улучшенное выделение */}
          {anomalies &&
            anomalies
              .filter(
                (anomaly) =>
                  anomaly.type === chartType && anomaly.time < data.length
              ) // Только валидные аномалии
              .slice(-5) // Показываем только последние 5 аномалий для каждого типа
              .map((anomaly, index) => (
                <React.Fragment key={`anomaly-${index}`}>
                  {/* Широкая подсветка аномальной области с градиентом */}
                  <ReferenceArea
                    x1={Math.max(0, anomaly.time - 8)}
                    x2={Math.min(data.length - 1, anomaly.time + 8)}
                    fill={
                      anomaly.severity === "critical" ? "#dc2626" : "#f59e0b"
                    }
                    fillOpacity={0.15}
                  />
                  {/* Средняя подсветка */}
                  <ReferenceArea
                    x1={Math.max(0, anomaly.time - 5)}
                    x2={Math.min(data.length - 1, anomaly.time + 5)}
                    fill={
                      anomaly.severity === "critical" ? "#dc2626" : "#f59e0b"
                    }
                    fillOpacity={0.25}
                  />
                  {/* Интенсивная подсветка критической области */}
                  <ReferenceArea
                    x1={Math.max(0, anomaly.time - 3)}
                    x2={Math.min(data.length - 1, anomaly.time + 3)}
                    fill={
                      anomaly.severity === "critical" ? "#dc2626" : "#f59e0b"
                    }
                    fillOpacity={0.4}
                  />
                  {/* Центральная точка аномалии */}
                  <ReferenceArea
                    x1={anomaly.time}
                    x2={anomaly.time}
                    fill={
                      anomaly.severity === "critical" ? "#dc2626" : "#f59e0b"
                    }
                    fillOpacity={0.7}
                  />
                </React.Fragment>
              ))}

          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={(props: any) => {
              const isDanger = isDangerValue(props.payload.value);
              const hasAnomaly =
                anomalies &&
                anomalies.some(
                  (anomaly) =>
                    anomaly.type === chartType &&
                    Math.abs(anomaly.time - props.payload.time) <= 3
                );

              if (hasAnomaly) {
                const anomaly = anomalies.find(
                  (anomaly) =>
                    anomaly.type === chartType &&
                    Math.abs(anomaly.time - props.payload.time) <= 3
                );

                const handleAnomalyDotClick = (e: any) => {
                  e.stopPropagation();
                  if (onAnomalyClick && anomaly) {
                    onAnomalyClick(anomaly);
                  }
                };

                return (
                  <g
                    style={{ cursor: "pointer" }}
                    onClick={handleAnomalyDotClick}
                  >
                    {/* Внешнее кольцо с пульсацией */}
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={12}
                      fill={
                        anomaly?.severity === "critical" ? "#dc2626" : "#f59e0b"
                      }
                      opacity={0.2}
                    >
                      <animate
                        attributeName="r"
                        values="8;15;8"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.1;0.4;0.1"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Среднее кольцо */}
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={8}
                      fill={
                        anomaly?.severity === "critical" ? "#dc2626" : "#f59e0b"
                      }
                      opacity={0.4}
                    >
                      <animate
                        attributeName="r"
                        values="6;10;6"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0.6;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Основная точка с большим размером */}
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={6}
                      fill={
                        anomaly?.severity === "critical" ? "#dc2626" : "#f59e0b"
                      }
                      stroke="#fff"
                      strokeWidth={3}
                    >
                      <animate
                        attributeName="r"
                        values="5;7;5"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Восклицательный знак как SVG */}
                    <foreignObject
                      x={props.cx - 8}
                      y={props.cy - 25}
                      width={16}
                      height={16}
                      style={{ pointerEvents: "none" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "16px",
                          height: "16px",
                          color:
                            anomaly?.severity === "critical"
                              ? "#dc2626"
                              : "#f59e0b",
                          fontSize: "12px",
                        }}
                      >
                        <WarningOutlined />
                      </div>
                    </foreignObject>
                    {/* Невидимая увеличенная область для клика */}
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={15}
                      fill="transparent"
                      stroke="transparent"
                    />
                  </g>
                );
              }

              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={isDanger ? 3 : 1.5}
                  fill={isDanger ? "#f43f5e" : color}
                  stroke={isDanger ? "#fff" : "none"}
                  strokeWidth={isDanger ? 1 : 0}
                />
              );
            }}
            activeDot={{
              r: 4,
              fill: color,
              stroke: "#fff",
              strokeWidth: 1,
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Текущее значение в розовой палитре */}
      {data.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "10px",
            background: isDangerValue(data[data.length - 1])
              ? "#fef2f2"
              : "#fef7ff",
            border: `1px solid ${
              isDangerValue(data[data.length - 1]) ? "#fecaca" : "#f3e8ff"
            }`,
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "14px",
            fontWeight: "bold",
            color: isDangerValue(data[data.length - 1]) ? "#dc2626" : "#a21caf",
          }}
        >
          {Math.round(data[data.length - 1])}
          {isDangerValue(data[data.length - 1]) && (
            <WarningOutlined
              style={{
                marginLeft: "3px",
                color: "#dc2626",
                animation: "blink 1s infinite",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default function CTGPage() {
  // Состояние пациентки
  const [patientName, setPatientName] = useState<string>(
    "Иванова Мария Петровна"
  );
  const [pregnancyWeek, setPregnancyWeek] = useState<number>(35);
  const [gestationDay, setGestationDay] = useState<number>(4);
  const [sessionDate, setSessionDate] = useState<Dayjs>(dayjs());
  const [sessionTime, setSessionTime] = useState<Dayjs>(dayjs());
  const [sessionType, setSessionType] = useState<string>("routine");

  // Состояние записи
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<string>("");

  // Данные для графиков
  const [fetalHeartRate, setFetalHeartRate] = useState<number[]>([]);
  const [uterineContractions, setUterineContractions] = useState<number[]>([]);
  const [contractions, setContractions] = useState<number[]>([]);

  // 🔗 Подключаемся к ML WebSocket для получения реальных предсказаний
  const {
    isConnected: mlConnected,
    latestData: mlData,
    error: mlError,
  } = useMLWebSocket();

  // Отслеживаем время начала записи для корректного позиционирования аномалий
  const [startTime, setStartTime] = useState<number | null>(null);

  // ИИ предсказания и аномалии
  const [aiPredictions, setAiPredictions] = useState({
    riskLevel: "low" as "low" | "medium" | "high",
    riskScore: 15,
    nextEvent: "Накопление данных...",
    confidence: 0,
    recommendations: ["Ожидание данных от ML модели..."],
  });
  const [mlPrediction, setMlPrediction] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<
    Array<{
      time: number;
      type: "fhr" | "uc" | "contractions";
      severity: "warning" | "critical";
      description: string;
    }>
  >([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);

  // Состояние для управления видимостью страниц
  const [showAnalysisPage, setShowAnalysisPage] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [detailedAnalysisData, setDetailedAnalysisData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Типы сеансов КТГ
  const sessionTypes = [
    { value: "routine", label: "Плановое КТГ", color: "blue" },
    { value: "emergency", label: "Экстренное КТГ", color: "red" },
    { value: "prenatal", label: "Антенатальное КТГ", color: "green" },
    { value: "intrapartum", label: "Интранатальное КТГ", color: "orange" },
  ];

  // Обработчик клика по аномалии - переход к детальному анализу
  const handleAnomalyClick = (anomaly: any) => {
    setSelectedAnomaly(anomaly);
    // Создаем объект с данными для детального анализа
    const detailedDataObj = {
      anomaly,
      timestamp: new Date().toISOString(),
      patientInfo: {
        name: patientName,
        week: pregnancyWeek,
        day: gestationDay,
      },
      chartData: {
        fhr: fetalHeartRate.slice(
          Math.max(0, anomaly.time - 30),
          anomaly.time + 30
        ),
        uc: uterineContractions.slice(
          Math.max(0, anomaly.time - 30),
          anomaly.time + 30
        ),
        contractions: contractions.slice(
          Math.max(0, anomaly.time - 30),
          anomaly.time + 30
        ),
      },
    };

    // Переходим к странице детального анализа
    setDetailedAnalysisData(detailedDataObj);
    setShowDetailedAnalysis(true);
  };

  // Обработчик возврата с детального анализа
  const handleBackFromDetailedAnalysis = () => {
    setShowDetailedAnalysis(false);
    setDetailedAnalysisData(null);
  };

  // Обработчик возврата со страницы анализа
  const handleBackFromAnalysis = () => {
    setShowAnalysisPage(false);
    setAnalysisData(null);
  };

  // Управление записью (данные уже поступают через ML WebSocket)
  const handleStartStop = async () => {
    if (isRecording) {
      // Остановка записи и генератора
      console.log("⏹️ Stopping recording and generator...");
      try {
        await stopGenerator();
        setIsRecording(false);
        console.log("✅ Generator stopped successfully");
      } catch (error) {
        console.error("❌ Failed to stop generator:", error);
        // Все равно останавливаем запись локально
        setIsRecording(false);
      }
    } else {
      // Начало записи и запуск генератора
      if (mlConnected) {
        console.log("▶️ Starting recording and generator...");
        try {
          await startGenerator();
          setIsRecording(true);
          setSessionStartTime(dayjs().format("DD.MM.YYYY HH:mm:ss"));
          setRecordingTime(0);
          // Очищаем старые данные
          setFetalHeartRate([]);
          setUterineContractions([]);
          setContractions([]);
          setAnomalies([]);
          setStartTime(null); // Сбрасываем время начала
          console.log("✅ Generator started successfully");
        } catch (error) {
          console.error("❌ Failed to start generator:", error);
          alert(
            "Не удалось запустить генератор данных. Проверьте подключение."
          );
        }
      } else {
        console.error("❌ ML WebSocket not connected");
        alert(
          "ML сервис не подключен. Подождите подключения или перезагрузите страницу."
        );
      }
    }
  };

  const handleSave = () => {
    setIsRecording(false);
    const duration = `${Math.floor(recordingTime / 60)}:${(recordingTime % 60)
      .toString()
      .padStart(2, "0")}`;
    alert(
      `Данные КТГ сохранены.\nПациентка: ${patientName}\nСрок: ${pregnancyWeek}н ${gestationDay}д\nДлительность: ${duration}`
    );
  };

  const handleDelete = () => {
    if (window.confirm("Вы уверены, что хотите удалить текущую запись?")) {
      setIsRecording(false);
      setRecordingTime(0);
      setFetalHeartRate([]);
      setUterineContractions([]);
      setContractions([]);
      setAnomalies([]);
      setStartTime(null);
      setSessionStartTime("");
    }
  };

  const handleNewSession = () => {
    const confirmNew =
      !sessionStartTime ||
      window.confirm(
        "Начать новое обследование? Текущие данные будут очищены."
      );
    if (confirmNew) {
      setIsRecording(false);
      setRecordingTime(0);
      setFetalHeartRate([]);
      setUterineContractions([]);
      setContractions([]);
      setAnomalies([]);
      setStartTime(null);
      setSessionStartTime("");
    }
  };

  // 🔄 Обновляем данные графиков и ML предсказания из WebSocket
  useEffect(() => {
    if (!mlData || !mlData.data || !isRecording) return;

    // Инициализируем время начала записи при первых данных ТОЛЬКО если оно ещё не установлено
    if (startTime === null && mlData.secFromStart) {
      console.log(`⏰ Setting start time: ${mlData.secFromStart}`);
      setStartTime(mlData.secFromStart);
    }

    // Обновляем графики с реальными данными
    const newFHR = mlData.data.BPMChild || mlData.data.bpmChild || 140;
    const newUC = mlData.data.uterus || 20;
    const newSpasms = mlData.data.spasms || 10;

    setFetalHeartRate((prev) => [...prev.slice(-299), newFHR]);
    setUterineContractions((prev) => [...prev.slice(-299), newUC]);
    setContractions((prev) => [...prev.slice(-299), newSpasms]);

    // Обновляем ML предсказания если они есть
    if (mlData.prediction) {
      const pred = mlData.prediction;

      // Преобразуем hypoxia_risk в наш формат
      let riskLevel: "low" | "medium" | "high" = "low";
      if (pred.hypoxia_risk === "critical" || pred.hypoxia_risk === "high") {
        riskLevel = "high";
      } else if (pred.hypoxia_risk === "medium") {
        riskLevel = "medium";
      }

      // Генерируем текст следующего события
      const nextEventText =
        pred.hypoxia_risk === "low"
          ? "Стабильное состояние"
          : pred.hypoxia_risk === "medium"
          ? "Требуется наблюдение"
          : pred.hypoxia_risk === "high"
          ? "ВНИМАНИЕ! Высокий риск"
          : "ТРЕВОГА! Критический риск";

      setAiPredictions({
        riskLevel: riskLevel,
        riskScore: Math.round(pred.hypoxia_probability * 100),
        nextEvent: nextEventText,
        confidence: Math.round(pred.confidence * 100),
        recommendations:
          pred.recommendations.length > 0
            ? pred.recommendations
            : ["Продолжить мониторинг"],
      });

      // Сохраняем данные для MLPredictionPanel
      setMlPrediction(pred);

      // Создаем аномалии из реальных данных ML, а не из алертов
      if (pred.alerts && pred.alerts.length > 0) {
        const currentDataLength = fetalHeartRate.length;
        const currentFHR = newFHR;
        const currentUC = newUC;

        // Анализируем реальные критические значения из данных
        const isCriticalFHR = currentFHR < 90 || currentFHR > 180; // Реальная брадикардия/тахикардия
        const isCriticalUC = currentUC > 65; // Реальный гипертонус
        const isCriticalSpasms = newSpasms > 70; // Сильные схватки

        const newAnomalies: any[] = [];

        // Создаем аномалию только если есть реальная проблема в данных
        if (isCriticalFHR) {
          newAnomalies.push({
            time: Math.max(0, currentDataLength - 5), // Чуть раньше текущего момента
            type: "fhr" as const,
            severity:
              currentFHR < 80 || currentFHR > 200
                ? ("critical" as const)
                : ("warning" as const),
            description:
              currentFHR < 90
                ? `Брадикардия: ${currentFHR.toFixed(0)} уд/мин`
                : `Тахикардия: ${currentFHR.toFixed(0)} уд/мин`,
          });
        }

        if (isCriticalUC) {
          newAnomalies.push({
            time: Math.max(0, currentDataLength - 5),
            type: "uc" as const,
            severity: "critical" as const,
            description: `Гипертонус матки: ${currentUC.toFixed(0)} mmHg`,
          });
        }

        if (isCriticalSpasms) {
          newAnomalies.push({
            time: Math.max(0, currentDataLength - 5),
            type: "contractions" as const,
            severity: "warning" as const,
            description: `Интенсивные схватки: ${newSpasms.toFixed(0)} mmHg`,
          });
        }

        console.log(
          `🎯 Real anomalies detected: FHR=${currentFHR.toFixed(
            0
          )} UC=${currentUC.toFixed(0)} Spasms=${newSpasms.toFixed(0)}`
        );

        // Добавляем аномалии только если они реально есть
        if (newAnomalies.length > 0) {
          setAnomalies((prev) => {
            // Проверяем, есть ли уже похожие аномалии в последних записях
            const recentAnomalies = prev.slice(-5);
            const hasRecentSimilar = recentAnomalies.some(
              (existing) =>
                Math.abs(existing.time - (currentDataLength - 5)) < 15 && // В пределах 15 точек
                existing.type === newAnomalies[0]?.type
            );

            if (!hasRecentSimilar) {
              console.log(
                `➕ Adding ${newAnomalies.length} real anomalies at position ${
                  currentDataLength - 5
                }`
              );
              return [...prev.slice(-20), ...newAnomalies]; // Храним последние 20 аномалий
            } else {
              console.log(`⏭️ Skipping duplicate anomaly (similar exists)`);
              return prev;
            }
          });
        }
      }
    }
  }, [mlData, isRecording, startTime]);

  // Таймер записи (только для отображения времени)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  // Получение рискового статуса
  const getRiskStatus = () => {
    if (fetalHeartRate.length === 0) return { status: "ok", score: 0 };

    const currentFHR = fetalHeartRate[fetalHeartRate.length - 1];
    const currentUC = uterineContractions[uterineContractions.length - 1];

    let score = 0;
    if (currentFHR < 110 || currentFHR > 160) score += 30;
    if (currentUC > 80) score += 20;

    if (score >= 50) return { status: "danger", score };
    if (score >= 25) return { status: "warn", score };
    return { status: "ok", score };
  };

  const risk = getRiskStatus();

  // Читерская функция для принудительной генерации аномалии
  const generateCheatAnomaly = () => {
    const currentTime = fetalHeartRate.length;
    const anomalyTypes = [
      { type: "fhr", description: "Брадикардия плода", severity: "critical" },
      { type: "fhr", description: "Тахикардия плода", severity: "warning" },
      { type: "uc", description: "Гипертонус матки", severity: "critical" },
      {
        type: "contractions",
        description: "Патологические схватки",
        severity: "warning",
      },
    ];

    const randomAnomaly =
      anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];

    const newAnomaly = {
      time: currentTime,
      type: randomAnomaly.type as "fhr" | "uc" | "contractions",
      severity: randomAnomaly.severity as "warning" | "critical",
      description: randomAnomaly.description,
    };

    setAnomalies((prev) => {
      const updated = [...prev.slice(-10), newAnomaly];
      return updated;
    });
  };

  // Если показываем детальный анализ аномалии
  if (showDetailedAnalysis && detailedAnalysisData) {
    return (
      <DetailedAnomalyAnalysis
        data={detailedAnalysisData}
        onBack={handleBackFromDetailedAnalysis}
      />
    );
  }

  // Если показываем страницу анализа
  if (showAnalysisPage && analysisData) {
    return (
      <AnomalyAnalysisPage
        data={analysisData}
        onBack={handleBackFromAnalysis}
      />
    );
  }

  return (
    <div
      style={{
        padding: "12px",
        background: "linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Компактный заголовок страницы в розовой палитре */}
      <Card
        size="small"
        style={{ marginBottom: "10px" }}
        bodyStyle={{ padding: "8px 12px" }}
        headStyle={{
          padding: "6px 12px",
          minHeight: "auto",
          background: "linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)",
          borderBottom: "1px solid #f3e8ff",
        }}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar
                size={24}
                style={{
                  background:
                    "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                }}
                icon={<HeartOutlined />}
              />
              <span
                style={{ fontSize: "16px", fontWeight: 600, color: "#831843" }}
              >
                КТГ Мониторинг
              </span>
            </div>
            <Space size="small">
              <Tag
                color={isRecording ? "error" : "default"}
                className="text-sm"
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  background: isRecording ? "#fef2f2" : "#f8fafc",
                  color: isRecording ? "#dc2626" : "#64748b",
                  border: `1px solid ${isRecording ? "#fecaca" : "#e2e8f0"}`,
                }}
              >
                {isRecording ? "ЗАПИСЬ" : "ОСТАНОВЛЕНО"}
              </Tag>
              {/* ML индикатор */}
              <Tag
                color={mlConnected ? "success" : "default"}
                style={{
                  fontSize: "11px",
                  padding: "2px 6px",
                  background: mlConnected ? "#f0fdf4" : "#f8fafc",
                  color: mlConnected ? "#16a34a" : "#64748b",
                  border: `1px solid ${mlConnected ? "#bbf7d0" : "#e2e8f0"}`,
                }}
              >
                {mlConnected ? "🧠 ML" : "⚫ ML"}
              </Tag>
            </Space>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <UserOutlined style={{ color: "#ec4899", fontSize: "14px" }} />
              <span
                style={{ fontSize: "13px", fontWeight: 600, color: "#831843" }}
              >
                {patientName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ClockCircleOutlined
                style={{ color: "#ec4899", fontSize: "14px" }}
              />
              <span style={{ fontSize: "13px", color: "#831843" }}>
                {pregnancyWeek}н {gestationDay}д
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarOutlined
                style={{ color: "#ec4899", fontSize: "14px" }}
              />
              <span style={{ fontSize: "13px", color: "#831843" }}>
                {sessionDate.format("DD.MM.YYYY")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              style={{ fontSize: "14px", color: "#831843", fontWeight: "bold" }}
            >
              {Math.floor(recordingTime / 60)}:
              {(recordingTime % 60).toString().padStart(2, "0")}
            </span>
            <div
              className={`w-2 h-2 rounded-full ${
                isRecording ? "bg-red-500" : "bg-gray-400"
              } ${isRecording ? "animate-pulse" : ""}`}
            ></div>
          </div>
        </div>
      </Card>

      {/* Основная область с графиками и боковой панелью */}
      <Row gutter={[12, 12]}>
        {/* Графики КТГ - увеличенные для лучшего анализа */}
        <Col span={18}>
          <Card
            size="small"
            style={{ height: "600px" }}
            bodyStyle={{ height: "570px", padding: "8px" }}
            headStyle={{
              padding: "6px 12px",
              minHeight: "auto",
              background: "linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)",
              borderBottom: "1px solid #f3e8ff",
            }}
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <LineChartOutlined
                    style={{ color: "#ec4899", fontSize: "16px" }}
                  />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#831843",
                    }}
                  >
                    Графики КТГ
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#831843",
                        fontWeight: "bold",
                      }}
                    >
                      Базальная
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#ec4899",
                      }}
                    >
                      {fetalHeartRate.length > 10
                        ? Math.round(
                            fetalHeartRate
                              .slice(-10)
                              .reduce((a, b) => a + b, 0) / 10
                          )
                        : "--"}{" "}
                      bpm
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#831843",
                        fontWeight: "bold",
                      }}
                    >
                      Вариация
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#a21caf",
                      }}
                    >
                      {fetalHeartRate.length > 10
                        ? Math.round(
                            Math.max(...fetalHeartRate.slice(-10)) -
                              Math.min(...fetalHeartRate.slice(-10))
                          )
                        : "--"}{" "}
                      bpm
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {/* График ЧСС плода - розовый */}
              <CTGChart
                title="ЧСС плода"
                unit="bpm"
                color="#ec4899"
                minValue={100}
                maxValue={180}
                height="calc(33.33% - 4px)"
                data={fetalHeartRate}
                dangerRanges={[{ min: 110, max: 160 }]}
                chartType="fhr"
                anomalies={anomalies}
                onAnomalyClick={handleAnomalyClick}
              />

              {/* График тонуса матки - фиолетовый */}
              <CTGChart
                title="Тонус матки"
                unit="mmHg"
                color="#a21caf"
                minValue={0}
                maxValue={100}
                height="calc(33.33% - 4px)"
                data={uterineContractions}
                dangerRanges={[{ min: 0, max: 80 }]}
                chartType="uc"
                anomalies={anomalies}
                onAnomalyClick={handleAnomalyClick}
              />

              {/* График схваток - малиновый */}
              <CTGChart
                title="Схватки"
                unit="mmHg"
                color="#be185d"
                minValue={0}
                maxValue={80}
                height="calc(33.34% - 4px)"
                data={contractions}
                dangerRanges={[{ min: 0, max: 60 }]}
                chartType="contractions"
                anomalies={anomalies}
                onAnomalyClick={handleAnomalyClick}
              />
            </div>
          </Card>
        </Col>

        {/* Правая колонка - компактные виджеты в розовой палитре */}
        <Col span={6}>
          {/* ML Предсказания */}
          <MLPredictionPanel
            prediction={mlPrediction}
            isAccumulating={!mlPrediction}
          />

          {/* Управление */}
          <Card
            size="small"
            style={{ marginBottom: "10px" }}
            bodyStyle={{ padding: "8px" }}
            headStyle={{
              padding: "4px 8px",
              minHeight: "auto",
              background: "linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)",
              borderBottom: "1px solid #f3e8ff",
            }}
            title={
              <div className="flex items-center gap-2">
                <SettingOutlined
                  style={{ color: "#ec4899", fontSize: "14px" }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#831843",
                  }}
                >
                  Управление
                </span>
              </div>
            }
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Button
                type="primary"
                danger={isRecording}
                icon={
                  isRecording ? <PauseCircleOutlined /> : <PlayCircleOutlined />
                }
                onClick={handleStartStop}
                block
                size="small"
                style={{
                  background: isRecording
                    ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"
                    : "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "bold",
                  height: "32px",
                }}
              >
                {isRecording ? "Стоп" : "Старт"}
              </Button>

              <Button
                icon={<SaveOutlined />}
                onClick={handleSave}
                disabled={!sessionStartTime}
                block
                size="small"
                style={{
                  background: "#fef7ff",
                  borderColor: "#f3e8ff",
                  color: "#831843",
                  fontSize: "13px",
                  height: "32px",
                }}
              >
                Сохранить
              </Button>

              <Button
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                disabled={!sessionStartTime && !isRecording}
                block
                size="small"
                danger
                style={{
                  fontSize: "13px",
                  height: "32px",
                }}
              >
                Удалить
              </Button>

              <Button
                icon={<PlusOutlined />}
                onClick={handleNewSession}
                block
                size="small"
                type="dashed"
                style={{
                  borderColor: "#f3e8ff",
                  color: "#831843",
                  fontSize: "13px",
                  height: "32px",
                }}
              >
                Новое обследование
              </Button>
            </Space>
          </Card>

          {/* Панель обнаруженных аномалий */}
          <Card
            size="small"
            style={{ marginBottom: "10px" }}
            bodyStyle={{ padding: "8px" }}
            headStyle={{
              padding: "4px 8px",
              minHeight: "auto",
              background: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
              borderBottom: "1px solid #fecaca",
            }}
            title={
              <div className="flex items-center gap-2">
                <AlertOutlined
                  style={{
                    color: "#dc2626",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={generateCheatAnomaly}
                  className="hover:scale-110"
                  title="Создать тестовую аномалию"
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#831843",
                  }}
                >
                  Аномалии ({anomalies.length})
                </span>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
            }
          >
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {anomalies.length > 0 ? (
                anomalies.slice(-5).map((anomaly, index) => (
                  <div
                    key={index}
                    onClick={() => handleAnomalyClick(anomaly)}
                    style={{
                      padding: "6px 8px",
                      border: `1px solid ${
                        anomaly.severity === "critical" ? "#fecaca" : "#fef3c7"
                      }`,
                      borderRadius: "4px",
                      background:
                        anomaly.severity === "critical" ? "#fef2f2" : "#fefce8",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    className="hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {anomaly.severity === "critical" ? (
                          <ExclamationCircleOutlined
                            style={{ color: "#dc2626", fontSize: "14px" }}
                          />
                        ) : (
                          <WarningOutlined
                            style={{ color: "#d97706", fontSize: "14px" }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            color:
                              anomaly.severity === "critical"
                                ? "#dc2626"
                                : "#d97706",
                          }}
                        >
                          {anomaly.description}
                        </span>
                      </div>
                      <Tag
                        color={
                          anomaly.severity === "critical" ? "error" : "warning"
                        }
                        style={{
                          fontSize: "10px",
                          margin: 0,
                          padding: "1px 4px",
                        }}
                      >
                        {Math.floor(anomaly.time / 60)}:
                        {(anomaly.time % 60).toString().padStart(2, "0")}
                      </Tag>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Аномалии не обнаружены
                </div>
              )}
            </div>
          </Card>

          {/* Параметры сеанса - collapsed */}
          <Collapse
            size="small"
            ghost
            items={[
              {
                key: "1",
                label: (
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#831843",
                    }}
                  >
                    <SettingOutlined /> Параметры сеанса
                  </span>
                ),
                children: (
                  <div
                    className="space-y-2 p-2 rounded"
                    style={{
                      background:
                        "linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)",
                      border: "1px solid #f3e8ff",
                    }}
                  >
                    <div>
                      <Text
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#831843",
                        }}
                      >
                        ФИО:
                      </Text>
                      <Input
                        size="small"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        style={{ fontSize: "13px", marginTop: "2px" }}
                      />
                    </div>
                    <div>
                      <Text
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#831843",
                        }}
                      >
                        Тип КТГ:
                      </Text>
                      <Select
                        size="small"
                        value={sessionType}
                        onChange={setSessionType}
                        style={{ width: "100%", marginTop: "2px" }}
                      >
                        {sessionTypes.map((type) => (
                          <Option key={type.value} value={type.value}>
                            <span style={{ fontSize: "13px" }}>
                              {type.label}
                            </span>
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Text
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#831843",
                          }}
                        >
                          Недели:
                        </Text>
                        <Input
                          size="small"
                          type="number"
                          value={pregnancyWeek}
                          onChange={(e) =>
                            setPregnancyWeek(Number(e.target.value))
                          }
                          style={{ marginTop: "2px" }}
                        />
                      </div>
                      <div>
                        <Text
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#831843",
                          }}
                        >
                          Дни:
                        </Text>
                        <Input
                          size="small"
                          type="number"
                          value={gestationDay}
                          onChange={(e) =>
                            setGestationDay(Number(e.target.value))
                          }
                          style={{ marginTop: "2px" }}
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
}
