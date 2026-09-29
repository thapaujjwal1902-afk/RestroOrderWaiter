import React, { useState } from 'react';
import { 
  Receipt, 
  Eye, 
  Scissors, 
  Sparkles, 
  Printer, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  DoorOpen, 
  UserCheck, 
  Clock, 
  Percent,
  Check
} from 'lucide-react';
import { Bill } from '../types';

interface TabBillsProps {
  bills: Bill[];
  onOpenGuestPresentation: (bill: Bill) => void;
  onPrintBill: (bill: Bill) => void;
  onApplyLoyalty: (billId: string, memberId: string) => { success: boolean; discountAmount: number; memberName: string };
  onOpenDrawer: () => boolean;
}

export const TabBills: React.FC<TabBillsProps> = ({
  bills,
  onOpenGuestPresentation,
  onPrintBill,
  onApplyLoyalty,
  onOpenDrawer
}) => {
  const [selectedBillId, setSelectedBillId] = useState<string>(bills[0]?.id || '');
  const [memberIdInput, setMemberIdInput] = useState('');
  const [loyaltySuccessMessage, setLoyaltySuccessMessage] = useState<string | null>(null);
  const [drawerKicked, setDrawerKicked] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitParts, setSplitParts] = useState(2);

  const selectedBill = bills.find(b => b.id === selectedBillId) || bills[0];

  const handleApplyLoyalty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberIdInput || !selectedBill) return;
    const res = onApplyLoyalty(selectedBill.id, memberIdInput);
    if (res.success) {
      setLoyaltySuccessMessage(`Applied 15% VIP Club discount (NPR ${res.discountAmount}) for ${res.memberName}`);
      setTimeout(() => setLoyaltySuccessMessage(null), 5000);
      setMemberIdInput('');
    }
  };

  const handleOpenDrawer = () => {
    onOpenDrawer();
    setDrawerKicked(true);
    setTimeout(() => setDrawerKicked(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Sub-Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">Unpaid Sales Bills</span>
          <span className="text-slate-400 font-mono">(GetUnpaidBills)</span>
        </div>

        {/* Global Cash Drawer Action (F7.6) */}
        <button
          onClick={handleOpenDrawer}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            drawerKicked 
              ? 'bg-emerald-500 text-slate-950' 
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
          }`}
          title="Sends ESC/POS pulse (1B 70 00 19 FA) to kick cash drawer"
        >
          <DoorOpen className="w-3.5 h-3.5" />
          {drawerKicked ? 'Drawer Kick Pulse Sent ✓' : 'Open Cash Drawer (F7.6)'}
        </button>
      </div>

      {/* Two-Pane Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Left Pane: Bills List */}
        <div className="w-full md:w-[360px] lg:w-[400px] border-r border-slate-800 flex flex-col min-h-0 bg-slate-900/50 overflow-hidden">
          <div className="p-3 overflow-y-auto space-y-2 flex-1">
            {bills.map(bill => {
              const isSelected = selectedBill?.id === bill.id;
              return (
                <div
                  key={bill.id}
                  onClick={() => setSelectedBillId(bill.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/30' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{bill.tableName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{bill.billNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      UNPAID
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span>{bill.items.length} items • {bill.guestCount} guests</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">
                      NPR {bill.total}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Table open {bill.ageMins} mins
                    </span>
                    <span>Waiter: {bill.waiterName.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Selected Bill Detail & Actions */}
        <div className="flex-1 bg-slate-950 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
          {selectedBill ? (
            <div className="max-w-2xl mx-auto w-full space-y-5">
              
              {/* Top Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                <div>
                  <h3 className="font-bold text-base text-white">{selectedBill.tableName} Bill Overview</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedBill.billNumber}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* F7.2: Present to Guest Fullscreen Mode */}
                  <button
                    onClick={() => onOpenGuestPresentation(selectedBill)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    title="Hand tablet to guest for dispute-free verification"
                  >
                    <Eye className="w-4 h-4" />
                    Present to Guest (F7.2)
                  </button>

                  {/* Print Bill */}
                  <button
                    onClick={() => onPrintBill(selectedBill)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    Print Receipt
                  </button>
                </div>
              </div>

              {/* Loyalty Discount Banner / Result */}
              {loyaltySuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{loyaltySuccessMessage}</span>
                </div>
              )}

              {/* Bill Line Items Table */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-semibold text-slate-400 uppercase">
                  <span>Dish / Description</span>
                  <span>Amount (NPR)</span>
                </div>

                <div className="space-y-2.5">
                  {selectedBill.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-slate-200">
                      <div>
                        <span className="font-semibold text-white">{item.quantity}× {item.name}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">NPR {item.price} each</span>
                      </div>
                      <span className="font-mono font-medium text-slate-100">
                        NPR {item.quantity * item.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Taxes Breakdown */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">NPR {selectedBill.subtotal}</span>
                  </div>

                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({selectedBill.discountReason}):</span>
                      <span className="font-mono">-NPR {selectedBill.discount}</span>
                    </div>
                  )}

                  {selectedBill.serviceCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charge (10%):</span>
                      <span className="font-mono text-slate-200">NPR {selectedBill.serviceCharge}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>VAT (13%):</span>
                    <span className="font-mono text-slate-200">NPR {selectedBill.tax}</span>
                  </div>

                  <div className="flex justify-between font-bold text-base text-white pt-2 border-t border-slate-800">
                    <span>Grand Total:</span>
                    <span className="text-amber-400 font-mono text-lg">NPR {selectedBill.total}</span>
                  </div>
                </div>
              </div>

              {/* F7.5: Loyalty / Member Card Lookup */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <h4 className="font-semibold text-xs text-white">Loyalty / Club Member Lookup (F7.5)</h4>
                </div>

                <form onSubmit={handleApplyLoyalty} className="flex gap-2">
                  <input
                    type="text"
                    value={memberIdInput}
                    onChange={(e) => setMemberIdInput(e.target.value)}
                    placeholder="Enter Member ID (e.g. MEM-809 or phone #)..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Apply VIP Discount
                  </button>
                </form>
              </div>

              {/* F7.3: Split Bill Tool (SaveSplittedData) */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-amber-400" />
                    <h4 className="font-semibold text-xs text-white">Split Check Tool (SaveSplittedData)</h4>
                  </div>
                  <button
                    onClick={() => setIsSplitting(!isSplitting)}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    {isSplitting ? 'Close Split View' : 'Calculate Equal Split'}
                  </button>
                </div>

                {isSplitting && (
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Split among guests:</span>
                      <div className="flex items-center gap-2">
                        {[2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            onClick={() => setSplitParts(num)}
                            className={`w-7 h-7 rounded-lg font-bold font-mono text-xs transition-colors cursor-pointer ${
                              splitParts === num 
                                ? 'bg-amber-500 text-slate-950' 
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-between font-mono">
                      <span className="text-slate-400">Each Guest Pays ({splitParts} parts):</span>
                      <span className="text-amber-400 font-bold text-sm">
                        NPR {Math.ceil(selectedBill.total / splitParts)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              No unpaid bills found.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
