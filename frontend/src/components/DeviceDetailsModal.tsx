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
  kva: number;
}

interface DeviceDetailsModalProps {
  device: Device | null;
  open: boolean;
  onClose: () => void;
  realTimeData?: { voltage: number; current: number; kva: number; status: string } | null;
}

// Sub-component to handle the "locked tooltip" logic for each chart
const LiveLineChart = ({ data, field, color, unit, displayName, isReallyDark, contrastColor }: any) => {
  const chartRef = useRef<any>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Re-trigger tooltip whenever data updates to keep it "locked" under the cursor
  useEffect(() => {
    if (chartRef.current && mousePosRef.current) {
      const { x, y } = mousePosRef.current;
      // Small timeout to ensure the chart has finished rendering the new point
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
    scale: {
      x: { type: 'time' },
    },
    axis: {
      x: { 
        title: { 
          text: 'Time', 
          style: { fill: contrastColor, fillOpacity: 1, fontWeight: 'bold' } 
        },
        label: { 
          style: { fill: contrastColor, fillOpacity: 1 },
          formatter: (v: any) => dayjs(v).format('HH:mm:ss'),
          autoHide: true,
        },
        tickCount: 5,
      },
      y: { 
        title: { 
          text: `${displayName} (${unit})`, 
          style: { fill: contrastColor, fillOpacity: 1, fontWeight: 'bold' } 
        },
        label: { 
          style: { fill: contrastColor, fillOpacity: 1 } 
        },
      },
    },
    tooltip: {
      title: (d: any) => dayjs(d._time).format('YYYY-MM-DD HH:mm:ss'),
      items: [{ channel: 'y', name: displayName, valueFormatter: (v: number) => `${v.toFixed(2)} ${unit}` }],
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

      // Track mouse position on the canvas
      plot.on('pointermove', (ev: any) => {
        mousePosRef.current = { x: ev.x, y: ev.y };
      });

      // Clear when mouse leaves
      plot.on('pointerleave', () => {
        mousePosRef.current = null;
      });
    },
  };

  return <Line {...config} />;
};

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ device, open, onClose, realTimeData }) => {
  const { token } = theme.useToken();
  
  // Robust dark mode detection
  const contrastColor = token.colorText;
  const isReallyDark = token.colorBgContainer === '#141414' || token.colorBgContainer === '#000000' || token.colorText === '#ffffff' || token.colorText.includes('rgba(255, 255, 255');

  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('1h');

  // Load initial history
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

  // Live update: Append real-time data when it arrives
  useEffect(() => {
    if (open && realTimeData && realTimeData.status === 'online') {
      const newDataPoint: HistoryData = {
        _time: new Date().toISOString(),
        voltage: realTimeData.voltage,
        current: realTimeData.current,
        kva: realTimeData.kva,
      };

      setHistory((prev) => {
        const lastPoint = prev[prev.length - 1];
        if (lastPoint && dayjs(lastPoint._time).isSame(dayjs(newDataPoint._time), 'second')) {
          return prev;
        }
        
        const newHistory = [...prev, newDataPoint];
        // Support up to 10000 points (~2.7 hours at 1Hz)
        return newHistory.slice(-10000);
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
      styles={{ body: { padding: '20px 0' } }}
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
        <div style={{ padding: '80px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Spin size="large" />
          <Text type="secondary">Retrieving historical telemetry...</Text>
        </div>
      ) : history.length === 0 ? (
        <div style={{ padding: '40px 0' }}>
          <Empty description="No data available for this range" />
        </div>
      ) : (
        <div style={{ padding: '0 24px' }}>
          <Row gutter={[16, 32]}>
            <Col span={24}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Voltage (V)</Text>
              <LiveLineChart 
                data={history} 
                field="voltage" 
                color="#1668dc" 
                unit="V" 
                displayName="Voltage" 
                isReallyDark={isReallyDark}
                contrastColor={contrastColor}
              />
            </Col>
            <Col span={24}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Current (A)</Text>
              <LiveLineChart 
                data={history} 
                field="current" 
                color="#d89614" 
                unit="A" 
                displayName="Current" 
                isReallyDark={isReallyDark}
                contrastColor={contrastColor}
              />
            </Col>
            <Col span={24}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Power (kVA)</Text>
              <LiveLineChart 
                data={history} 
                field="kva" 
                color="#49aa19" 
                unit="kVA" 
                displayName="Power" 
                isReallyDark={isReallyDark}
                contrastColor={contrastColor}
              />
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
};
