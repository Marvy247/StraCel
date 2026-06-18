'use client';

import { loadNotifications, saveNotifications, markAllAsRead, clearAllNotifications, clearNotification } from '@/lib/notifications';
import { Bell, CheckCheck, Trash2, ShoppingCart, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NotificationPanelProps {
  onClose?: () => void;
  compact?: boolean;
}

export default function NotificationPanel({ onClose, compact }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(loadNotifications());

  const refresh = () => setNotifications(loadNotifications());

  const handleMarkAllRead = () => {
    const updated = markAllAsRead(notifications);
    saveNotifications(updated);
    refresh();
  };

  const handleClear = (id: string) => {
    const updated = clearNotification(notifications, id);
    saveNotifications(updated);
    refresh();
  };

  const handleClearAll = () => {
    saveNotifications(clearAllNotifications());
    refresh();
  };

  useEffect(() => {
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCart className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const containerClass = compact
    ? 'w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden'
    : 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm';

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notifications
        </h3>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <>
              <button onClick={handleMarkAllRead} className="text-xs text-slate-400 hover:text-yellow-600 p-1 cursor-pointer" title="Mark all read">
                <CheckCheck className="h-4 w-4" />
              </button>
              <button onClick={handleClearAll} className="text-xs text-slate-400 hover:text-red-500 p-1 cursor-pointer" title="Clear all">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          {onClose && (
            <button onClick={onClose} className="cursor-pointer p-1">
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-72">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 flex items-start gap-3 transition-colors ${
                !n.read ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
              }`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
                  {n.message}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => handleClear(n.id)} className="cursor-pointer">
                <X className="h-3 w-3 text-slate-300 hover:text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
