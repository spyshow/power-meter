import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

export const emitDeviceUpdate = (id: number, data: { voltage: number; current: number; kva: number }) => {
  eventBus.emit('update', { id, ...data });
};
