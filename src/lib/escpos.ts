/**
 * ESC/POS Thermal Receipt Builder & Web Bluetooth Driver for 58mm / 80mm Printers
 * Supports raw Web Bluetooth API (GATT 0xFFE0 / 0x18F0 / 0x1800 serial characteristics)
 */

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  note?: string;
}

export interface ReceiptData {
  invoiceNumber: string;
  orderType: 'Dine-in' | 'Takeaway' | 'Delivery';
  customerName?: string;
  customerPhone?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  deliveryFee?: number;
  total: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Split';
  cashReceived?: number;
  changeDue?: number;
  cashierName?: string;
  dateStr?: string;
  timeStr?: string;
}

// ESC/POS Command Constants
const ESC = 0x1B;
const GS = 0x1D;

export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  // Initialize printer
  init(): this {
    this.buffer.push(ESC, 0x40); // ESC @
    return this;
  }

  // Text alignment: 0=Left, 1=Center, 2=Right
  align(align: 'left' | 'center' | 'right'): this {
    const val = align === 'center' ? 1 : align === 'right' ? 2 : 0;
    this.buffer.push(ESC, 0x61, val);
    return this;
  }

  // Font size: Normal, Double Width, Double Height, Large (Both)
  size(mode: 'normal' | 'bold' | 'double_height' | 'double_width' | 'large'): this {
    let n = 0;
    if (mode === 'double_height') n = 0x01;
    if (mode === 'double_width') n = 0x10;
    if (mode === 'large') n = 0x11;
    this.buffer.push(GS, 0x21, n);
    return this;
  }

  // Bold on/off
  bold(enable: boolean): this {
    this.buffer.push(ESC, 0x45, enable ? 1 : 0);
    return this;
  }

  // Print text
  text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  // Print text followed by newline
  line(str: string = ''): this {
    this.text(str);
    this.buffer.push(0x0A); // LF
    return this;
  }

  // Feed N lines
  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0A);
    }
    return this;
  }

  // Print a divider line of dashes (32 chars for 58mm, 48 chars for 80mm)
  divider(char: string = '-', width: number = 32): this {
    return this.line(char.repeat(width));
  }

  // Print 2 columns justified (Left text, Right text)
  row(left: string, right: string, totalWidth: number = 32): this {
    const space = totalWidth - left.length - right.length;
    if (space > 0) {
      this.line(left + ' '.repeat(space) + right);
    } else {
      this.line(left + ' ' + right);
    }
    return this;
  }

  // Print 3 columns (Item, Qty, Total)
  itemRow(name: string, qty: number, price: number, totalWidth: number = 32): this {
    const qtyStr = `${qty}x`;
    const priceStr = `Rs.${(qty * price).toFixed(0)}`;
    const rightSide = `${qtyStr}  ${priceStr}`;
    
    const maxNameLen = totalWidth - rightSide.length - 1;
    let displayName = name;
    if (displayName.length > maxNameLen) {
      displayName = displayName.substring(0, maxNameLen);
    }
    
    const space = totalWidth - displayName.length - rightSide.length;
    this.line(displayName + ' '.repeat(Math.max(1, space)) + rightSide);
    return this;
  }

  // Cut paper command
  cut(): this {
    this.feed(3);
    this.buffer.push(GS, 0x56, 0x00); // GS V 0 (Full cut)
    return this;
  }

  // Return Uint8Array ready for Bluetooth transmission
  getUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Generate full ESC/POS binary bytes for Bake Factory Receipt
 */
