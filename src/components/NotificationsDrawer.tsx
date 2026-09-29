import React from 'react';
import { X, Bell, BellRing, Printer, AlertTriangle, CheckCircle } from 'lucide-react';
import { Order } from '../types';

export interface AppNotification {
  id: string;
  type: 'READY' | 'PRINT_ERROR' | 'OFFLINE';
  title: string;
  message: string;
  time: string;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClearAll: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-sm h-full shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Shift Notifications</h3>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400">
              {notifications.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs">
              No new alerts. Kitchen orders and printer status updates appear here.
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id}
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  n.type === 'READY'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                    : n.type === 'PRINT_ERROR'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {n.type === 'READY' && <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                    {n.type === 'PRINT_ERROR' && <Printer className="w-3.5 h-3.5 text-rose-400" />}
                    {n.type === 'OFFLINE' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    {n.title}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">{n.time}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
