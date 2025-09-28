import type { ThemeConfig } from 'antd';

// Палитра цветов приложения (остается ваша)
export const colors = {
  // Основные цвета
  primary: '#d46a92',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#1890ff',
  
  // Цвета текста
  text: {
    primary: '#1A1A1A',      // Основной текст
    secondary: '#9ca3af',    // Вторичный текст (описания, подписи)
    muted: '#6b7280',        // Приглушенный текст
    disabled: '#d1d5db',     // Отключенный текст
    accent: '#6a4162',       // Акцентный цвет для данных
  },
  
  // Цвета фона
  background: {
    primary: '#fefafa',      // Основной фон
    secondary: '#f9fafb',    // Вторичный фон
    card: '#ffffff',         // Фон карточек
    gray: '#e5e7eb',         // Серый фон для элементов
  },
  
  // Цвета для рисков
  risk: {
    low: '#10b981',          // 0-30% - Норма (зеленый)
    medium: '#f59e0b',       // 30-60% - Подозрение (желтый)
    high: '#e91e63',         // 60-100% - Критично (красный)
  },
  
  // Цвета для статусов
  status: {
    success: '#52c41a',      // Успех, норма
    warning: '#faad14',      // Предупреждение
    danger: '#ff4d4f',       // Опасность
    info: '#1890ff',         // Информация
    processing: '#1890ff',   // Обработка
    inactive: '#999999',     // Неактивно
  },
  
  // Цвета для графиков и данных
  chart: {
    primary: '#d46a92',      // Основной цвет графика
    secondary: '#1890ff',    // Вторичный цвет
    success: '#52c41a',      // Положительные значения
    warning: '#fa8c16',      // Предупреждающие значения
    danger: '#ff4d4f',       // Критические значения
    fhr: '#6a4162',          // Частота сердечных сокращений плода
    uc: '#1890ff',           // Маточные сокращения
    materialBlue: '#2196F3', // Material Design Blue
    materialGreen: '#4CAF50', // Material Design Green
    materialOrange: '#FF9800', // Material Design Orange
    materialRed: '#F44336',  // Material Design Red
  },
  
  // Цвета границ
  border: {
    primary: '#d9d9d9',      // Основные границы
    secondary: '#f0f0f0',    // Вторичные границы
    light: '#f0f0f0',        // Светлые границы
    grid: '#eee',            // Границы сетки
    divider: '#e8e8e8',      // Разделители
  },
  
  // Утилитарные цвета
  utility: {
    hover: '#fde7ef',        // Цвет при наведении
    active: '#f8b5c9',       // Активное состояние
    focus: '#e879a6',        // Фокус
    inactive: '#f5f5f5',     // Неактивное состояние
    positive: '#f6ffed',     // Положительный фон
    negative: '#fff2f0',     // Отрицательный фон
    warning: '#fffbe6',      // Предупреждающий фон
  }
};

// Конфигурация темы Ant Design
export const theme: ThemeConfig = {
  token: {
    // Основные цвета (ваша палитра)
    colorPrimary: colors.primary,
    colorInfo: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextTertiary: colors.text.muted,
    colorTextDisabled: colors.text.disabled,
    
    // Фоны (ваша палитра)
    colorBgBase: colors.background.primary,
    colorBgContainer: colors.background.card,
    colorBgElevated: colors.background.card,
    
    // Границы (ваша палитра)
    colorBorder: colors.border.primary,
    colorBorderSecondary: colors.border.secondary,
    
    // Типографика (более компактная система)
    fontSize: 12,                    // Базовый размер шрифта (уменьшен с 14 до 12)
    fontSizeHeading1: 32,            // h1 - очень большой (уменьшен)
    fontSizeHeading2: 26,            // h2 - большой (уменьшен)
    fontSizeHeading3: 20,            // h3 - средний (уменьшен)
    fontSizeHeading4: 16,            // h4 - обычный заголовок (уменьшен)
    fontSizeHeading5: 14,            // h5 - маленький заголовок (уменьшен)
    fontSizeSM: 11,                  // Маленький текст (уменьшен)
    fontSizeLG: 14,                  // Большой текст (уменьшен)
    fontSizeXL: 16,                  // Очень большой текст (уменьшен)
    
    // Отступы и размеры (Ant Design система)
    borderRadius: 6,                 // Скругление углов
    padding: 16,                     // Базовые отступы
    margin: 16,                      // Базовые отступы
    paddingSM: 12,                   // Маленькие отступы
    paddingLG: 24,                   // Большие отступы
    paddingXS: 8,                    // Очень маленькие отступы
    
    // Высота строк (Ant Design система)  
    lineHeight: 1.5715,              // Базовая высота строки
    lineHeightHeading1: 1.2105,      // Для больших заголовков
    lineHeightHeading2: 1.2667,      // Для средних заголовков  
    lineHeightHeading3: 1.3333,      // Для обычных заголовков
    lineHeightHeading4: 1.4,         // Для маленьких заголовков
    lineHeightHeading5: 1.5,         // Для самых маленьких заголовков
    
    // Семейства шрифтов (Ant Design система)
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
    fontFamilyCode: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
    
    // Веса шрифтов (стандартные)
    fontWeightStrong: 600,           // Жирный текст
  },
  components: {
    Typography: {
      titleMarginBottom: '0.5em',     // Отступ снизу у заголовков
      titleMarginTop: 0,              // Без отступа сверху
    },
  },
};

// Дополнительные утилиты для работы с цветами
export const colorUtils = {
  // Часто используемые цвета для быстрого доступа
  text: colors.text,
  chart: colors.chart,
  status: colors.status,
  risk: colors.risk,
  border: colors.border,
  background: colors.background,
};

// Временная совместимость со старой системой typography
// TODO: Постепенно заменить на использование Ant Design компонентов
export const typography = {
  fontSize: {
    xxs: '10px',
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '11px': '11px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  sizes: {
    cardPadding: '16px',
    cardHeight: {
      header: '54px',
    },
    components: {
      width100: '100%',
    },
  },
  styles: {
    h4: {
      fontSize: '16px',
      fontWeight: 600,
      color: colors.text.primary,
    },
    body: {
      fontSize: '14px',
      fontWeight: 400,
      color: colors.text.primary,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      color: colors.text.secondary,
    },
    button: {
      fontSize: '14px',
      fontWeight: 500,
    },
  }
};