import ModbusRTU from 'modbus-serial';
import dotenv from 'dotenv';
import { writeData, flushData } from './influx';

dotenv.config();

const PAS600_IP = process.env.PAS600_IP || '172.16.0.80';
const PAS600_PORT = parseInt(process.env.PAS600_PORT || '502', 10);
const DEVICE_IDS = [10, 20, 30, 40, 50, 60];

export const client = new ModbusRTU();

// Register addresses (PM5310 - Float32)
const REG_CURRENT_AVG = 3000 - 1; // 1-based to 0-based
const REG_VOLTAGE_LL_AVG = 3028 - 1;
const REG_KVA_TOT = 3060 - 1;

export const connectModbus = async () => {
  try {
    await client.connectTCP(PAS600_IP, { port: PAS600_PORT });
    client.setID(1); // Default ID for gateway, will be changed per poll
    client.setTimeout(1000);
    console.log(`Connected to PAS600 at ${PAS600_IP}:${PAS600_PORT}`);
  } catch (error) {
    console.error('Error connecting to Modbus:', error);
  }
};

const readFloat = async (address: number): Promise<number> => {
  const result = await client.readHoldingRegisters(address, 2);
  // Modbus registers are 16-bit. Float32 is 32-bit (2 registers).
  // Assuming big-endian (typical for Schneider)
  const buffer = Buffer.alloc(4);
  buffer.writeUInt16BE(result.data[0], 0);
  buffer.writeUInt16BE(result.data[1], 2);
  return buffer.readFloatBE(0);
};

export const pollDevice = async (id: number) => {
  try {
    client.setID(id);
    
    // Read Current, Voltage, KVA
    const current = await readFloat(REG_CURRENT_AVG);
    const voltage = await readFloat(REG_VOLTAGE_LL_AVG);
    const kva = await readFloat(REG_KVA_TOT);

    console.log(`Device ${id}: ${voltage}V, ${current}A, ${kva}kVA`);

    // Write to InfluxDB
    writeData('power_consumption', { device_id: id.toString() }, { voltage, current, kva });
  } catch (error) {
    console.error(`Error polling device ${id}:`, error);
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
