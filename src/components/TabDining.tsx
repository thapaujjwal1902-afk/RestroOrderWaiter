import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Search, 
  CheckCircle, 
  Utensils, 
  Flame, 
  Leaf, 
  Clock, 
  Sparkles,
  ExternalLink,
  Save,
  Coffee,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Table, MenuItem, CartItem, CourseType, ServerConfig, WaiterUser } from '../types';
import { INITIAL_ROOMS } from '../data/mockRestroServer';

interface TabDiningProps {
  tables: Table[];
  menu: MenuItem[];
  currentWaiter: WaiterUser;
  activeServer: ServerConfig;
  isOffline: boolean;
  onSendOrder: (tableId: number, cartItems: CartItem[], notes?: string) => { success: boolean; queued: boolean; message: string; orderId?: string };
  onNavigateToTab: (tab: 'dining' | 'orders' | 'bills' | 'prints' | 'more') => void;
}

export const TabDining: React.FC<TabDiningProps> = ({
  tables,
  menu,
  currentWaiter,
  activeServer,
  isOffline,
  onSendOrder,
  onNavigateToTab
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<number>(1);
  const [selectedTable, setSelectedTable] = useState<Table>(tables[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNotes, setOrderNotes] = useState<string>('');
  
  // Anti double-send protection
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // Draft autosave indicator
  const [lastAutosavedTime, setLastAutosavedTime] = useState<string>('Just now');

  // WebView Mode Toggle (Simulated Responsive POS vs Embedded Iframe/WebView)
  const [viewMode, setViewMode] = useState<'app' | 'webview'>('app');

  // Categories
  const categories = ['All', 'Starters', 'Main Course', 'Curries', 'Breads', 'Beverages', 'Desserts'];

  // Draft autosave timer (every 15s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (cart.length > 0) {
        setLastAutosavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [cart]);

  // Filter tables by room
  const roomTables = tables.filter(t => t.roomId === selectedRoomId);

  // Filter menu
  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === menuItem.id);
      if (existing) {
        return prev.map(i => i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      // Determine default course
      let defaultCourse: CourseType = 'main';
      if (menuItem.category === 'Starters') defaultCourse = 'starter';
      else if (menuItem.category === 'Beverages') defaultCourse = 'drinks';
      else if (menuItem.category === 'Desserts') defaultCourse = 'dessert';

      return [
        ...prev,
        {
          id: 'CI-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          course: defaultCourse
        }
      ];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleUpdateCourse = (cartItemId: string, course: CourseType) => {
    setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, course } : i));
  };

  const handleUpdateNotes = (cartItemId: string, notes: string) => {
    setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, notes } : i));
  };

  const handleSendOrder = () => {
    if (cart.length === 0 || isSending) return;
    setIsSending(true);

    // F5.4: 3-second button lock
    const res = onSendOrder(selectedTable.id, cart, orderNotes);
    if (res.success) {
      setSendSuccessMessage(res.message);
      setCart([]);
      setOrderNotes('');
      setTimeout(() => {
        setSendSuccessMessage(null);
      }, 4000);
    } else {
      alert(res.message);
    }

    setTimeout(() => {
      setIsSending(false);
    }, 3000);
  };

  const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const cartTax = Math.round(cartSubtotal * 0.13); // 13% VAT
  const cartTotal = cartSubtotal + cartTax;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Sub-header: Rooms & View Mode Switch */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Room Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mr-1 hidden sm:inline">Rooms:</span>
          {INITIAL_ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedRoomId === room.id 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: APK Responsive POS vs WebView Iframe */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-700">
            <button
              onClick={() => setViewMode('app')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === 'app' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Touch POS (Ergonomic)
            </button>
            <button
              onClick={() => setViewMode('webview')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === 'webview' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw IIS WebView (F4.1)
            </button>
          </div>
        </div>

      </div>

      {/* SUCCESS BANNER */}
      {sendSuccessMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>{sendSuccessMessage}</span>
          </div>
          <button 
            onClick={() => onNavigateToTab('orders')}
            className="underline font-bold text-emerald-100 hover:text-white cursor-pointer"
          >
            Track in Orders Tab →
          </button>
        </div>
      )}

      {/* WEBVIEW MODE (Simulated or Real SageFrame IIS iframe) */}
      {viewMode === 'webview' ? (
        <div className="flex-1 flex flex-col bg-slate-900 p-4 overflow-hidden">
          <div className="bg-slate-800 border border-slate-700 rounded-t-xl px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-slate-300">
                WebView Container: {activeServer.url}/Default.aspx?id={activeServer.pageId}
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Bridge: <code>window.WaiterApp</code> active
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-b-xl border border-t-0 border-slate-700 flex flex-col items-center justify-center p-6 text-slate-800 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">SageFrame Dining Module WebView Host</h3>
            <p className="text-xs text-slate-600 max-w-md mb-4">
              In the real Android APK on your tablet, the WebView renders <code>Dinning.ascx</code> directly from your local IIS server with touch target optimizations and native printing bridge hooks.
            </p>

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 text-left max-w-md w-full text-xs font-mono text-slate-700 space-y-1 mb-4">
              <p className="text-amber-700 font-bold">// Injected Bridge Functions Available:</p>
              <p>• window.WaiterApp.print(html, "kot"|"bill")</p>
              <p>• window.WaiterApp.captureOrder(cartJson)</p>
              <p>• window.WaiterApp.openDrawer()</p>
              <p>• window.WaiterApp.vibrate(200)</p>
            </div>

            <button
              onClick={() => setViewMode('app')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer"
            >
              Switch to Touch-First POS View
            </button>
          </div>
        </div>
      ) : (
        /* TOUCH-FIRST RESPONSIVE POS (TWO-PANE LAYOUT) */
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* LEFT COLUMN: Table Strip + Menu Catalog */}
          <div className="flex-1 flex flex-col min-h-0 border-r border-slate-800 overflow-hidden">
            
            {/* Table Selector Strip */}
            <div className="bg-slate-900/80 border-b border-slate-800 p-3 overflow-x-auto">
              <div className="flex items-center gap-2.5">
                {roomTables.map(t => {
                  const isSelected = t.id === selectedTable.id;
                  const statusColors = {
                    available: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                    occupied: 'border-amber-500/60 bg-amber-500/15 text-amber-200',
                    reserved: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
                    billed: 'border-blue-500/60 bg-blue-500/20 text-blue-200'
                  };

                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTable(t)}
                      className={`min-w-[100px] p-2.5 rounded-xl border text-left transition-all shrink-0 cursor-pointer ${
                        isSelected 
                          ? 'ring-2 ring-amber-400 border-amber-400 bg-slate-800 shadow-md' 
                          : `${statusColors[t.status]} hover:bg-slate-800`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">{t.tableNumber}</span>
                        <span className="text-[10px] uppercase font-semibold tracking-wider">
                          {t.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{t.capacity} Seats</span>
                        {t.runningTotal > 0 && (
                          <span className="text-amber-400 font-bold font-mono">₹{t.runningTotal}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Search & Category Filter */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dish name or item code (e.g. STR01)..."
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-amber-500 text-slate-950 font-bold' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid (F4.2: Large touch targets >= 48px) */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredMenu.map(item => {
                const inCart = cart.find(c => c.menuItemId === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleAddToCart(item)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer min-h-[96px] ${
                      inCart 
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-sm' 
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5">
                          {item.isVeg ? (
                            <span className="w-3.5 h-3.5 rounded border border-emerald-500 flex items-center justify-center p-0.5 shrink-0" title="Pure Veg">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded border border-rose-500 flex items-center justify-center p-0.5 shrink-0" title="Non-Veg">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            </span>
                          )}
                          <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-1">{item.name}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                          {item.code}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                      <span className="font-bold text-sm text-amber-400 font-mono">
                        NPR {item.price}
                      </span>
                      
                      {inCart ? (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded-md text-xs">
                          {inCart.quantity} in order
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 px-2 py-1 rounded-md transition-colors">
                          <Plus className="w-3 h-3" /> Add
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: Table Order Cart & KOT Sender */}
          <div className="w-full lg:w-[380px] xl:w-[420px] bg-slate-900 flex flex-col min-h-0 border-t lg:border-t-0 border-slate-800">
            
            {/* Active Table Header & Autosave status */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{selectedTable.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300">
                    {selectedTable.roomName}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>Server: {currentWaiter.name}</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Save className="w-3 h-3" /> Autosaved {lastAutosavedTime}
                  </span>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors p-1.5 cursor-pointer"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">No items in cart for {selectedTable.name}</p>
                  <p className="text-[11px] text-slate-600">Tap menu items to add to this KOT</p>
                </div>
              ) : (
                cart.map(item => (
                  <div 
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-semibold text-xs text-white block">{item.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          NPR {item.price} × {item.quantity} = NPR {item.price * item.quantity}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-750 flex items-center justify-center text-slate-300 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-white font-mono">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-750 flex items-center justify-center text-slate-300 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Course Selection & Kitchen Notes */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/50 text-[11px]">
                      {/* Course Selector */}
                      <div className="flex items-center gap-1">
                        {(['starter', 'main', 'dessert', 'drinks'] as CourseType[]).map(c => (
                          <button
                            key={c}
                            onClick={() => handleUpdateCourse(item.id, c)}
                            className={`px-1.5 py-0.5 rounded capitalize text-[10px] font-medium transition-colors cursor-pointer ${
                              item.course === c 
                                ? 'bg-amber-500 text-slate-950 font-bold' 
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            {c === 'starter' ? 'STR' : (c === 'main' ? 'MAIN' : (c === 'dessert' ? 'DES' : 'BAR'))}
                          </button>
                        ))}
                      </div>

                      {/* Item Special Instructions */}
                      <input
                        type="text"
                        placeholder="Item note (e.g. less spicy)..."
                        value={item.notes || ''}
                        onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                        className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded px-2 py-0.5 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* General KOT Notes */}
            {cart.length > 0 && (
              <div className="px-3 pt-2">
                <input
                  type="text"
                  placeholder="General KOT instruction (e.g. rush order, serve together)..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            )}

            {/* Cart Summary & Send Action (F5.4: Double-send lock) */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items):</span>
                  <span className="font-mono text-slate-200">NPR {cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>VAT (13%):</span>
                  <span className="font-mono text-slate-200">NPR {cartTax}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-slate-800">
                  <span>Estimated Total:</span>
                  <span className="text-amber-400 font-mono">NPR {cartTotal}</span>
                </div>
              </div>

              {/* Send to Kitchen Button */}
              <button
                onClick={handleSendOrder}
                disabled={cart.length === 0 || isSending}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  cart.length === 0 || isSending 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : isOffline 
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
                {isSending ? (
                  <span>Transmitting KOT (Locking 3s)...</span>
                ) : isOffline ? (
                  <span>Queue Order to Offline Storage (Room)</span>
                ) : (
                  <span>Send KOT to Kitchen & Print Slip</span>
                )}
              </button>

              {/* Bridge Hook Telemetry Indicator */}
              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                <span>Hook: <code>WaiterApp.captureOrder()</code> active</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
