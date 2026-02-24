import { Typography } from 'antd';

const { Title } = Typography;

export const PeakAnalysis = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Peak Value Analysis</Title>
      <Typography.Text>This page will show the historical maximum values for all devices.</Typography.Text>
    </div>
  );
};
