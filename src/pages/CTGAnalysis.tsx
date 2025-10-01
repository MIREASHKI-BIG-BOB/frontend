import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { 
  LineChartOutlined, 
  HistoryOutlined, 
  SwapOutlined,
  FundOutlined
} from '@ant-design/icons';
import CTGPage from './CTG';

const { TabPane } = Tabs;

export default function CTGAnalysis() {
  const [activeTab, setActiveTab] = useState('current');

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
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
        }}
        bodyStyle={{ padding: '12px 24px' }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{
            marginBottom: 0,
            fontWeight: 600
          }}
        >
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LineChartOutlined style={{ fontSize: '18px' }} />
                <span>Текущий анализ</span>
              </span>
            }
            key="current"
          />
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HistoryOutlined style={{ fontSize: '18px' }} />
                <span>Архив КТГ</span>
              </span>
            }
            key="archive"
          />
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SwapOutlined style={{ fontSize: '18px' }} />
                <span>Сравнение сеансов</span>
              </span>
            }
            key="compare"
          />
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FundOutlined style={{ fontSize: '18px' }} />
                <span>Тренды</span>
              </span>
            }
            key="trends"
          />
        </Tabs>
      </Card>

      {/* Контент вкладок */}
      <div>
        {activeTab === 'current' && <CTGPage />}
        
        {activeTab === 'archive' && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HistoryOutlined style={{ color: '#8b5cf6', fontSize: '20px' }} />
                <span style={{ color: '#831843', fontWeight: 600 }}>Архив КТГ сеансов</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              <HistoryOutlined style={{ fontSize: '64px', color: '#8b5cf6', marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#831843' }}>
                Архив КТГ записей
              </p>
              <p>Все сохранённые КТГ сеансы с возможностью поиска и фильтрации</p>
            </div>
          </Card>
        )}

        {activeTab === 'compare' && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SwapOutlined style={{ color: '#06b6d4', fontSize: '20px' }} />
                <span style={{ color: '#831843', fontWeight: 600 }}>Сравнение КТГ сеансов</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              <SwapOutlined style={{ fontSize: '64px', color: '#06b6d4', marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#831843' }}>
                Сравнение показателей
              </p>
              <p>Выберите несколько сеансов для сравнения динамики показателей</p>
            </div>
          </Card>
        )}

        {activeTab === 'trends' && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FundOutlined style={{ color: '#ec4899', fontSize: '20px' }} />
                <span style={{ color: '#831843', fontWeight: 600 }}>Анализ трендов</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: '12px' }}
          >
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              <FundOutlined style={{ fontSize: '64px', color: '#ec4899', marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#831843' }}>
                Долгосрочные тренды
              </p>
              <p>Анализ изменений показателей за период наблюдения</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
