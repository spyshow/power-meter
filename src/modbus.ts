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

let isConnected = false;

export const connectModbus = async () => {
  if (isConnected) return;
  
  try {
    await client.connectTCP(PAS600_IP, { port: PAS600_PORT });
    client.setID(1);
    client.setTimeout(1000);
    isConnected = true;
    console.log(`Connected to PAS600 at ${PAS600_IP}:${PAS600_PORT}`);
  } catch (error) {
    isConnected = false;
    console.error('Error connecting to Modbus:', error instanceof Error ? error.message : error);
    // Retry connection after 5 seconds
    setTimeout(connectModbus, 5000);
  }
};

const readFloat = async (address: number): Promise<number> => {
  const result = await client.readHoldingRegisters(address, 2);
  const buffer = Buffer.alloc(4);
  buffer.writeUInt16BE(result.data[0], 0);
  buffer.writeUInt16BE(result.data[1], 2);
  return buffer.readFloatBE(0);
};

export const pollDevice = async (id: number) => {
  if (!isConnected) {
    console.warn(`Skipping poll for device ${id}: Not connected to gateway`);
    return;
  }
  
  try {
    client.setID(id);
    
    const current = await readFloat(REG_CURRENT_AVG);
    const voltage = await readFloat(REG_VOLTAGE_LL_AVG);
    const kva = await readFloat(REG_KVA_TOT);

    console.log(`Device ${id}: ${voltage.toFixed(1)}V, ${current.toFixed(2)}A, ${kva.toFixed(2)}kVA`);

    emitDeviceUpdate(id, { voltage, current, kva });
    writeData('power_consumption', { device_id: id.toString() }, { voltage, current, kva });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`Error polling device ${id}:`, msg);
    
    if (msg.includes('ECONN') || msg.includes('Port Not Open') || msg.includes('closed')) {
      isConnected = false;
      connectModbus();
    }
  }
};

export const startPolling = async () => {
  setInterval(async () => {
    for (const id of DEVICE_IDS) {
      await pollDevice(id);
    }
    await flushData();
  }, 1000);
};

// Export for testing
export const setConnected = (val: boolean) => { isConnected = val; };
