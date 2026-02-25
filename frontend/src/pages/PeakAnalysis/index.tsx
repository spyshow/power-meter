import { Table, Typography, Tag, Space, theme, Input } from 'antd';
import dayjs from 'dayjs';
import { RiseOutlined, ThunderboltOutlined, DashboardOutlined } from '@ant-design/icons';
import { usePeaksData, type PeakRecord } from '../../hooks/usePeaksData';

const { Title, Text } = Typography;
const { useToken } = theme;

export const PeakAnalysis = () => {
  const { token } = useToken();
  const { data, loading } = usePeaksData();

  const columns: any = [
    {
      title: 'Device',
      dataIndex: 'device_id',
      key: 'device',
      filters: [
        { text: 'Device 1000', value: '10' },
        { text: 'Device 2000', value: '20' },
        { text: 'Device 3000', value: '30' },
        { text: 'Device 4000', value: '40' },
        { text: 'Device 5000', value: '50' },
        { text: 'Device 6000', value: '60' },
      ],
      onFilter: (value: string, record: PeakRecord) => record.device_id === value,
      sorter: (a: PeakRecord, b: PeakRecord) => a.device_id.localeCompare(b.device_id),
      render: (id: string) => <Tag color="blue">Device {id}00</Tag>,
    },
    {
      title: 'Parameter',
      dataIndex: 'metric',
      key: 'metric',
      filters: [
        { text: 'Voltage', value: 'voltage' },
        { text: 'Current', value: 'current' },
        { text: 'Power', value: 'kva' },
      ],
      onFilter: (value: string, record: PeakRecord) => record.metric === value,
      sorter: (a: PeakRecord, b: PeakRecord) => a.metric.localeCompare(b.metric),
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
      filterSearch: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search value"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <button
              type="button"
              onClick={() => confirm()}
              style={{ width: 90, background: token.colorPrimary, color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 0', cursor: 'pointer' }}
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => clearFilters()}
              style={{ width: 90, background: 'none', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '4px 0', cursor: 'pointer' }}
            >
              Reset
            </button>
          </Space>
        </div>
      ),
      onFilter: (value: string, record: PeakRecord) => record.value.toString().includes(value),
      render: (val: number, record: PeakRecord) => {
        const unit = record.metric === 'voltage' ? 'V' : record.metric === 'current' ? 'A' : 'kVA';
        return <Text strong style={{ fontSize: '16px' }}>{val.toFixed(2)} {unit}</Text>;
      }
    },
    {
      title: 'Recorded At',
      dataIndex: '_time',
      key: 'time',
      filters: [
        { text: 'Today', value: 'today' },
        { text: 'Last 24h', value: '24h' },
      ],
      onFilter: (value: string, record: PeakRecord) => {
        const now = dayjs();
        const recordTime = dayjs(record._time);
        if (value === 'today') return recordTime.isSame(now, 'day');
        if (value === '24h') return now.diff(recordTime, 'hour') <= 24;
        return true;
      },
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
