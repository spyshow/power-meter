import { Table, Typography, Tag, Space, theme } from 'antd';
import dayjs from 'dayjs';
import { RiseOutlined, ThunderboltOutlined, DashboardOutlined } from '@ant-design/icons';
import { usePeaksData, PeakRecord } from '../../hooks/usePeaksData';

const { Title, Text } = Typography;
const { useToken } = theme;

export const PeakAnalysis = () => {
  const { token } = useToken();
  const { data, loading } = usePeaksData();

  const columns = [
    {
      title: 'Device',
      dataIndex: 'device_id',
      key: 'device',
      render: (id: string) => <Tag color="blue">Device {id}00</Tag>,
    },
    {
      title: 'Parameter',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric: string) => {
        const config: any = {
          voltage: { label: 'Voltage', color: '#1668dc', icon: <ThunderboltOutlined /> },
          current: { label: 'Current', color: '#d89614', icon: <DashboardOutlined /> },
          kva: { label: 'Power', color: '#49aa19', icon: <RiseOutlined /> },
        };
        const item = config[metric] || { label: metric, color: 'default' };
        return (
          <Space>
            <span style={{ color: item.color }}>{item.icon}</span>
            <Text strong>{item.label}</Text>
          </Space>
        );
      }
    },
    {
      title: 'Peak Value',
      dataIndex: 'value',
      key: 'value',
      sorter: (a: PeakRecord, b: PeakRecord) => a.value - b.value,
      render: (val: number, record: PeakRecord) => {
        const unit = record.metric === 'voltage' ? 'V' : record.metric === 'current' ? 'A' : 'kVA';
        return <Text strong style={{ fontSize: '16px' }}>{val.toFixed(2)} {unit}</Text>;
      }
    },
    {
      title: 'Recorded At',
      dataIndex: '_time',
      key: 'time',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: PeakRecord, b: PeakRecord) => dayjs(a._time).unix() - dayjs(b._time).unix(),
      defaultSortOrder: 'descend' as const,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        background: token.colorBgContainer,
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: token.boxShadowTertiary
      }}>
        <Space direction="vertical" size={0}>
          <Title level={3} style={{ margin: 0 }}>Peak Value Analysis</Title>
          <Text type="secondary">Historical maximum values recorded across the network</Text>
        </Space>
        <RiseOutlined style={{ fontSize: '32px', color: token.colorPrimary, opacity: 0.5 }} />
      </div>

      <Table 
        dataSource={data} 
        columns={columns} 
        loading={loading}
        rowKey={(record) => `${record.device_id}-${record.metric}-${record._time}`}
        pagination={{ pageSize: 10 }}
        style={{ 
          background: token.colorBgContainer,
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};
