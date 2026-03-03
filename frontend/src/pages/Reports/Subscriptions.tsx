import React from 'react';
import { 
  List, 
  useTable, 
  DateField, 
  TagField, 
  DeleteButton, 
  CreateButton,
  useModalForm,
} from '@refinedev/antd';
import { Form, Input, Select, Radio, Space, Table, Modal } from 'antd';

export const ReportSubscriptions: React.FC = () => {
  const { tableProps } = useTable({
    resource: 'reports/subscriptions',
    syncWithLocation: true,
  });

  const { modalProps, formProps, show } = useModalForm({
    resource: 'reports/subscriptions',
    action: 'create',
  });

  return (
    <div style={{ padding: '24px' }}>
      <List 
        title="Scheduled Reports"
        headerButtons={<CreateButton onClick={() => show()} />}
      >
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title="ID" />
          <Table.Column dataIndex="name" title="Name" />
          <Table.Column dataIndex="schedule" title="Schedule (Cron)" />
          <Table.Column dataIndex="format" title="Format" render={(val: string) => val.toUpperCase()} />
          <Table.Column dataIndex="range" title="Range" />
          <Table.Column 
            dataIndex="isActive" 
            title="Status" 
            render={(val: number) => val === 1 ? <TagField value="Active" color="green" /> : <TagField value="Inactive" color="red" />} 
          />
          <Table.Column 
            dataIndex="lastRun" 
            title="Last Run" 
            render={(val: string) => val ? <DateField value={val} format="YYYY-MM-DD HH:mm" /> : 'Never'} 
          />
          <Table.Column
            title="Actions"
            render={(_: any, record: any) => (
              <Space>
                <DeleteButton hideText size="small" recordItemId={record.id} resource="reports/subscriptions" />
              </Space>
            )}
          />
        </Table>
      </List>

      <Modal {...modalProps} title="Create Scheduled Report">
        <Form {...formProps} layout="vertical">
          <Form.Item name="name" label="Friendly Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Weekly Maintenance Report" />
          </Form.Item>
          
          <Form.Item 
            name="deviceIds" 
            label="Select Devices" 
            rules={[{ required: true, message: 'Please select at least one device' }]}
            getValueFromEvent={(val: string[]) => val.join(',')}
            getValueProps={(val: string) => ({ value: val ? val.split(',') : [] })}
          >
            <Select mode="multiple" placeholder="Search and select devices">
              <Select.Option value="10">Device 10</Select.Option>
              <Select.Option value="20">Device 20</Select.Option>
              <Select.Option value="30">Device 30</Select.Option>
              <Select.Option value="40">Device 40</Select.Option>
              <Select.Option value="50">Device 50</Select.Option>
              <Select.Option value="60">Device 60</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="metrics" 
            label="Select Metrics" 
            rules={[{ required: true, message: 'Please select metrics' }]}
            getValueFromEvent={(val: string[]) => val.join(',')}
            getValueProps={(val: string) => ({ value: val ? val.split(',') : [] })}
          >
            <Select mode="multiple" placeholder="Search and select metrics">
              <Select.Option value="voltage">Voltage (V)</Select.Option>
              <Select.Option value="current">Current (A)</Select.Option>
              <Select.Option value="kva">Power (kVA)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="schedule" label="Cron Schedule" rules={[{ required: true }]}>
            <Input placeholder="0 0 * * 1 (Every Monday at Midnight)" />
          </Form.Item>
          <Space size="large">
            <Form.Item name="format" label="Format" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio.Button value="pdf">PDF</Radio.Button>
                <Radio.Button value="xlsx">Excel</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="range" label="Data Range" rules={[{ required: true }]}>
              <Select style={{ width: 120 }}>
                <Select.Option value="1h">Last 1 Hour</Select.Option>
                <Select.Option value="6h">Last 6 Hours</Select.Option>
                <Select.Option value="24h">Last 24 Hours</Select.Option>
                <Select.Option value="7d">Last 7 Days</Select.Option>
                <Select.Option value="30d">Last 30 Days</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="granularity" label="Granularity" rules={[{ required: true }]}>
              <Select style={{ width: 120 }}>
                <Select.Option value="raw">Raw</Select.Option>
                <Select.Option value="aggregated">Aggregated</Select.Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};
