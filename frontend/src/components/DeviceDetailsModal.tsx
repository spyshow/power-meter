import React, { useState, useEffect, useRef } from 'react';
import { Modal, Spin, Row, Col, Typography, Empty, Select, theme, Space } from 'antd';
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
  activePower: number;
  reactivePower: number;
  apparentPower: number;
  powerFactor: number;
}

interface DeviceDetailsModalProps {
  device: Device | null;
  open: boolean;
  onClose: () => void;
  realTimeData?: any | null;
}

const LiveLineChart = ({ data, field, color, unit, displayName, isReallyDark, contrastColor }: any) => {
  const chartRef = useRef<any>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (chartRef.current && mousePosRef.current) {
      const { x, y } = mousePosRef.current;
      const timer = setTimeout(() => {
        if (chartRef.current && mousePosRef.current) {
          chartRef.current.emit('tooltip:show', { x, y });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const config = {
    data,
    xField: (d: any) => new Date(d._time),
    yField: field,
    paddingLeft: 60,
    paddingRight: 20,
    theme: isReallyDark ? 'dark' : 'light',
    scale: { x: { type: 'time' } },
    axis: {
      x: {
        title: { text: 'Time', style: { fill: contrastColor, fillOpacity: 1, fontWeight: 'bold' } },
        label: { style: { fill: contrastColor, fillOpacity: 1 }, formatter: (v: any) => dayjs(v).format('HH:mm:ss'), autoHide: true },
        tickCount: 5,
      },
      y: {
        title: { text: `${displayName} (${unit})`, style: { fill: contrastColor, fillOpacity: 1, fontWeight: 'bold' } },
        label: { style: { fill: contrastColor, fillOpacity: 1 } },
      },
    },
    tooltip: {
      title: (d: any) => dayjs(d._time).format('YYYY-MM-DD HH:mm:ss'),
      items: [{ channel: 'y', name: displayName, valueFormatter: (v: number) => `${Number(v).toFixed(2)} ${unit}` }],
      trigger: 'axis',
      shared: true,
      showMarkers: true,
      showCrosshairs: true,
      crosshairs: { type: 'xy' },
    },
    colorField: () => color,
    line: { style: { lineWidth: 2, stroke: color } },
    animate: false,
    onReady: (plot: any) => {
      chartRef.current = plot;
      plot.on('pointermove', (ev: any) => { mousePosRef.current = { x: ev.x, y: ev.y }; });
      plot.on('pointerleave', () => { mousePosRef.current = null; });
    },
  };

  return <Line {...config} />;
};

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ device, open, onClose, realTimeData }) => {
  const { token } = theme.useToken();
  const contrastColor = token.colorText;
  const isReallyDark = token.colorBgContainer === '#141414' || token.colorBgContainer === '#000000' || token.colorText === '#ffffff' || token.colorText.includes('rgba(255, 255, 255');

  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('1h');

  useEffect(() => {
    if (device && open) {
      setLoading(true);
      axios.get(`/api/history?deviceId=${device.id}&range=${range}`)
        .then(res => {
          setHistory(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch history", err);
          setLoading(false);
        });
    } else if (!open) {
      setHistory([]);
    }
  }, [device, open, range]);

  useEffect(() => {
    if (open && realTimeData && realTimeData.status === 'online') {
      const newDataPoint: HistoryData = {
        _time: new Date().toISOString(),
        voltage: realTimeData.voltage,
        current: realTimeData.current,
        activePower: realTimeData.activePower,
        reactivePower: realTimeData.reactivePower,
        apparentPower: realTimeData.apparentPower,
        powerFactor: realTimeData.powerFactor,
      };

      setHistory((prev) => {
        const lastPoint = prev[prev.length - 1];
        if (lastPoint && dayjs(lastPoint._time).isSame(dayjs(newDataPoint._time), 'second')) {
          return prev;
        }
        return [...prev, newDataPoint].slice(-10000);
      });
    }
  }, [realTimeData, open]);

  if (!device) return null;

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>{device.name} Telemetry Trends</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      styles={{ body: { padding: '20px 0', maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <Space>
          <Text strong>Analysis Range: </Text>
          <Select value={range} onChange={setRange} style={{ width: 120 }}>
            <Option value="15m">Last 15m</Option>
            <Option value="1h">Last 1h</Option>
            <Option value="6h">Last 6h</Option>
            <Option value="24h">Last 24h</Option>
          </Select>
        </Space>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}><Text type="secondary">Retrieving historical telemetry...</Text></div>
        </div>
      ) : history.length === 0 ? (
        <div style={{ padding: '40px 0' }}>
          <Empty description="No data available for this range" />
        </div>
      ) : (
        <div style={{ padding: '0 24px' }}>
          <Row gutter={[16, 32]}>
            <Col span={12}><Text strong style={{ display: 'block', marginBottom: 8 }}>Voltage (V)</Text><LiveLineChart data={history} field="voltage" color="#1668dc" unit="V" displayName="Voltage" isReallyDark={isReallyDark} contrastColor={contrastColor} /></Col>
            <Col span={12}><Text strong style={{ display: 'block', marginBottom: 8 }}>Current (A)</Text><LiveLineChart data={history} field="current" color="#d89614" unit="A" displayName="Current" isReallyDark={isReallyDark} contrastColor={contrastColor} /></Col>
            <Col span={12}><Text strong style={{ display: 'block', marginBottom: 8 }}>Active Power (kW)</Text><LiveLineChart data={history} field="activePower" color="#49aa19" unit="kW" displayName="Active Power" isReallyDark={isReallyDark} contrastColor={contrastColor} /></Col>
            <Col span={12}><Text strong style={{ display: 'block', marginBottom: 8 }}>Reactive Power (kVAR)</Text><LiveLineChart data={history} field="reactivePower" color="#eb2f96" unit="kVAR" displayName="Reactive Power" isReallyDark={isReallyDark} contrastColor={contrastColor} /></Col>
            <Col span={12}><Text strong style={{ display: 'block', marginBottom: 8 }}>Apparent Power (kVA)</Text><LiveLineChart data={history} field="apparentPower" color="#722ed1" unit="kVA" displayName="Apparent Power" isReallyDark={isReallyDark} contrastColor={contrastColor} /></Col>
            <Col span={12}><Text strong style={{ display: 'block', marginBottom: 8 }}>Power Factor</Text><LiveLineChart data={history} field="powerFactor" color="#13c2c2" unit="" displayName="Power Factor" isReallyDark={isReallyDark} contrastColor={contrastColor} /></Col>
          </Row>
        </div>
      )}
    </Modal>
  );
};
