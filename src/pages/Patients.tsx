import { Card, List, Avatar } from 'antd';

const demo = [
  { name: 'Иванова Анна', gestation: '34 нед.' },
  { name: 'Петрова Мария', gestation: '38 нед.' },
  { name: 'Сидорова Елена', gestation: '30 нед.' },
];

export default function Patients() {
  return (
    <div className="p-6">
      <Card title="Пациенты">
        <List
          itemLayout="horizontal"
          dataSource={demo}
          renderItem={(p) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{p.name[0]}</Avatar>}
                title={p.name}
                description={`Срок: ${p.gestation}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
