import { Button, Card, Typography } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

export default function Hero() {
  return (
    <section className="bg-hero-gradient">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-8 items-center py-16 px-4 md:px-6">
        <div>
          <Typography.Title className="!text-4xl md:!text-5xl !mb-4 !leading-tight">
            Медицинская технология у вас на ладони
          </Typography.Title>
          <Typography.Paragraph className="!text-lg text-secondary !mb-6">
            HeraBEAT — медицинский фетальный монитор, который позволяет слышать и отслеживать
            сердцебиение ребёнка дома. Точность клинического уровня и уверенность для будущих мам.
          </Typography.Paragraph>
          <div className="flex flex-wrap gap-3">
            <Button type="primary" size="large" aria-label="Начать работу">Начать</Button>
            <Button size="large" icon={<PlayCircleOutlined />} aria-label="Смотреть демо">Демо</Button>
          </div>
        </div>
        <div aria-label="Изображение устройства и приложения" className="">
          <Card className="shadow-xl border-0">
            <div className="aspect-[16/10] w-full rounded-lg bg-chartBg flex items-center justify-center">
              <div className="text-secondary">[ Место для фото устройства/мамы со смартфоном ]</div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
