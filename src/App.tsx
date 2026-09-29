import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  ChefHat, 
  Receipt, 
  Printer, 
  MoreHorizontal,
  BellRing
} from 'lucide-react';
import { apiService } from './services/apiClient';
import { 
  ServerConfig, 
  WaiterUser, 
  Table, 
  MenuItem, 
  Order, 
  Bill, 
  PrintJob, 
  PrinterConfig, 
  QueuedOrder, 
  DiagnosticLog,
  CartItem,
  OrderStatus
} from './types';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { TabDining } from './components/TabDining';
import { TabOrders } from './components/TabOrders';
import { TabBills } from './components/TabBills';
import { TabPrints } from './components/TabPrints';
import { TabMore } from './components/TabMore';
import { ServerSetupModal } from './components/ServerSetupModal';
import { PinLoginModal } from './components/PinLoginModal';
import { GuestPresentationModal } from './components/GuestPresentationModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { NotificationsDrawer, AppNotification } from './components/NotificationsDrawer';
import { IisSetupGuideModal } from './components/IisSetupGuideModal';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dining' | 'orders' | 'bills' | 'prints' | 'more'>('dining');

  // Core Data State
  const [servers, setServers] = useState<ServerConfig[]>(apiService.getServers());
  const [activeServer, setActiveServer] = useState<ServerConfig>(apiService.getActiveServer());
  const [currentWaiter, setCurrentWaiter] = useState<WaiterUser>(apiService.getCurrentWaiter());
  const [waiters, setWaiters] = useState<WaiterUser[]>(apiService.getWaiters());
  const [tables, setTables] = useState<Table[]>(apiService.getTables());
  const [menu, setMenu] = useState<MenuItem[]>(apiService.getMenu());
  const [orders, setOrders] = useState<Order[]>(apiService.getOrders());
  const [bills, setBills] = useState<Bill[]>(apiService.getBills());
  const [printers, setPrinters] = useState<PrinterConfig[]>(apiService.getPrinters());
  const [printJobs, setPrintJobs] = useState<PrintJob[]>(apiService.getPrintJobs());
  const [queuedOrders, setQueuedOrders] = useState<QueuedOrder[]>(apiService.getQueuedOrders());
  const [logs, setLogs] = useState<DiagnosticLog[]>(apiService.getLogs());
  const [isOffline, setIsOffline] = useState<boolean>(apiService.isOffline());
  const [pollInterval, setPollInterval] = useState<number>(apiService.getPollInterval());

  // Modal Visibility
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isIisGuideOpen, setIsIisGuideOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [presentationBill, setPresentationBill] = useState<Bill | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'NOTIF-1',
      type: 'READY',
      title: 'Chicken Momo Ready!',
      message: 'Table 1: Chicken Momo (Steam) is ready for pickup in hot station.',
      time: '12:39 PM'
    }
  ]);

  // Subscribe to kitchen order alerts & logs
  useEffect(() => {
    const unsubAlert = apiService.onKitchenReadyAlert((order, itemNames) => {
      // Audio chime simulation & Vibration (F6.3)
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch (_) {}
      }

      const newNotif: AppNotification = {
        id: 'NOTIF-' + Date.now(),
        type: 'READY',
        title: `Food Ready: ${order.tableName}`,
        message: `${itemNames.join(', ')} is ready for pickup!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setNotifications(prev => [newNotif, ...prev]);
      setOrders(apiService.getOrders());
    });

    const unsubLogs = apiService.onLogsChanged(newLogs => {
      setLogs(newLogs);
    });

    return () => {
      unsubAlert();
      unsubLogs();
    };
  }, []);

  // Sync state helpers
  const refreshAllState = () => {
    setTables(apiService.getTables());
    setOrders(apiService.getOrders());
    setBills(apiService.getBills());
    setPrintJobs(apiService.getPrintJobs());
    setQueuedOrders(apiService.getQueuedOrders());
    setPrinters(apiService.getPrinters());
    setServers(apiService.getServers());
    setActiveServer(apiService.getActiveServer());
  };

  // Handlers
  const handleToggleOffline = (offline: boolean) => {
    apiService.setOfflineSimulation(offline);
    setIsOffline(offline);
    refreshAllState();
  };

  const handleSendOrder = (tableId: number, cartItems: CartItem[], notes?: string) => {
    const res = apiService.sendOrder(tableId, cartItems, notes);
    refreshAllState();
    return res;
  };

  const handleSyncNow = () => {
    apiService.syncQueuedOrders();
    refreshAllState();
  };

  const handleMarkServed = (orderId: string) => {
    apiService.markOrderServed(orderId);
    refreshAllState();
  };

  const handleUpdateItemStatus = (orderId: string, itemId: string, status: OrderStatus) => {
    apiService.updateOrderItemStatus(orderId, itemId, status);
    refreshAllState();
  };

  const handleRemindKitchen = (orderId: string) => {
    const res = apiService.remindKitchen(orderId);
    refreshAllState();
    return res;
  };

  const handleReprintKot = (order: Order) => {
    apiService.createPrintJob(order, 'KOT');
    refreshAllState();
    setActiveTab('prints');
  };

  const handlePrintBill = (bill: Bill) => {
    apiService.printBill(bill);
    refreshAllState();
    setActiveTab('prints');
  };

  const handleApplyLoyalty = (billId: string, memberId: string) => {
    const res = apiService.applyMemberLoyalty(billId, memberId);
    refreshAllState();
    return res;
  };

  const handleOpenDrawer = () => {
    const res = apiService.openCashDrawer();
    refreshAllState();
    return res;
  };

  const handleRetryPrintJob = (jobId: string) => {
    apiService.retryPrintJob(jobId);
    refreshAllState();
  };

  const handleSetPrinterStatus = (printerId: string, status: 'OK' | 'PAPER_OUT' | 'COVER_OPEN' | 'OFFLINE') => {
    apiService.setPrinterStatus(printerId, status);
    refreshAllState();
  };

  const handleTestPrinter = (printer: PrinterConfig) => {
    const dummyOrder: Order = {
      id: 'TEST-ORD',
      orderNumber: '#TEST-001',
      tableId: 99,
      tableName: 'TEST TABLE',
      waiterId: currentWaiter.id,
      waiterName: currentWaiter.name,
      items: [
        { id: 'TI-1', menuItemId: 101, name: 'ESC/POS Printer Test Page', quantity: 1, price: 0, course: 'main', status: 'SENT', sentAt: 'Now', elapsedMins: 0 }
      ],
      totalAmount: 0,
      status: 'SENT',
      sentAt: 'Now',
      elapsedMins: 0,
      syncedFromServer: true,
      kotPrinted: true
    };
    apiService.createPrintJob(dummyOrder, printer.roles[0] || 'KOT');
    refreshAllState();
    setActiveTab('prints');
  };

  const handleSelectServer = (server: ServerConfig) => {
    apiService.setActiveServer(server);
    setActiveServer(server);
    refreshAllState();
  };

  const handleAddServer = (server: ServerConfig) => {
    apiService.addOrUpdateServer(server);
    refreshAllState();
  };

  const handleRemoveServer = (serverId: string) => {
    apiService.removeServer(serverId);
    refreshAllState();
  };

  const handleSetDefaultServer = (serverId: string) => {
    apiService.setDefaultServer(serverId);
    refreshAllState();
  };

  const handleLoginPin = (pin: string) => {
    const res = apiService.loginWithPin(pin);
    if (res.success && res.waiter) {
      setCurrentWaiter(res.waiter);
    }
    return res;
  };

  const handleSetPollInterval = (sec: number) => {
    apiService.setPollInterval(sec);
    setPollInterval(sec);
  };

  // Badge counts
  const readyOrdersCount = orders.filter(o => o.status === 'READY').length;
  const failedPrintsCount = printJobs.filter(p => p.status === 'FAILED').length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      
      {/* Top Application Header */}
      <Header
        activeServer={activeServer}
        currentWaiter={currentWaiter}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        onOpenServerSetup={() => setIsServerModalOpen(true)}
        onOpenPinSwitch={() => setIsPinModalOpen(true)}
        onOpenAndroidExport={() => setIsAndroidModalOpen(true)}
        onOpenIisGuide={() => setIsIisGuideOpen(true)}
        notificationsCount={notifications.length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Persistent Offline / Sync Banner (F5.2) */}
      <OfflineBanner
        isOffline={isOffline}
        queuedOrders={queuedOrders}
        onSyncNow={handleSyncNow}
        onClearConflicts={() => setQueuedOrders(prev => prev.filter(q => q.syncState !== 'CONFLICT'))}
      />

      {/* Main Tab Viewport */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {activeTab === 'dining' && (
          <TabDining
            tables={tables}
            menu={menu}
            currentWaiter={currentWaiter}
            activeServer={activeServer}
            isOffline={isOffline}
            onSendOrder={handleSendOrder}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'orders' && (
          <TabOrders
            orders={orders}
            currentWaiter={currentWaiter}
            onMarkServed={handleMarkServed}
            onUpdateItemStatus={handleUpdateItemStatus}
            onRemindKitchen={handleRemindKitchen}
            onReprintKot={handleReprintKot}
          />
        )}

        {activeTab === 'bills' && (
          <TabBills
            bills={bills}
            onOpenGuestPresentation={(bill) => setPresentationBill(bill)}
            onPrintBill={handlePrintBill}
            onApplyLoyalty={handleApplyLoyalty}
            onOpenDrawer={handleOpenDrawer}
          />
        )}

        {activeTab === 'prints' && (
          <TabPrints
            printJobs={printJobs}
            printers={printers}
            onRetryJob={handleRetryPrintJob}
            onSetPrinterStatus={handleSetPrinterStatus}
          />
        )}

        {activeTab === 'more' && (
          <TabMore
            printers={printers}
            activeServer={activeServer}
            currentWaiter={currentWaiter}
            logs={logs}
            pollInterval={pollInterval}
            onSetPollInterval={handleSetPollInterval}
            onOpenPinSwitch={() => setIsPinModalOpen(true)}
            onOpenAndroidExport={() => setIsAndroidModalOpen(true)}
            onOpenIisGuide={() => setIsIisGuideOpen(true)}
            onTestPrinter={handleTestPrinter}
          />
        )}
      </main>

      {/* Bottom 5-Tab Navigation Bar (F4.1: min touch height >= 52px) */}
      <nav className="bg-slate-900 border-t border-slate-800 text-slate-300 z-30 shrink-0">
        <div className="max-w-4xl mx-auto flex items-stretch justify-around h-15">
          
          {/* TAB 1: DINING */}
          <button
            onClick={() => setActiveTab('dining')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'dining' 
                ? 'text-amber-400 font-bold bg-amber-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[11px] tracking-tight">Dining (F4)</span>
          </button>

          {/* TAB 2: ORDERS */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative cursor-pointer ${
              activeTab === 'orders' 
                ? 'text-amber-400 font-bold bg-amber-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <div className="relative">
              <ChefHat className="w-5 h-5" />
              {readyOrdersCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-emerald-500 text-slate-950 font-black rounded-full text-[9px] flex items-center justify-center animate-pulse">
                  {readyOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">Orders (F6)</span>
          </button>

          {/* TAB 3: BILLS */}
          <button
            onClick={() => setActiveTab('bills')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'bills' 
                ? 'text-amber-400 font-bold bg-amber-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[11px] tracking-tight">Bills (F7)</span>
          </button>

          {/* TAB 4: PRINTS */}
          <button
            onClick={() => setActiveTab('prints')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative cursor-pointer ${
              activeTab === 'prints' 
                ? 'text-amber-400 font-bold bg-amber-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <div className="relative">
              <Printer className="w-5 h-5" />
              {failedPrintsCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white font-bold rounded-full text-[9px] flex items-center justify-center">
                  !
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">Prints (F8/F9)</span>
          </button>

          {/* TAB 5: MORE */}
          <button
            onClick={() => setActiveTab('more')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'more' 
                ? 'text-amber-400 font-bold bg-amber-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[11px] tracking-tight">More (F10)</span>
          </button>

        </div>
      </nav>

      {/* MODALS */}
      <ServerSetupModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        servers={servers}
        activeServer={activeServer}
        onSelectServer={handleSelectServer}
        onSetDefault={handleSetDefaultServer}
        onAddServer={handleAddServer}
        onRemoveServer={handleRemoveServer}
      />

      <PinLoginModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentWaiter={currentWaiter}
        waiters={waiters}
        onLoginPin={handleLoginPin}
      />

      {presentationBill && (
        <GuestPresentationModal
          isOpen={!!presentationBill}
          onClose={() => setPresentationBill(null)}
          bill={presentationBill}
        />
      )}

      <AndroidCodeModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      <IisSetupGuideModal
        isOpen={isIisGuideOpen}
        onClose={() => setIsIisGuideOpen(false)}
        activeServer={activeServer}
        onApplyServerUrl={(url, pageId) => {
          const updated: ServerConfig = {
            ...activeServer,
            id: 'SRV-IIS-' + Date.now(),
            name: 'On-Premise IIS Host',
            url,
            pageId,
            status: 'online',
            isDefault: true,
            latencyMs: 16
          };
          handleAddServer(updated);
          handleSelectServer(updated);
        }}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onClearAll={() => setNotifications([])}
      />

    </div>
  );
}
