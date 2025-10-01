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
  RobotOutlined,
  RadarChartOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  FundOutlined,
  TeamOutlined
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
  const [openKeys, setOpenKeys] = useState<string[]>(['monitoring', 'analytics', 'management']);
  
  const menuItems = [
    {
      key: 'monitoring',
      icon: <ApiOutlined style={{ color: '#ec4899' }} />,
      label: 'Мониторинг устройства',
      type: 'submenu' as const,
      children: [
        {
          key: '#/dashboard',
          icon: <RadarChartOutlined />,
          label: 'Шайба (Live)',
          badge: true,
        },
      ],
    },
    {
      key: 'analytics',
      icon: <FundOutlined style={{ color: '#8b5cf6' }} />,
      label: 'Анализ данных',
      type: 'submenu' as const,
      children: [
        {
          key: '#/ctg',
          icon: <LineChartOutlined />,
          label: 'КТГ Анализ',
        },
        {
          key: '#/detailed-analysis',
          icon: <ThunderboltOutlined />,
          label: 'ИИ Анализ аномалий',
        },
        {
          key: '#/reports',
          icon: <FileTextOutlined />,
          label: 'Генерация отчётов',
        },
      ],
    },
    {
      key: 'management',
      icon: <TeamOutlined style={{ color: '#06b6d4' }} />,
      label: 'Управление',
      type: 'submenu' as const,
      children: [
        {
          key: '#/patients',
          icon: <UserOutlined />,
          label: 'Пациенты',
        },
        {
          key: '#/notifications',
          icon: <BellOutlined />,
          label: 'Уведомления',
        },
      ],
    },
    {
      key: 'divider-1',
      type: 'divider' as const,
    },
    {
      key: '#/settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
  ];

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

  // Определяем активный ключ для меню
  const getActiveMenuKey = () => {
    if (currentRoute === '#/' || currentRoute === '#/dashboard') {
      return '#/dashboard';
    }
    return currentRoute;
  };

  // Находим название активного пункта меню
  const getActiveMenuLabel = () => {
    for (const item of menuItems) {
      if (item.type === 'submenu' && item.children) {
        const found = item.children.find((child: any) => child.key === getActiveMenuKey());
        if (found) return found.label;
      }
      if (item.key === getActiveMenuKey()) {
        return item.label;
      }
    }
    return 'Медицинский мониторинг';
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
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
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
            
            if (item.type === 'submenu') {
              return (
                <Menu.SubMenu
                  key={item.key}
                  icon={item.icon}
                  title={item.label}
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {item.children?.map((child: any) => {
                    const isActive = getActiveMenuKey() === child.key;
                    return (
                      <Menu.Item
                        key={child.key}
                        icon={child.badge ? (
                          <Badge dot status="success" offset={[-2, 2]}>
                            {child.icon}
                          </Badge>
                        ) : child.icon}
                        style={{
                          fontWeight: child.badge && isActive ? 600 : undefined
                        }}
                      >
                        {child.label}
                      </Menu.Item>
                    );
                  })}
                </Menu.SubMenu>
              );
            }
            
            return (
              <Menu.Item 
                key={item.key} 
                icon={item.icon}
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
                {getActiveMenuLabel()}
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