'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TestnetBanner from '@/components/TestnetBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Listing, CONTRACTS, MARKETPLACE_ABI, publicClient, formatCELO, formatAddress, getConnectedAddress, connectWallet, recordPurchase } from '@/lib/celo';
import { useTxTracker } from '@/lib/transactionTracker';
import { createWalletClient, custom } from 'viem';
import { celo } from 'viem/chains';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, User, Clock, ExternalLink, Package, Info } from 'lucide-react';

async function getWalletClient() {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error('No wallet detected');
  return createWalletClient({ chain: celo, transport: custom(eth) });
}

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = Number(params.id);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const { addTx } = useTxTracker();

  useEffect(() => {
    const addr = getConnectedAddress();
    if (addr) setUserAddress(addr);
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    setLoading(true);
    setError('');
    try {
      const l = await publicClient.readContract({
        address: CONTRACTS.CoreMarketPlace,
        abi: MARKETPLACE_ABI,
        functionName: 'getListing',
        args: [BigInt(listingId)],
      }) as any;
      setListing({
        listingId,
        seller: l.seller,
        name: l.name,
        description: l.description,
        price: l.price,
        currency: l.currency,
        status: l.status,
        createdAt: l.createdAt,
        expiresAt: l.expiresAt,
      });
    } catch {
      setError('Listing not found');
    } finally {
      setLoading(false);
    }
  };

  const ensureConnected = async () => {
    let addr = getConnectedAddress();
    if (!addr) {
      addr = await connectWallet();
      if (addr) setUserAddress(addr);
    }
    return addr;
  };

  const handlePurchase = async () => {
    const addr = await ensureConnected();
    if (!addr || !listing) return;
    setPurchasing(true);
    try {
      const wc = await getWalletClient();
      const hash = await wc.writeContract({
        address: CONTRACTS.CoreMarketPlace, abi: MARKETPLACE_ABI,
        functionName: 'purchaseListing', args: [BigInt(listingId)],
        value: listing.price, account: addr as `0x${string}`,
      });
      addTx(hash, `Purchase: ${listing.name}`);
      recordPurchase({
        listingId: listing.listingId,
        name: listing.name,
        description: listing.description,
        price: formatCELO(listing.price),
        currency: listing.currency === 1 ? 'G$' : 'CELO',
        seller: listing.seller,
        txHash: hash,
        timestamp: Date.now(),
      });
      toast.success('Purchase submitted!', {
        description: 'Track progress in the Transactions panel.',
        action: { label: 'View Orders', onClick: () => window.location.href = '/my-orders' },
      });
      loadListing();
    } catch (e: any) {
      toast.error(e.shortMessage ?? 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-yellow-50/20 to-green-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <TestnetBanner /><Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-yellow-50/20 to-green-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <TestnetBanner /><Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center w-full">
          <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Listing Not Found</h2>
          <p className="text-slate-500 mb-6">{error || 'This listing does not exist or has been removed.'}</p>
          <Link href="/marketplace"><Button>Back to Marketplace</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = listing.seller.toLowerCase() === userAddress.toLowerCase();
  const isActive = listing.status === 0;
  const currency = listing.currency === 1 ? 'G$' : 'CELO';
  const statusLabel = ['Active', 'Sold', 'Cancelled'][listing.status];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-yellow-50/20 to-green-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <TestnetBanner /><Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <Link href="/marketplace" className="inline-flex items-center text-sm text-slate-500 hover:text-yellow-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Marketplace
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{listing.name}</h1>
              <Badge className={`${isActive ? 'bg-green-500' : listing.status === 1 ? 'bg-blue-500' : 'bg-slate-400'} shrink-0`}>
                {statusLabel}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{formatAddress(listing.seller)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Created block #{listing.createdAt.toString()}</span>
              </div>
              {listing.expiresAt > 0n && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Expires block #{listing.expiresAt.toString()}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</h3>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-green-500 bg-clip-text text-transparent">
                  {formatCELO(listing.price)} {currency}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Seller receives</p>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  {formatCELO(listing.price)} {currency}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg mb-6">
              <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Funds are sent directly to the seller via smart contract. No intermediaries, no fees.
              </p>
            </div>

            {isActive && !isOwner && (
              <Button onClick={handlePurchase} disabled={purchasing} size="lg"
                className="w-full bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white border-0 text-lg py-6">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {purchasing ? 'Processing...' : `Buy Now — ${formatCELO(listing.price)} ${currency}`}
              </Button>
            )}

            {isActive && isOwner && (
              <p className="text-center text-sm text-slate-400">You own this listing</p>
            )}

            {!isActive && (
              <p className="text-center text-sm text-slate-400">
                This item has been {listing.status === 1 ? 'sold' : 'cancelled'}.
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">On-Chain Details</h3>
              <div className="space-y-1 text-xs text-slate-500 font-mono">
                <p>Listing ID: #{listing.listingId}</p>
                <p>Seller: {listing.seller}</p>
                <p>Contract: {formatAddress(CONTRACTS.CoreMarketPlace)}</p>
                <a
                  href={`https://explorer.celo.org/mainnet/address/${CONTRACTS.CoreMarketPlace}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" /> View Contract on Explorer
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
