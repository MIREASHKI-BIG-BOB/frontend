import { Card, Typography } from 'antd';
import { WifiOutlined, FilterOutlined, ExperimentOutlined, DashboardOutlined } from '@ant-design/icons';

const tech = [
  { icon: <WifiOutlined />, title: 'Беспроводное подключение', desc: 'BLE — стабильная и экономичная связь со смартфоном.' },
  { icon: <FilterOutlined />, title: 'Шумоподавление', desc: 'Очистка сигнала для точного сердечного ритма.' },
  { icon: <ExperimentOutlined />, title: 'Умное обнаружение', desc: 'Алгоритмы подскажут оптимальное положение датчика.' },
  { icon: <DashboardOutlined />, title: 'Широколучевой ультразвук', desc: 'Удобное сканирование без мед. навыков.' },
];

export default function Technologies() {
  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Typography.Title level={3}>Наши технологии</Typography.Title>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tech.map((t, i) => (
            <Card key={i} aria-label={`Технология: ${t.title}`}>
              <div className="text-accent text-2xl mb-2" aria-hidden>{t.icon}</div>
              <Typography.Title level={5} className="!mb-1">{t.title}</Typography.Title>
              <Typography.Paragraph className="!mb-0 text-secondary">{t.desc}</Typography.Paragraph>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
