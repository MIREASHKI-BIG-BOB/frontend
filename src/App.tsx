import { Layout, Button, Typography, Space } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import FimeaLogo from './components/FimeaLogo';
import logoImg from './assets/logo.png';
import { colors } from './theme';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Technologies from './components/Technologies';
import Trust from './components/Trust';
import ProblemSolution from './components/ProblemSolution';
import DeviceShowcase from './components/DeviceShowcase';
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
import { MLDataProvider } from './contexts/MLDataContext';
import { useEffect, useState } from 'react';

const { Header, Content, Footer } = Layout;

export default function App() {
  const [route, setRoute] = useState<string>(location.hash || '#/');
  const [logoFailed, setLogoFailed] = useState(false);
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
    else if (isCTG) content = <CTGPage />;
    else if (isAIAnalysis) content = <AIAnalysis />;
    else if (isSettings) content = <Settings />;
    else if (isNotifications) content = <Notifications />;
    else if (isReports) content = <Reports />;

    return (
      <MLDataProvider>
        <AppLayout currentRoute={route} onNavigate={handleNavigate}>
          {content}
        </AppLayout>
      </MLDataProvider>
    );
  }

return (
  <Layout style={{ minHeight: '100%', background: '#fff' }}>
    <Header
      style={{
        background: colors.primary,
        padding: '12px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4">
        <Space size="large" align="center">
          {/* Локальный логотип из src/assets (fallback — FimeaLogo) */}
          <img
            src={logoImg}
            alt="FIMEA"
            style={{ height: 32, width: 'auto', display: logoFailed ? 'none' : 'block' }}
            onError={() => setLogoFailed(true)}
          />
          {logoFailed && <FimeaLogo size={28} color="white" />}
        </Space>

        <Button
          type="primary"
          size="large"
          style={{
            backgroundColor: 'white',
            color: colors.primary,
            border: 'none',
            borderRadius: 8,
            height: 44,
            fontWeight: 600,
            padding: '0 20px'
          }}
          onClick={() => (location.hash = '#/ctg')}
        >
          Начать <ArrowRightOutlined />
        </Button>
      </div>
    </Header>

    <Content style={{ background: '#fff' }}>
      <div className=''> {/* вертикальные интервалы между секциями */}
        <Hero />
        <DeviceShowcase />
        <ProblemSolution />
        <HowItWorks />
        <Technologies />
        <Trust />
      </div>
    </Content>

    <Footer
      style={{
        background: '#fff',
        borderTop: '1px solid #f1f1f1',
        padding: '24px 0',
      }}
    >
      <div className="mx-auto max-w-7xl text-secondary text-sm px-4">
        © {new Date().getFullYear()} FIMEA. Медицинская технология у вас на ладони.
      </div>
    </Footer>
  </Layout>
);

}