export function generateReceiptBytes(data: ReceiptData, is80mm: boolean = false): Uint8Array {
  const width = is80mm ? 48 : 32;
  const builder = new EscPosBuilder();

  const now = new Date();
  const dateStr = data.dateStr || now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = data.timeStr || now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  // 1. Header (Centered)
  builder
    .align('center')
    .size('large')
    .bold(true)
    .line('BAKE FACTORY')
    .size('normal')
    .bold(true)
    .line('CAKES & DESSERTS')
    .bold(false)
    .line('ARTISANAL STUDIO')
    .line('Catholic Church Area, Tadepalle')
    .line('Vijayawada')
    .line('Hotline: +91 79894 99446')
    .divider('-', width);

  // 2. Tax Invoice Title & Metadata
  builder
    .align('center')
    .bold(true)
    .line('TAX INVOICE')
    .bold(false)
    .align('left')
    .row(`Invoice No: #${data.invoiceNumber}`, `Type: ${data.orderType.toUpperCase()}`, width)
    .row(`Date: ${dateStr}`, `${timeStr}`, width);

  if (data.customerName || data.customerPhone) {
    const cust = `${data.customerName || 'Walk-in Customer'} ${data.customerPhone ? `(${data.customerPhone})` : ''}`;
    builder.line(`Customer: ${cust}`);
  }

  if (data.cashierName) {
    builder.line(`Cashier: ${data.cashierName}`);
  }

  builder.divider('-', width);

  // 3. Itemized Table
  builder
    .bold(true)
    .row('ITEM', 'QTY RATE AMOUNT', width)
    .bold(false)
    .divider('-', width);

  data.items.forEach(item => {
    builder.itemRow(item.name, item.quantity, item.price, width);
    if (item.note && item.note.trim()) {
      builder.line(`  Note: ${item.note.trim()}`);
    }
  });

  builder.divider('-', width);

  // 4. Financial Summary & NET TOTAL
  builder.row('Subtotal:', `Rs.${data.subtotal.toFixed(0)}`, width);

  if (data.discount > 0) {
    builder.row('Discount:', `-Rs.${data.discount.toFixed(0)}`, width);
  }

  if (data.deliveryFee && data.deliveryFee > 0) {
    builder.row('Delivery Fee:', `Rs.${data.deliveryFee.toFixed(0)}`, width);
  }

  builder
    .divider('=', width)
    .bold(true)
    .size('double_height')
    .row('NET TOTAL:', `Rs.${data.total.toFixed(0)}`, width)
    .size('normal')
    .bold(false)
    .divider('=', width);

  // 5. Payment Information
  builder.row('Payment Mode:', data.paymentMethod.toUpperCase(), width);

  if (data.paymentMethod === 'Cash' && data.cashReceived !== undefined) {
    builder.row('Cash Received:', `Rs.${data.cashReceived.toFixed(0)}`, width);
    if (data.changeDue !== undefined && data.changeDue >= 0) {
      builder.row('Change Returned:', `Rs.${data.changeDue.toFixed(0)}`, width);
    }
  }

  builder.divider('-', width);

  // 6. Brand Closing Footer
  builder
    .align('center')
    .bold(true)
    .line('THANK YOU FOR VISITING!')
    .line('BAKE FACTORY')
    .bold(false)
    .line('CAKES & DESSERTS')
    .line('Baked fresh. Served happy.')
    .divider('-', width)
    .cut();

  return builder.getUint8Array();
}

/**
 * Connect to Bluetooth Thermal Printer via Web Bluetooth API and Print
 */
export async function printViaBluetooth(
  data: ReceiptData,
  is80mm: boolean = false
): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Bluetooth only available in browser.' };
  }

  if (!('bluetooth' in navigator)) {
    return {
      success: false,
      message: 'Web Bluetooth is not supported on this browser. Please use Chrome/Edge or standard print dialog.'
    };
  }

  try {
    // Request Bluetooth Device with common thermal printer services
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Common thermal service
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent
        0xFFE0,
        0xFF00,
        0x1800,
        0x180A,
      ]
    });

    if (!device || !device.gatt) {
      return { success: false, message: 'Printer connection was cancelled.' };
    }

    const server = await device.gatt.connect();

    // Find printable characteristic
    const services = await server.getPrimaryServices();
    let writeChar: any = null;

    for (const service of services) {
      try {
        const characteristics = await service.getCharacteristics();
        for (const c of characteristics) {
          if (c.properties.write || c.properties.writeWithoutResponse) {
            writeChar = c;
            break;
          }
        }
        if (writeChar) break;
      } catch (err) {
        continue;
      }
    }

    if (!writeChar) {
      return { success: false, message: 'Could not find writable printer channel on device.' };
    }

    // Generate Raw Receipt ESC/POS Bytes
    const bytes = generateReceiptBytes(data, is80mm);

    // Send in chunks of 100 bytes (Bluetooth MTU safe chunking)
    const CHUNK_SIZE = 100;
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      const chunk = bytes.slice(i, i + CHUNK_SIZE);
      if (writeChar.properties.writeWithoutResponse) {
        await writeChar.writeValueWithoutResponse(chunk);
      } else {
        await writeChar.writeValue(chunk);
      }
      // Small delay between chunks for hardware buffer safety
      await new Promise(res => setTimeout(res, 25));
    }

    return { success: true, message: 'Receipt printed successfully via Bluetooth!' };
  } catch (error: any) {
    console.error('Bluetooth Print Error:', error);
    return { success: false, message: error.message || 'Failed to print via Bluetooth.' };
  }
}
