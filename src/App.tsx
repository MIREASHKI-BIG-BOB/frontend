import { Layout, Button, Typography, Space } from 'antd';
import { HeartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { colors } from './theme';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Technologies from './components/Technologies';
import Trust from './components/Trust';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import DeviceMonitoring from './pages/DeviceMonitoring';
import CTGAnalysis from './pages/CTGAnalysis';
import TestDashboard from './pages/TestDashboard';
import Patients from './pages/Patients';
import Settings from './pages/Settings';
import CTGPage from './pages/CTG';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AIAnalysis from './pages/AIAnalysis';
import { useEffect, useState } from 'react';

const { Header, Content, Footer } = Layout;

export default function App() {
  const [route, setRoute] = useState<string>(location.hash || '#/');

  useEffect(() => {
    const onHash = () => setRoute(location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const isDashboard = route.startsWith('#/dashboard');
  const isPatients = route.startsWith('#/patients');
  const isCTG = route.startsWith('#/ctg');
  const isAIAnalysis = route.startsWith('#/ai-analysis');
  const isSettings = route.startsWith('#/settings');
  const isNotifications = route.startsWith('#/notifications');
  const isReports = route.startsWith('#/reports');
  
  const isAppRoute = isDashboard || isPatients || isCTG || isAIAnalysis || isSettings || isNotifications || isReports;

  const handleNavigate = (newRoute: string) => {
    location.hash = newRoute;
  };

  // Render app layout for dashboard routes
  if (isAppRoute) {
    let content;
    if (isDashboard) content = <DeviceMonitoring />;
    else if (isPatients) content = <Patients />;
    else if (isCTG) content = <CTGAnalysis />;
    else if (isAIAnalysis) content = <AIAnalysis />;
    else if (isSettings) content = <Settings />;
    else if (isNotifications) content = <Notifications />;
    else if (isReports) content = <Reports />;

    return (
      <AppLayout currentRoute={route} onNavigate={handleNavigate}>
        {content}
      </AppLayout>
    );
  }

  // Render landing page layout
  return (
    <Layout style={{ minHeight: '100%' }}>
      <Header className="!bg-accent">
        <div className="mx-auto max-w-7xl flex items-center justify-between py-2">
          <Space size="large" align="center">
            <HeartOutlined className="text-white text-2xl" aria-hidden />
            <Typography.Title level={3} className="!text-white !mb-0">HeraBEAT</Typography.Title>
          </Space>
          <Space>
            <Button type="primary" size="large" style={{backgroundColor: 'white', color: colors.text.accent}} onMouseOver={(e) => {e.currentTarget.style.backgroundColor = colors.utility.hover}} onMouseOut={(e) => {e.currentTarget.style.backgroundColor = 'white'}} aria-label="Открыть дешборд" onClick={() => (location.hash = '#/dashboard') }>
              Дешборд <ArrowRightOutlined />
            </Button>
          </Space>
        </div>
      </Header>
      <Content>
        <Hero />
        <HowItWorks />
        <Technologies />
        <Trust />
      </Content>
      <Footer className="bg-white">
        <div className="mx-auto max-w-7xl text-secondary text-sm">
          © {new Date().getFullYear()} HeraBEAT. Медицинская технология у вас на ладони.
        </div>
      </Footer>
    </Layout>
  );
}
