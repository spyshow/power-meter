import { useState, useEffect } from 'react';
import { Row, Col, Spin, Typography, Alert, Card, Space, Tag, theme } from 'antd';
import axios from 'axios';
import { DeviceCard } from '../components/DeviceCard';
import { DeviceDetailsModal } from '../components/DeviceDetailsModal';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

export const Dashboard = () => {
  const { token } = useToken();
  const [devices, setDevices] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<{ id: number; name: string } | null>(null);
  const realTimeData = useRealTimeData(devices);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    axios.get('http://localhost:3001/devices').then((res) => {
      setDevices(res.data);
      setLoading(false);
    }).catch(err => {
      setError("Cannot connect to backend server. Please ensure the backend is running on port 3001.");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (Object.keys(realTimeData).length > 0) {
      setLastUpdate(new Date());
    }
  }, [realTimeData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: '16px' }}>
        <Spin size="large" />
        <Text strong>Initializing System Monitoring...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 24px 24px 24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        padding: '16px 24px',
        margin: '0 -24px 24px -24px',
        boxShadow: token.boxShadowTertiary
      }}>
        <Space direction="vertical" size={0}>
          <Title level={3} style={{ margin: 0 }}>MCGI Power Logger</Title>
          <Text type="secondary">Real-time power monitoring network</Text>
        </Space>
        <Space>
          <Tag color="blue" icon={<ReloadOutlined spin />}>
            Updated: {lastUpdate.toLocaleTimeString()}
          </Tag>
          <Tag color="green">SYSTEM LIVE</Tag>
        </Space>
      </div>
      
      {error && (
        <Alert 
          message="Communication Error" 
          description={error} 
          type="error" 
          showIcon 
          closable 
          style={{ marginBottom: 24 }} 
        />
      )}

      <Row gutter={[20, 20]}>
        {devices.map((device) => {
          const deviceData = realTimeData[device.id];
          return (
            <Col key={device.id} xs={24} sm={12} md={12} lg={8} xl={6}>
              <DeviceCard
                id={device.id}
                name={device.name}
                voltage={deviceData?.voltage || 0}
                current={deviceData?.current || 0}
                kva={deviceData?.kva || 0}
                status={deviceData?.status || 'offline'}
                onClick={() => setSelectedDevice(device)}
              />
            </Col>
          );
        })}
      </Row>

      <DeviceDetailsModal
        device={selectedDevice}
        open={!!selectedDevice}
        onClose={() => setSelectedDevice(null)}
        realTimeData={selectedDevice ? realTimeData[selectedDevice.id] : null}
      />
    </div>
  );
};
