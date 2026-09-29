import React from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { QueuedOrder } from '../types';

interface OfflineBannerProps {
  isOffline: boolean;
  queuedOrders: QueuedOrder[];
  onSyncNow: () => void;
  onClearConflicts: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  queuedOrders,
  onSyncNow,
  onClearConflicts
}) => {
  if (!isOffline && queuedOrders.length === 0) return null;

  const conflictsCount = queuedOrders.filter(q => q.syncState === 'CONFLICT').length;

  return (
    <div className={`w-full px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner ${
      isOffline 
        ? 'bg-amber-500 text-slate-950 font-medium' 
        : 'bg-emerald-600 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {isOffline ? (
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0 animate-bounce" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
        )}
        <span>
          {isOffline ? (
            <>
              <strong>OFFLINE MODE ACTIVE:</strong> Wi-Fi or server heartbeat unreachable. Orders will be saved securely to local SQLite/Room queue.
            </>
          ) : (
            <>
              <strong>NETWORK RESTORED:</strong> Ready to synchronize queued offline orders with SageFrame IIS server.
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-slate-950/15 font-bold">
          {queuedOrders.length} {queuedOrders.length === 1 ? 'order' : 'orders'} in queue
        </span>

        {conflictsCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-700 text-white font-bold">
            <ShieldAlert className="w-3 h-3" />
            {conflictsCount} conflict
          </span>
        )}

        {!isOffline && queuedOrders.length > 0 && (
          <button
            onClick={onSyncNow}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950 text-white font-bold hover:bg-slate-900 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Sync Now
          </button>
        )}
      </div>
    </div>
  );
};
