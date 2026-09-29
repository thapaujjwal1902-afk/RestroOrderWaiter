import { Table, MenuItem, Order, Bill, PrinterConfig, WaiterUser, PrintJob } from '../types';

export const INITIAL_WAITERS: WaiterUser[] = [
  { id: 'W1', name: 'Ramesh Sharma', pin: '1234', username: 'ramesh', shift: 'Morning Shift (08:00 - 16:00)', role: 'waiter', tablesServedCount: 14 },
  { id: 'W2', name: 'Sunil Thapa', pin: '4321', username: 'sunil', shift: 'Morning Shift (08:00 - 16:00)', role: 'captain', tablesServedCount: 22 },
  { id: 'W3', name: 'Pooja KC', pin: '1111', username: 'pooja', shift: 'Evening Shift (16:00 - 24:00)', role: 'waiter', tablesServedCount: 8 },
  { id: 'W4', name: 'Admin Master', pin: '9999', username: 'admin', shift: 'All Shifts', role: 'manager', tablesServedCount: 35 }
];

export const INITIAL_ROOMS = [
  { id: 1, name: 'Main Dining Hall' },
  { id: 2, name: 'Terrace Garden' },
  { id: 3, name: 'VIP AC Lounge' },
  { id: 4, name: 'Family Cabana' }
];

export const INITIAL_TABLES: Table[] = [
  { id: 1, tableNumber: 'T-01', name: 'Table 1', roomName: 'Main Dining Hall', roomId: 1, capacity: 4, status: 'occupied', activeGuests: 3, runningTotal: 1850, waiterId: 'W1', waiterName: 'Ramesh Sharma', occupiedSince: '25 min ago' },
  { id: 2, tableNumber: 'T-02', name: 'Table 2', roomName: 'Main Dining Hall', roomId: 1, capacity: 2, status: 'available', activeGuests: 0, runningTotal: 0 },
  { id: 3, tableNumber: 'T-03', name: 'Table 3', roomName: 'Main Dining Hall', roomId: 1, capacity: 6, status: 'occupied', activeGuests: 5, runningTotal: 4200, waiterId: 'W2', waiterName: 'Sunil Thapa', occupiedSince: '45 min ago' },
  { id: 4, tableNumber: 'T-04', name: 'Table 4', roomName: 'Main Dining Hall', roomId: 1, capacity: 4, status: 'billed', activeGuests: 2, runningTotal: 2450, waiterId: 'W1', waiterName: 'Ramesh Sharma', occupiedSince: '60 min ago' },
  { id: 5, tableNumber: 'T-05', name: 'Table 5', roomName: 'Main Dining Hall', roomId: 1, capacity: 8, status: 'reserved', activeGuests: 0, runningTotal: 0 },
  
  { id: 6, tableNumber: 'TG-01', name: 'Terrace 1', roomName: 'Terrace Garden', roomId: 2, capacity: 4, status: 'occupied', activeGuests: 4, runningTotal: 3100, waiterId: 'W1', waiterName: 'Ramesh Sharma', occupiedSince: '18 min ago' },
  { id: 7, tableNumber: 'TG-02', name: 'Terrace 2', roomName: 'Terrace Garden', roomId: 2, capacity: 4, status: 'available', activeGuests: 0, runningTotal: 0 },
  { id: 8, tableNumber: 'TG-03', name: 'Terrace 3', roomName: 'Terrace Garden', roomId: 2, capacity: 2, status: 'available', activeGuests: 0, runningTotal: 0 },
  
  { id: 9, tableNumber: 'VIP-1', name: 'VIP Lounge 1', roomName: 'VIP AC Lounge', roomId: 3, capacity: 10, status: 'occupied', activeGuests: 8, runningTotal: 9600, waiterId: 'W2', waiterName: 'Sunil Thapa', occupiedSince: '55 min ago' },
  { id: 10, tableNumber: 'VIP-2', name: 'VIP Lounge 2', roomName: 'VIP AC Lounge', roomId: 3, capacity: 6, status: 'available', activeGuests: 0, runningTotal: 0 },
  
  { id: 11, tableNumber: 'CAB-1', name: 'Cabana 1', roomName: 'Family Cabana', roomId: 4, capacity: 6, status: 'occupied', activeGuests: 4, runningTotal: 3800, waiterId: 'W1', waiterName: 'Ramesh Sharma', occupiedSince: '30 min ago' },
  { id: 12, tableNumber: 'CAB-2', name: 'Cabana 2', roomName: 'Family Cabana', roomId: 4, capacity: 6, status: 'available', activeGuests: 0, runningTotal: 0 }
];

