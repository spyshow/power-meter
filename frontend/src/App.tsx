import { useState } from 'react';
import { Refine, Authenticated } from '@refinedev/core';
import { 
  notificationProvider, 
  ThemedLayoutV2, 
  ErrorComponent, 
  RefineThemes,
  ThemedSiderV2
} from '@refinedev/antd';
import { ConfigProvider, theme, Switch, Space, Typography } from 'antd';
import routerBindings, { UnsavedChangesNotifier, CatchAllNavigate, NavigateToResource } from '@refinedev/react-router-v6';
import dataProvider from '@refinedev/simple-rest';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { 
  DashboardOutlined, 
  GlobalOutlined, 
  BulbOutlined, 
  BulbFilled, 
  RiseOutlined, 
  UserOutlined, 
  FileTextOutlined,
  ScheduleOutlined 
} from '@ant-design/icons';
import { Dashboard } from './pages/Dashboard';
import { PeakAnalysis } from './pages/PeakAnalysis';
import { Reports } from './pages/Reports';
import { ReportSubscriptions } from './pages/Reports/Subscriptions';
import { LoginPage } from './pages/Login';
import { UserList, UserCreate, UserEdit } from './pages/Users';
import { authProvider } from './authProvider';
import '@refinedev/antd/dist/reset.css';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
          dataProvider={dataProvider('/api', axiosInstance as any)}
          authProvider={authProvider}
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
            {
              name: 'reports',
              list: '/reports',
              meta: {
                label: 'Reports',
                icon: <FileTextOutlined />,
              }
            },
            {
              name: 'reports/subscriptions',
              list: '/reports/subscriptions',
              meta: {
                label: 'Schedules',
                icon: <ScheduleOutlined />,
              }
            },
            {
              name: 'users',
              list: '/users',
              create: '/users/create',
              edit: '/users/edit/:id',
              meta: {
                label: 'User Management',
                icon: <UserOutlined />,
              }
            },
          ]}
        >
          <Routes>
            <Route
              element={
                <Authenticated
                  key="authenticated-inner"
                  fallback={<CatchAllNavigate to="/login" />}
                >
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
                </Authenticated>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="/peaks" element={<PeakAnalysis />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/subscriptions" element={<ReportSubscriptions />} />
              <Route path="/users">
                <Route index element={<UserList />} />
                <Route path="create" element={<UserCreate />} />
                <Route path="edit/:id" element={<UserEdit />} />
              </Route>
              <Route path="*" element={<ErrorComponent />} />
            </Route>
            <Route
              element={
                <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                  <NavigateToResource />
                </Authenticated>
              }
            >
              <Route path="/login" element={<LoginPage />} />
            </Route>
          </Routes>
          <UnsavedChangesNotifier />
        </Refine>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
