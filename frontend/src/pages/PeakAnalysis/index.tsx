import { Table, Typography, Tag, Space, theme, Input, Segmented } from 'antd';
import dayjs from 'dayjs';
import { RiseOutlined, ThunderboltOutlined, DashboardOutlined, HistoryOutlined, TrophyOutlined, DotChartOutlined, PercentageOutlined } from '@ant-design/icons';
import { usePeaksData, type PeakRecord } from '../../hooks/usePeaksData';
import { useState, useMemo } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export const PeakAnalysis = () => {
  const { token } = useToken();
  const { data, loading } = usePeaksData();
  const [viewMode, setViewMode] = useState<'history' | 'highest'>('highest');

  const filteredData = useMemo(() => {
    if (viewMode === 'history') return data;

    const latestPeaks: Record<string, PeakRecord> = {};
    data.forEach(record => {
      const key = `${record.device_id}_${record.metric}`;
      if (!latestPeaks[key] || record.value > latestPeaks[key].value) {
        latestPeaks[key] = record;
      }
    });

    return Object.values(latestPeaks);
  }, [data, viewMode]);

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
      filterMultiple: true,
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
        { text: 'Active Power', value: 'activePower' },
        { text: 'Reactive Power', value: 'reactivePower' },
        { text: 'Apparent Power', value: 'apparentPower' },
        { text: 'Power Factor', value: 'powerFactor' },
      ],
      filterMultiple: true,
      onFilter: (value: string, record: PeakRecord) => record.metric === value,
      sorter: (a: PeakRecord, b: PeakRecord) => a.metric.localeCompare(b.metric),
      render: (metric: string) => {
        const config: any = {
          voltage: { label: 'Voltage', color: '#1668dc', icon: <ThunderboltOutlined /> },
          current: { label: 'Current', color: '#d89614', icon: <DashboardOutlined /> },
          activePower: { label: 'Active Power', color: '#49aa19', icon: <ThunderboltOutlined /> },
          reactivePower: { label: 'Reactive Power', color: '#eb2f96', icon: <DotChartOutlined /> },
          apparentPower: { label: 'Apparent Power', color: '#722ed1', icon: <RiseOutlined /> },
          powerFactor: { label: 'Power Factor', color: '#13c2c2', icon: <PercentageOutlined /> },
        };
        const item = config[metric] || { label: metric, color: 'default', icon: <RiseOutlined /> };
        return (
          <Space>
            <span style={{ color: item.color }}>{item.icon}</span>
            <Text strong>{item.label}</Text>
          </Space>
        );
      }
    },
    {
      title: 'Previous Value',
      dataIndex: 'previous_value',
      key: 'prev',
      render: (val: number, record: PeakRecord) => {
        if (val === undefined || val === null) return <Text type="secondary">-</Text>;
        const unitMap: any = { voltage: 'V', current: 'A', activePower: 'kW', reactivePower: 'kVAR', apparentPower: 'kVA', powerFactor: '' };
        return <Text type="secondary">{Number(val).toFixed(2)} {unitMap[record.metric] || ''}</Text>;
      }
    },
    {
      title: 'Peak Value',
      dataIndex: 'value',
      key: 'value',
      sorter: (a: PeakRecord, b: PeakRecord) => a.value - b.value,
      render: (val: number, record: PeakRecord) => {
        if (val === undefined || val === null) return <Text type="secondary">-</Text>;
        const unitMap: any = { voltage: 'V', current: 'A', activePower: 'kW', reactivePower: 'kVAR', apparentPower: 'kVA', powerFactor: '' };
        return <Text strong style={{ fontSize: '16px', color: token.colorError }}>{Number(val).toFixed(2)} {unitMap[record.metric] || ''}</Text>;
      }
    },
    {
      title: 'Increase',
      key: 'increase',
      render: (_: any, record: PeakRecord) => {
        if (!record.previous_value || record.previous_value === 0) return <Tag color="green">New Record</Tag>;
        const diff = record.value - record.previous_value;
        const percent = (diff / record.previous_value) * 100;
        const color = percent > 50 ? 'volcano' : 'orange';
        return <Tag color={color} icon={<RiseOutlined />}>+{percent.toFixed(1)}%</Tag>;
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

        <Space size="large">
          <Segmented
            value={viewMode}
            onChange={(val: any) => setViewMode(val)}
            options={[
              { label: 'Highest Only', value: 'highest', icon: <TrophyOutlined /> },
              { label: 'Full History', value: 'history', icon: <HistoryOutlined /> },
            ]}
          />
          <RiseOutlined style={{ fontSize: '32px', color: token.colorPrimary, opacity: 0.5 }} />
        </Space>
      </div>

      <Table
        dataSource={filteredData}
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
