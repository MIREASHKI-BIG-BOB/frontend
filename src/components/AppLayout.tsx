import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Dropdown, Space, Typography } from 'antd';
import NotificationBell from './NotificationBell';
import { colors, typography } from '../theme';
import {
  HeartOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  ProfileOutlined,
  HomeOutlined,
  BarChartOutlined,
  RobotOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState([
    {
      key: 'divider-1',
      type: 'divider' as const,
    },
    {
      key: '#/dashboard',
      icon: <DashboardOutlined />,
      label: 'Мониторинг',
    },
    {
      key: '#/patients',
      icon: <UserOutlined />,
      label: 'Пациенты',
    },
    {
      key: '#/ctg',
      icon: <LineChartOutlined />,
      label: 'КТГ',
    },
    {
      key: 'divider-2',
      type: 'divider' as const,
    },
    {
      key: '#/reports',
      icon: <BarChartOutlined />,
      label: 'Отчетность',
    },
    {
      key: 'divider-3',
      type: 'divider' as const,
    },
    {
      key: '#/notifications',
      icon: <BellOutlined />,
      label: 'Уведомления',
    },
    {
      key: '#/settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
  ]);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [collapsed]);

  const handleMenuClick = (e: { key: string }) => {
    onNavigate(e.key);
    // Auto-collapse on mobile after navigation
    if (isMobile) {
      setCollapsed(true);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, key: string) => {
    // Не даем перетаскивать разделители
    if (key.includes('divider')) {
      e.preventDefault();
      return;
    }
    setDraggedItem(key);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', key);
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== key && !key.includes('divider')) {
      setDragOverItem(key);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, dropKey: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === dropKey || dropKey.includes('divider')) {
      return;
    }

    const newItems = [...menuItems];
    const draggedIndex = newItems.findIndex(item => item.key === draggedItem);
    const dropIndex = newItems.findIndex(item => item.key === dropKey);
    
    if (draggedIndex !== -1 && dropIndex !== -1) {
      // Удаляем перетаскиваемый элемент
      const [draggedMenuItem] = newItems.splice(draggedIndex, 1);
      // Вставляем его в новую позицию
      newItems.splice(dropIndex, 0, draggedMenuItem);
      setMenuItems(newItems);
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Определяем активный ключ для меню
  const getActiveMenuKey = () => {
    if (currentRoute === '#/' || currentRoute === '#/dashboard') {
      return '#/dashboard';
    }
    return currentRoute;
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Профиль врача',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={240}
        collapsedWidth={isMobile ? 0 : 80}
        className="!bg-white shadow-lg"
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          transition: 'all 0.2s',
        }}
      >
        {/* Logo Area */}
        <div 
          className="h-16 flex items-center justify-center px-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => onNavigate('#/')}
        >
          <Space size="small" align="center">
            <HeartOutlined className="text-accent text-2xl" />
            {!collapsed && (
              <Text strong className="text-lg text-accent">
                HeraBEAT
              </Text>
            )}
          </Space>
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[getActiveMenuKey()]}
          onClick={handleMenuClick}
          className="border-r-0 mt-4"
          style={{
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {menuItems.map((item) => {
            if (item.key.includes('divider')) {
              return <Menu.Divider key={item.key} />;
            }
            
            const isDragging = draggedItem === item.key;
            const isDragOver = dragOverItem === item.key;
            
            return (
              <Menu.Item 
                key={item.key} 
                icon={item.icon}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item.key)}
                onDragOver={(e) => handleDragOver(e, item.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.key)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: isDragging ? 0.5 : 1,
                  transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  borderLeft: isDragOver ? `3px solid ${colors.status.info}` : 'none',
                  backgroundColor: isDragOver ? `rgba(24, 144, 255, 0.1)` : undefined,
                  cursor: isDragging ? 'move' : 'pointer'
                }}
              >
                {item.label}
              </Menu.Item>
            );
          })}
        </Menu>

        {/* Collapsed toggle hint */}
        {collapsed && !isMobile && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setCollapsed(false)}
              className="text-gray-400 hover:text-accent"
              size="small"
            />
          </div>
        )}
      </Sider>

      <Layout style={{ 
        marginLeft: collapsed ? (isMobile ? 0 : 80) : 240, 
        transition: 'margin-left 0.2s' 
      }}>
        {/* Top Header */}
        <Header className="!bg-white !px-6 !h-16 flex items-center justify-between shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <Space size="large" align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600 hover:text-accent hover:bg-gray-50 !w-10 !h-10 flex items-center justify-center"
              size="large"
            />
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <Text strong className="text-lg text-gray-800">
                {menuItems.find(item => item.key === getActiveMenuKey() && !item.key.includes('divider'))?.label || 'Медицинский мониторинг'}
              </Text>
            </div>
          </Space>

          <Space size="large" align="center">
            {/* Notifications */}
            <NotificationBell 
              onNavigateToNotifications={() => onNavigate('#/notifications')}
            />

            {/* User Profile */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                type="text" 
                className="hover:bg-gray-50 !h-auto !px-3 !py-2 flex items-center border border-transparent hover:border-gray-200 rounded-lg"
                style={{ height: 'auto' }}
              >
                <Space size="small" align="center">
                  <Avatar 
                    size={36}
                    style={{ backgroundColor: colors.risk.high }}
                    icon={<UserOutlined />}
                  />
                  {!isMobile && (
                    <div className="text-left ml-2">
                      <div className="text-sm font-semibold text-gray-800 leading-tight">
                        Др. Иванова А.С.
                      </div>
                      <div className="text-xs text-gray-500 leading-tight">
                        Акушер-гинеколог
                      </div>
                    </div>
                  )}
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        {/* Main Content */}
        <Content className="bg-gray-50 min-h-[calc(100vh-64px)]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;