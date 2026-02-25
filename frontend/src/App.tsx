import { useState } from 'react';
import { Refine } from '@refinedev/core';
import { 
  notificationProvider, 
  ThemedLayoutV2, 
  ErrorComponent, 
  RefineThemes,
  ThemedSiderV2
} from '@refinedev/antd';
import { ConfigProvider, theme, Switch, Space, Typography } from 'antd';
import routerBindings, { UnsavedChangesNotifier } from '@refinedev/react-router-v6';
import dataProvider from '@refinedev/simple-rest';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { DashboardOutlined, GlobalOutlined, BulbOutlined, BulbFilled, RiseOutlined } from '@ant-design/icons';
import { Dashboard } from './pages/Dashboard';
import { PeakAnalysis } from './pages/PeakAnalysis';
import '@refinedev/antd/dist/reset.css';

const { Text } = Typography;

const TitleComponent = ({ collapsed, isDarkMode }: { collapsed: boolean; isDarkMode: boolean }) => {
  const { token } = theme.useToken();
  return (
    <div style={{ 
      padding: '16px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      color: isDarkMode ? '#fff' : token.colorText,
      fontSize: '18px'
    }}>
      <GlobalOutlined style={{ fontSize: '24px', color: token.colorPrimary }} />
      {!collapsed && <span style={{ fontWeight: 800, letterSpacing: '1px' }}>MCGI LOGGER</span>}
    </div>
  );
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <ConfigProvider theme={{
        ...RefineThemes.Blue,
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
        <Refine
          routerProvider={routerBindings}
          dataProvider={dataProvider('/api')}
          notificationProvider={notificationProvider}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            disableTelemetry: true,
          }}
          resources={[
            {
              name: 'dashboard',
              list: '/',
              meta: {
                label: 'System Dashboard',
                icon: <DashboardOutlined />,
              }
            },
            {
              name: 'peaks',
              list: '/peaks',
              meta: {
                label: 'Peak Analysis',
                icon: <RiseOutlined />,
              }
            },
          ]}
        >
          <Routes>
            <Route
              element={
                <ThemedLayoutV2 
                  Header={() => null}
                  Sider={(props) => (
                    <ThemedSiderV2 
                      {...props} 
                      render={({ items, logout, collapsed }) => {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ flex: 1 }}>
                              {items}
                            </div>
                            <div style={{ 
                              padding: '16px', 
                              borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                              display: 'flex',
                              justifyContent: collapsed ? 'center' : 'space-between',
                              alignItems: 'center'
                            }}>
                              {!collapsed && (
                                <Space size={4}>
                                  {isDarkMode ? <BulbFilled /> : <BulbOutlined />}
                                  <Text style={{ color: 'inherit', fontSize: '12px' }}>Dark Mode</Text>
                                </Space>
                              )}
                              <Switch 
                                size="small" 
                                checked={isDarkMode} 
                                onChange={(checked) => setIsDarkMode(checked)} 
                              />
                            </div>
                            {logout}
                          </div>
                        );
                      }}
                    />
                  )}
                  Title={({ collapsed }) => (
                    <TitleComponent collapsed={collapsed} isDarkMode={isDarkMode} />
                  )}
                >
                  <Outlet />
                </ThemedLayoutV2>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="/peaks" element={<PeakAnalysis />} />
              <Route path="*" element={<ErrorComponent />} />
            </Route>
          </Routes>
          <UnsavedChangesNotifier />
        </Refine>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
