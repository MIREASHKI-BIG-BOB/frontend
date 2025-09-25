import { Typography, Tag, Card } from 'antd';

export default function Trust() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Typography.Title level={3}>Рекомендовано врачами</Typography.Title>
        <Typography.Paragraph className="text-secondary">
          Над решением работают специалисты совместно с клиниками и профильными экспертами.
        </Typography.Paragraph>
        <Card className="mt-6">
          <div className="flex flex-wrap gap-3" aria-label="Логотипы партнёров (заглушки)">
            <Tag color="blue">Медцентр №1</Tag>
            <Tag color="green">Клиника MaterCare</Tag>
            <Tag color="gold">Perinatal Lab</Tag>
            <Tag color="purple">Fetal Research</Tag>
          </div>
        </Card>
      </div>
    </section>
  );
}
