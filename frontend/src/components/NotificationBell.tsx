'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { loadNotifications, getUnreadCount } from '@/lib/notifications';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState(loadNotifications());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => {
      const ns = loadNotifications();
      setNotifications(ns);
      setUnread(getUnreadCount(ns));
    };
    refresh();
    window.addEventListener('storage', refresh);
    const interval = setInterval(refresh, 15000);
    return () => {
      window.removeEventListener('storage', refresh);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <NotificationPanel onClose={() => setOpen(false)} compact />
        </div>
      )}
    </div>
  );
}
