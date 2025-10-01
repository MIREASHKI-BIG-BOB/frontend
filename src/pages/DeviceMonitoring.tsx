import React, { useState } from 'react';
import { Tabs, Card, Badge } from 'antd';
import { 
  RadarChartOutlined, 
  HistoryOutlined, 
  SettingOutlined, 
  ApiOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import Dashboard from './Dashboard';

const { TabPane } = Tabs;

export default function DeviceMonitoring() {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div style={{ 
      padding: '16px',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
      minHeight: '100vh'
    }}>
      {/* Заголовок с табами */}
      <Card
        bordered={false}
        style={{ 
          marginBottom: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(236, 72, 153, 0.1)'
        }}
        bodyStyle={{ padding: '12px 24px' }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="small"
          tabBarStyle={{
            marginBottom: 0,
            fontWeight: 600,
            minHeight: '32px'
          }}
        >
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <RadarChartOutlined style={{ fontSize: '14px', color: '#ec4899' }} />
                <span>Live Мониторинг</span>
              </span>
            }
            key="live"
          />
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <HistoryOutlined style={{ fontSize: '14px', color: '#8b5cf6' }} />
                <span>История сеансов</span>
              </span>
            }
            key="history"
          />
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <SettingOutlined style={{ fontSize: '14px', color: '#06b6d4' }} />
                <span>Настройка устройства</span>
              </span>
            }
            key="settings"
          />
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <ApiOutlined style={{ fontSize: '14px', color: '#10b981' }} />
                <span>Статус подключения</span>
              </span>
            }
            key="status"
          />
        </Tabs>
      </Card>

      {/* Контент вкладок */}
      <div>
        {activeTab === 'live' && <Dashboard />}
        
        {activeTab === 'history' && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HistoryOutlined style={{ color: '#8b5cf6', fontSize: '18px' }} />
                <span style={{ color: '#831843', fontWeight: 600, fontSize: '15px' }}>История сеансов мониторинга</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { date: '01.10.2025', time: '14:23', duration: '45 мин', quality: 'Отлично', anomalies: 0 },
                { date: '01.10.2025', time: '09:15', duration: '42 мин', quality: 'Хорошо', anomalies: 1 },
                { date: '30.09.2025', time: '18:50', duration: '38 мин', quality: 'Отлично', anomalies: 0 },
                { date: '30.09.2025', time: '11:30', duration: '40 мин', quality: 'Хорошо', anomalies: 0 },
                { date: '29.09.2025', time: '16:45', duration: '43 мин', quality: 'Удовл.', anomalies: 2 },
              ].map((session, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
                  borderRadius: '8px',
                  border: '1px solid #f3e8ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#831843', marginBottom: '4px' }}>
                      {session.date} в {session.time}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Длительность: {session.duration}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '11px', 
                      color: session.quality === 'Отлично' ? '#10b981' : session.quality === 'Хорошо' ? '#8b5cf6' : '#f59e0b',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}>
                      {session.quality}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      Аномалий: {session.anomalies}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SettingOutlined style={{ color: '#06b6d4', fontSize: '18px' }} />
                <span style={{ color: '#831843', fontWeight: 600, fontSize: '15px' }}>Настройка устройства MoniPuck</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { title: 'Частота записи', value: '250 Гц', description: 'Частота дискретизации сигналов' },
                { title: 'Чувствительность допплера', value: 'Высокая', description: 'Уровень чувствительности датчика ЧСС' },
                { title: 'Порог уведомлений', value: 'Средний', description: 'Когда отправлять критические уведомления' },
                { title: 'Автоматическая калибровка', value: 'Включена', description: 'Автоподстройка при запуске сеанса' },
                { title: 'Качество связи', value: 'Bluetooth 5.0', description: 'Протокол передачи данных' },
                { title: 'Режим работы', value: 'Непрерывный', description: 'Домашний мониторинг 24/7' },
              ].map((setting, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
                  borderRadius: '8px',
                  border: '1px solid #f3e8ff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#831843' }}>
                      {setting.title}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#06b6d4' }}>
                      {setting.value}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {setting.description}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'status' && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ApiOutlined style={{ color: '#10b981', fontSize: '18px' }} />
                <span style={{ color: '#831843', fontWeight: 600, fontSize: '15px' }}>Технический статус подключения</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Статус подключения */}
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                borderRadius: '8px',
                border: '2px solid #bbf7d0',
                textAlign: 'center'
              }}>
                <ThunderboltOutlined style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px' }} />
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>
                  УСТРОЙСТВО ПОДКЛЮЧЕНО
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Стабильное соединение • Последние данные: 2 сек назад
                </div>
              </div>

              {/* Детальная информация */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Батарея', value: '87%', color: '#10b981', status: 'Отлично' },
                  { label: 'Сигнал Bluetooth', value: '92%', color: '#06b6d4', status: 'Отлично' },
                  { label: 'Качество данных', value: '5/5', color: '#8b5cf6', status: 'Отлично' },
                  { label: 'Температура', value: '36.8°C', color: '#ec4899', status: 'Норма' },
                  { label: 'Время работы', value: '4ч 23м', color: '#f59e0b', status: 'Активен' },
                  { label: 'Версия ПО', value: 'v2.1.3', color: '#64748b', status: 'Актуальна' },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    padding: '12px',
                    background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
                    borderRadius: '8px',
                    border: '1px solid #f3e8ff'
                  }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: item.color, marginBottom: '2px' }}>
                      {item.value}
                    </div>
                    <div style={{ fontSize: '10px', color: '#831843' }}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>

              {/* Информация о сеансе */}
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #fef7ff 0%, #ffffff 100%)',
                borderRadius: '8px',
                border: '1px solid #f3e8ff'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#831843', marginBottom: '8px' }}>
                  Текущий сеанс
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                  <span>Начало: 14:23</span>
                  <span>•</span>
                  <span>Пациентка: Иванова М.П.</span>
                  <span>•</span>
                  <span>Срок: 36н 4д</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
