import React, { useState, useEffect } from 'react';
import { Modal, Spin, Row, Col, Typography, Empty, Select } from 'antd';
import { Line } from '@ant-design/plots';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface Device {
  id: number;
  name: string;
}

interface HistoryData {
  _time: string;
  voltage: number;
  current: number;
  kva: number;
}

interface DeviceDetailsModalProps {
  device: Device | null;
  open: boolean;
  onClose: () => void;
}

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ device, open, onClose }) => {
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('1h');

  useEffect(() => {
    if (device && open) {
      setLoading(true);
      axios.get(`http://localhost:3001/history?deviceId=${device.id}&range=${range}`)
        .then(res => {
          setHistory(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch history", err);
          setLoading(false);
        });
    }
  }, [device, open, range]);

  if (!device) return null;

  const chartConfig = (data: any[], field: string, color: string, unit: string) => ({
    data,
    xField: '_time',
    yField: field,
    axis: {
      x: { labelFormatter: (v: string) => dayjs(v).format('HH:mm:ss') },
      y: { title: { text: `${field} (${unit})` } },
    },
    tooltip: {
      channel: 'y',
      valueFormatter: (v: number) => `${v.toFixed(2)} ${unit}`,
    },
    colorField: () => color,
    line: { style: { lineWidth: 2 } },
    animate: { enter: { type: 'fadeIn' } },
  });

  return (
    <Modal
      title={`${device.name} Details`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <div style={{ marginBottom: 16 }}>
        <Text>Time Range: </Text>
        <Select value={range} onChange={setRange} style={{ width: 120 }}>
          <Option value="15m">Last 15m</Option>
          <Option value="1h">Last 1h</Option>
          <Option value="6h">Last 6h</Option>
          <Option value="24h">Last 24h</Option>
        </Select>
      </div>

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      ) : history.length === 0 ? (
        <Empty description="No historical data found in this range" />
      ) : (
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Title level={4}>Voltage (V)</Title>
            <Line {...chartConfig(history, 'voltage', '#1890ff', 'V')} />
          </Col>
          <Col span={24}>
            <Title level={4}>Current (A)</Title>
            <Line {...chartConfig(history, 'current', '#52c41a', 'A')} />
          </Col>
          <Col span={24}>
            <Title level={4}>Power (kVA)</Title>
            <Line {...chartConfig(history, 'kva', '#faad14', 'kVA')} />
          </Col>
        </Row>
      )}
    </Modal>
  );
};
