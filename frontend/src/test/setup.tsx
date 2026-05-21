import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';
import type { ReactNode } from 'react';
import { Refine } from '@refinedev/core';
import dataProvider from '@refinedev/simple-rest';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

export const TestWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <Refine
          dataProvider={dataProvider('http://localhost:3001/api')}
          options={{
            disableTelemetry: true,
          }}
        >
          {children}
        </Refine>
      </ConfigProvider>
    </BrowserRouter>
  );
};
