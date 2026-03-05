import React from 'react';
import { Card, Statistic, Row, Col, Badge, Typography, theme } from 'antd';
import { DashboardOutlined, ThunderboltOutlined, LineChartOutlined, DeploymentUnitOutlined, DotChartOutlined, PercentageOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

interface DeviceCardProps {
  id: number;
  name: string;
  voltage: number;
  current: number;
  activePower: number;
  reactivePower: number;
  apparentPower: number;
  powerFactor: number;
  status: 'online' | 'offline';
  onClick?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ 
  id, name, voltage, current, activePower, reactivePower, apparentPower, powerFactor, status, onClick 
}) => {
  const { token } = useToken();

  return (
    <Card
      hoverable
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DeploymentUnitOutlined style={{ color: token.colorPrimary }} />
          <Title level={4} style={{ margin: 0 }}>{name}</Title>
        </div>
      }
      extra={<Badge status={status === 'online' ? 'success' : 'error'} text={status.toUpperCase()} />}
      style={{
        width: '100%',
        borderRadius: '8px',
        borderTop: `4px solid ${status === 'online' ? token.colorSuccess : token.colorError}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
      onClick={onClick}
      actions={[
        <div key="view-details" onClick={(e) => { e.stopPropagation(); onClick?.(); }} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
          <LineChartOutlined />
          <Text>View History</Text>
        </div>
      ]}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic
            title={<Text type="secondary"><ThunderboltOutlined /> Voltage</Text>}
            value={voltage}
            suffix="V"
            precision={1}
            valueStyle={{ color: '#1668dc', fontSize: '18px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<Text type="secondary"><DashboardOutlined /> Current</Text>}
            value={current}
            suffix="A"
            precision={2}
            valueStyle={{ color: '#d89614', fontSize: '18px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<Text type="secondary"><ThunderboltOutlined /> Active P.</Text>}
            value={activePower}
            suffix="kW"
            precision={2}
            valueStyle={{ color: '#49aa19', fontSize: '18px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<Text type="secondary"><DotChartOutlined /> Reactive P.</Text>}
            value={reactivePower}
            suffix="kVAR"
            precision={2}
            valueStyle={{ color: '#eb2f96', fontSize: '18px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<Text type="secondary"><ThunderboltOutlined /> Apparent P.</Text>}
            value={apparentPower}
            suffix="kVA"
            precision={2}
            valueStyle={{ color: '#722ed1', fontSize: '18px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<Text type="secondary"><PercentageOutlined /> Power Factor</Text>}
            value={powerFactor}
            precision={2}
            valueStyle={{ color: '#13c2c2', fontSize: '18px' }}
          />
        </Col>
      </Row>
    </Card>
  );
};
