import { render, screen } from '@testing-library/react';
import { DeviceCard } from './DeviceCard';
import { describe, it, expect } from 'vitest';

describe('DeviceCard', () => {
  it('renders all 6 metrics correctly', () => {
    const props = {
      id: 10,
      name: "Device 10",
      voltage: 230.5,
      current: 5.2,
      activePower: 1.1,
      reactivePower: 0.5,
      apparentPower: 1.2,
      powerFactor: 0.95,
      status: 'online' as const
    };

    render(<DeviceCard {...props} />);
    expect(screen.getByText(/Device 10/i)).toBeInTheDocument();

    // Check for labels using exact text to avoid partial matches
    expect(screen.getByText("Voltage")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("Active P.")).toBeInTheDocument();
    expect(screen.getByText("Reactive P.")).toBeInTheDocument();
    expect(screen.getByText("Apparent P.")).toBeInTheDocument();
    expect(screen.getByText("Power Factor")).toBeInTheDocument();

    expect(screen.getByText(/ONLINE/i)).toBeInTheDocument();
  });
});
