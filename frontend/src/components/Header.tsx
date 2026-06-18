'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatAddress, formatCELO, getWalletBalance, getGDBalance, connectWallet, disconnectWallet, getConnectedAddress } from '@/lib/celo';
import { Wallet, LogOut, Copy, CheckCircle2, RefreshCw, DollarSign } from 'lucide-react';
import MobileNav from '@/components/MobileNav';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const pathname = usePathname();
  const [userAddress, setUserAddress] = useState<string>('');
  const [balance, setBalance] = useState<bigint>(0n);
  const [gdBalance, setGdBalance] = useState<bigint>(0n);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadBalances = useCallback(async (address: string) => {
    setLoadingBalance(true);
    const [celoBal, gdBal] = await Promise.all([
      getWalletBalance(address),
      getGDBalance(address),
    ]);
    setBalance(celoBal);
    setGdBalance(gdBal);
    setLoadingBalance(false);
  }, []);

  const loadUserData = useCallback(() => {
    const address = getConnectedAddress();
    if (address) {
      setUserAddress(address);
      loadBalances(address);
    } else {
      setUserAddress('');
      setBalance(0n);
      setGdBalance(0n);
    }
  }, [loadBalances]);

  useEffect(() => {
    loadUserData();
    window.addEventListener('storage', loadUserData);
    return () => window.removeEventListener('storage', loadUserData);
  }, [loadUserData]);

  const handleConnect = async () => {
    const address = await connectWallet();
    if (address) { setUserAddress(address); loadUserData(); }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setUserAddress('');
    setBalance(0n);
    window.dispatchEvent(new Event('storage'));
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(userAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/my-listings', label: 'My Listings' },
    { href: '/my-orders', label: 'My Orders' },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-green-500 bg-clip-text text-transparent">Stracel</h1>
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">on Celo</span>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}>
                <span className={`px-4 py-2 rounded-md font-medium transition-all cursor-pointer text-sm ${
                  pathname === href
                    ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {userAddress && <NotificationBell />}
            {userAddress ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-yellow-500/20 hover:ring-yellow-500/50 transition-all">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-yellow-400 to-green-500 text-white font-semibold">
                      {userAddress.slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-slate-800">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Address</span>
                      <button onClick={copyAddress} className="text-xs text-yellow-600 flex items-center gap-1">
                        {copied ? <><CheckCircle2 className="h-3 w-3" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                      </button>
                    </div>
                    <p className="text-sm font-mono bg-slate-100 dark:bg-slate-700 p-2 rounded break-all">
                      {formatAddress(userAddress)}
                    </p>
                  </div>
                  <div className="px-2 py-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Balances</span>
                      <button onClick={() => loadBalances(userAddress)} className="text-xs text-yellow-600 flex items-center gap-1 cursor-pointer" title="Refresh balances">
                        <RefreshCw className={`h-3 w-3 ${loadingBalance ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">CELO</span>
                      </div>
                      <span className="text-sm font-mono font-medium">
                        {loadingBalance ? '...' : formatCELO(balance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">G$</span>
                      </div>
                      <span className="text-sm font-mono font-medium">
                        {loadingBalance ? '...' : formatCELO(gdBalance)}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleConnect} size="sm" className="cursor-pointer bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white border-0">
                <Wallet className="h-4 w-4 mr-2" />Connect Wallet
              </Button>
            )}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
