import { Card, Typography } from 'antd';
import { MobileOutlined, AimOutlined, SoundOutlined, ShareAltOutlined } from '@ant-design/icons';

const steps = [
  { icon: <MobileOutlined />, title: 'Подключите', desc: 'Соедините HeraBEAT со смартфоном по Bluetooth.' },
  { icon: <AimOutlined />, title: 'Установите', desc: 'Расположите датчик на животе — система подскажет оптимальное место.' },
  { icon: <SoundOutlined />, title: 'Слушайте', desc: 'В реальном времени наблюдайте и слушайте сердцебиение ребёнка.' },
  { icon: <ShareAltOutlined />, title: 'Делитесь', desc: 'Отправляйте результаты врачу прямо из приложения.' },
];

export default function HowItWorks() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Typography.Title level={3}>Как это работает</Typography.Title>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <Card key={i} aria-label={`Шаг ${i + 1}: ${s.title}`}>
              <div className="text-accent text-2xl mb-2" aria-hidden>{s.icon}</div>
              <Typography.Title level={5} className="!mb-1">{s.title}</Typography.Title>
              <Typography.Paragraph className="!mb-0 text-secondary">{s.desc}</Typography.Paragraph>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