export const INITIAL_MENU: MenuItem[] = [
  // Starters
  { id: 101, name: 'Paneer Chilli Dry', category: 'Starters', price: 380, code: 'STR01', isVeg: true, spicyLevel: 2, description: 'Crisp paneer tossed with bell peppers and green chillies in soy glaze', available: true },
  { id: 102, name: 'Chicken Momo (Steam/Fried)', category: 'Starters', price: 320, code: 'STR02', isVeg: false, spicyLevel: 1, description: 'Authentic Himalayan dumplings served with spicy tomato sesame achar', available: true },
  { id: 103, name: 'Crispy Corn Salt & Pepper', category: 'Starters', price: 290, code: 'STR03', isVeg: true, spicyLevel: 1, description: 'Golden batter fried sweetcorn kernels with wok aromatics', available: true },
  { id: 104, name: 'Mutton Sekuwa', category: 'Starters', price: 540, code: 'STR04', isVeg: false, spicyLevel: 2, description: 'Charcoal grilled tender mutton marinated in traditional mountain spices', available: true },
  { id: 105, name: 'Veg Spring Rolls', category: 'Starters', price: 260, code: 'STR05', isVeg: true, spicyLevel: 0, description: 'Crispy vegetable rolls served with sweet plum dipping sauce', available: true },

  // Main Course & Curries
  { id: 201, name: 'Butter Chicken Masala', category: 'Curries', price: 580, code: 'CUR01', isVeg: false, spicyLevel: 1, description: 'Tandoori chicken simmered in rich buttery tomato & cashew gravy', available: true },
  { id: 202, name: 'Paneer Butter Masala', category: 'Curries', price: 460, code: 'CUR02', isVeg: true, spicyLevel: 1, description: 'Cottage cheese cubes bathed in velvety spiced tomato gravy', available: true },
  { id: 203, name: 'Dal Makhani Bukhara', category: 'Curries', price: 360, code: 'CUR03', isVeg: true, spicyLevel: 0, description: 'Slow-cooked black lentils simmered overnight with cream and butter', available: true },
  { id: 204, name: 'Chicken Biryani with Raita', category: 'Main Course', price: 490, code: 'MC01', isVeg: false, spicyLevel: 2, description: 'Fragrant basmati rice layered with spiced marinated chicken and saffron', available: true },
  { id: 205, name: 'Thakali Mutton Thali Set', category: 'Main Course', price: 720, code: 'MC02', isVeg: false, spicyLevel: 2, description: 'Complete set with local mutton, black lentils, gundruk achar, rice & ghee', available: true },

  // Breads
  { id: 301, name: 'Butter Naan', category: 'Breads', price: 90, code: 'BRD01', isVeg: true, description: 'Tandoor baked leavened flatbread brushed with fresh butter', available: true },
  { id: 302, name: 'Garlic Cheese Naan', category: 'Breads', price: 160, code: 'BRD02', isVeg: true, description: 'Infused with roasted garlic cloves and melted mozzarella cheese', available: true },
  { id: 303, name: 'Tandoori Roti (Plain/Butter)', category: 'Breads', price: 50, code: 'BRD03', isVeg: true, description: 'Whole wheat round bread baked in clay tandoor', available: true },

  // Beverages
  { id: 401, name: 'Fresh Mint Lime Soda', category: 'Beverages', price: 180, code: 'BEV01', isVeg: true, description: 'Muddled garden mint, fresh lime juice with sweet/salted club soda', available: true },
  { id: 402, name: 'Classic Virgin Mojito', category: 'Beverages', price: 260, code: 'BEV02', isVeg: true, description: 'Crushed lime wedges, organic cane sugar, fresh mint and crushed ice', available: true },
  { id: 403, name: 'Ice Cold Carlsberg Pilsner (650ml)', category: 'Beverages', price: 550, code: 'BEV03', isVeg: true, description: 'Chilled premium pilsner beer served with frosted glass', available: true },
  { id: 404, name: 'Masala Spiced Himalayan Tea', category: 'Beverages', price: 90, code: 'BEV04', isVeg: true, description: 'Brewed black tea with ginger, cardamom, cinnamon and fresh milk', available: true },

  // Desserts
  { id: 501, name: 'Hot Gulab Jamun with Rabdi (2 pcs)', category: 'Desserts', price: 220, code: 'DES01', isVeg: true, description: 'Warm milk dumplings soaked in cardamom syrup served with saffron rabdi', available: true },
  { id: 502, name: 'Sizzling Brownie with Vanilla Ice Cream', category: 'Desserts', price: 340, code: 'DES02', isVeg: true, description: 'Fudge chocolate brownie served sizzling on cast iron plate with hot chocolate sauce', available: true }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    orderNumber: '#KOT-104',
    tableId: 1,
    tableName: 'Table 1',
    waiterId: 'W1',
    waiterName: 'Ramesh Sharma',
    totalAmount: 1850,
    status: 'READY',
    sentAt: '12:38 PM',
    elapsedMins: 14,
    notes: 'No coriander on butter chicken. Extra crispy naan.',
    syncedFromServer: true,
    kotPrinted: true,
    items: [
      { id: 'OI-1', menuItemId: 102, name: 'Chicken Momo (Steam)', quantity: 2, price: 320, course: 'starter', status: 'READY', sentAt: '12:38 PM', elapsedMins: 14 },
      { id: 'OI-2', menuItemId: 201, name: 'Butter Chicken Masala', quantity: 1, price: 580, course: 'main', status: 'PREPARING', sentAt: '12:38 PM', elapsedMins: 14, notes: 'Less spicy' },
      { id: 'OI-3', menuItemId: 301, name: 'Butter Naan', quantity: 3, price: 90, course: 'main', status: 'READY', sentAt: '12:38 PM', elapsedMins: 14 },
      { id: 'OI-4', menuItemId: 401, name: 'Fresh Mint Lime Soda', quantity: 2, price: 180, course: 'drinks', status: 'SERVED', sentAt: '12:38 PM', elapsedMins: 14 }
    ]
  },
  {
    id: 'ORD-1002',
    orderNumber: '#KOT-105',
    tableId: 6,
    tableName: 'Terrace 1',
    waiterId: 'W1',
    waiterName: 'Ramesh Sharma',
    totalAmount: 3100,
    status: 'PREPARING',
    sentAt: '12:45 PM',
    elapsedMins: 7,
    notes: 'Terrace windy, please bring covers on food',
    syncedFromServer: true,
    kotPrinted: true,
    items: [
      { id: 'OI-5', menuItemId: 104, name: 'Mutton Sekuwa', quantity: 2, price: 540, course: 'starter', status: 'PREPARING', sentAt: '12:45 PM', elapsedMins: 7 },
      { id: 'OI-6', menuItemId: 403, name: 'Carlsberg Pilsner (650ml)', quantity: 2, price: 550, course: 'drinks', status: 'SERVED', sentAt: '12:45 PM', elapsedMins: 7 },
      { id: 'OI-7', menuItemId: 204, name: 'Chicken Biryani with Raita', quantity: 2, price: 490, course: 'main', status: 'SENT', sentAt: '12:45 PM', elapsedMins: 7 }
    ]
  },
  {
    id: 'ORD-1003',
    orderNumber: '#KOT-103',
    tableId: 9,
    tableName: 'VIP Lounge 1',
    waiterId: 'W2',
    waiterName: 'Sunil Thapa',
    totalAmount: 9600,
    status: 'PREPARING',
    sentAt: '12:20 PM',
    elapsedMins: 32,
    notes: 'VIP guest Mr. Adhikari. Ensure priority presentation.',
    syncedFromServer: true,
    kotPrinted: true,
    items: [
      { id: 'OI-8', menuItemId: 205, name: 'Thakali Mutton Thali Set', quantity: 6, price: 720, course: 'main', status: 'PREPARING', sentAt: '12:20 PM', elapsedMins: 32 },
      { id: 'OI-9', menuItemId: 101, name: 'Paneer Chilli Dry', quantity: 3, price: 380, course: 'starter', status: 'SERVED', sentAt: '12:20 PM', elapsedMins: 32 },
      { id: 'OI-10', menuItemId: 402, name: 'Classic Virgin Mojito', quantity: 6, price: 260, course: 'drinks', status: 'SERVED', sentAt: '12:20 PM', elapsedMins: 32 },
      { id: 'OI-11', menuItemId: 502, name: 'Sizzling Brownie', quantity: 4, price: 340, course: 'dessert', status: 'SENT', sentAt: '12:20 PM', elapsedMins: 32 }
    ]
  }
];

