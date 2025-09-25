import { Segmented, Button, Tooltip, Dropdown, Menu, DatePicker, TimePicker, Select, Space, Typography } from 'antd';
import { SettingOutlined, SaveOutlined, UndoOutlined, PlusOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import PatientCard from '../widgets/PatientCard';
import CTGChartSimple from '../widgets/CTGChartSimple';
import AlertPanel from '../widgets/AlertPanel';
import QuickStats from '../widgets/QuickStats';
import RecentPatients from '../widgets/RecentPatients';
import TrendsChart from '../widgets/TrendsChart';
import { useEffect, useState, useMemo } from 'react';
import { AlertSystem } from '../utils/AlertSystem';
import { NotificationService } from '../utils/NotificationService';
import { Responsive, WidthProvider, Layout as RGLLayout } from 'react-grid-layout';
import dayjs from 'dayjs';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardLayout extends RGLLayout {
  i: string;
  component: string;
  title: string;
}

const defaultLayouts = {
  lg: [
    { i: 'patient', x: 0, y: 0, w: 3, h: 6.5, component: 'PatientCard', title: 'Пациентка' },
    { i: 'ctg', x: 3, y: 0, w: 6, h: 7, component: 'CTGChart', title: 'КТГ Мониторинг' },
    { i: 'alerts', x: 9, y: 0, w: 3, h: 6, component: 'AlertPanel', title: 'Уведомления' },
    { i: 'quickstats', x: 0, y: 7, w: 3, h: 3.5, component: 'QuickStats', title: 'Статистика' },
    { i: 'trends', x: 3, y: 7, w: 6, h: 3, component: 'TrendsChart', title: 'Тренды' },
    { i: 'recent', x: 9, y: 7, w: 3, h: 4, component: 'RecentPatients', title: 'Последние пациентки' },
  ],
  md: [
    { i: 'patient', x: 0, y: 0, w: 4, h: 6, component: 'PatientCard', title: 'Пациентка' },
    { i: 'ctg', x: 4, y: 0, w: 8, h: 7, component: 'CTGChart', title: 'КТГ Мониторинг' },
    { i: 'alerts', x: 0, y: 6, w: 4, h: 5, component: 'AlertPanel', title: 'Уведомления' },
    { i: 'quickstats', x: 4, y: 7, w: 4, h: 3, component: 'QuickStats', title: 'Статистика' },
    { i: 'trends', x: 8, y: 7, w: 4, h: 4, component: 'TrendsChart', title: 'Тренды' },
    { i: 'recent', x: 0, y: 11, w: 4, h: 4, component: 'RecentPatients', title: 'Последние пациентки' },
  ],
  sm: [
    { i: 'patient', x: 0, y: 0, w: 6, h: 6, component: 'PatientCard', title: 'Пациентка' },
    { i: 'ctg', x: 0, y: 6, w: 6, h: 7, component: 'CTGChart', title: 'КТГ Мониторинг' },
    { i: 'alerts', x: 0, y: 13, w: 6, h: 5, component: 'AlertPanel', title: 'Уведомления' },
    { i: 'quickstats', x: 0, y: 18, w: 6, h: 3, component: 'QuickStats', title: 'Статистика' },
    { i: 'trends', x: 0, y: 21, w: 6, h: 4, component: 'TrendsChart', title: 'Тренды' },
    { i: 'recent', x: 0, y: 25, w: 6, h: 4, component: 'RecentPatients', title: 'Последние пациентки' },
  ],
  xs: [
    { i: 'patient', x: 0, y: 0, w: 4, h: 6, component: 'PatientCard', title: 'Пациентка' },
    { i: 'ctg', x: 0, y: 6, w: 4, h: 7, component: 'CTGChart', title: 'КТГ Мониторинг' },
    { i: 'alerts', x: 0, y: 13, w: 4, h: 5, component: 'AlertPanel', title: 'Уведомления' },
    { i: 'quickstats', x: 0, y: 18, w: 4, h: 3, component: 'QuickStats', title: 'Статистика' },
    { i: 'trends', x: 0, y: 21, w: 4, h: 4, component: 'TrendsChart', title: 'Тренды' },
    { i: 'recent', x: 0, y: 25, w: 4, h: 4, component: 'RecentPatients', title: 'Последние пациентки' },
  ]
};

const { Text } = Typography;

export default function Dashboard() {
  const [fps, setFps] = useState<number>(250);
  const [winSec, setWinSec] = useState<number>(180);
  const [risk, setRisk] = useState<'ok' | 'warn' | 'danger'>('ok');
  const [riskScore, setRiskScore] = useState<number>(0);
  const [recSec, setRecSec] = useState<number>(0);
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Простые поля для выбора сеанса
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [sessionType, setSessionType] = useState('monitoring');

  const alertSystem = useMemo(() => new AlertSystem(), []);
  const notificationService = useMemo(() => new NotificationService(), []);

  useEffect(() => {
    let interval: number;
    if (recSec > 0 || true) { // Always run for demo
      interval = setInterval(() => {
        setRecSec(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recSec]);

  // Subscribe to alerts and show notifications
  useEffect(() => {
    const unsubscribe = alertSystem.subscribe((alerts) => {
      alerts.forEach(alert => {
        notificationService.showNotification(
          alert.title + ': ' + (alert.reasons ? alert.reasons.join(', ') : 'Медицинская тревога')
        );
      });
    });

    return unsubscribe;
  }, [alertSystem, notificationService]);

  // Load saved layouts from localStorage
  useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    if (savedLayouts) {
      try {
        setLayouts(JSON.parse(savedLayouts));
      } catch (e) {
        console.warn('Failed to parse saved layouts, using defaults');
      }
    }
  }, []);

  const handleLayoutChange = (layout: RGLLayout[], allLayouts: any) => {
    if (isEditMode) {
      setLayouts(allLayouts);
    }
  };

  const saveLayout = () => {
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
    setIsEditMode(false);
    // Show notification about saving
    notificationService.showNotification('Раскладка сохранена');
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    localStorage.removeItem('dashboard-layouts');
    // Принудительно перерисовываем компонент
    setIsEditMode(false);
    setTimeout(() => {
      window.location.hash = window.location.hash; // Refresh current route
    }, 100);
    notificationService.showNotification('Раскладка сброшена к стандартной');
  };

  // Функция для получения правильного виджета по ID
  const getWidgetById = (id: string) => {
    switch (id) {
      case 'patient':
        return (
          <PatientCard 
            risk={riskScore} 
            spo2={98}
            movements={12}
            recordingSec={recSec}
          />
        );
      case 'ctg':
        return (
          <CTGChartSimple 
            fpsMs={fps} 
            windowLengthSec={winSec} 
            onRiskChange={(risk, score) => {
              setRisk(risk);
              setRiskScore(score);
            }}
            alertSystem={alertSystem}
          />
        );
      case 'alerts':
        return <AlertPanel alertSystem={alertSystem} />;
      case 'quickstats':
        return (
          <QuickStats 
            patientsTotal={8}
            activeMonitoring={6}
            avgHeartRate={Math.round(75 + Math.sin(recSec / 10) * 5)}
            alertsToday={3}
          />
        );
      case 'trends':
        return <TrendsChart height={120} />;
      case 'recent':
        return <RecentPatients />;
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <div>Неизвестный виджет</div>
            <div className="text-xs">ID: {id}</div>
          </div>
        );
    }
  };

  const getTitleById = (id: string) => {
    const titles: { [key: string]: string } = {
      'patient': 'Пациентка',
      'ctg': 'КТГ Мониторинг',
      'alerts': 'Уведомления',
      'quickstats': 'Статистика',
      'trends': 'Тренды',
      'recent': 'Последние пациентки'
    };
    return titles[id] || 'Неизвестный виджет';
  };

  const renderWidget = (layoutItem: RGLLayout) => {
    const commonStyle = {
      background: 'white',
      borderRadius: '8px',
      overflow: 'hidden' as const,
      boxShadow: isEditMode ? '0 4px 12px rgba(233, 30, 99, 0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
      border: isEditMode ? '2px dashed #e91e63' : '1px solid #f0f0f0',
      transition: 'all 0.2s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
    };

    const labelColors: { [key: string]: string } = {
      'patient': 'bg-blue-500',
      'ctg': 'bg-green-500',
      'alerts': 'bg-orange-500',
      'quickstats': 'bg-purple-500',
      'trends': 'bg-indigo-500',
      'recent': 'bg-pink-500',
    };

    return (
      <div style={commonStyle} className={isEditMode ? 'cursor-move' : ''}>
        {isEditMode && (
          <div className={`absolute top-2 left-2 z-50 ${labelColors[layoutItem.i] || 'bg-gray-500'} text-white text-xs px-2 py-1 rounded shadow-lg`}>
            {getTitleById(layoutItem.i)}
          </div>
        )}
        <div className="flex-1 w-full h-full">
          {getWidgetById(layoutItem.i)}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Control Panel */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            type={isEditMode ? "primary" : "default"}
            icon={<SettingOutlined />}
            onClick={() => setIsEditMode(!isEditMode)}
            style={isEditMode ? { backgroundColor: '#e91e63', borderColor: '#e91e63' } : {}}
          >
            {isEditMode ? 'Режим редактирования' : 'Настроить виджеты'}
          </Button>
          
          {isEditMode && (
            <>
              <Tooltip title="Сохранить текущую раскладку">
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={saveLayout}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Сохранить
                </Button>
              </Tooltip>
              
              <Tooltip title="Сбросить к стандартной раскладке">
                <Button 
                  icon={<UndoOutlined />} 
                  onClick={resetLayout}
                  danger
                >
                  Сбросить
                </Button>
              </Tooltip>
            </>
          )}
        </div>
        
        {isEditMode && (
          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            💡 Перетащите виджеты, измените размер или добавьте новые. Настройки сохраняются автоматически.
          </div>
        )}
      </div>

      {/* Простой выбор сеанса */}
      <div style={{ 
        background: 'white', 
        padding: '16px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        marginBottom: '16px',
        border: '1px solid #f0f0f0'
      }}>
        <Space size="large" wrap>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <Text type="secondary">Дата:</Text>
            <DatePicker 
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || dayjs())}
              format="DD.MM.YYYY"
              size="small"
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClockCircleOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary">Время:</Text>
            <TimePicker 
              value={selectedTime}
              onChange={(time) => setSelectedTime(time || dayjs())}
              format="HH:mm"
              size="small"
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text type="secondary">Тип сеанса:</Text>
            <Select
              value={sessionType}
              onChange={setSessionType}
              size="small"
              style={{ width: 200 }}
              options={[
                { value: 'monitoring', label: 'Мониторинг плода' },
                { value: 'stress', label: 'Стресс-тест' },
                { value: 'nst', label: 'НСТ (нестрессовый тест)' },
                { value: 'cst', label: 'КСТ (контрактильный стресс-тест)' }
              ]}
            />
          </div>
          
          <Text style={{ color: '#666' }}>
            Сеанс: {selectedDate.format('DD.MM.YYYY')} в {selectedTime.format('HH:mm')}
          </Text>
        </Space>
      </div>

      {/* Responsive Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4 }}
        rowHeight={50}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        compactType="vertical"
        preventCollision={false}
        autoSize={true}
        verticalCompact={true}
      >
        {layouts.lg.map((layoutItem) => (
          <div key={layoutItem.i} className="widget-container">
            {renderWidget(layoutItem)}
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Custom CSS для стилизации grid layout */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .react-grid-item.react-grid-placeholder {
          background: rgba(233, 30, 99, 0.1) !important;
          border: 2px dashed #e91e63 !important;
          border-radius: 8px !important;
        }
        
        .react-grid-item > .react-resizable-handle {
          opacity: ${isEditMode ? '1' : '0'} !important;
          background-color: #e91e63 !important;
          z-index: 60 !important;
        }
        
        .react-grid-item > .react-resizable-handle::after {
          border-color: white !important;
        }
        
        .widget-container {
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .widget-container > div {
          height: 100%;
          flex: 1;
          min-height: 0;
        }
        
        .react-grid-item:hover > .react-resizable-handle {
          opacity: ${isEditMode ? '1' : '0'} !important;
        }
        
        .layout {
          min-height: auto;
        }
        
        .react-grid-layout {
          position: relative;
        }
        
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top, width, height;
        }
        
        .react-grid-item.cssTransforms {
          transition-property: transform, width, height;
        }
        
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
          cursor: se-resize;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGcgZmlsbD0iIzk5OSI+PGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjEiLz48Y2lyY2xlIGN4PSIxIiBjeT0iNSIgcj0iMSIvPjxjaXJjbGUgY3g9IjUiIGN5PSIxIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=');
          background-position: bottom right;
          background-repeat: no-repeat;
          background-origin: content-box;
        }
        
        .react-grid-item.react-draggable-dragging {
          transition: none !important;
          z-index: 3 !important;
          will-change: transform;
        }
        
        .react-grid-item.resizing {
          z-index: 1;
          will-change: width, height;
        }
        `
      }} />
    </div>
  );
}