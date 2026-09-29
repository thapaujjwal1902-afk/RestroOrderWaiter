import React, { useState } from 'react';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  UserCheck, 
  Bell, 
  FileCode, 
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ServerConfig, WaiterUser } from '../types';

interface HeaderProps {
  activeServer: ServerConfig;
  currentWaiter: WaiterUser;
  isOffline: boolean;
  onToggleOffline: (offline: boolean) => void;
  onOpenServerSetup: () => void;
  onOpenPinSwitch: () => void;
  onOpenAndroidExport: () => void;
  onOpenIisGuide: () => void;
  notificationsCount: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeServer,
  currentWaiter,
  isOffline,
  onToggleOffline,
  onOpenServerSetup,
  onOpenPinSwitch,
  onOpenAndroidExport,
  onOpenIisGuide,
  notificationsCount,
  onOpenNotifications
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 px-3 sm:px-5 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo & App Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-inner">
            RW
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-100">RestroWaiter</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-medium">APK v1.0.4</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">SageFrame / RestroOrder Companion</p>
          </div>
        </div>

        {/* Server & Connectivity Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Active Server Chip */}
          <button
            onClick={onOpenServerSetup}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs text-slate-200 transition-colors cursor-pointer"
            title="Configure LAN Server or Auto-Scan"
          >
            <Server className={`w-3.5 h-3.5 ${isOffline ? 'text-rose-400' : 'text-emerald-400'}`} />
            <div className="text-left hidden md:block">
              <span className="block font-medium truncate max-w-[120px]">{activeServer.name}</span>
              <span className="block text-[10px] text-slate-400 font-mono">
                {isOffline ? 'Disconnected' : `${activeServer.latencyMs}ms (${activeServer.url.replace(/^https?:\/\//, '')})`}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Network Simulation Toggle */}
          <button
            onClick={() => onToggleOffline(!isOffline)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isOffline 
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold' 
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
            }`}
            title="Toggle simulated Airplane Mode to test Offline Order Queuing"
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOffline ? 'Offline Mode' : 'Online (Wi-Fi)'}</span>
          </button>

          {/* Waiter Profile & Quick PIN Switch */}
          <button
            onClick={onOpenPinSwitch}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
            title="Switch Waiter Shift via 4-Digit PIN"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 font-semibold flex items-center justify-center text-xs">
              {currentWaiter.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <span className="block font-medium text-slate-100">{currentWaiter.name}</span>
              <span className="block text-[10px] text-slate-400">{currentWaiter.role.toUpperCase()} • PIN: {currentWaiter.pin}</span>
            </div>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
            title="Kitchen Order Alerts & Print Status"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {notificationsCount}
              </span>
            )}
          </button>

          {/* On-Premise Windows IIS & SSMS Hub Button */}
          <button
            onClick={onOpenIisGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs border border-slate-700 shadow-xs transition-all cursor-pointer"
            title="On-Premise Windows IIS & SQL Server (SSMS) Setup Guide"
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Windows IIS & SSMS</span>
          </button>

          {/* Android Studio Export Button */}
          <button
            onClick={onOpenAndroidExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
            title="View & Download Kotlin Android Studio Project"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Android APK Code</span>
          </button>
        </div>

      </div>
    </header>
  );
};
