import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ModbusRTU from 'modbus-serial';

@Injectable()
export class ModbusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ModbusService.name);
  private client: ModbusRTU | null = null;
  private connected = false;
  private connecting = false;
  private readonly ip: string;
  private readonly port: number;
  private readonly isSimulation: boolean;
  
  private consecutiveTimeouts = 0;
  private readonly MAX_CONSECUTIVE_TIMEOUTS = 3;
  
  // Serialization lock to ensure only one Modbus operation happens at a time
  private lock = Promise.resolve();

  constructor(private configService: ConfigService) {
    this.ip = this.configService.get<string>('PAS600_IP') || '172.16.0.80';
    this.port = parseInt(this.configService.get<string>('PAS600_PORT') || '502', 10);
    this.isSimulation = this.configService.get<string>('MODBUS_SIMULATION') === 'true' || this.ip === 'SIMULATE';
  }

  async onModuleInit() {
    if (this.isSimulation) {
      this.logger.log('Running in SIMULATION mode');
      this.connected = true;
      return;
    }
    await this.connect();
  }

  async onModuleDestroy() {
    await this.cleanup();
  }

  private async cleanup() {
    if (this.client && !this.isSimulation) {
      const oldClient = this.client;
      this.client = null;
      this.connected = false;
      
      try {
        await Promise.race([
          new Promise<void>((resolve) => {
            oldClient.removeAllListeners();
            oldClient.close(() => resolve());
          }),
          new Promise<void>((resolve) => setTimeout(resolve, 2000)), // 2s timeout for cleanup
        ]);
      } catch (e) {
        // Ignore close errors
      }
    }
  }

  async connect() {
    if (this.isSimulation || this.connecting || this.connected) return;
    this.connecting = true;

    try {
      await this.cleanup();

      this.logger.log(`Connecting to PAS600 at ${this.ip}:${this.port}...`);
      
      const newClient = new ModbusRTU();
      
      newClient.on('error', (err: any) => {
        const msg = err?.message || err;
        this.logger.error(`Client error event: ${msg}`);
        if (msg.includes('ECONN') || msg.includes('closed')) {
          this.connected = false;
        }
      });

      newClient.on('close', () => {
        if (this.connected) {
          this.logger.warn('Client connection closed event');
          this.connected = false;
        }
      });

      await Promise.race([
        newClient.connectTCP(this.ip, { port: this.port }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000)),
      ]);

      newClient.setID(1);
      newClient.setTimeout(180000);
      
      this.client = newClient;
      this.connected = true;
      this.consecutiveTimeouts = 0;
      this.logger.log(`Connected successfully to ${this.ip}:${this.port}`);
    } catch (error) {
      this.connected = false;
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Connection failed: ${msg}`);
      this.scheduleReconnect(10000);
    } finally {
      this.connecting = false;
    }
  }

  private scheduleReconnect(delay: number) {
    if (this.isSimulation) return;
    setTimeout(() => this.connect(), delay);
  }

  isConnected(): boolean {
    return this.connected;
  }

  private async acquireLock(): Promise<() => void> {
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentLock = this.lock;
    this.lock = currentLock.then(() => nextLock);
    await currentLock;
    return release!;
  }

  private handleError(error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    // Connection loss errors - require a reconnect
    if (msg.includes('ECONN') || msg.includes('Port Not Open') || msg.includes('closed')) {
      if (this.connected) {
        this.logger.warn(`Connection lost: ${msg}. Triggering reconnect...`);
        this.connected = false;
        this.connect();
      }
    } 
    // Timeout is handled differently - it might just be the gateway is busy
    else if (msg.includes('Timeout') || msg.includes('timed out')) {
      this.logger.warn(`Modbus timeout: ${msg}`);
      this.consecutiveTimeouts++;
      if (this.consecutiveTimeouts >= this.MAX_CONSECUTIVE_TIMEOUTS) {
        this.logger.error(`Too many consecutive timeouts (${this.consecutiveTimeouts}). Forcing reconnect...`);
        this.consecutiveTimeouts = 0;
        this.connected = false;
        this.connect();
      }
    }
  }

  async readRaw(deviceId: number, startAddress: number, length: number): Promise<number[]> {
    if (this.isSimulation) {
      return this.generateSimulatedData(startAddress, length);
    }

    const release = await this.acquireLock();
    try {
      if (!this.connected || !this.client) {
        this.connect();
        throw new Error('Modbus client not connected');
      }

      this.client.setID(deviceId);
      await new Promise((resolve) => setTimeout(resolve, 20));
      const result = await this.client.readHoldingRegisters(startAddress, length);
      
      this.consecutiveTimeouts = 0; // Reset on success
      return result.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      release();
    }
  }

  private generateSimulatedData(startAddress: number, length: number): number[] {
    const data: number[] = new Array(length).fill(0);
    const setFloat = (offset: number, value: number) => {
      const buffer = Buffer.alloc(4);
      buffer.writeFloatBE(value, 0);
      data[offset] = buffer.readUInt16BE(0);
      data[offset + 1] = buffer.readUInt16BE(2);
    };

    setFloat(0, 10 + Math.random() * 5);
    setFloat(16, 220 + Math.random() * 10);
    setFloat(50, 2000 + Math.random() * 500);
    setFloat(58, 200 + Math.random() * 100);
    setFloat(66, 2100 + Math.random() * 500);
    setFloat(74, 0.9 + Math.random() * 0.1);

    return data;
  }

  async readFloat(deviceId: number, address: number): Promise<number> {
    const results = await this.readFloats(deviceId, address, 1);
    return results[0];
  }

  async readFloats(deviceId: number, startAddress: number, count: number): Promise<number[]> {
    if (this.isSimulation) {
      const data = this.generateSimulatedData(startAddress, count * 2);
      const floats: number[] = [];
      for (let i = 0; i < count; i++) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt16BE(data[i * 2], 0);
        buffer.writeUInt16BE(data[i * 2 + 1], 2);
        floats.push(buffer.readFloatBE(0));
      }
      return floats;
    }

    const release = await this.acquireLock();
    try {
      if (!this.connected || !this.client) {
        this.connect();
        throw new Error('Modbus client not connected');
      }

      this.client.setID(deviceId);
      await new Promise((resolve) => setTimeout(resolve, 20));
      const result = await this.client.readHoldingRegisters(startAddress, count * 2);
      
      this.consecutiveTimeouts = 0; // Reset on success
      const floats: number[] = [];
      for (let i = 0; i < count; i++) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt16BE(result.data[i * 2], 0);
        buffer.writeUInt16BE(result.data[i * 2 + 1], 2);
        floats.push(buffer.readFloatBE(0));
      }
      return floats;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      release();
    }
  }
}

