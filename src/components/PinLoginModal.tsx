import React, { useState } from 'react';
import { X, Delete, Lock, UserCheck, Shield, KeyRound } from 'lucide-react';
import { WaiterUser } from '../types';

interface PinLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWaiter: WaiterUser;
  waiters: WaiterUser[];
  onLoginPin: (pin: string) => { success: boolean; waiter?: WaiterUser; error?: string };
}

export const PinLoginModal: React.FC<PinLoginModalProps> = ({
  isOpen,
  onClose,
  currentWaiter,
  waiters,
  onLoginPin
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedPresetWaiter, setSelectedPresetWaiter] = useState<WaiterUser | null>(null);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        // Submit
        setTimeout(() => {
          const res = onLoginPin(nextPin);
          if (res.success) {
            setPin('');
            onClose();
          } else {
            setErrorMsg(res.error || 'Invalid PIN code');
            setPin('');
          }
        }, 120);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleSelectPreset = (w: WaiterUser) => {
    setSelectedPresetWaiter(w);
    setPin(w.pin);
    setTimeout(() => {
      onLoginPin(w.pin);
      setPin('');
      onClose();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Quick Waiter PIN Switch</h2>
              <p className="text-xs text-slate-400">SageFrame / ROUSER Authentication</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Quick Waiter Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Waiter on Shift
            </label>
            <div className="grid grid-cols-2 gap-2">
              {waiters.map(w => {
                const isSelected = w.id === currentWaiter.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => handleSelectPreset(w)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-200' 
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{w.name}</span>
                      <span className="text-[10px] px-1 py-0.5 rounded bg-slate-700 font-mono text-slate-300">
                        {w.pin}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 capitalize">{w.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Dots Indicator */}
          <div className="text-center py-2">
            <div className="flex justify-center items-center gap-4 mb-2">
              {[0, 1, 2, 3].map(idx => (
                <div 
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    idx < pin.length 
                      ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-500/50' 
                      : 'border-slate-600 bg-slate-800'
                  }`}
                />
              ))}
            </div>
            {errorMsg ? (
              <p className="text-xs text-rose-400 font-medium animate-pulse">{errorMsg}</p>
            ) : (
              <p className="text-xs text-slate-500">Enter 4-digit PIN for instant shift access</p>
            )}
          </div>

          {/* 4x3 Touch Pad (Minimum 48px ergonomic touch buttons) */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-750 active:bg-amber-500 active:text-slate-950 font-bold text-xl text-white border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 font-medium text-xs border border-slate-700/60 transition-all flex items-center justify-center cursor-pointer"
            >
              CLEAR
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-750 active:bg-amber-500 active:text-slate-950 font-bold text-xl text-white border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 border border-slate-700/60 transition-all flex items-center justify-center cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Current Waiter Status */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <div>
              <span className="text-slate-200 font-medium">{currentWaiter.name}</span>
              <span className="block text-[11px] text-slate-500">{currentWaiter.shift}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
              ACTIVE SHIFT
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
