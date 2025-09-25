import type { ThemeConfig } from 'antd';

// Палитра цветов приложения
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
    neutral: '#999999',      // Нейтральные значения
    fhr: '#6a4162',          // Цвет для FHR (частота сердцебиения плода)
    uc: '#f39db6',           // Цвет для UC (маточные сокращения)
    materialBlue: '#2196F3', // Material Design синий
  },

  // Цвета для фонов и границ
  border: {
    light: '#f0f0f0',        // Светлая граница
    medium: '#e5e7eb',       // Средняя граница  
    dark: '#d1d5db',         // Темная граница
    grid: '#eee',            // Сетка графиков
    divider: '#ddd',         // Разделительные линии
  },

  // Дополнительные служебные цвета
  utility: {
    hover: '#fde7ef',        // Розовый для hover эффектов
    inactive: '#999999',     // Неактивные элементы
    recording: '#52c41a',    // Запись активна
    notRecording: '#999999', // Запись не активна
    positive: '#3f8600',     // Положительная статистика
    negative: '#cf1322',     // Отрицательная статистика
    notification: '#e91e63', // Цвет уведомлений
  }
};

// Типографическая система
export const typography = {
  // Размеры шрифтов
  fontSize: {
    xxs: '10px',             // Очень мелкий текст
    xs: '12px',              // Мелкий текст, подписи
    sm: '14px',              // Базовый текст
    base: '16px',            // Основной размер
    lg: '18px',              // Крупный текст
    xl: '20px',              // Заголовки
    '2xl': '34px',           // Большие заголовки
    '3xl': '40px',           // Главные заголовки
    '11px': '11px',          // Специфичный размер для легенд графиков
  },
  
  // Толщина шрифта
  fontWeight: {
    normal: 400,             // Обычный текст
    medium: 500,             // Средний (подзаголовки)
    semibold: 600,           // Полужирный (важный текст)
    bold: 700,               // Жирный (заголовки)
  },
  
  // Межстрочный интервал
  lineHeight: {
    tight: 1.25,             // Плотный (1.25)
    normal: 1.5,             // Нормальный (1.5)
    relaxed: 1.75,           // Свободный (1.75)
  },
  
  // Отступы между элементами
  spacing: {
    xs: '4px',               // Минимальные отступы
    sm: '8px',               // Малые отступы
    base: '12px',            // Базовые отступы
    md: '16px',              // Средние отступы
    lg: '20px',              // Большие отступы
    xl: '24px',              // Очень большие отступы
  },

  // Размеры компонентов
  sizes: {
    cardPadding: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      combined: '8px 12px',    // Комбинированные отступы
    },
    cardHeight: {
      header: '40px',          // Высота заголовка карточки
    },
    components: {
      width100: '100px',       // Ширина 100px для мелких компонентов
    }
  },
  
  // Готовые стили для разных типов текста
  styles: {
    // Заголовки
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: 1.25,
      color: colors.text.primary,
      marginBottom: '16px',
    },
    h2: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.25,
      color: colors.text.primary,
      marginBottom: '12px',
    },
    h3: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.25,
      color: colors.text.primary,
      marginBottom: '8px',
    },
    h4: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: 1.25,
      color: colors.text.primary,
      marginBottom: '8px',
    },
    
    // Основной текст
    body: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
      color: colors.text.primary,
    },
    
    // Мелкий текст (подписи, описания)
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.25,
      color: colors.text.secondary,
    },
    
    // Подписи с увеличенным интерлиньяжем
    description: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
      color: colors.text.secondary,
    },
    
    // Мелкий приглушенный текст
    muted: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.25,
      color: colors.text.muted,
    },
    
    // Важный текст
    emphasis: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.5,
      color: colors.text.primary,
    },
    
    // Кнопки
    button: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.25,
    },
  }
};

export const theme: ThemeConfig = {
  token: {
    // Основные цвета
    colorPrimary: colors.primary,
    colorInfo: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextTertiary: colors.text.muted,
    colorTextDisabled: colors.text.disabled,
    
    // Фоны
    colorBgBase: colors.background.primary,
    colorBgContainer: colors.background.card,
    colorBgElevated: colors.background.card,
    
    // Типографика
    fontSize: parseInt(typography.fontSize.sm),
    fontSizeHeading1: parseInt(typography.fontSize['2xl']),
    fontSizeHeading2: parseInt(typography.fontSize.xl),
    fontSizeHeading3: parseInt(typography.fontSize.lg),
    fontSizeHeading4: parseInt(typography.fontSize.base),
    fontSizeHeading5: parseInt(typography.fontSize.sm),
    
    // Отступы и скругления
    borderRadius: 12,
    padding: parseInt(typography.spacing.sm),
    margin: parseInt(typography.spacing.sm),
    
    // Высота строк
    lineHeight: 1.5,
  },
  components: {
    Typography: {
      titleMarginBottom: typography.spacing.sm,
      titleMarginTop: 0,
    },
  },
};
