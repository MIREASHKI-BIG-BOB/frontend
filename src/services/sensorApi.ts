/**
 * API сервис для работы с сенсорами
 */

const API_BASE_URL = "/api";

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

/**
 * Запустить сенсоры
 * @param count - количество сенсоров (по умолчанию 1, максимум 3)
 */
export async function startSensors(
  count: number = 1
): Promise<SensorStartResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sensors/start?count=${Math.min(count, 3)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error starting sensors:", error);
    throw error;
  }
}

/**
 * Остановить все сенсоры
 */
export async function stopSensors(): Promise<SensorStopResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sensors/stop`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error stopping sensors:", error);
    throw error;
  }
}

/**
 * Проверить здоровье API
 */
export async function checkHealth(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking health:", error);
    throw error;
  }
}

/**
 * Запустить генератор данных
 */
export async function startGenerator(): Promise<{ message?: string }> {
  try {
    const response = await fetch("/gen-api/on");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Генератор может вернуть пустой ответ или JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return { message: "Generator started" };
  } catch (error) {
    console.error("Error starting generator:", error);
    throw error;
  }
}

/**
 * Остановить генератор данных
 */
export async function stopGenerator(): Promise<{ message?: string }> {
  try {
    const response = await fetch("/gen-api/off");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Генератор может вернуть пустой ответ или JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return { message: "Generator stopped" };
  } catch (error) {
    console.error("Error stopping generator:", error);
    throw error;
  }
}
