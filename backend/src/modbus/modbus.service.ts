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
    if (!this.connected) {
      throw new Error('Modbus client not connected');
    }

    try {
      this.client.setID(deviceId);
      // Small delay after setID as per original logic
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await this.client.readHoldingRegisters(address, 2);
      if (!result || !result.data || result.data.length < 2) {
        throw new Error(`Invalid Modbus response for address ${address}`);
      }

      const buffer = Buffer.alloc(4);
      buffer.writeUInt16BE(result.data[0], 0);
      buffer.writeUInt16BE(result.data[1], 2);
      return buffer.readFloatBE(0);
    } catch (error) {
      // If communication error, mark as disconnected if appropriate
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('ECONN') || msg.includes('Port Not Open') || msg.includes('closed') || msg.includes('Timeout')) {
        if (!msg.includes('Timeout')) {
          this.connected = false;
          this.connect();
        }
      }
      throw error;
    }
  }
}
