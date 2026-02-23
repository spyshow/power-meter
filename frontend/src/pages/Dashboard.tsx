import { useState, useEffect } from 'react';
import { Row, Col, Spin, Typography } from 'antd';
import axios from 'axios';
import { DeviceCard } from '../components/DeviceCard';
import { useRealTimeData } from '../hooks/useRealTimeData';

const { Title } = Typography;

export const Dashboard = () => {
  const [devices, setDevices] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const realTimeData = useRealTimeData(devices);

  useEffect(() => {
    axios.get('http://localhost:3001/devices').then((res) => {
      setDevices(res.data);
      setLoading(res.data.length === 0);
    }).catch(err => {
      console.error("Failed to fetch devices", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Real-time Modbus Monitoring</Title>
      <Row gutter={[16, 16]}>
        {devices.map((device) => {
          const deviceData = realTimeData[device.id];
          return (
            <Col key={device.id} xs={24} sm={12} md={8} lg={8} xl={8}>
              <DeviceCard
                id={device.id}
                name={device.name}
                voltage={deviceData?.voltage || 0}
                current={deviceData?.current || 0}
                kva={deviceData?.kva || 0}
                status={deviceData?.status || 'offline'}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
