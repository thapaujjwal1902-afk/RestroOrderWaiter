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
  OrderStatus,
  CartItem,
  PrintRole
} from '../types';
import { 
  INITIAL_SERVERS, 
  INITIAL_WAITERS, 
  INITIAL_TABLES, 
  INITIAL_MENU, 
  INITIAL_ORDERS, 
  INITIAL_BILLS, 
  INITIAL_PRINTERS, 
  INITIAL_PRINT_JOBS 
} from '../data/mockRestroServer';
import { generateKotEscPos, generateBillEscPos } from './escPosEngine';

class RestroWaiterService {
  private servers: ServerConfig[] = INITIAL_SERVERS;
  private activeServer: ServerConfig = INITIAL_SERVERS[0];
  private currentWaiter: WaiterUser = INITIAL_WAITERS[0];
  private tables: Table[] = INITIAL_TABLES;
  private menu: MenuItem[] = INITIAL_MENU;
  private orders: Order[] = INITIAL_ORDERS;
  private bills: Bill[] = INITIAL_BILLS;
  private printers: PrinterConfig[] = INITIAL_PRINTERS;
  private printJobs: PrintJob[] = INITIAL_PRINT_JOBS;
  private queuedOrders: QueuedOrder[] = [];
  private logs: DiagnosticLog[] = [];
  private isOfflineMode: boolean = false;
  private pollIntervalSeconds: number = 20;
  private lastDedupeHashes: Map<string, number> = new Map(); // hash -> timestamp

  // Event listeners
  private statusListeners: ((orders: Order[]) => void)[] = [];
  private logListeners: ((logs: DiagnosticLog[]) => void)[] = [];
  private readyAlertCallbacks: ((order: Order, itemNames: string[]) => void)[] = [];

  constructor() {
    this.addLog('INFO', 'SYSTEM', 'RestroWaiter initialized in high-availability mode.');
    this.startKitchenStatusPoller();
  }

  // --- Logger ---
  public addLog(level: 'INFO' | 'WARN' | 'ERROR' | 'HTTP', tag: string, message: string) {
    const log: DiagnosticLog = {
      id: 'LOG-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      tag,
      message
    };
    this.logs.unshift(log);
    if (this.logs.length > 200) this.logs.pop();
    this.logListeners.forEach(cb => cb([...this.logs]));
  }

  public getLogs(): DiagnosticLog[] {
    return [...this.logs];
  }

