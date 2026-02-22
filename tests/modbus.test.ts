import { pollDevice, connectModbus, client } from '../src/modbus';

// Mock modbus-serial
jest.mock('modbus-serial');

// Mock InfluxDB module
jest.mock('../src/influx', () => ({
  writeData: jest.fn(),
  flushData: jest.fn().mockResolvedValue(undefined),
}));

describe('Modbus Polling Engine', () => {
  it('should connect to PAS600', async () => {
    (client.connectTCP as jest.Mock).mockResolvedValue(undefined);
    await connectModbus();
    expect(client.connectTCP).toHaveBeenCalled();
  });

  it('should poll a device and read registers', async () => {
    (client.readHoldingRegisters as jest.Mock).mockResolvedValue({ data: [17280, 0] });
    await pollDevice(10);
    expect(client.setID).toHaveBeenCalledWith(10);
    expect(client.readHoldingRegisters).toHaveBeenCalled();
  });
});
