import { Refine } from '@refinedev/core';
import { notificationProvider, ThemedLayoutV2, ErrorComponent, RefineThemes } from '@refinedev/antd';
import { ConfigProvider } from 'antd';
import routerBindings, { NavigateToResource, UnsavedChangesNotifier } from '@refinedev/react-router-v6';
import dataProvider from '@refinedev/simple-rest';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import '@refinedev/antd/dist/reset.css';

const App = () => {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <Refine
          routerProvider={routerBindings}
          dataProvider={dataProvider('http://localhost:3001')}
          notificationProvider={notificationProvider}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
          resources={[
            {
              name: 'dashboard',
              list: '/',
            },
          ]}
        >
          <Routes>
            <Route
              element={
                <ThemedLayoutV2 title={{ text: 'Modbus Dashboard' }}>
                  <Outlet />
                </ThemedLayoutV2>
              }
            >
              <Route index element={<div style={{ padding: 24 }}>Dashboard Content (Coming Soon)</div>} />
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
