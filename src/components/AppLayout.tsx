import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Dropdown, Space, Typography } from 'antd';
import NotificationBell from './NotificationBell';
import FimeaLogo from './FimeaLogo';
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
  TeamOutlined,
  MonitorOutlined
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
      icon: <MonitorOutlined style={{ fontSize: '16px' }} />,
      label: 'Мониторинг устройства',
      type: 'submenu' as const,
      children: [
        {
          key: '#/dashboard',
          icon: <RadarChartOutlined />,
          label: 'MoniPuck (Live)',
          badge: true,
        },
      ],
    },
    {
      key: 'analytics',
      icon: <FundOutlined style={{ fontSize: '16px' }} />,
      label: 'Анализ данных',
      type: 'submenu' as const,
      children: [
        {
          key: '#/ctg',
          icon: <LineChartOutlined />,
          label: 'КТГ Анализ',
        },
        {
          key: '#/ai-analysis',
          icon: <ThunderboltOutlined />,
          label: 'ИИ-Анализ сессий',
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
      icon: <TeamOutlined style={{ fontSize: '16px' }} />,
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
      icon: <SettingOutlined style={{ fontSize: '16px' }} />,
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
        collapsedWidth={isMobile ? 0 : 64}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          backgroundColor: '#ffffff',
          boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: `1px solid ${colors.border.light}`,
        }}
      >
        {/* Logo Area - с настоящим лого */}
        <div 
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 16px',
            borderBottom: `1px solid ${colors.border.light}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: 'linear-gradient(135deg, rgba(216, 98, 136, 0.05) 0%, rgba(216, 98, 136, 0.1) 100%)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(216, 98, 136, 0.1) 0%, rgba(216, 98, 136, 0.15) 100%)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(216, 98, 136, 0.05) 0%, rgba(216, 98, 136, 0.1) 100%)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onClick={() => onNavigate('#/')}
        >
          {collapsed ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              padding: '6px',
              boxShadow: '0 2px 8px rgba(216, 98, 136, 0.2)',
            }}>
              <FimeaLogo size={32} color="#D86288" />
            </div>
          ) : (
            <Space size="middle" align="center">
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 4px 12px rgba(216, 98, 136, 0.2)',
              }}>
                <FimeaLogo size={32} color="#D86288" />
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #D86288, #B83280)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.5px'
              }}>
                FIMEA
              </div>
            </Space>
          )}
        </div>

        {/* Navigation Menu - улучшенный стиль */}
        <Menu
          mode="inline"
          selectedKeys={[getActiveMenuKey()]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          onClick={handleMenuClick}
          className="border-r-0"
          style={{
            marginTop: '12px',
            padding: '0 8px',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: 'transparent',
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
        marginLeft: collapsed ? (isMobile ? 0 : 64) : 240, 
        transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: colors.background.secondary,
      }}>
        {/* Top Header - минималистичный */}
        <Header 
          style={{
            background: '#ffffff',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            borderBottom: `1px solid ${colors.border.light}`,
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <Space size="middle" align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.text.secondary,
                borderRadius: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.primary;
                e.currentTarget.style.backgroundColor = colors.primaryPale;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            />
            <div style={{ 
              width: '1px', 
              height: '24px', 
              background: colors.border.default 
            }} />
            <div>
              <Text strong style={{ 
                fontSize: '18px', 
                color: colors.text.primary,
                fontWeight: 600,
              }}>
                {getActiveMenuLabel()}
              </Text>
            </div>
          </Space>

          <Space size="middle" align="center">
            {/* Notifications */}
            <NotificationBell 
              onNavigateToNotifications={() => onNavigate('#/notifications')}
            />

            {/* User Profile - минималистичный */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                type="text" 
                style={{
                  height: 'auto',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid transparent`,
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primaryPale;
                  e.currentTarget.style.borderColor = colors.border.default;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <Space size="small" align="center">
                  <Avatar 
                    size={36}
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                    }}
                    icon={<UserOutlined />}
                  />
                  {!isMobile && (
                    <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        color: colors.text.primary,
                        lineHeight: '18px',
                      }}>
                        Др. Иванова А.С.
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.text.secondary,
                        lineHeight: '16px',
                      }}>
                        Акушер-гинеколог
                      </div>
                    </div>
                  )}
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        {/* Main Content - минималистичный */}
        <Content style={{
          background: colors.background.secondary,
          minHeight: 'calc(100vh - 64px)',
          padding: 0,
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;