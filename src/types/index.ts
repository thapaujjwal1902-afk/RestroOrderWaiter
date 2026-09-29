export interface ServerConfig {
  id: string;
  name: string;
  url: string;
  pageId: number;
  isDefault: boolean;
  status: 'online' | 'offline' | 'checking';
  latencyMs: number;
  lastTested?: string;
  version?: string;
  isLanDetected?: boolean;
}

export interface WaiterUser {
  id: string;
  name: string;
  pin: string;
  username: string;
  shift: string;
  role: 'waiter' | 'captain' | 'manager';
  tablesServedCount: number;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'billed';

export interface Table {
  id: number;
  tableNumber: string;
  name: string;
  roomName: string;
  roomId: number;
  capacity: number;
  status: TableStatus;
  currentBillId?: string;
  waiterId?: string;
  waiterName?: string;
  activeGuests: number;
  runningTotal: number;
  occupiedSince?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  category: 'Starters' | 'Main Course' | 'Curries' | 'Breads' | 'Beverages' | 'Desserts';
  price: number;
  code: string;
  isVeg: boolean;
  spicyLevel?: number; // 0, 1, 2, 3
  description: string;
  available: boolean;
}

export type CourseType = 'starter' | 'main' | 'dessert' | 'drinks';

export interface CartItem {
  id: string; // unique for cart item row
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  course: CourseType;
}

export type OrderStatus = 'SENT' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  menuItemId: number;
  name: string;
  quantity: number;
  price: number;
  course: CourseType;
  status: OrderStatus;
  sentAt: string;
  elapsedMins: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId: number;
  tableName: string;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  sentAt: string;
  elapsedMins: number;
  notes?: string;
  syncedFromServer: boolean;
  kotPrinted: boolean;
}

export interface Bill {
  id: string;
  billNumber: string;
  tableId: number;
  tableName: string;
  guestCount: number;
  waiterName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  total: number;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Room' | 'Split' | 'Unpaid';
  createdAt: string;
  ageMins: number;
  status: 'unpaid' | 'paid';
  discountReason?: string;
  memberId?: string;
  memberName?: string;
}

export type PrintRole = 'KOT' | 'BILL' | 'BAR' | 'COURIER';
export type PrintStatus = 'PRINTED' | 'PENDING' | 'FAILED' | 'RETRYING';
export type PrintFailureReason = 'TIMEOUT' | 'PAPER_OUT' | 'COVER_OPEN' | 'OFFLINE';

export interface PrintJob {
  id: string;
  slipNumber: string;
  tableId: number;
  tableName: string;
  role: PrintRole;
  stationName: string;
  time: string;
  status: PrintStatus;
  failureReason?: PrintFailureReason;
  content: string;
  attempts: number;
  smid?: string;
  printedBy: string;
}

export interface PrinterConfig {
  id: string;
  name: string;
  type: 'TCP' | 'BLUETOOTH' | 'USB';
  address: string; // e.g. 192.168.1.200 or BT MAC
  port?: number; // e.g. 9100
  roles: PrintRole[];
  paperWidth: '58mm' | '80mm';
  status: 'OK' | 'PAPER_OUT' | 'COVER_OPEN' | 'OFFLINE';
  lastPingTime?: string;
}

export interface QueuedOrder {
  id: string;
  tableId: number;
  tableName: string;
  cartJson: string;
  createdAt: string;
  syncState: 'QUEUED' | 'SYNCED' | 'CONFLICT';
  errorMsg?: string;
  dedupeHash: string;
}

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'HTTP';
  tag: string;
  message: string;
}
