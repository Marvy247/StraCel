'use client';

import { useState } from 'react';
import { useTxTracker } from '@/lib/transactionTracker';
import { Clock, CheckCircle2, XCircle, ExternalLink, X, ListTodo } from 'lucide-react';

export default function TransactionPanel() {
  const { transactions, clearTx, clearAll } = useTxTracker();
  const [isOpen, setIsOpen] = useState(false);

  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer"
      >
        <ListTodo className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {transactions.length > 0 ? `${transactions.length} tx` : 'Transactions'}
        </span>
        {pendingCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-white animate-pulse">
            {pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-16 right-4 z-50 w-80 max-h-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Transactions</h3>
              <div className="flex items-center gap-2">
                {transactions.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                    Clear all
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="cursor-pointer">
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-80">
              {transactions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No transactions yet
                </div>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{tx.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{tx.hash.slice(0, 14)}...</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {tx.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />}
                        {tx.status === 'confirmed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {tx.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                        <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                          <ExternalLink className="h-3 w-3 text-slate-400 hover:text-yellow-500" />
                        </a>
                        <button onClick={() => clearTx(tx.id)} className="cursor-pointer">
                          <X className="h-3 w-3 text-slate-300 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                      {tx.status === 'confirmed' && <span className="text-green-500 ml-2">Confirmed</span>}
                      {tx.status === 'failed' && <span className="text-red-500 ml-2">Failed</span>}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
