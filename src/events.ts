import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

export const emitDeviceUpdate = (id: number, data: { voltage?: number; current?: number; kva?: number; status?: 'online' | 'offline' }) => {
  eventBus.emit('update', { id, ...data });
};

export const emitPeakDetected = (id: number, metric: string, data: { value: number; previous_value: number }) => {
  eventBus.emit('peak', { id, metric, ...data, timestamp: new Date().toISOString() });
};
