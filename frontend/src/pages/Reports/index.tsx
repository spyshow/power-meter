import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Typography, 
  Table, 
  Divider, 
  Row, 
  Col,
  Radio
} from 'antd';
import { FilePdfOutlined, FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { useApiUrl, useCustomMutation } from '@refinedev/core';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const Reports: React.FC = () => {
  const apiUrl = useApiUrl();
  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { mutate: mutatePreview } = useCustomMutation();

  const handlePreview = async (values: any) => {
    setLoading(true);
    const { range, devices, metrics, granularity } = values;

    const params: any = {
      deviceIds: devices,
      metrics: metrics,
      granularity: granularity,
    };

    if (range && range.length === 2) {
      params.start = range[0].toISOString();
      params.stop = range[1].toISOString();
    } else {
      params.range = '1h'; // Default if none selected
    }

    const token = localStorage.getItem('token');

    mutatePreview({
      url: `${apiUrl}/reports/preview`,
      method: 'post',
      values: params,
      config: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }, {
      onSuccess: (data: any) => {
        setPreviewData(data.data || []);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      }
    });
  };

  const handleDownload = async (format: 'pdf' | 'xlsx') => {
    const values = await form.validateFields();
    const { range, devices, metrics, granularity } = values;

    const params: any = {
      deviceIds: devices,
      metrics: metrics,
      granularity: granularity,
      format: format
    };

    if (range && range.length === 2) {
      params.start = range[0].toISOString();
      params.stop = range[1].toISOString();
    } else {
      params.range = '1h';
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/reports/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${dayjs().format('YYYY-MM-DD-HH-mm')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const columns = previewData.length > 0 ? [
    { title: 'Device', dataIndex: 'device_id', key: 'device_id' },
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (val: any) => dayjs(val).format('YYYY-MM-DD HH:mm:ss') },
    ...Object.keys(previewData[0])
      .filter(k => !['device_id', 'timestamp', 'id'].includes(k))
      .map(key => ({
        title: key.toUpperCase(),
        dataIndex: key,
        key: key,
      }))
  ] : [];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Report Generation</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            granularity: 'aggregated',
            metrics: ['apparentPower'],
            devices: ['10']
          }}
          onFinish={handlePreview}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="devices"
                label="Select Devices"
                rules={[{ required: true, message: 'Please select at least one device' }]}
              >
                <Select mode="multiple" placeholder="Select devices">
                  <Select.Option value="10">Device 10</Select.Option>
                  <Select.Option value="20">Device 20</Select.Option>
                  <Select.Option value="30">Device 30</Select.Option>
                  <Select.Option value="40">Device 40</Select.Option>
                  <Select.Option value="50">Device 50</Select.Option>
                  <Select.Option value="60">Device 60</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="metrics"
                label="Select Metrics"
                rules={[{ required: true, message: 'Please select metrics' }]}
              >
                <Select mode="multiple" placeholder="Select metrics">
                  <Select.Option value="voltage">Voltage (V)</Select.Option>
                  <Select.Option value="current">Current (A)</Select.Option>
                  <Select.Option value="activePower">Active Power (kW)</Select.Option>
                  <Select.Option value="reactivePower">Reactive Power (kVAR)</Select.Option>
                  <Select.Option value="apparentPower">Apparent Power (kVA)</Select.Option>
                  <Select.Option value="powerFactor">Power Factor</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="range" label="Time Range">
                <RangePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="granularity" label="Data Granularity">
                <Radio.Group>
                  <Radio.Button value="raw">Raw (1s)</Radio.Button>
                  <Radio.Button value="aggregated">Aggregated (1m+)</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: '24px' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                  loading={loading}
                >
                  Preview Data
                </Button>
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={() => handleDownload('pdf')}
                >
                  Export PDF
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => handleDownload('xlsx')}
                >
                  Export Excel
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {previewData.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Title level={4}>Data Preview (First 100 rows)</Title>
          <Table
            dataSource={previewData.slice(0, 100)}
            columns={columns}
            rowKey={(record: any) => `${record.device_id}-${record.timestamp}`}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </div>
      )}
    </div>
  );
};
