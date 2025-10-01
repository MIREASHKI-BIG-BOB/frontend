// Единые стили для всех виджетов
export const WIDGET_STYLES = {
  // Padding
  padding: {
    widget: '8px',
    header: '8px 12px',
    innerBlock: '10px',
    card: '10px',
  },
  
  // Font sizes
  fontSize: {
    title: '12px',        // Заголовки виджетов
    large: '16px',        // Большие числа (батарея, ЧСС и т.д.)
    normal: '11px',       // Основной текст
    small: '10px',        // Вторичный текст (подписи)
    tiny: '9px',          // Мелкий текст (единицы измерения, время)
  },
  
  // Line height
  lineHeight: {
    comfortable: '1.4',
    normal: '1.3',
    compact: '1.2',
  },
  
  // Colors (розово-фиолетовая палитра)
  colors: {
    primary: '#ec4899',
    secondary: '#be185d',
    accent: '#a21caf',
    purple: '#8b5cf6',
    text: {
      primary: '#831843',
      secondary: '#6b7280',
      muted: '#9ca3af',
    },
    background: {
      gradient: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
      light: '#fef7ff',
      border: '#f3e8ff',
    }
  }
};
