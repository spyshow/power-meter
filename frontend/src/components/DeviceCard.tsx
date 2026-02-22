import React from 'react';
import { Card, Statistic, Row, Col, Badge, Typography } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface DeviceCardProps {
  id: number;
  name: string;
  voltage: number;
  current: number;
  kva: number;
  status: 'online' | 'offline';
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ id, name, voltage, current, kva, status }) => {
  return (
    <Card
      title={<Title level={4}>{name}</Title>}
      extra={<Badge status={status === 'online' ? 'success' : 'error'} text={status.toUpperCase()} />}
      style={{ width: '100%' }}
      actions={[
        <DashboardOutlined key="details" />,
      ]}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Statistic title="Voltage" value={voltage} suffix="V" precision={1} />
        </Col>
        <Col span={8}>
          <Statistic title="Current" value={current} suffix="A" precision={2} />
        </Col>
        <Col span={8}>
          <Statistic title="Power" value={kva} suffix="kVA" precision={2} />
        </Col>
      </Row>
    </Card>
  );
};