export const INITIAL_BILLS: Bill[] = [
  {
    id: 'BILL-4091',
    billNumber: 'INV-2026-0891',
    tableId: 4,
    tableName: 'Table 4',
    guestCount: 2,
    waiterName: 'Ramesh Sharma',
    subtotal: 2168,
    tax: 282, // 13% VAT
    discount: 0,
    serviceCharge: 0,
    total: 2450,
    paymentMode: 'Unpaid',
    createdAt: '11:50 AM',
    ageMins: 62,
    status: 'unpaid',
    items: [
      { id: 'BI-1', menuItemId: 201, name: 'Butter Chicken Masala', quantity: 1, price: 580, course: 'main', status: 'SERVED', sentAt: '11:55 AM', elapsedMins: 57 },
      { id: 'BI-2', menuItemId: 203, name: 'Dal Makhani Bukhara', quantity: 1, price: 360, course: 'main', status: 'SERVED', sentAt: '11:55 AM', elapsedMins: 57 },
      { id: 'BI-3', menuItemId: 302, name: 'Garlic Cheese Naan', quantity: 3, price: 160, course: 'main', status: 'SERVED', sentAt: '11:55 AM', elapsedMins: 57 },
      { id: 'BI-4', menuItemId: 401, name: 'Fresh Mint Lime Soda', quantity: 2, price: 180, course: 'drinks', status: 'SERVED', sentAt: '11:55 AM', elapsedMins: 57 },
      { id: 'BI-5', menuItemId: 501, name: 'Gulab Jamun with Rabdi', quantity: 1, price: 220, course: 'dessert', status: 'SERVED', sentAt: '12:30 PM', elapsedMins: 22 }
    ]
  },
  {
    id: 'BILL-4092',
    billNumber: 'INV-2026-0892',
    tableId: 1,
    tableName: 'Table 1',
    guestCount: 3,
    waiterName: 'Ramesh Sharma',
    subtotal: 1637,
    tax: 213,
    discount: 0,
    serviceCharge: 0,
    total: 1850,
    paymentMode: 'Unpaid',
    createdAt: '12:38 PM',
    ageMins: 14,
    status: 'unpaid',
    items: [
      { id: 'BI-6', menuItemId: 102, name: 'Chicken Momo (Steam)', quantity: 2, price: 320, course: 'starter', status: 'READY', sentAt: '12:38 PM', elapsedMins: 14 },
      { id: 'BI-7', menuItemId: 201, name: 'Butter Chicken Masala', quantity: 1, price: 580, course: 'main', status: 'PREPARING', sentAt: '12:38 PM', elapsedMins: 14 },
      { id: 'BI-8', menuItemId: 301, name: 'Butter Naan', quantity: 3, price: 90, course: 'main', status: 'READY', sentAt: '12:38 PM', elapsedMins: 14 },
      { id: 'BI-9', menuItemId: 401, name: 'Fresh Mint Lime Soda', quantity: 2, price: 180, course: 'drinks', status: 'SERVED', sentAt: '12:38 PM', elapsedMins: 14 }
    ]
  },
  {
    id: 'BILL-4093',
    billNumber: 'INV-2026-0893',
    tableId: 3,
    tableName: 'Table 3',
    guestCount: 5,
    waiterName: 'Sunil Thapa',
    subtotal: 3716,
    tax: 484,
    discount: 0,
    serviceCharge: 0,
    total: 4200,
    paymentMode: 'Unpaid',
    createdAt: '12:08 PM',
    ageMins: 44,
    status: 'unpaid',
    items: [
      { id: 'BI-10', menuItemId: 104, name: 'Mutton Sekuwa', quantity: 3, price: 540, course: 'starter', status: 'SERVED', sentAt: '12:10 PM', elapsedMins: 42 },
      { id: 'BI-11', menuItemId: 204, name: 'Chicken Biryani with Raita', quantity: 3, price: 490, course: 'main', status: 'SERVED', sentAt: '12:20 PM', elapsedMins: 32 },
      { id: 'BI-12', menuItemId: 403, name: 'Carlsberg Pilsner (650ml)', quantity: 2, price: 550, course: 'drinks', status: 'SERVED', sentAt: '12:10 PM', elapsedMins: 42 }
    ]
  }
];