  public onLogsChanged(cb: (logs: DiagnosticLog[]) => void) {
    this.logListeners.push(cb);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== cb);
    };
  }

  // --- Network / Offline Simulation ---
  public setOfflineSimulation(offline: boolean) {
    this.isOfflineMode = offline;
    this.addLog(offline ? 'WARN' : 'INFO', 'NETWORK', offline ? 'Simulated network offline (Airplane mode enabled)' : 'Network reconnected. Testing auto-sync...');
    if (!offline) {
      this.syncQueuedOrders();
    }
  }

  public isOffline(): boolean {
    return this.isOfflineMode;
  }

  // --- Server Management ---
  public getServers(): ServerConfig[] {
    return [...this.servers];
  }

  public getActiveServer(): ServerConfig {
    return this.activeServer;
  }

  public setActiveServer(server: ServerConfig) {
    this.activeServer = server;
    this.addLog('INFO', 'SERVER', `Active server switched to: ${server.name} (${server.url})`);
  }

  public addOrUpdateServer(server: ServerConfig) {
    const existingIndex = this.servers.findIndex(s => s.id === server.id);
    if (existingIndex >= 0) {
      this.servers[existingIndex] = server;
    } else {
      this.servers.push(server);
    }
    if (server.isDefault) {
      this.servers.forEach(s => {
        if (s.id !== server.id) s.isDefault = false;
      });
      this.activeServer = server;
    }
  }

  public setDefaultServer(serverId: string) {
    this.servers.forEach(s => {
      s.isDefault = (s.id === serverId);
      if (s.isDefault) this.activeServer = s;
    });
  }

  public removeServer(serverId: string) {
    this.servers = this.servers.filter(s => s.id !== serverId);
  }

  // --- Waiter Authentication ---
  public getCurrentWaiter(): WaiterUser {
    return this.currentWaiter;
  }

  public getWaiters(): WaiterUser[] {
    return INITIAL_WAITERS;
  }

  public loginWithPin(pin: string): { success: boolean; waiter?: WaiterUser; error?: string } {
    this.addLog('HTTP', 'AUTH', `POST /Modules/ROUSER/ROLoginWebService.asmx/LoginPin with PIN ****`);
    const waiter = INITIAL_WAITERS.find(w => w.pin === pin);
    if (waiter) {
      this.currentWaiter = waiter;
      this.addLog('INFO', 'AUTH', `Authenticated waiter: ${waiter.name} (${waiter.role})`);
      return { success: true, waiter };
    }
    this.addLog('WARN', 'AUTH', 'Invalid PIN authentication attempt');
    return { success: false, error: 'Invalid PIN. Try 1234 or 4321 for demo.' };
  }

  // --- Tables & Dining ---
  public getTables(): Table[] {
    return [...this.tables];
  }

  public getMenu(): MenuItem[] {
    return [...this.menu];
  }

  public getTableById(id: number): Table | undefined {
    return this.tables.find(t => t.id === id);
  }

  // --- Orders & Offline Queue ---
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getQueuedOrders(): QueuedOrder[] {
    return [...this.queuedOrders];
  }

  // Double-tap lock and order send handler
  public sendOrder(
    tableId: number, 
    cartItems: CartItem[], 
    notes?: string
  ): { success: boolean; queued: boolean; message: string; orderId?: string } {
    const table = this.tables.find(t => t.id === tableId);
    if (!table) return { success: false, queued: false, message: 'Table not found' };
    if (cartItems.length === 0) return { success: false, queued: false, message: 'Cart is empty' };

    // F5.4: Double-send prevention (dedupe hash window)
    const cartSignature = tableId + '-' + cartItems.map(i => `${i.menuItemId}:${i.quantity}`).sort().join('|');
    const now = Date.now();
    const lastSent = this.lastDedupeHashes.get(cartSignature);
    if (lastSent && now - lastSent < 3000) {
      this.addLog('WARN', 'ORDER', `Blocked duplicate order click within 3s window (Signature: ${cartSignature})`);
      return { success: false, queued: false, message: 'Duplicate tap ignored (anti-double send)' };
    }
    this.lastDedupeHashes.set(cartSignature, now);

    const totalAmount = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    // If offline, queue locally in Room-like store
    if (this.isOfflineMode) {
      const queuedId = 'OFF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const queuedOrder: QueuedOrder = {
        id: queuedId,
        tableId,
        tableName: table.name,
        cartJson: JSON.stringify({ items: cartItems, notes, waiterId: this.currentWaiter.id }),
        createdAt: new Date().toLocaleTimeString(),
        syncState: 'QUEUED',
        dedupeHash: cartSignature
      };
      this.queuedOrders.push(queuedOrder);
      this.addLog('WARN', 'OFFLINE', `Network down: Order stored in local offline queue (${table.name})`);
      return { 
        success: true, 
        queued: true, 
        message: `Offline mode: Order saved to local device queue (#${queuedId})`,
        orderId: queuedId
      };
    }

    // Normal Online Order Send
    const orderId = 'ORD-' + (1000 + this.orders.length + 1);
    const orderNumber = '#KOT-' + (100 + this.orders.length + 1);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      tableId,
      tableName: table.name,
      waiterId: this.currentWaiter.id,
      waiterName: this.currentWaiter.name,
      items: cartItems.map((c, idx) => ({
        id: `OI-${Date.now()}-${idx}`,
        menuItemId: c.menuItemId,
        name: c.name,
        quantity: c.quantity,
        price: c.price,
        course: c.course,
        status: 'SENT',
        sentAt: timeStr,
        elapsedMins: 0,
        notes: c.notes
      })),
      totalAmount,
      status: 'SENT',
      sentAt: timeStr,
      elapsedMins: 0,
      notes,
      syncedFromServer: true,
      kotPrinted: true
    };

    this.orders.unshift(newOrder);

    // Update Table status
    table.status = 'occupied';
    table.runningTotal += totalAmount;
    table.activeGuests = Math.max(table.activeGuests, 2);
    table.waiterId = this.currentWaiter.id;
    table.waiterName = this.currentWaiter.name;
    table.occupiedSince = 'Just now';

    // F8.2: Automatically trigger KOT print job to thermal printer
    this.createPrintJob(newOrder, 'KOT');
    
    // If has beverages, also print BAR ticket
    if (cartItems.some(i => i.course === 'drinks')) {
      this.createPrintJob(newOrder, 'BAR');
    }

    this.addLog('HTTP', 'ORDER', `POST /services/DashBoardWebService.asmx/SaveSalesBill -> OK (Table ${table.name})`);
    return { success: true, queued: false, message: `KOT ${orderNumber} sent successfully!`, orderId };
  }

  // Sync queued offline orders when reconnecting
  public syncQueuedOrders() {
    if (this.queuedOrders.length === 0) return;
    this.addLog('INFO', 'SYNC', `SyncWorker starting FIFO replay for ${this.queuedOrders.length} offline orders...`);

    const successfullySynced: string[] = [];

    this.queuedOrders.forEach(q => {
      try {
        const payload = JSON.parse(q.cartJson);
        const table = this.tables.find(t => t.id === q.tableId);
        if (table) {
          // Check conflict: table already billed?
          if (table.status === 'billed') {
            q.syncState = 'CONFLICT';
            q.errorMsg = 'Table was billed by another cashier while offline!';
            this.addLog('ERROR', 'SYNC_CONFLICT', `Table ${table.name} conflict: table already billed.`);
            return;
          }

          const orderId = 'ORD-' + (1000 + this.orders.length + 1);
          const orderNumber = '#KOT-' + (100 + this.orders.length + 1);
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const items: CartItem[] = payload.items || [];
          const totalAmount = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

          const syncedOrder: Order = {
            id: orderId,
            orderNumber,
            tableId: q.tableId,
            tableName: q.tableName,
            waiterId: this.currentWaiter.id,
            waiterName: this.currentWaiter.name,
            items: items.map((c, idx) => ({
              id: `OI-SYNC-${Date.now()}-${idx}`,
              menuItemId: c.menuItemId,
              name: c.name,
              quantity: c.quantity,
              price: c.price,
              course: c.course,
              status: 'SENT',
              sentAt: timeStr,
              elapsedMins: 0,
              notes: c.notes
            })),
            totalAmount,
            status: 'SENT',
            sentAt: timeStr,
            elapsedMins: 0,
            notes: payload.notes,
            syncedFromServer: true,
            kotPrinted: true
          };

          this.orders.unshift(syncedOrder);
          table.status = 'occupied';
          table.runningTotal += totalAmount;
          this.createPrintJob(syncedOrder, 'KOT');
          successfullySynced.push(q.id);
        }
      } catch (err) {
        q.syncState = 'CONFLICT';
        q.errorMsg = 'Corrupt payload format';
      }
    });

    this.queuedOrders = this.queuedOrders.filter(q => !successfullySynced.includes(q.id));
    this.addLog('INFO', 'SYNC', `Successfully replayed ${successfullySynced.length} queued orders to IIS server.`);
  }

  // --- Kitchen Status Poller (diff engine) ---
  public onKitchenReadyAlert(cb: (order: Order, itemNames: string[]) => void) {
    this.readyAlertCallbacks.push(cb);
    return () => {
      this.readyAlertCallbacks = this.readyAlertCallbacks.filter(c => c !== cb);
    };
  }

  private startKitchenStatusPoller() {
    setInterval(() => {
      if (this.isOfflineMode) return;
      this.pollKitchenStatus();
    }, this.pollIntervalSeconds * 1000);
  }

  public pollKitchenStatus() {
    let newlyReadyOrders: { order: Order; items: string[] }[] = [];

    // Advance orders through preparation steps for simulation
    this.orders.forEach(order => {
      order.elapsedMins += 1;
      let orderHasNewReady = false;
      const readyItemNames: string[] = [];

      order.items.forEach(item => {
        item.elapsedMins += 1;
        if (item.status === 'SENT' && item.elapsedMins >= 1) {
          item.status = 'PREPARING';
        } else if (item.status === 'PREPARING' && item.elapsedMins >= 2) {
          item.status = 'READY';
          orderHasNewReady = true;
          readyItemNames.push(item.name);
        }
      });

      // Update aggregate order status
      const allServed = order.items.every(i => i.status === 'SERVED');
      const anyReady = order.items.some(i => i.status === 'READY');
      const anyPreparing = order.items.some(i => i.status === 'PREPARING');

      if (allServed) {
        order.status = 'SERVED';
      } else if (anyReady) {
        order.status = 'READY';
      } else if (anyPreparing) {
        order.status = 'PREPARING';
      }

      if (orderHasNewReady && readyItemNames.length > 0) {
        newlyReadyOrders.push({ order, items: readyItemNames });
      }
    });

    // Notify listeners
    this.statusListeners.forEach(cb => cb([...this.orders]));

    // Heads-up alerts
    newlyReadyOrders.forEach(entry => {
      this.addLog('INFO', 'KITCHEN_ALERT', `Kitchen marked ${entry.items.join(', ')} as READY for ${entry.order.tableName}`);
      this.readyAlertCallbacks.forEach(cb => cb(entry.order, entry.items));
    });
  }

  public updateOrderItemStatus(orderId: string, itemId: string, newStatus: OrderStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    const item = order.items.find(i => i.id === itemId);
    if (item) {
      item.status = newStatus;
      const allServed = order.items.every(i => i.status === 'SERVED');
      if (allServed) order.status = 'SERVED';
      this.statusListeners.forEach(cb => cb([...this.orders]));
      this.addLog('HTTP', 'ORDER', `Updated status of ${item.name} on ${order.tableName} -> ${newStatus}`);
    }
  }

  public markOrderServed(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.items.forEach(i => i.status = 'SERVED');
      order.status = 'SERVED';
      this.statusListeners.forEach(cb => cb([...this.orders]));
      this.addLog('HTTP', 'ORDER', `Order ${order.orderNumber} for ${order.tableName} marked fully SERVED`);
    }
  }

  public remindKitchen(orderId: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    this.addLog('HTTP', 'CALL_WAITER', `POST /services/DashBoardWebService.asmx/callWaiter (Priority kitchen reminder for Table ${order.tableName})`);
    return true;
  }

  // --- Bills & Guest Presentation ---
  public getBills(): Bill[] {
    return [...this.bills];
  }

  public getBillForTable(tableId: number): Bill | undefined {
    return this.bills.find(b => b.tableId === tableId && b.status === 'unpaid');
  }

  public applyMemberLoyalty(billId: string, memberId: string): { success: boolean; discountAmount: number; memberName: string } {
    const bill = this.bills.find(b => b.id === billId);
    if (!bill) return { success: false, discountAmount: 0, memberName: '' };

    // Simulated loyalty lookup
    const memberName = 'Dr. Rajesh Shrestha (Club Gold)';
    const discount = Math.round(bill.subtotal * 0.15); // 15% VIP discount
    bill.discount = discount;
    bill.discountReason = 'Gold Member (15%)';
    bill.memberId = memberId;
    bill.memberName = memberName;
    bill.total = Math.max(0, bill.subtotal - discount + bill.tax + bill.serviceCharge);

    this.addLog('HTTP', 'LOYALTY', `POST /CheckLoyaltyForDiscount -> Applied 15% discount (NPR ${discount}) to Bill ${bill.billNumber}`);
    return { success: true, discountAmount: discount, memberName };
  }

  public openCashDrawer(): boolean {
    this.addLog('HTTP', 'DRAWER', `POST /services/DashBoardWebService.asmx/OpenDrawer -> Pulse sent to thermal printer`);
    return true;
  }

  // --- Printing Engine (ESC/POS) ---
  public getPrinters(): PrinterConfig[] {
    return [...this.printers];
  }

  public getPrintJobs(): PrintJob[] {
    return [...this.printJobs];
  }

  public createPrintJob(order: Order, role: PrintRole): PrintJob {
    const printer = this.printers.find(p => p.roles.includes(role)) || this.printers[0];
    const slipNumber = `${role} #${Math.floor(100 + Math.random() * 900)}`;
    const escPosContent = generateKotEscPos(order, role, { paperWidth: printer.paperWidth });

    // Simulate hardware fault if printer status is not OK
    const isSuccess = printer.status === 'OK' && !this.isOfflineMode;
    const failureReason = !isSuccess 
      ? (printer.status !== 'OK' ? printer.status : 'OFFLINE')
      : undefined;

    const job: PrintJob = {
      id: 'PJ-' + (900 + this.printJobs.length + 1),
      slipNumber,
      tableId: order.tableId,
      tableName: order.tableName,
      role,
      stationName: `${printer.name} (${printer.address})`,
      time: new Date().toLocaleTimeString(),
      status: isSuccess ? 'PRINTED' : 'FAILED',
      failureReason,
      content: escPosContent,
      attempts: 1,
      smid: 'SM-' + Math.floor(1000 + Math.random() * 9000),
      printedBy: this.currentWaiter.name
    };

    this.printJobs.unshift(job);
    this.addLog(
      isSuccess ? 'INFO' : 'ERROR', 
      'PRINT', 
      isSuccess 
        ? `Slip ${slipNumber} successfully printed on ${printer.name}` 
        : `Print FAILED on ${printer.name} [Reason: ${failureReason}]`
    );

    return job;
  }

  public printBill(bill: Bill): PrintJob {
    const printer = this.printers.find(p => p.roles.includes('BILL')) || this.printers[0];
    const slipNumber = `BILL #${bill.billNumber.replace(/[^0-9]/g, '')}`;
    const escPosContent = generateBillEscPos(bill, { paperWidth: printer.paperWidth });

    const isSuccess = printer.status === 'OK' && !this.isOfflineMode;
    const failureReason = !isSuccess 
      ? (printer.status !== 'OK' ? printer.status : 'OFFLINE')
      : undefined;

    const job: PrintJob = {
      id: 'PJ-' + (900 + this.printJobs.length + 1),
      slipNumber,
      tableId: bill.tableId,
      tableName: bill.tableName,
      role: 'BILL',
      stationName: `${printer.name} (${printer.address})`,
      time: new Date().toLocaleTimeString(),
      status: isSuccess ? 'PRINTED' : 'FAILED',
      failureReason,
      content: escPosContent,
      attempts: 1,
      smid: 'SM-' + Math.floor(1000 + Math.random() * 9000),
      printedBy: this.currentWaiter.name
    };

    this.printJobs.unshift(job);
    this.addLog(
      isSuccess ? 'INFO' : 'ERROR',
      'PRINT',
      isSuccess ? `Tax Invoice ${bill.billNumber} printed on ${printer.name}` : `Bill print FAILED [Reason: ${failureReason}]`
    );

    return job;
  }

  public retryPrintJob(jobId: string): boolean {
    const job = this.printJobs.find(j => j.id === jobId);
    if (!job) return false;
    job.attempts += 1;
    job.status = 'PRINTED';
    job.failureReason = undefined;
    this.addLog('INFO', 'PRINT_RETRY', `Retry attempt #${job.attempts} succeeded for ${job.slipNumber}`);
    return true;
  }

  public setPrinterStatus(printerId: string, status: 'OK' | 'PAPER_OUT' | 'COVER_OPEN' | 'OFFLINE') {
    const p = this.printers.find(pr => pr.id === printerId);
    if (p) {
      p.status = status;
      this.addLog('WARN', 'PRINTER_HW', `${p.name} hardware state changed to: ${status}`);
    }
  }

  public setPollInterval(seconds: number) {
    this.pollIntervalSeconds = seconds;
    this.addLog('INFO', 'CONFIG', `Status poller frequency updated to: ${seconds} seconds`);
  }

  public getPollInterval(): number {
    return this.pollIntervalSeconds;
  }
}

export const apiService = new RestroWaiterService();
