import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ListingCard from '../ListingCard';
import { Listing } from '@/lib/celo';

const mockListing: Listing = {
  listingId: 1,
  seller: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'Test Item',
  description: 'A test item for sale',
  price: 1000000n,
  currency: 0,
  status: 0,
  createdAt: 1000n,
  expiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400),
};

describe('ListingCard Component', () => {
  it('renders listing information correctly', () => {
    render(<ListingCard listing={mockListing} />);

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('A test item for sale')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Buy button for non-owner active listings', () => {
    render(<ListingCard listing={mockListing} isOwner={false} />);

    expect(screen.getByText(/Buy with/)).toBeInTheDocument();
  });

  it('shows Cancel button for owner', () => {
    render(<ListingCard listing={mockListing} isOwner={true} />);

    expect(screen.getByText('Cancel Listing')).toBeInTheDocument();
  });

  it('calls onPurchase when Buy button is clicked', async () => {
    const onPurchase = vi.fn();
    render(<ListingCard listing={mockListing} onPurchase={onPurchase} isOwner={false} />);

    const purchaseButton = screen.getByText(/Buy with/);
    fireEvent.click(purchaseButton);

    expect(onPurchase).toHaveBeenCalledWith(1);
  });

  it('shows Sold status for sold listings', () => {
    const soldListing = { ...mockListing, status: 1 };

    render(<ListingCard listing={soldListing} isOwner={false} />);

    expect(screen.getAllByText('Sold')).toHaveLength(2);
  });

  it('formats seller address correctly', () => {
    render(<ListingCard listing={mockListing} />);

    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
  });
});
