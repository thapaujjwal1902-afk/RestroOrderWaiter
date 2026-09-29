import { Order, Bill, PrintRole } from '../types';

export interface EscPosRenderOptions {
  paperWidth: '58mm' | '80mm'; // 58mm = 32 chars, 80mm = 42/48 chars
  restaurantName?: string;
  restaurantAddress?: string;
  phone?: string;
  panVatNo?: string;
}

export function formatLine(left: string, right: string, width: number): string {
  const spaceNeeded = width - (left.length + right.length);
  if (spaceNeeded <= 0) {
    const trimmedLeft = left.substring(0, Math.max(1, width - right.length - 1));
    return trimmedLeft + ' ' + right;
  }
  return left + ' '.repeat(spaceNeeded) + right;
}

export function centerText(text: string, width: number): string {
  if (text.length >= width) return text.substring(0, width);
  const pad = Math.floor((width - text.length) / 2);
  return ' '.repeat(pad) + text;
}

export function generateKotEscPos(
  order: Order,
  role: PrintRole = 'KOT',
  options: EscPosRenderOptions = { paperWidth: '80mm' }
): string {
  const width = options.paperWidth === '58mm' ? 32 : 42;
  const divider = '='.repeat(width);
  const lightDivider = '-'.repeat(width);
  
  const lines: string[] = [];
  lines.push(divider);
  lines.push(centerText(role === 'BAR' ? '*** BAR DRINKS TICKET ***' : '*** KITCHEN ORDER TICKET ***', width));
  lines.push(centerText(`KOT: ${order.orderNumber}`, width));
  lines.push(divider);
  lines.push(formatLine(`Table: ${order.tableName}`, `Time: ${order.sentAt}`, width));
  lines.push(formatLine(`Waiter: ${order.waiterName}`, `Guests: 4`, width));
  if (order.notes) {
    lines.push(lightDivider);
    lines.push(`NOTE: ${order.notes}`);
  }
  lines.push(lightDivider);
  
  // Header
  if (width >= 42) {
    lines.push(formatLine('Qty  Description', 'Course', width));
  } else {
    lines.push('Qty  Item');
  }
  lines.push(lightDivider);

  // Filter items if BAR
  const filteredItems = role === 'BAR' 
    ? order.items.filter(i => i.course === 'drinks')
    : (role === 'KOT' ? order.items.filter(i => i.course !== 'drinks') : order.items);

  const renderItems = filteredItems.length > 0 ? filteredItems : order.items;

  renderItems.forEach(item => {
    const qtyStr = `${item.quantity}x `.padEnd(4);
    if (width >= 42) {
      lines.push(formatLine(`${qtyStr}${item.name}`, item.course.toUpperCase(), width));
    } else {
      lines.push(`${qtyStr}${item.name}`);
    }
    if (item.notes) {
      lines.push(`     >> [Note: ${item.notes}]`);
    }
  });

  lines.push(divider);
  const totalCount = renderItems.reduce((acc, curr) => acc + curr.quantity, 0);
  lines.push(formatLine(`Items: ${renderItems.length} (${totalCount} pcs)`, `Status: SENT`, width));
  lines.push(divider);
  lines.push('\n\n[ESC/POS CUT]\n');

  return lines.join('\n');
}

export function generateBillEscPos(
  bill: Bill,
  options: EscPosRenderOptions = { paperWidth: '80mm' }
): string {
  const width = options.paperWidth === '58mm' ? 32 : 42;
  const divider = '='.repeat(width);
  const lightDivider = '-'.repeat(width);

  const lines: string[] = [];
  lines.push(divider);
  lines.push(centerText(options.restaurantName || 'THE HIMALAYAN RESTRO & BAR', width));
  lines.push(centerText(options.restaurantAddress || 'Lakeside-6, Pokhara, Nepal', width));
  lines.push(centerText(`VAT/PAN: ${options.panVatNo || '601928475'} | Tel: 061-465892`, width));
  lines.push(centerText('TAX INVOICE', width));
  lines.push(divider);
  lines.push(formatLine(`Bill: ${bill.billNumber}`, `Table: ${bill.tableName}`, width));
  lines.push(formatLine(`Date: ${new Date().toLocaleDateString()}`, `Time: ${bill.createdAt}`, width));
  lines.push(formatLine(`Waiter: ${bill.waiterName}`, `Guests: ${bill.guestCount}`, width));
  lines.push(lightDivider);

  // Column header
  lines.push(formatLine('Qty  Item Description', 'Amount', width));
  lines.push(lightDivider);

  bill.items.forEach(item => {
    const qtyText = `${item.quantity}x ${item.name}`;
    const amountText = (item.quantity * item.price).toFixed(2);
    lines.push(formatLine(qtyText, amountText, width));
  });

  lines.push(lightDivider);
  lines.push(formatLine('Sub Total:', bill.subtotal.toFixed(2), width));
  if (bill.discount > 0) {
    lines.push(formatLine(`Discount (${bill.discountReason || 'Member'}):`, `-${bill.discount.toFixed(2)}`, width));
  }
  if (bill.serviceCharge > 0) {
    lines.push(formatLine('Service Charge (10%):', bill.serviceCharge.toFixed(2), width));
  }
  lines.push(formatLine('VAT (13%):', bill.tax.toFixed(2), width));
  lines.push(divider);
  lines.push(formatLine('GRAND TOTAL (NPR):', bill.total.toFixed(2), width));
  lines.push(divider);
  lines.push(formatLine('Payment Mode:', bill.paymentMode, width));
  if (bill.memberId) {
    lines.push(formatLine(`Member: ${bill.memberName}`, `ID: ${bill.memberId}`, width));
  }
  lines.push(lightDivider);
  lines.push(centerText('Thank You For Dining With Us!', width));
  lines.push(centerText('Please Visit Again', width));
  lines.push(divider);
  lines.push('\n[ESC/POS CASH DRAWER PULSE: 1B 70 00 19 FA]');
  lines.push('\n[ESC/POS FULL CUT]\n');

  return lines.join('\n');
}
