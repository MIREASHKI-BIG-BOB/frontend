import type { ThemeConfig } from 'antd';

// ========================================
// ЕДИНАЯ СИСТЕМА ДИЗАЙНА FIMEA
// Минималистичная, согласованная палитра
// ========================================

export const colors = {
  // Основной цвет - розовый (единая палитра)
  primary: '#ec4899',          // Основной розовый (pink-500)
  primaryDark: '#be185d',      // Темный розовый для акцентов (pink-700)
  primaryLight: '#fbcfe8',     // Светлый розовый для фонов (pink-200)
  primaryLighter: '#fce7f3',   // Очень светлый розовый (pink-100)
  primaryPale: '#fdf2f8',      // Бледный розовый для больших площадей (pink-50)
  
  // Семантические цвета (статус)
  success: '#22c55e',          // Зеленый - успех, норма (green-500)
  warning: '#f59e0b',          // Оранжевый - предупреждение (amber-500)
  error: '#ef4444',            // Красный - ошибка, опасность (red-500)
  info: '#06b6d4',             // Циан - информация (cyan-500)
  
  // Текст (градации серого)
  text: {
    primary: '#1f2937',        // Основной текст (gray-800)
    secondary: '#6b7280',      // Вторичный текст (gray-500)
    tertiary: '#9ca3af',       // Третичный текст (gray-400)
    disabled: '#d1d5db',       // Отключенный (gray-300)
    inverse: '#ffffff',        // Белый текст на темном фоне
  },
  
  // Фоны
  background: {
    primary: '#ffffff',        // Основной белый фон
    secondary: '#f9fafb',      // Светло-серый фон (gray-50)
    tertiary: '#f3f4f6',       // Третичный серый (gray-100)
    accent: '#fdf2f8',         // Розовый фон для акцентов
  },
  
  // Границы
  border: {
    light: '#f3f4f6',          // Светлая граница (gray-100)
    default: '#e5e7eb',        // Обычная граница (gray-200)
    dark: '#d1d5db',           // Темная граница (gray-300)
    grid: '#f1f5f9',           // Цвет сетки для графиков (slate-100)
    divider: '#e2e8f0',        // Разделители (slate-200)
  },
  
  // Дополнительные цвета для графиков и статусов
  chart: {
    primary: '#ec4899',        // Розовый для основного графика
    secondary: '#be185d',      // Темно-розовый для вторичного
    tertiary: '#a21caf',       // Фиолетовый для третьего графика
    fhr: '#ec4899',            // ЧСС плода - розовый
    uc: '#be185d',             // Тонус матки - темно-розовый  
    contractions: '#a21caf',   // Схватки - фиолетовый
  },
  
  // Статусы (алиасы для удобства)
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  },
  
  // Уровни риска
  risk: {
    low: '#22c55e',            // Зеленый - низкий риск
    medium: '#f59e0b',         // Оранжевый - средний риск
    high: '#ef4444',           // Красный - высокий риск
  },
};

// ========================================
// ЕДИНАЯ ТИПОГРАФИЧЕСКАЯ СИСТЕМА
// ========================================

export const typography = {
  // Размеры шрифтов - единая шкала
  fontSize: {
    xs: '11px',                // Очень мелкий
    sm: '12px',                // Мелкий (основной для UI)
    base: '14px',              // Базовый
    lg: '16px',                // Крупный
    xl: '18px',                // Очень крупный
    '2xl': '24px',             // Заголовок
    '3xl': '32px',             // Главный заголовок
  },
  
  // Толщина шрифта
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Межстрочный интервал
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // ЕДИНАЯ СИСТЕМА ОТСТУПОВ (кратно 4px)
  spacing: {
    xs: '4px',                 // 4px
    sm: '8px',                 // 8px
    md: '12px',                // 12px (основной)
    lg: '16px',                // 16px
    xl: '20px',                // 20px
    '2xl': '24px',             // 24px
    '3xl': '32px',             // 32px
  },
};

// ========================================
// КОНФИГУРАЦИЯ ТЕМЫ ANT DESIGN
// ========================================

export const theme: ThemeConfig = {
  token: {
    // Основные цвета
    colorPrimary: colors.primary,
    colorInfo: colors.info,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    
    // Текст
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextTertiary: colors.text.tertiary,
    colorTextDisabled: colors.text.disabled,
    
    // Фоны
    colorBgBase: colors.background.primary,
    colorBgContainer: colors.background.primary,
    colorBgElevated: colors.background.primary,
    
    // Границы
    colorBorder: colors.border.default,
    colorBorderSecondary: colors.border.light,
    
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

// ========================================
// УТИЛИТЫ ДЛЯ БЫСТРОГО ДОСТУПА
// ========================================

export const colorUtils = {
  text: colors.text,
  chart: colors.chart,
  status: colors.status,
  risk: colors.risk,
  border: colors.border,
  background: colors.background,
};