export const INITIAL_PRINTERS: PrinterConfig[] = [
  { id: 'PRN-1', name: 'Kitchen Hot Station (TCP)', type: 'TCP', address: '192.168.1.201', port: 9100, roles: ['KOT'], paperWidth: '80mm', status: 'OK', lastPingTime: 'Just now' },
  { id: 'PRN-2', name: 'Bar & Beverages (TCP)', type: 'TCP', address: '192.168.1.202', port: 9100, roles: ['BAR'], paperWidth: '80mm', status: 'OK', lastPingTime: '2 min ago' },
  { id: 'PRN-3', name: 'Cashier Main Thermal (USB)', type: 'USB', address: 'POS_CASHIER_USB_01', roles: ['BILL'], paperWidth: '80mm', status: 'OK', lastPingTime: 'Just now' },
  { id: 'PRN-4', name: 'Terrace Mobile Printer (BT)', type: 'BLUETOOTH', address: '00:11:22:33:44:55', roles: ['KOT', 'BILL'], paperWidth: '58mm', status: 'PAPER_OUT', lastPingTime: '5 min ago' }
];

export const INITIAL_PRINT_JOBS: PrintJob[] = [
  {
    id: 'PJ-901',
    slipNumber: 'KOT #104',
    tableId: 1,
    tableName: 'Table 1',
    role: 'KOT',
    stationName: 'Kitchen Hot Station (192.168.1.201)',
    time: '12:38:12 PM',
    status: 'PRINTED',
    printedBy: 'Ramesh Sharma',
    attempts: 1,
    smid: 'SM-8841',
    content: `================================
          KITCHEN ORDER TICKET
Table: Table 1 (Main Hall)
Waiter: Ramesh Sharma | Time: 12:38 PM
KOT No: #104 | Order: #ORD-1001
================================
Qty  Item                     Course
--------------------------------
2    Chicken Momo (Steam)     STR
1    Butter Chicken Masala    MAIN
     ** Less spicy **
3    Butter Naan              MAIN
--------------------------------
Total Items: 6 (3 distinct)
================================`
  },
  {
    id: 'PJ-902',
    slipNumber: 'BAR #063',
    tableId: 1,
    tableName: 'Table 1',
    role: 'BAR',
    stationName: 'Bar & Beverages (192.168.1.202)',
    time: '12:38:15 PM',
    status: 'PRINTED',
    printedBy: 'Ramesh Sharma',
    attempts: 1,
    smid: 'SM-8842',
    content: `================================
             BAR TICKET
Table: Table 1 | Time: 12:38 PM
Waiter: Ramesh Sharma
================================
Qty  Item
--------------------------------
2    Fresh Mint Lime Soda
================================`
  },
  {
    id: 'PJ-903',
    slipNumber: 'KOT #105',
    tableId: 6,
    tableName: 'Terrace 1',
    role: 'KOT',
    stationName: 'Terrace Mobile Printer (BT)',
    time: '12:45:03 PM',
    status: 'FAILED',
    failureReason: 'PAPER_OUT',
    printedBy: 'Ramesh Sharma',
    attempts: 3,
    smid: 'SM-8843',
    content: `================================
          KITCHEN ORDER TICKET
Table: Terrace 1 (Garden)
Waiter: Ramesh Sharma | Time: 12:45 PM
KOT No: #105
================================
Qty  Item
--------------------------------
2    Mutton Sekuwa
2    Chicken Biryani with Raita
================================`
  }
];

export const INITIAL_SERVERS = [
  { id: 'SRV-1', name: 'Restaurant Main LAN (IIS)', url: 'http://192.168.1.50:8080', pageId: 42, isDefault: true, status: 'online' as const, latencyMs: 24, lastTested: 'Just now', version: 'v3.4.1 (RestroOrder IIS 10)', isLanDetected: true },
  { id: 'SRV-2', name: 'Backup Server (Port 8443)', url: 'https://192.168.1.51:8443', pageId: 42, isDefault: false, status: 'online' as const, latencyMs: 48, lastTested: '10 min ago', version: 'v3.4.1', isLanDetected: true },
  { id: 'SRV-3', name: 'Cloud Test Host (Domain)', url: 'https://waiter.restroorder-demo.com', pageId: 42, isDefault: false, status: 'offline' as const, latencyMs: 310, lastTested: 'Yesterday', version: 'v3.3.0', isLanDetected: false }
];
