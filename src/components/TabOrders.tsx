import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BellRing, 
  Send, 
  Filter, 
  CheckCheck, 
  ChefHat, 
  Utensils, 
  ChevronRight,
  Flame,
  Printer,
  Sparkles
} from 'lucide-react';
import { Order, OrderItem, OrderStatus, WaiterUser } from '../types';

interface TabOrdersProps {
  orders: Order[];
  currentWaiter: WaiterUser;
  onMarkServed: (orderId: string) => void;
  onUpdateItemStatus: (orderId: string, itemId: string, status: OrderStatus) => void;
  onRemindKitchen: (orderId: string) => boolean;
  onReprintKot: (order: Order) => void;
}

export const TabOrders: React.FC<TabOrdersProps> = ({
  orders,
  currentWaiter,
  onMarkServed,
  onUpdateItemStatus,
  onRemindKitchen,
  onReprintKot
}) => {
  const [filter, setFilter] = useState<'all' | 'mine' | 'ready' | 'served'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [remindedOrderIds, setRemindedOrderIds] = useState<string[]>([]);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'mine') return order.waiterId === currentWaiter.id;
    if (filter === 'ready') return order.status === 'READY';
    if (filter === 'served') return order.status === 'SERVED';
    return true;
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || filteredOrders[0];

  const handleRemind = (orderId: string) => {
    onRemindKitchen(orderId);
    setRemindedOrderIds(prev => [...prev, orderId]);
    setTimeout(() => {
      setRemindedOrderIds(prev => prev.filter(id => id !== orderId));
    }, 10000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'SENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">SENT</span>;
      case 'PREPARING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 flex items-center gap-1"><ChefHat className="w-3 h-3" /> PREPARING</span>;
      case 'READY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 animate-pulse flex items-center gap-1 shadow-sm"><BellRing className="w-3 h-3" /> READY FOR PICKUP</span>;
      case 'SERVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">SERVED</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400">CANCELLED</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Sub-Header / Filters */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-amber-400" />
            Kitchen Order Tracker
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            (checkOrder poller: 20s)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              filter === 'mine' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            My Tables
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              filter === 'ready' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ready Only ({orders.filter(o => o.status === 'READY').length})
          </button>
          <button
            onClick={() => setFilter('served')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              filter === 'served' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Served
          </button>
        </div>
      </div>

      {/* Two-pane Master-Detail Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Left Pane: Orders List */}
        <div className="w-full md:w-[380px] lg:w-[440px] border-r border-slate-800 flex flex-col min-h-0 bg-slate-900/60 overflow-hidden">
          <div className="p-3 overflow-y-auto space-y-2 flex-1">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No orders match current filter.
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                const isLate = order.elapsedMins >= 15 && order.status !== 'SERVED';

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/40' 
                        : isLate 
                          ? 'bg-amber-500/10 border-amber-500/50 hover:bg-slate-800' 
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{order.tableName}</span>
                        <span className="text-[11px] font-mono text-slate-400">{order.orderNumber}</span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="text-xs text-slate-300 line-clamp-1 mb-2">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Sent {order.sentAt} ({order.elapsedMins} min ago)
                      </span>
                      <span className="font-bold text-amber-400 font-mono">
                        NPR {order.totalAmount}
                      </span>
                    </div>

                    {isLate && (
                      <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold flex items-center justify-between">
                        <span>⚠️ Order taking &gt; 15 min</span>
                        <span>Remind Kitchen</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Selected Order Detail Sheet */}
        <div className="flex-1 bg-slate-950 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
          {selectedOrder ? (
            <div className="max-w-3xl mx-auto w-full space-y-5">
              
              {/* Card Header */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-white">{selectedOrder.tableName}</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      {selectedOrder.orderNumber}
                    </span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Waiter: <strong>{selectedOrder.waiterName}</strong></span>
                    <span>•</span>
                    <span>Elapsed: <strong className="text-slate-200">{selectedOrder.elapsedMins} mins</strong></span>
                    <span>•</span>
                    <span>Sent At: {selectedOrder.sentAt}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reprint KOT */}
                  <button
                    onClick={() => onReprintKot(selectedOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
                    title="Reprint Kitchen Slip to Thermal Printer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Reprint KOT
                  </button>

                  {/* Mark All Served */}
                  {selectedOrder.status !== 'SERVED' && (
                    <button
                      onClick={() => onMarkServed(selectedOrder.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Mark Served (F6.4)
                    </button>
                  )}
                </div>
              </div>

              {/* Special Instructions Note */}
              {selectedOrder.notes && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Special KOT Note:</strong> {selectedOrder.notes}</span>
                </div>
              )}

              {/* Items Breakdown Table */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                  Ordered Dishes & Course Status
                </h3>

                <div className="space-y-2">
                  {selectedOrder.items.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-700/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-sm text-amber-400 font-mono">
                          {item.quantity}×
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{item.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono uppercase text-slate-400">
                              {item.course}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-amber-400 font-medium">Note: {item.notes}</p>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.elapsedMins} min in kitchen
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}

                        {item.status !== 'SERVED' && (
                          <button
                            onClick={() => onUpdateItemStatus(selectedOrder.id, item.id, 'SERVED')}
                            className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Serve Item
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kitchen Reminder Action (>15 mins warning F6.6) */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-white">Running late or customer inquiring?</h4>
                  <p className="text-slate-400 text-[11px]">Calls SageFrame <code>callWaiter</code> web method to notify head chef.</p>
                </div>

                <button
                  onClick={() => handleRemind(selectedOrder.id)}
                  disabled={remindedOrderIds.includes(selectedOrder.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    remindedOrderIds.includes(selectedOrder.id)
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" />
                  {remindedOrderIds.includes(selectedOrder.id) ? 'Kitchen Reminded ✓' : 'Send Kitchen Priority Ping'}
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Select an order from the list to view courses, items, and status.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
