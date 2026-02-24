import { pollDevice, connectModbus, client, setConnected } from '../src/modbus';

// Mock modbus-serial
jest.mock('modbus-serial');

// Mock InfluxDB module
jest.mock('../src/influx', () => ({
  writeData: jest.fn(),
  flushData: jest.fn().mockResolvedValue(undefined),
}));

// Mock PeakService
jest.mock('../src/peaks', () => ({
  peaks: {
    checkPeak: jest.fn().mockResolvedValue(undefined),
  }
}));

import { peaks } from '../src/peaks';

describe('Modbus Polling Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setConnected(false);
  });

  it('should connect to PAS600', async () => {
    (client.connectTCP as jest.Mock).mockResolvedValue(undefined);
    await connectModbus();
    expect(client.connectTCP).toHaveBeenCalled();
  });

  it('should poll a device and read registers', async () => {
    setConnected(true);
    (client.readHoldingRegisters as jest.Mock).mockResolvedValue({ data: [17280, 0] });
    await pollDevice(10);
    expect(client.setID).toHaveBeenCalledWith(10);
    expect(client.readHoldingRegisters).toHaveBeenCalled();
  });

  it('should check for peaks during polling', async () => {
    setConnected(true);
    // Mock float value for 230V
    (client.readHoldingRegisters as jest.Mock).mockResolvedValue({ data: [17254, 0] });
    
    await pollDevice(10);

    expect(peaks.checkPeak).toHaveBeenCalledWith(10, 'voltage', expect.any(Number));
    expect(peaks.checkPeak).toHaveBeenCalledWith(10, 'current', expect.any(Number));
    expect(peaks.checkPeak).toHaveBeenCalledWith(10, 'kva', expect.any(Number));
  });

  it('should attempt reconnection on failure', async () => {
    jest.useFakeTimers();
    (client.connectTCP as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));
    
    await connectModbus();
    
    expect(client.connectTCP).toHaveBeenCalledTimes(1);
    
    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000);
    
    expect(client.connectTCP).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});
