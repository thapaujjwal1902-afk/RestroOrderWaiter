import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Heart, Sparkles, Receipt } from 'lucide-react';
import { Bill } from '../types';

interface GuestPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
}

export const GuestPresentationModal: React.FC<GuestPresentationModalProps> = ({
  isOpen,
  onClose,
  bill
}) => {
  const [selectedTipPct, setSelectedTipPct] = useState<number>(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen) return null;

  const tipAmount = Math.round(bill.subtotal * (selectedTipPct / 100));
  const finalTotal = bill.total + tipAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[92vh]">
        
        {/* Top Header for Waiter return */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-200">Guest Review Mode (F7.2)</span>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
          >
            Exit Presentation Mode
          </button>
        </div>

        {/* Guest Presentation Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-2 shadow-inner">
              <Receipt className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">The Himalayan Restro & Bar</h2>
            <p className="text-xs text-slate-400 font-mono">Invoice #{bill.billNumber} • {bill.tableName}</p>
          </div>

          {/* Clean Line Items (Large readable font for guests) */}
          <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex justify-between">
              <span>Ordered Dishes</span>
              <span>Amount</span>
            </div>

            <div className="space-y-3">
              {bill.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium text-white">{item.quantity}× {item.name}</span>
                    <span className="text-xs text-slate-500 block font-mono">NPR {item.price} each</span>
                  </div>
                  <span className="font-mono font-bold text-slate-200">
                    NPR {item.quantity * item.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-200">NPR {bill.subtotal}</span>
              </div>

              {bill.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Loyalty Discount ({bill.discountReason}):</span>
                  <span className="font-mono">-NPR {bill.discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>VAT (13% Government Tax):</span>
                <span className="font-mono text-slate-200">NPR {bill.tax}</span>
              </div>

              {tipAmount > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Staff Gratuity Tip ({selectedTipPct}%):</span>
                  <span className="font-mono">+NPR {tipAmount}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-xl text-white pt-2 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-amber-400 font-mono">NPR {finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Gratuity / Tip Selection */}
          <div className="space-y-2 text-center">
            <label className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Add Optional Gratuity for Waiter {bill.waiterName}:
            </label>
            <div className="flex items-center justify-center gap-2">
              {[0, 5, 10, 15].map(pct => (
                <button
                  key={pct}
                  onClick={() => setSelectedTipPct(pct)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTipPct === pct 
                      ? 'bg-amber-500 text-slate-950 scale-105' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {pct === 0 ? 'No Tip' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Guest Verification Action */}
          <div className="pt-2">
            {isConfirmed ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 text-center font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Bill Verified by Guest. Ready for Settlement!
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmed(true)}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-5 h-5" />
                Tap to Confirm Bill as Correct
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
