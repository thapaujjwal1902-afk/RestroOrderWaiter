import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Server, 
  Star, 
  Trash2, 
  Check, 
  QrCode, 
  RotateCw, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Wifi
} from 'lucide-react';
import { ServerConfig } from '../types';

interface ServerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: ServerConfig[];
  activeServer: ServerConfig;
  onSelectServer: (server: ServerConfig) => void;
  onSetDefault: (serverId: string) => void;
  onAddServer: (server: ServerConfig) => void;
  onRemoveServer: (serverId: string) => void;
}

export const ServerSetupModal: React.FC<ServerSetupModalProps> = ({
  isOpen,
  onClose,
  servers,
  activeServer,
  onSelectServer,
  onSetDefault,
  onAddServer,
  onRemoveServer
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'qr'>('scan');
  
  // LAN Scanner state
  const [subnetPrefix, setSubnetPrefix] = useState('192.168.1.');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScannedIp, setCurrentScannedIp] = useState('');
  const [discoveredServers, setDiscoveredServers] = useState<ServerConfig[]>([]);

  // Manual Form
  const [manualName, setManualName] = useState('Local IIS Waiter Server');
  const [manualUrl, setManualUrl] = useState('http://192.168.1.100:8080');
  const [manualPageId, setManualPageId] = useState(42);

  // QR String
  const [qrString, setQrString] = useState('restrowaiter://connect?server=http://192.168.1.50:8080&id=42');

  // Simulated IP Change Guard demonstration
  const [showIpChangeAlert, setShowIpChangeAlert] = useState(false);

  if (!isOpen) return null;

  const startLanScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setDiscoveredServers([]);

    let current = 1;
    const interval = setInterval(() => {
      current += 6;
      const ip = `${subnetPrefix}${current}`;
      setCurrentScannedIp(ip);
      const pct = Math.min(100, Math.round((current / 254) * 100));
      setScanProgress(pct);

      // Simulate finding a server at .50 and .88
      if (current >= 50 && current < 58) {
        setDiscoveredServers(prev => {
          if (prev.some(s => s.url.includes('.50'))) return prev;
          return [
            ...prev,
            {
              id: 'SRV-SCAN-50',
              name: 'RestroOrder Dining Server (IIS 10)',
              url: `http://${subnetPrefix}50:8080`,
              pageId: 42,
              isDefault: false,
              status: 'online',
              latencyMs: 18,
              version: 'SageFrame v3.4.1 [Dinning Module Confirmed]',
              isLanDetected: true
            }
          ];
        });
      }

      if (current >= 120 && current < 128) {
        setDiscoveredServers(prev => {
          if (prev.some(s => s.url.includes('.120'))) return prev;
          return [
            ...prev,
            {
              id: 'SRV-SCAN-120',
              name: 'Backup POS Station (Port 8443)',
              url: `https://${subnetPrefix}120:8443`,
              pageId: 42,
              isDefault: false,
              status: 'online',
              latencyMs: 32,
              version: 'SageFrame v3.4.1',
              isLanDetected: true
            }
          ];
        });
      }

      if (current >= 254) {
        clearInterval(interval);
        setIsScanning(false);
        setScanProgress(100);
      }
    }, 40);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl) return;
    const newServer: ServerConfig = {
      id: 'SRV-MAN-' + Date.now(),
      name: manualName || 'Custom Server',
      url: manualUrl,
      pageId: Number(manualPageId) || 42,
      isDefault: false,
      status: 'online',
      latencyMs: 35,
      lastTested: 'Just now',
      version: 'Manual Entry'
    };
    onAddServer(newServer);
    onSelectServer(newServer);
    onClose();
  };

  const handleParseQr = () => {
    try {
      const url = new URL(qrString.replace('restrowaiter://', 'http://'));
      const serverParam = url.searchParams.get('server');
      const idParam = url.searchParams.get('id');
      if (serverParam) {
        const newServer: ServerConfig = {
          id: 'SRV-QR-' + Date.now(),
          name: 'QR Imported Server',
          url: serverParam,
          pageId: idParam ? parseInt(idParam) : 42,
          isDefault: true,
          status: 'online',
          latencyMs: 22,
          lastTested: 'Just now',
          version: 'QR Configured'
        };
        onAddServer(newServer);
        onSelectServer(newServer);
        onClose();
      }
    } catch (e) {
      alert('Invalid QR deep link format. Expected restrowaiter://connect?server=URL&id=PAGE_ID');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Server Setup & LAN Scanner</h2>
              <p className="text-xs text-slate-400">Connect to your IIS RestroOrder server</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IP Change Guard Banner (Feature F2.8) */}
        {showIpChangeAlert && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 px-5 py-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>F2.8 IP-Change Guard:</strong> Server DHCP address moved to <code>192.168.1.77:8080</code>!</span>
            </div>
            <button
              onClick={() => {
                const updated: ServerConfig = {
                  ...activeServer,
                  url: 'http://192.168.1.77:8080',
                  name: 'RestroOrder (New IP .77)',
                  latencyMs: 14
                };
                onAddServer(updated);
                onSelectServer(updated);
                setShowIpChangeAlert(false);
              }}
              className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
            >
              1-Tap Switch
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('scan')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'scan' 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            LAN Auto-Scanner (F2.1)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual' 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual IP / Host
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'qr' 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            QR Provisioning (F2.6)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">

          {/* TAB 1: LAN SCANNER */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      LAN Subnet Prefix (/24 sweep ports 80, 443, 8080)
                    </label>
                    <input
                      type="text"
                      value={subnetPrefix}
                      onChange={(e) => setSubnetPrefix(e.target.value)}
                      placeholder="192.168.1."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={startLanScan}
                    disabled={isScanning}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                    {isScanning ? 'Sweeping Subnet...' : 'Start LAN Sweep'}
                  </button>
                </div>

                {/* Progress bar */}
                {isScanning && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Probing IP: <code className="text-amber-400 font-mono">{currentScannedIp}</code></span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-75"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Discovered Servers */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Discovered Servers ({discoveredServers.length})
                </h3>
                {discoveredServers.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                    {isScanning ? 'Probing /24 addresses for SageFrame markers...' : 'No discovered hosts yet. Press "Start LAN Sweep" or add manual host.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {discoveredServers.map(server => (
                      <div 
                        key={server.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-emerald-500/40 hover:border-emerald-500 transition-all"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{server.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                              {server.latencyMs}ms
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-400">{server.url}</p>
                          <p className="text-[11px] text-emerald-400">{server.version}</p>
                        </div>
                        <button
                          onClick={() => {
                            onAddServer(server);
                            onSelectServer(server);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Simulate IP Change Guard Trigger */}
              <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                <span>Want to test router reboot IP migration?</span>
                <button
                  type="button"
                  onClick={() => setShowIpChangeAlert(true)}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Trigger DHCP IP-Change Guard Demo
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL ENTRY */}
          {activeTab === 'manual' && (
            <form onSubmit={handleAddManual} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Friendly Server Name</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Back-office IIS Server"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Base URL (IP or Hostname)</label>
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="http://192.168.1.50:8080"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Page ID (Default 42)</label>
                  <input
                    type="number"
                    value={manualPageId}
                    onChange={(e) => setManualPageId(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-xs text-slate-400">
                Waiters connect to: <code>{manualUrl}/Default.aspx?id={manualPageId}</code>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition-colors cursor-pointer"
              >
                Save & Connect Server
              </button>
            </form>
          )}

          {/* TAB 3: QR IMPORT */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <QrCode className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-white text-sm">Scan QR Code from Cashier / Admin</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Managers can print a QR badge with the server endpoint so new waiter tablets configure instantly.
                </p>

                <div className="text-left pt-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Decoded Deep Link URI:</label>
                  <input
                    type="text"
                    value={qrString}
                    onChange={(e) => setQrString(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-300"
                  />
                </div>

                <button
                  onClick={handleParseQr}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Import Configuration from QR
                </button>
              </div>
            </div>
          )}

          {/* Saved Servers List */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Saved Servers List (F2.4)
            </h3>
            <div className="space-y-2">
              {servers.map((server) => {
                const isActive = server.id === activeServer.id;
                return (
                  <div
                    key={server.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-amber-500/10 border-amber-500/50' 
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onSetDefault(server.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          server.isDefault ? 'text-amber-400 bg-amber-400/20' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={server.isDefault ? 'Default Launch Server' : 'Set as Default'}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">{server.name}</span>
                          {server.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-medium">Default</span>
                          )}
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-medium">Active</span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                          <span>{server.url}</span>
                          <span>•</span>
                          <span>Page: {server.pageId}</span>
                          <span>•</span>
                          <span className="text-emerald-400">{server.latencyMs}ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isActive && (
                        <button
                          onClick={() => {
                            onSelectServer(server);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium transition-colors cursor-pointer"
                        >
                          Use
                        </button>
                      )}
                      {servers.length > 1 && (
                        <button
                          onClick={() => onRemoveServer(server.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Remove Server"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
