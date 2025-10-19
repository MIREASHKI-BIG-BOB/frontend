/**
 * API сервис для работы с сенсорами/генератором
 */

const API_BASE_URL = "/api";

/* ===================== Вспомогательные ===================== */

async function parseJsonSafe(resp: Response): Promise<any | null> {
  const ct = resp.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

async function parseTextSafe(resp: Response): Promise<string | null> {
  const ct = resp.headers.get("content-type") || "";
  if (ct.includes("application/json")) return null;
  try {
    return await resp.text();
  } catch {
    return null;
  }
}

/** Достаёт осмысленное сообщение об ошибке из тела ответа */
async function extractErrorMessage(resp: Response): Promise<string> {
  const data = await parseJsonSafe(resp);
  if (data && typeof data === "object") {
    // Частые форматы: { error: { message } } или { message }
    const jsonMsg =
      data?.error?.message ??
      data?.message ??
      data?.error ??
      null;
    if (typeof jsonMsg === "string" && jsonMsg.trim()) return jsonMsg.trim();
  }
  const text = await parseTextSafe(resp);
  if (text && text.trim()) return text.trim();
  return `HTTP ${resp.status}`;
}

/** true если ошибка бэка — «нормальная» (идемпотентная) */
function isBenignStop(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("already stopped") ||
    m.includes("not connected") ||
    m.includes("websocket not connected")
  );
}

function isBenignStart(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("already connected") ||
    m.includes("already running")
  );
}

/** Возвращает нормальный объект-ответ, даже если backend шлёт пустое тело */
async function okOrDefault(resp: Response, fallback: any) {
  const data = await parseJsonSafe(resp);
  return data ?? fallback;
}

/* ===================== Типы ===================== */

export interface SensorStartParams {
  /** Количество сенсоров для запуска (макс 3) */
  count?: number;
}

export interface SensorStartResponse {
  message: string;
  sensor?: {
    uuid: string;
    ip: string;
    connected: boolean;
  };
}

export interface SensorStopResponse {
  message: string;
}

/* ===================== Сенсоры ===================== */

/**
 * Запустить сенсоры
 * @param count - количество сенсоров (по умолчанию 1, максимум 3)
 */
export async function startSensors(
  count: number = 1
): Promise<SensorStartResponse> {
  const url = `${API_BASE_URL}/sensors/start?count=${Math.min(count, 3)}`;
  const resp = await fetch(url, { method: "GET", cache: "no-store" });

  if (!resp.ok) {
    const msg = await extractErrorMessage(resp);
    throw new Error(msg);
  }
  return okOrDefault(resp, { message: "Sensors started" });
}

/**
 * Остановить все сенсоры
 */
export async function stopSensors(): Promise<SensorStopResponse> {
  const resp = await fetch(`${API_BASE_URL}/sensors/stop`, {
    method: "GET",
    cache: "no-store",
  });

  if (!resp.ok) {
    const msg = await extractErrorMessage(resp);
    // Для сенсоров тоже можем быть идемпотентными
    if (isBenignStop(msg)) return { message: msg };
    throw new Error(msg);
  }
  return okOrDefault(resp, { message: "Sensors stopped" });
}

/**
 * Проверить здоровье API
 */
export async function checkHealth(): Promise<{ status: string }> {
  const resp = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    cache: "no-store",
  });

  if (!resp.ok) {
    const msg = await extractErrorMessage(resp);
    throw new Error(msg);
  }
  return okOrDefault(resp, { status: "ok" });
}

/* ===================== Генератор данных ===================== */

/**
 * Запустить генератор данных
 * Возвращает benign-успех, если генератор уже запущен на бэке.
 */
export async function startGenerator(): Promise<{ message?: string }> {
  const resp = await fetch("/gen-api/on", { method: "GET", cache: "no-store" });

  if (!resp.ok) {
    const msg = await extractErrorMessage(resp);
    if (isBenignStart(msg)) {
      console.warn("Generator already running — ignoring");
      return { message: msg };
    }
    throw new Error(msg);
  }

  return okOrDefault(resp, { message: "Generator started" });
}

/**
 * Остановить генератор данных
 * Возвращает benign-успех, если генератор уже остановлен/отключён.
 */
// Остановить генератор данных
export async function stopGenerator(): Promise<{ message?: string }> {
  try {
    const response = await fetch("/gen-api/off");
    if (!response.ok) {
      // пробуем прочитать тело ошибки
      let data: any = null;
      try { data = await response.json(); } catch {}
      const msg = data?.error?.message || "";
      // игнорируем «уже не подключен»
      if (msg.includes("not connected")) {
        console.warn("Generator already stopped — ignoring");
        return { message: "already_stopped" };
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const ct = response.headers.get("content-type");
    if (ct && ct.includes("application/json")) return await response.json();
    return { message: "Generator stopped" };
  } catch (err) {
    console.warn("Stop ignored:", err);
    return { message: "already_stopped" };
  }
}

