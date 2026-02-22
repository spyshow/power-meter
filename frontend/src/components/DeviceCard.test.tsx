import { render, screen } from '@testing-library/react';
import { DeviceCard } from './DeviceCard';
import { describe, it, expect } from 'vitest';

describe('DeviceCard', () => {
  it('renders device info correctly', () => {
    const { container } = render(<DeviceCard id={10} name="Device 10" voltage={230} current={11} kva={2} status="online" />);
    expect(screen.getByText(/Device 10/i)).toBeInTheDocument();
    
    // Check for labels
    expect(screen.getByText(/Voltage/i)).toBeInTheDocument();
    expect(screen.getByText(/Current/i)).toBeInTheDocument();
    expect(screen.getByText(/Power/i)).toBeInTheDocument();
    
    // Check for values in the specific statistic sections
    const stats = container.querySelectorAll('.ant-statistic-content-value');
    expect(stats[0].textContent).toContain('230');
    expect(stats[1].textContent).toContain('11');
    expect(stats[2].textContent).toContain('2');
    
    expect(screen.getByText(/ONLINE/i)).toBeInTheDocument();
  });
});
