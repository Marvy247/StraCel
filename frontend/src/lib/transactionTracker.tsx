'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { publicClient } from '@/lib/celo';

export type TxStatus = 'pending' | 'confirmed' | 'failed';

export interface TrackedTx {
  id: string;
  hash: string;
  label: string;
  status: TxStatus;
  timestamp: number;
  explorerUrl: string;
}

interface TxTrackerContextValue {
  transactions: TrackedTx[];
  addTx: (hash: string, label: string) => void;
  clearTx: (id: string) => void;
  clearAll: () => void;
}

const TxTrackerContext = createContext<TxTrackerContextValue>({
  transactions: [],
  addTx: () => {},
  clearTx: () => {},
  clearAll: () => {},
});

export function useTxTracker() {
  return useContext(TxTrackerContext);
}

const STORAGE_KEY = 'stracel_tx_history';
const MAX_TXS = 20;
const EXPLORER = 'https://explorer.celo.org/mainnet/tx';

function loadTxs(): TrackedTx[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTxs(txs: TrackedTx[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs.slice(0, MAX_TXS)));
}

export function TxTrackerProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<TrackedTx[]>(loadTxs);
  const pollingRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    saveTxs(transactions);
  }, [transactions]);

  const stopPolling = useCallback((id: string) => {
    if (pollingRef.current[id]) {
      clearInterval(pollingRef.current[id]);
      delete pollingRef.current[id];
    }
  }, []);

  const updateTx = useCallback((id: string, updates: Partial<TrackedTx>) => {
    setTransactions(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      saveTxs(next);
      return next;
    });
  }, []);

  const addTx = useCallback((hash: string, label: string) => {
    const id = crypto.randomUUID();
    const tx: TrackedTx = {
      id, hash, label, status: 'pending',
      timestamp: Date.now(),
      explorerUrl: `${EXPLORER}/${hash}`,
    };
    setTransactions(prev => {
      const next = [tx, ...prev].slice(0, MAX_TXS);
      saveTxs(next);
      return next;
    });

    pollingRef.current[id] = setInterval(async () => {
      try {
        const receipt = await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` });
        if (receipt) {
          stopPolling(id);
          if (receipt.status === 'success') {
            updateTx(id, { status: 'confirmed' });
          } else {
            updateTx(id, { status: 'failed' });
          }
        }
      } catch {
        // not yet mined — keep polling
      }
    }, 3000);
  }, [stopPolling, updateTx]);

  const clearTx = useCallback((id: string) => {
    stopPolling(id);
    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id);
      saveTxs(next);
      return next;
    });
  }, [stopPolling]);

  const clearAll = useCallback(() => {
    Object.keys(pollingRef.current).forEach(stopPolling);
    setTransactions([]);
    saveTxs([]);
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      Object.keys(pollingRef.current).forEach(stopPolling);
    };
  }, [stopPolling]);

  return (
    <TxTrackerContext.Provider value={{ transactions, addTx, clearTx, clearAll }}>
      {children}
    </TxTrackerContext.Provider>
  );
}
