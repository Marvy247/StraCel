'use client';

import { SlidersHorizontal, X } from 'lucide-react';

export interface FilterState {
  currency: 'all' | 'CELO' | 'G$';
  priceMin: string;
  priceMax: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </div>
        <button onClick={onReset} className="text-xs text-yellow-600 hover:text-yellow-700 cursor-pointer">
          Reset all
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Currency</label>
          <div className="flex gap-2">
            {(['all', 'CELO', 'G$'] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => onChange({ ...filters, currency: cur })}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  filters.currency === cur
                    ? cur === 'all'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                      : cur === 'CELO'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                        : 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {cur === 'all' ? 'All' : cur}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Price Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
              min="0"
              step="0.001"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
              min="0"
              step="0.001"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
