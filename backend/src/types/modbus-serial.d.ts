declare module 'modbus-serial' {
  export default class ModbusRTU {
    constructor();
    connectTCP(ip: string, options: { port: number }): Promise<void>;
    setID(id: number): void;
    setTimeout(ms: number): void;
    readHoldingRegisters(address: number, length: number): Promise<{ data: number[] }>;
    close(callback: () => void): void;
    on(event: string, callback: (err?: any) => void): void;
    removeAllListeners(event?: string): void;
  }
}
