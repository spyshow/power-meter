import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ModbusRTU from 'modbus-serial';

@Injectable()
export class ModbusService implements OnModuleInit, OnModuleDestroy {
  private client: ModbusRTU | null = null;
  private connected = false;
  private connecting = false;
  private readonly ip: string;
  private readonly port: number;
  private readonly isSimulation: boolean;

  constructor(private configService: ConfigService) {
    this.ip = this.configService.get<string>('PAS600_IP') || '172.16.0.80';
    this.port = parseInt(this.configService.get<string>('PAS600_PORT') || '502', 10);
    this.isSimulation = this.configService.get<string>('MODBUS_SIMULATION') === 'true' || this.ip === 'SIMULATE';
  }

  async onModuleInit() {
    if (this.isSimulation) {
      console.log('[ModbusService] Running in SIMULATION mode');
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
        await new Promise<void>((resolve) => {
          // Remove all listeners to prevent memory leaks and redundant error handling during shutdown
          oldClient.removeAllListeners();
          oldClient.close(() => resolve());
        });
      } catch (e) {
        // Ignore close errors
      }
    }
  }

  async connect() {
    if (this.isSimulation || this.connecting || this.connected) return;
    this.connecting = true;

    try {
      // Completely tear down the old client to ensure no stale state remains
      await this.cleanup();

      console.log(`[ModbusService] Creating new client and connecting to PAS600 at ${this.ip}:${this.port}...`);
      
      const newClient = new ModbusRTU();
      
      // Proactive disconnection detection via events
      newClient.on('error', (err) => {
        console.error(`[ModbusService] Client error event: ${err.message}`);
        this.connected = false;
        // Don't call connect() immediately here to avoid potential loops; 
        // the next read attempt or poll will trigger it.
      });

      newClient.on('close', () => {
        if (this.connected) {
          console.warn('[ModbusService] Client connection closed event');
          this.connected = false;
        }
      });

      await newClient.connectTCP(this.ip, { port: this.port });
      newClient.setID(1);
      newClient.setTimeout(2000);
      
      this.client = newClient;
      this.connected = true;
      console.log(`[ModbusService] Connected successfully to ${this.ip}:${this.port}`);
    } catch (error) {
      this.connected = false;
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[ModbusService] Connection failed: ${msg}`);
      // Retry after 10 seconds
      setTimeout(() => this.connect(), 10000);
    } finally {
      this.connecting = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private handleError(error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    // Common modbus-serial error messages that indicate connection loss
    if (msg.includes('ECONN') || msg.includes('Port Not Open') || msg.includes('closed') || msg.includes('Timeout')) {
      if (this.connected) {
        console.warn(`[ModbusService] Connection issue detected: ${msg}. Triggering reconnect...`);
        this.connected = false;
        this.connect();
      }
    }
  }

  async readRaw(deviceId: number, startAddress: number, length: number): Promise<number[]> {
    if (this.isSimulation) {
      return this.generateSimulatedData(startAddress, length);
    }

    if (!this.connected || !this.client) {
      // Try to connect if not connected
      this.connect();
      throw new Error('Modbus client not connected');
    }

    try {
      this.client.setID(deviceId);
      // Brief delay to allow the gateway to process the slave ID change
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result = await this.client.readHoldingRegisters(startAddress, length);
      return result.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private generateSimulatedData(startAddress: number, length: number): number[] {
    // Generate an array of 16-bit integers that represent realistic floats
    const data: number[] = new Array(length).fill(0);
    
    // Helper to write a float into two 16-bit registers in the array
    const setFloat = (offset: number, value: number) => {
      const buffer = Buffer.alloc(4);
      buffer.writeFloatBE(value, 0);
      data[offset] = buffer.readUInt16BE(0);
      data[offset + 1] = buffer.readUInt16BE(2);
    };

    // Offsets are relative to 3009 (startAddress)
    // current: 3010 (offset 0)
    setFloat(0, 10 + Math.random() * 5);
    // voltage: 3026 (offset 16)
    setFloat(16, 220 + Math.random() * 10);
    // activePower: 3060 (offset 50)
    setFloat(50, 2000 + Math.random() * 500);
    // reactivePower: 3068 (offset 58)
    setFloat(58, 200 + Math.random() * 100);
    // apparentPower: 3076 (offset 66)
    setFloat(66, 2100 + Math.random() * 500);
    // powerFactor: 3084 (offset 74)
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

    if (!this.connected || !this.client) {
      this.connect();
      throw new Error('Modbus client not connected');
    }

    try {
      this.client.setID(deviceId);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result = await this.client.readHoldingRegisters(startAddress, count * 2);
      
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
    }
  }
}
