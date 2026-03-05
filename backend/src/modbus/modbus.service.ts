import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ModbusRTU from 'modbus-serial';

@Injectable()
export class ModbusService implements OnModuleInit, OnModuleDestroy {
  private client: ModbusRTU;
  private connected = false;
  private readonly ip: string;
  private readonly port: number;

  constructor(private configService: ConfigService) {
    this.client = new ModbusRTU();
    this.ip = this.configService.get<string>('PAS600_IP') || '172.16.0.80';
    this.port = parseInt(this.configService.get<string>('PAS600_PORT') || '502', 10);
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close(() => {});
    }
  }

  async connect() {
    if (this.connected) return;

    try {
      await this.client.connectTCP(this.ip, { port: this.port });
      this.client.setID(1);
      this.client.setTimeout(2000);
      this.connected = true;
      console.log(`[ModbusService] Connected to PAS600 at ${this.ip}:${this.port}`);
    } catch (error) {
      this.connected = false;
      console.error('[ModbusService] Error connecting to Modbus:', error instanceof Error ? error.message : error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async readFloat(deviceId: number, address: number): Promise<number> {
    const results = await this.readFloats(deviceId, address, 1);
    return results[0];
  }

  async readFloats(deviceId: number, startAddress: number, count: number): Promise<number[]> {
    if (!this.connected) {
      throw new Error('Modbus client not connected');
    }

    try {
      this.client.setID(deviceId);
      // Essential delay for PAS600 serial switching
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Each float is 2 registers
      const result = await this.client.readHoldingRegisters(startAddress, count * 2);
      
      if (!result || !result.data || result.data.length < count * 2) {
        throw new Error(`Invalid Modbus response for address ${startAddress}`);
      }

      const floats: number[] = [];
      for (let i = 0; i < count; i++) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt16BE(result.data[i * 2], 0);
        buffer.writeUInt16BE(result.data[i * 2 + 1], 2);
        floats.push(buffer.readFloatBE(0));
      }
      return floats;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('ECONN') || msg.includes('Port Not Open') || msg.includes('closed')) {
        this.connected = false;
        this.connect();
      }
      throw error;
    }
  }

  /**
   * Reads a raw buffer of registers. Useful for non-contiguous data in a range.
   */
  async readRaw(deviceId: number, startAddress: number, length: number): Promise<number[]> {
    if (!this.connected) throw new Error('Modbus client not connected');
    this.client.setID(deviceId);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const result = await this.client.readHoldingRegisters(startAddress, length);
    return result.data;
  }
}
