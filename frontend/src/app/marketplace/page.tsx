'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import CreateListingForm from '@/components/CreateListingForm';
import TestnetBanner from '@/components/TestnetBanner';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import type { FilterState } from '@/components/FilterPanel';
import { ListingGridSkeleton } from '@/components/LoadingSkeleton';
import {
  getListings, Listing, CONTRACTS, MARKETPLACE_ABI, GD_ABI,
  getConnectedAddress, connectWallet, formatCELO, recordPurchase, formatAddress, publicClient, getEstimatedGas,
} from '@/lib/celo';
import { useTxTracker } from '@/lib/transactionTracker';
import { createNotification, saveNotifications, loadNotifications, NOTIF_TYPES } from '@/lib/notifications';
import { createWalletClient, custom, parseEther } from 'viem';
import { celo } from 'viem/chains';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ArrowUpDown, Package, SlidersHorizontal, Coins, Fuel, Loader2 } from 'lucide-react';

async function getWalletClient() {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error('No wallet detected');
  return createWalletClient({ chain: celo, transport: custom(eth) });
}

const ITEMS_PER_PAGE = 12;

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [confirmListing, setConfirmListing] = useState<Listing | null>(null);
  const [paymentCurrency, setPaymentCurrency] = useState<'CELO' | 'G$'>('CELO');
  const [estimatedGas, setEstimatedGas] = useState<bigint>(0n);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ currency: 'all', priceMin: '', priceMax: '' });
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { addTx } = useTxTracker();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadListings();
    const addr = getConnectedAddress();
    if (addr) setUserAddress(addr);
  }, []);

  useEffect(() => {
    document.title = 'Marketplace — Stracel';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      setListings(await getListings());
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const ensureConnected = async (): Promise<string | null> => {
    let addr = getConnectedAddress();
    if (!addr) {
      addr = await connectWallet();
      if (addr) setUserAddress(addr);
    }
    return addr;
  };

  const handleCreateListing = async (data: { name: string; description: string; price: number; duration: number; currency: 'CELO' | 'G$' }) => {
    const addr = await ensureConnected();
    if (!addr) return;
    try {
      const wc = await getWalletClient();
      toast.loading('Waiting for wallet confirmation...');
      const fnName = data.currency === 'G$' ? 'createListingGD' : 'createListing';
      const hash = await wc.writeContract({
        address: CONTRACTS.CoreMarketPlace,
        abi: MARKETPLACE_ABI,
        functionName: fnName,
        args: [data.name, data.description, parseEther(data.price.toString()), BigInt(data.duration)],
        account: addr as `0x${string}`,
      });
      addTx(hash, `Create: ${data.name}`);
      const ns = loadNotifications();
      ns.unshift(createNotification(NOTIF_TYPES.LISTING, `"${data.name}" listed for ${data.price} ${data.currency}`));
      saveNotifications(ns);
      toast.dismiss();
      toast.success(`${data.currency} listing created!`);
      loadListings();
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.shortMessage ?? 'Failed to create listing');
    }
  };

  const handlePurchaseListing = async (listingId: number) => {
    const addr = await ensureConnected();
    if (!addr) return;
    const listing = listings.find(l => l.listingId === listingId);
    if (!listing) return;
    setConfirmListing(listing);
    setPaymentCurrency(listing.currency === 1 ? 'G$' : 'CELO');
    try {
      const gas = await getEstimatedGas(addr, CONTRACTS.CoreMarketPlace, listing.price);
      setEstimatedGas(gas);
    } catch { setEstimatedGas(0n); }
  };

  const executePurchase = async (listing: Listing, payCurrency: 'CELO' | 'G$') => {
    const addr = await ensureConnected();
    if (!addr) return;
    setConfirmListing(null);
    try {
      const wc = await getWalletClient();
      let hash: string;

      if (payCurrency === 'CELO') {
        hash = await wc.writeContract({
          address: CONTRACTS.CoreMarketPlace, abi: MARKETPLACE_ABI,
          functionName: 'purchaseListing', args: [BigInt(listing.listingId)],
          value: listing.price, account: addr as `0x${string}`,
        });
      } else {
        const allowance = await publicClient.readContract({
          address: CONTRACTS.GDollar, abi: GD_ABI,
          functionName: 'allowance', args: [addr as `0x${string}`, CONTRACTS.CoreMarketPlace],
        });
        if (allowance < listing.price) {
          const approveHash = await wc.writeContract({
            address: CONTRACTS.GDollar, abi: GD_ABI,
            functionName: 'approve', args: [CONTRACTS.CoreMarketPlace, listing.price],
            account: addr as `0x${string}`,
          });
          addTx(approveHash, `Approve G$ for ${listing.name}`);
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
        hash = await wc.writeContract({
          address: CONTRACTS.CoreMarketPlace, abi: MARKETPLACE_ABI,
          functionName: 'purchaseListingGD', args: [BigInt(listing.listingId)],
          account: addr as `0x${string}`,
        });
      }

      addTx(hash, `Purchase: ${listing.name}`);
      const ns = loadNotifications();
      ns.unshift(createNotification(NOTIF_TYPES.PURCHASE, `Purchased "${listing.name}" for ${formatCELO(listing.price)} ${payCurrency}`));
      saveNotifications(ns);
      recordPurchase({
        listingId: listing.listingId,
        name: listing.name,
        description: listing.description,
        price: formatCELO(listing.price),
        currency: payCurrency,
        seller: listing.seller,
        txHash: hash,
        timestamp: Date.now(),
      });

      toast.success('Purchase submitted!', {
        description: `${formatCELO(listing.price)} ${payCurrency} — Track in Transactions panel.`,
        action: { label: 'View Orders', onClick: () => window.location.href = '/my-orders' },
      });
      loadListings();
    } catch (e: any) {
      toast.error(e.shortMessage ?? 'Purchase failed');
    }
  };

  const handleCancelListing = async (listingId: number) => {
    const addr = await ensureConnected();
    if (!addr) return;
    try {
      const wc = await getWalletClient();
      const hash = await wc.writeContract({
        address: CONTRACTS.CoreMarketPlace,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [BigInt(listingId)],
        account: addr as `0x${string}`,
      });
      addTx(hash, `Cancel listing #${listingId}`);
      const ns2 = loadNotifications();
      ns2.unshift(createNotification(NOTIF_TYPES.LISTING, `Listing #${listingId} cancelled`));
      saveNotifications(ns2);
      toast.success('Listing cancelled!');
      loadListings();
    } catch (e: any) {
      toast.error(e.shortMessage ?? 'Cancel failed');
    }
  };

  const filteredListings = useCallback(() => {
    return listings
      .filter(l => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!l.name.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q)) return false;
        }
        if (filters.currency !== 'all') {
          const cur = filters.currency === 'CELO' ? 0 : 1;
          if (l.currency !== cur) return false;
        }
        const priceNum = Number(l.price);
        if (filters.priceMin && priceNum < Number(parseEther(filters.priceMin))) return false;
        if (filters.priceMax && priceNum > Number(parseEther(filters.priceMax))) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.price - b.price);
        if (sortBy === 'price-high') return Number(b.price - a.price);
        return b.listingId - a.listingId;
      });
  }, [listings, searchQuery, filters, sortBy]);

  const result = filteredListings();
  const paginated = result.slice(0, visibleCount);
  const hasMore = visibleCount < result.length;

  const resetFilters = () => {
    setFilters({ currency: 'all', priceMin: '', priceMax: '' });
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-yellow-50/20 to-green-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <TestnetBanner />
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-green-500 bg-clip-text text-transparent mb-2">
                Marketplace
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {result.length} listing{result.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <span className="hidden sm:inline text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono">/</kbd> to search
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <CreateListingForm onCreateListing={handleCreateListing} />
          <div className="flex-1" ref={searchRef}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search listings..." />
          </div>
          <Select value={sortBy} onValueChange={(v: any) => { setSortBy(v); setVisibleCount(ITEMS_PER_PAGE); }}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:w-auto ${showFilters ? 'border-yellow-500 text-yellow-600' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex gap-6">
          {showFilters && (
            <div className="w-full sm:w-64 shrink-0">
              <FilterPanel filters={filters} onChange={setFilters} onReset={resetFilters} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {loading ? (
              <ListingGridSkeleton count={6} />
            ) : paginated.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg">
                <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                  {searchQuery || filters.currency !== 'all' || filters.priceMin || filters.priceMax
                    ? 'No listings match your criteria.'
                    : 'No active listings yet.'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchQuery || filters.currency !== 'all' || filters.priceMin || filters.priceMax
                    ? 'Try adjusting your filters or search.'
                    : 'Be the first to create a listing!'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginated.map(listing => (
                    <ListingCard
                      key={listing.listingId}
                      listing={listing}
                      onPurchase={handlePurchaseListing}
                      onCancel={handleCancelListing}
                      isOwner={listing.seller.toLowerCase() === userAddress.toLowerCase()}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                      className="px-8"
                    >
                      Load More ({result.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
                <p className="text-center text-xs text-slate-400 mt-4">
                  Showing {paginated.length} of {result.length} listings
                </p>
              </>
            )}
          </div>
        </div>

        <ConfirmDialog
          open={!!confirmListing}
          onOpenChange={(open) => { if (!open) { setConfirmListing(null); setPaymentCurrency('CELO'); } }}
          title="Confirm Purchase"
          description={
            confirmListing
              ? `You are about to buy "${confirmListing.name}" for ${formatCELO(confirmListing.price)} ${confirmListing.currency === 1 ? 'G$' : 'CELO'}.\n\nFunds are sent directly to the seller (${formatAddress(confirmListing.seller)}) via smart contract.`
              : ''
          }
          onConfirm={() => confirmListing && executePurchase(confirmListing, paymentCurrency)}
          confirmText={`Pay ${confirmListing ? formatCELO(confirmListing.price) : ''} ${paymentCurrency}`}
        >
          {confirmListing && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Pay with</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentCurrency('CELO')}
                    className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                      paymentCurrency === 'CELO'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <Coins className={`h-4 w-4 ${paymentCurrency === 'CELO' ? 'text-yellow-500' : ''}`} />
                    CELO
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentCurrency('G$')}
                    className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                      paymentCurrency === 'G$'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <Coins className={`h-4 w-4 ${paymentCurrency === 'G$' ? 'text-green-500' : ''}`} />
                    G$
                  </button>
                </div>
              </div>

              {estimatedGas > 0n && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-2 rounded">
                  <Fuel className="h-3 w-3" />
                  <span>Est. gas fee: ~{formatCELO(estimatedGas)} CELO</span>
                </div>
              )}
            </div>
          )}
        </ConfirmDialog>
      </main>
      <Footer />
    </div>
  );
}
