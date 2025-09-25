import { Card } from 'antd';

export default function TestDashboard() {
  return (
    <div className="p-6">
      <Card title="Тест дашборда">
        <p>Если вы видите это сообщение, значит роутинг работает!</p>
        <p>Текущий хэш: {location.hash}</p>
      </Card>
    </div>
  );
}