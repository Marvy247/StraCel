import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import Header from '../Header';
import * as navigation from 'next/navigation';

vi.mock('@/lib/celo', () => ({
  getConnectedAddress: vi.fn(() => null),
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
  formatAddress: vi.fn((address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`),
  formatCELO: vi.fn(() => '0.0000'),
  getWalletBalance: vi.fn(() => Promise.resolve(0n)),
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header with logo and navigation', () => {
    render(<Header />);

    expect(screen.getByText('Stracel')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('My Listings')).toBeInTheDocument();
    expect(screen.getByText('My Orders')).toBeInTheDocument();
  });

  it('shows Connect Wallet button when not connected', () => {
    render(<Header />);

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);

    const marketplaceLink = screen.getByText('Marketplace').closest('a');
    const myListingsLink = screen.getByText('My Listings').closest('a');
    const myOrdersLink = screen.getByText('My Orders').closest('a');

    expect(marketplaceLink).toHaveAttribute('href', '/marketplace');
    expect(myListingsLink).toHaveAttribute('href', '/my-listings');
    expect(myOrdersLink).toHaveAttribute('href', '/my-orders');
  });

  it('applies active styling to current page', () => {
    vi.spyOn(navigation, 'usePathname').mockReturnValue('/');

    render(<Header />);
  });
});
