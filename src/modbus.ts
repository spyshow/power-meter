import ModbusRTU from 'modbus-serial';
import dotenv from 'dotenv';
import { writeData, flushData } from './influx';
import { emitDeviceUpdate } from './events';

dotenv.config();

const PAS600_IP = process.env.PAS600_IP || '172.16.0.80';
const PAS600_PORT = parseInt(process.env.PAS600_PORT || '502', 10);
const DEVICE_IDS = [10, 20, 30, 40, 50, 60];

export const client = new ModbusRTU();

// Register addresses (PM5310 - Float32)
const REG_CURRENT_AVG = 3000 - 1; // 1-based to 0-based
const REG_VOLTAGE_LL_AVG = 3028 - 1;
const REG_KVA_TOT = 3060 - 1;

// Optimized: Read range from 3000 to 3062 (64 registers total) to get all values in one go
// However, the gap is large (3000 to 3062 = 62 regs). 
// Let's read smaller blocks if the device doesn't like large gaps, 
// but usually PM5310 handles it. 
// Alternatively, let's just make the existing calls more robust.

let isConnected = false;
const deviceStatus: Record<number, { status: 'online' | 'offline', failCount: number }> = {};

export const connectModbus = async () => {
  if (isConnected) return;
  
  try {
    await client.connectTCP(PAS600_IP, { port: PAS600_PORT });
    client.setID(1);
    client.setTimeout(2000); 
    isConnected = true;
    console.log(`Connected to PAS600 at ${PAS600_IP}:${PAS600_PORT}`);
  } catch (error) {
    isConnected = false;
    console.error('Error connecting to Modbus:', error instanceof Error ? error.message : error);
    setTimeout(connectModbus, 5000);
  }
};

const readFloat = async (address: number): Promise<number> => {
  const result = await client.readHoldingRegisters(address, 2);
  if (!result || !result.data || result.data.length < 2) {
    throw new Error(`Invalid Modbus response for address ${address}`);
  }
  const buffer = Buffer.alloc(4);
  buffer.writeUInt16BE(result.data[0], 0);
  buffer.writeUInt16BE(result.data[1], 2);
  return buffer.readFloatBE(0);
};

// Helper for sequential polling with delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const pollDevice = async (id: number) => {
  if (!deviceStatus[id]) {
    deviceStatus[id] = { status: 'offline', failCount: 0 };
  }

  if (!isConnected) {
    if (deviceStatus[id].status === 'online') {
      deviceStatus[id].status = 'offline';
      emitDeviceUpdate(id, { status: 'offline' });
    }
    return;
  }
  
  try {
    client.setID(id);
    
    // Some devices prefer a small delay after setID
    await delay(10);

    const current = await readFloat(REG_CURRENT_AVG);
    const voltage = await readFloat(REG_VOLTAGE_LL_AVG);
    const kva = await readFloat(REG_KVA_TOT);

    // Sanity check: If values are exactly 0 but status was online, 
    // it might be a temporary read glitch on the gateway side.
    // However, we should report what we get unless it's impossible.
    
    deviceStatus[id].failCount = 0;
    
    if (deviceStatus[id].status === 'offline') {
      console.log(`Device ${id} is now ONLINE`);
      deviceStatus[id].status = 'online';
    }

    emitDeviceUpdate(id, { voltage, current, kva, status: 'online' });
    writeData('power_consumption', { device_id: id.toString() }, { voltage, current, kva });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    deviceStatus[id].failCount++;
    
    if (deviceStatus[id].failCount >= 3 && deviceStatus[id].status === 'online') {
      console.error(`Device ${id} marked OFFLINE after 3 failures:`, msg);
      deviceStatus[id].status = 'offline';
      emitDeviceUpdate(id, { status: 'offline' });
    }

    if (msg.includes('ECONN') || msg.includes('Port Not Open') || msg.includes('closed') || msg.includes('Timeout')) {
      if (!msg.includes('Timeout')) {
        isConnected = false;
        connectModbus();
      }
    }
  }
};

export const startPolling = async () => {
  // Use a recursive timeout instead of setInterval to ensure 
  // one poll finishes before the next starts, avoiding congestion.
  const runPoll = async () => {
    for (const id of DEVICE_IDS) {
      if (!isConnected) break;
      await pollDevice(id);
      await delay(50); // 50ms gap between devices to let the PAS600 breathe
    }
    await flushData();
    setTimeout(runPoll, 1000); // Wait 1s after the LAST device finishes
  };
  
  runPoll();
};

// Export for testing
export const setConnected = (val: boolean) => { isConnected = val; };
