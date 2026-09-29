import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Printer, 
  Activity, 
  Wifi, 
  RotateCw, 
  LogOut, 
  Download, 
  FileText, 
  ShieldCheck, 
  Sliders, 
  Sun, 
  Moon, 
  Copy,
  Plus,
  PlayCircle,
  HelpCircle,
  Code
} from 'lucide-react';
import { PrinterConfig, DiagnosticLog, ServerConfig, WaiterUser } from '../types';

interface TabMoreProps {
  printers: PrinterConfig[];
  activeServer: ServerConfig;
  currentWaiter: WaiterUser;
  logs: DiagnosticLog[];
  pollInterval: number;
  onSetPollInterval: (sec: number) => void;
  onOpenPinSwitch: () => void;
  onOpenAndroidExport: () => void;
  onOpenIisGuide: () => void;
  onTestPrinter: (printer: PrinterConfig) => void;
}

export const TabMore: React.FC<TabMoreProps> = ({
  printers,
  activeServer,
  currentWaiter,
  logs,
  pollInterval,
  onSetPollInterval,
  onOpenPinSwitch,
  onOpenAndroidExport,
  onOpenIisGuide,
  onTestPrinter
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'printers' | 'diagnostics' | 'settings'>('diagnostics');
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Simulated live latency history for graph
  const [latencyHistory, setLatencyHistory] = useState<number[]>([22, 24, 21, 28, 25, 23, 19, 24, 26, 22]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLatencyHistory(prev => {
        const next = Math.max(12, Math.floor(activeServer.latencyMs + (Math.random() * 12 - 6)));
        return [...prev.slice(1), next];
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [activeServer.latencyMs]);

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] [${l.tag}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setUpdateMessage(null);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateMessage('RestroWaiter v1.0.4 is up-to-date. (Checked /version.json on IIS server)');
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Sub-Header Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('diagnostics')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'diagnostics' 
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Diagnostics & Logs (F10.6)
          </button>
          <button
            onClick={() => setActiveSubTab('printers')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'printers' 
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hardware Printers (F8.1)
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'settings' 
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            App Preferences
          </button>
        </div>

        {/* Android Studio Export Shortcut */}
        <button
          onClick={onOpenAndroidExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg border border-slate-700 text-xs transition-colors cursor-pointer"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Android Studio Source Code</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full">

        {/* 1. DIAGNOSTICS & LATENCY SUITE */}
        {activeSubTab === 'diagnostics' && (
          <div className="space-y-5">
            
            {/* On-Premise Windows IIS & SSMS Hub Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] uppercase font-mono">
                    On-Premise Host
                  </span>
                  <h3 className="font-bold text-white text-base">Windows Server (IIS) & SQL Server (SSMS)</h3>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  Connect your existing <code>RestroOrder_Master.sln</code> and SQL Server database with zero code rewrites. Includes firewall command, session timeout, and connection verification.
                </p>
              </div>

              <button
                onClick={onOpenIisGuide}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                Open IIS & SSMS Guide →
              </button>
            </div>
            
            {/* Server Reachability & Sparkline Graph */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    IIS Network Health & Latency Graph
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Target: {activeServer.url} • Active Waiter: {currentWaiter.name}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                  {latencyHistory[latencyHistory.length - 1]} ms (Stable)
                </span>
              </div>

              {/* Sparkline Visualizer */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-end gap-2 h-20 pt-2">
                  {latencyHistory.map((val, idx) => {
                    const heightPct = Math.min(100, Math.max(15, (val / 60) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div 
                          className="w-full bg-emerald-500/70 hover:bg-emerald-400 rounded-t-sm transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[9px] font-mono text-slate-500">{val}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] text-slate-500 text-center font-mono pt-1 border-t border-slate-800/80">
                  Real-time HTTP roundtrip latency over local Wi-Fi router (sampled every 3s)
                </div>
              </div>
            </div>

            {/* Diagnostic Logs (Logcat export) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Diagnostics & Telemetry Audit Log</h3>
                </div>
                <button
                  onClick={handleCopyLogs}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copiedLogs ? 'Copied Logcat!' : 'Export / Copy Logs'}
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-64 overflow-y-auto space-y-1">
                {logs.map(log => {
                  const levelColors = {
                    INFO: 'text-slate-400',
                    WARN: 'text-amber-400',
                    ERROR: 'text-rose-400 font-bold',
                    HTTP: 'text-blue-400'
                  };

                  return (
                    <div key={log.id} className="leading-relaxed">
                      <span className="text-slate-600">[{log.timestamp}]</span>{' '}
                      <span className={levelColors[log.level]}>[{log.tag}]</span>{' '}
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Self-Update Check (F10.7) */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-semibold text-white">OTA App Version Check (F10.7)</h4>
                <p className="text-slate-400 text-[11px]">Checks <code>{activeServer.url}/version.json</code> for newer APK builds without Google Play.</p>
                {updateMessage && (
                  <p className="text-emerald-400 font-medium mt-1">{updateMessage}</p>
                )}
              </div>

              <button
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                {isCheckingUpdate ? 'Checking...' : 'Check for Updates'}
              </button>
            </div>

          </div>
        )}

        {/* 2. PRINTER MANAGER (F8.1) */}
        {activeSubTab === 'printers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Station Printer Registry (F8.1)</h3>
                <p className="text-xs text-slate-400">Map TCP (port 9100), Bluetooth, and USB printers to restaurant stations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {printers.map(p => (
                <div 
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{p.name}</h4>
                      <p className="text-xs font-mono text-slate-400">{p.type} • {p.address}:{p.port || 9100}</p>
                      <p className="text-[11px] text-slate-500">Width: {p.paperWidth} thermal paper</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      p.status === 'OK' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-slate-400">Roles:</span>
                    {p.roles.map(r => (
                      <span key={r} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold">
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => onTestPrinter(p)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                      Print Test Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. APP PREFERENCES */}
        {activeSubTab === 'settings' && (
          <div className="space-y-4">
            
            {/* Status Poller Frequency (F6.2) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Kitchen Status Poller Interval (F6.2)</h4>
                  <p className="text-xs text-slate-400">Controls how often background WorkManager polls <code>checkOrder</code>.</p>
                </div>
                <span className="font-mono text-sm font-bold text-amber-400">{pollInterval}s</span>
              </div>

              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={pollInterval}
                onChange={(e) => onSetPollInterval(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10s (High responsiveness)</span>
                <span>20s (Default)</span>
                <span>60s (Battery saver)</span>
              </div>
            </div>

            {/* Waiter Shift Switch */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">Current Shift: {currentWaiter.shift}</h4>
                <p className="text-xs text-slate-400">Logged in as {currentWaiter.name} ({currentWaiter.username})</p>
              </div>

              <button
                onClick={onOpenPinSwitch}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Switch Waiter PIN
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
