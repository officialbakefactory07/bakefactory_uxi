"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, 
  Banknote, QrCode, User, Phone, Tag, Edit3, Printer, 
  RotateCcw, CheckCircle2, Clock, LogOut, FileText, ChevronRight, X, Sparkles, ArrowLeft, ArrowRight
} from 'lucide-react';
import { ReceiptData, ReceiptItem } from '@/lib/escpos';
import { ReceiptModal } from '@/components/POS/ReceiptModal';
import styles from './page.module.css';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  subcategory?: string;
}

interface PosCartItem extends MenuItem {
  quantity: number;
  note?: string;
}

const CATEGORIES = ['All', 'Cakes', 'Desserts', 'Cookies', 'Combos'];

export default function PosTerminal() {
  const router = useRouter();

  // Auth / Session State
  const [cashierSession, setCashierSession] = useState<any>(null);

  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile View Tab: 'menu' | 'cart'
  const [mobileTab, setMobileTab] = useState<'menu' | 'cart'>('menu');

  // Cart & Order State
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway' | 'Delivery'>('Takeaway');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Split'>('Cash');
  const [cashTendered, setCashTendered] = useState<string>('');

  // UI Modals State
  const [generatedReceipt, setGeneratedReceipt] = useState<ReceiptData | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingItemNoteId, setEditingItemNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shift summary live state
  const [shiftOrders, setShiftOrders] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  // 1. Verify Strict Cashier Authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionStr = localStorage.getItem('bf_cashier_session');

      if (!sessionStr) {
        setIsAuthorized(false);
        router.replace('/pos/login');
        return;
      }

      try {
        const parsed = JSON.parse(sessionStr);
        if (parsed && (parsed.cashierName || parsed.id)) {
          setCashierSession(parsed);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace('/pos/login');
        }
      } catch (e) {
        setIsAuthorized(false);
        router.replace('/pos/login');
      }
    }
  }, [router]);

  // 2. Fetch Menu from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'menu'), (snap) => {
      const items: MenuItem[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        items.push({
          id: doc.id,
          name: d.name || 'Untitled Item',
          category: d.category || 'Cakes',
          price: d.price || 0,
          image: d.image || '',
          subcategory: d.subcategory || ''
        });
      });
      setMenuItems(items);
      setLoadingMenu(false);
    }, (err) => {
      console.error('Error fetching POS menu:', err);
      setLoadingMenu(false);
    });

    return () => unsub();
  }, []);

  // 3. Fetch Today's POS Orders for Shift Reporting
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pos_orders'), (snap) => {
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setShiftOrders(list);
    });
    return () => unsub();
  }, []);

  // 4. Cart Add / Modifiers
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, note: '' }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as PosCartItem[];
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const saveItemNote = (id: string) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, note: tempNote.trim() } : i));
    setEditingItemNoteId(null);
    setTempNote('');
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountVal(0);
    setCashTendered('');
    setMobileTab('menu');
  };

  // 5. Calculations
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!discountVal || discountVal <= 0) return 0;
    if (discountType === 'percent') {
      return Math.round((subtotal * discountVal) / 100);
    }
    return Math.min(discountVal, subtotal);
  }, [subtotal, discountVal, discountType]);

  const netTotal = Math.max(0, subtotal - discountAmount);

  const parsedCash = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, parsedCash - netTotal);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  // 6. Handle Checkout & Bill Generation
  const handlePrintBill = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const invNum = 'BF-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();

    const orderRecord = {
      invoiceNumber: invNum,
      orderType,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || '',
      items: cart.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        note: i.note || ''
      })),
      subtotal,
      discount: discountAmount,
      total: netTotal,
      paymentMethod,
      cashReceived: paymentMethod === 'Cash' ? (parsedCash || netTotal) : undefined,
      changeDue: paymentMethod === 'Cash' ? changeDue : undefined,
      cashierName: cashierSession?.cashierName || 'Cashier 1',
      source: 'POS_TERMINAL',
      status: 'Completed',
      createdAt: serverTimestamp(),
      dateStr: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    try {
      // Save to Firebase pos_orders collection
      await addDoc(collection(db, 'pos_orders'), orderRecord);

      // Prepare receipt data
      const receipt: ReceiptData = {
        invoiceNumber: invNum,
        orderType,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || undefined,
        items: cart.map(i => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          note: i.note || undefined
        })),
        subtotal,
        discount: discountAmount,
        total: netTotal,
        paymentMethod,
        cashReceived: paymentMethod === 'Cash' ? (parsedCash || netTotal) : undefined,
        changeDue: paymentMethod === 'Cash' ? changeDue : undefined,
        cashierName: cashierSession?.cashierName || 'Cashier',
        dateStr: orderRecord.dateStr,
        timeStr: orderRecord.timeStr
      };

      setGeneratedReceipt(receipt);
    } catch (err) {
      console.error('Error saving POS order:', err);
      alert('Failed to save POS order. Please check network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bf_cashier_session');
    router.push('/pos/login');
  };

  // Shift Totals Calculation
  const shiftTotals = useMemo(() => {
    let totalSales = 0;
    let cashCount = 0;
    let upiCount = 0;
    let billsCount = shiftOrders.length;

    shiftOrders.forEach(o => {
      const amt = o.total || 0;
      totalSales += amt;
      if (o.paymentMethod === 'Cash') cashCount += amt;
      if (o.paymentMethod === 'UPI') upiCount += amt;
    });

    return { totalSales, cashCount, upiCount, billsCount };
  }, [shiftOrders]);

  if (!isAuthorized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#180E07',
        color: '#FFFFFF',
        fontFamily: 'sans-serif',
        gap: '1rem'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          border: '3px solid rgba(212, 160, 23, 0.2)',
          borderTopColor: '#D4A017',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontSize: '0.9rem', color: '#D4A017', letterSpacing: '0.05em', fontWeight: 600 }}>
          🔒 Verifying Cashier Terminal Access...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.posContainer}>
      
      {/* ── Top Header Navigation ── */}
      <header className={styles.topNav}>
        <div className={styles.navBrand}>
          <Image src="/logo.png" alt="Bake Factory" width={34} height={34} style={{ mixBlendMode: 'multiply' }} />
          <div>
            <strong>BAKE FACTORY POS</strong>
            <span>{cashierSession?.cashierName || 'Terminal 1'}</span>
          </div>
        </div>

        <div className={styles.navActions}>
          <button className={styles.shiftBtn} onClick={() => setShowShiftModal(true)}>
            <FileText size={15} />
            <span className={styles.hideMobile}>Shift </span>(₹{shiftTotals.totalSales.toFixed(0)})
          </button>

          <button className={styles.logoutBtn} onClick={handleLogout} title="Sign Out">
            <LogOut size={15} />
            <span className={styles.hideMobile}>Logout</span>
          </button>
        </div>
      </header>

      {/* ── Mobile Tab Switcher ── */}
      <div className={styles.mobileTabBar}>
        <button 
          className={`${styles.mobileTabBtn} ${mobileTab === 'menu' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobileTab('menu')}
        >
          🍰 Menu Catalog
        </button>
        <button 
          className={`${styles.mobileTabBtn} ${mobileTab === 'cart' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobileTab('cart')}
        >
          🛒 Current Bill ({totalCartCount}) • ₹{netTotal.toFixed(0)}
        </button>
      </div>

      {/* ── Main POS Workspace ── */}
      <div className={styles.workspace}>
        
        {/* ── Left Side: Menu Grid & Category Filters ── */}
        <section className={`${styles.menuPanel} ${mobileTab === 'cart' ? styles.hideOnMobile : ''}`}>
          
          {/* Search & Category Tabs */}
          <div className={styles.menuControls}>
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search cake, cookie, pastry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className={styles.categoryTabs}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  className={`${styles.catTab} ${activeCategory === cat ? styles.activeCatTab : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className={styles.productsGrid}>
            {loadingMenu ? (
              <div className={styles.gridLoader}>Loading Menu Catalog...</div>
            ) : filteredMenuItems.length === 0 ? (
              <div className={styles.gridEmpty}>No items found in "{activeCategory}".</div>
            ) : (
              filteredMenuItems.map(item => {
                const inCart = cart.find(c => c.id === item.id);
                return (
                  <div 
                    key={item.id} 
                    className={`${styles.productCard} ${inCart ? styles.productCardActive : ''}`}
                    onClick={() => addToCart(item)}
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className={styles.prodImg} />
                    ) : (
                      <div className={styles.prodPlaceholder}>{item.name.charAt(0)}</div>
                    )}
                    <div className={styles.prodInfo}>
                      <span className={styles.prodName}>{item.name}</span>
                      <div className={styles.prodPriceRow}>
                        <span className={styles.prodPrice}>₹{item.price.toFixed(0)}</span>
                        {inCart && <span className={styles.qtyBadge}>{inCart.quantity} in bill</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Floating Mobile Bill Bar */}
          {cart.length > 0 && mobileTab === 'menu' && (
            <div className={styles.floatingMobileBar} onClick={() => setMobileTab('cart')}>
              <div className={styles.floatingBarInfo}>
                <ShoppingBag size={18} />
                <span><strong>{totalCartCount} Items</strong> • ₹{netTotal.toFixed(0)}</span>
              </div>
              <div className={styles.floatingBarAction}>
                <span>View Bill & Print</span>
                <ArrowRight size={16} />
              </div>
            </div>
          )}

        </section>

        {/* ── Right Side: Fast Cart & Checkout Drawer ── */}
        <section className={`${styles.cartPanel} ${mobileTab === 'menu' ? styles.hideOnMobile : ''}`}>
          
          {/* Mobile Back Button */}
          <div className={styles.mobileBackRow}>
            <button className={styles.backToMenuBtn} onClick={() => setMobileTab('menu')}>
              <ArrowLeft size={16} /> Add More Items
            </button>
            <span className={styles.mobileBillTitle}>Invoice Details</span>
          </div>

          {/* Order Type Selector */}
          <div className={styles.orderTypeSelector}>
            {(['Takeaway', 'Dine-in', 'Delivery'] as const).map(type => (
              <button 
                key={type}
                className={`${styles.typeBtn} ${orderType === type ? styles.typeBtnActive : ''}`}
                onClick={() => setOrderType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Customer Lookup Bar */}
          <div className={styles.customerBar}>
            <div className={styles.customerInputWrap}>
              <User size={15} />
              <input 
                type="text" 
                placeholder="Customer Name" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className={styles.customerInputWrap}>
              <Phone size={15} />
              <input 
                type="tel" 
                placeholder="Phone (10 digits)" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className={styles.cartList}>
            {cart.length === 0 ? (
              <div className={styles.cartEmpty}>
                <ShoppingBag size={36} className={styles.emptyCartIcon} />
                <p>No items in current bill.</p>
                <button className={styles.emptyAddBtn} onClick={() => setMobileTab('menu')}>
                  Browse Menu & Add Items
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className={styles.cartItemRow}>
                  <div className={styles.cartItemDetails}>
                    <span className={styles.cartItemName}>{item.name}</span>
                    <span className={styles.cartItemRate}>₹{item.price.toFixed(0)} each</span>
                    
                    {/* Item Custom Note (Cake Message, Dietary) */}
                    {item.note && (
                      <div className={styles.itemNoteDisplay}>
                        <span>* {item.note}</span>
                        <button onClick={() => { setEditingItemNoteId(item.id); setTempNote(item.note || ''); }}>Edit</button>
                      </div>
                    )}

                    {!item.note && editingItemNoteId !== item.id && (
                      <button 
                        className={styles.addNoteBtn} 
                        onClick={() => { setEditingItemNoteId(item.id); setTempNote(''); }}
                      >
                        + Add Custom Note (e.g. Birthday Msg)
                      </button>
                    )}

                    {editingItemNoteId === item.id && (
                      <div className={styles.noteInputBox}>
                        <input 
                          type="text" 
                          placeholder="e.g. Happy Birthday Sara" 
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          autoFocus
                        />
                        <button className={styles.saveNoteBtn} onClick={() => saveItemNote(item.id)}>Save</button>
                        <button className={styles.cancelNoteBtn} onClick={() => setEditingItemNoteId(null)}>✕</button>
                      </div>
                    )}
                  </div>

                  <div className={styles.cartItemRight}>
                    <span className={styles.cartItemTotal}>₹{(item.price * item.quantity).toFixed(0)}</span>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQuantity(item.id, -1)} className={styles.qtyBtn}><Minus size={12} /></button>
                      <span className={styles.qtyVal}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className={styles.qtyBtn}><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Calculation & Discounts */}
          <div className={styles.calculationSection}>
            <div className={styles.calcRow}>
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>

            {/* Discount Inputs */}
            <div className={styles.discountRow}>
              <div className={styles.discountToggle}>
                <button 
                  className={discountType === 'flat' ? styles.discActive : ''} 
                  onClick={() => setDiscountType('flat')}
                >
                  ₹ Flat
                </button>
                <button 
                  className={discountType === 'percent' ? styles.discActive : ''} 
                  onClick={() => setDiscountType('percent')}
                >
                  % Off
                </button>
              </div>
              <input 
                type="number" 
                placeholder="Discount" 
                value={discountVal || ''} 
                onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                className={styles.discountInput}
              />
              {discountAmount > 0 && <span className={styles.discApplied}>-₹{discountAmount}</span>}
            </div>

            <div className={styles.divider} />

            <div className={styles.grandTotalRow}>
              <span>NET TOTAL:</span>
              <span className={styles.grandTotalVal}>₹{netTotal.toFixed(0)}</span>
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className={styles.paymentSection}>
            <label className={styles.sectionLabel}>Select Payment Method</label>
            <div className={styles.paymentGrid}>
              {[
                { key: 'Cash', icon: Banknote, label: 'Cash' },
                { key: 'UPI', icon: QrCode, label: 'UPI / QR' },
                { key: 'Card', icon: CreditCard, label: 'Card' },
              ].map(p => (
                <button 
                  key={p.key}
                  className={`${styles.payBtn} ${paymentMethod === p.key ? styles.payBtnActive : ''}`}
                  onClick={() => setPaymentMethod(p.key as any)}
                >
                  <p.icon size={16} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            {/* Cash Tendered & Change Return Box */}
            {paymentMethod === 'Cash' && (
              <div className={styles.cashTenderedBox}>
                <div className={styles.cashInputRow}>
                  <label>Cash Received:</label>
                  <input 
                    type="number" 
                    placeholder={`₹${netTotal}`} 
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                  />
                </div>
                <div className={styles.quickCashChips}>
                  {Array.from(new Set([netTotal, 100, 200, 500, 2000]))
                    .filter(n => n >= netTotal && n > 0)
                    .slice(0, 4)
                    .map((val, idx) => (
                      <button key={`cash-chip-${val}-${idx}`} onClick={() => setCashTendered(val.toString())}>
                        {val === netTotal ? `Exact (₹${val})` : `₹${val}`}
                      </button>
                    ))}
                </div>
                {parsedCash > 0 && (
                  <div className={styles.changeDueRow}>
                    <span>Change to Return:</span>
                    <strong>₹{changeDue.toFixed(0)}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom POS Print Action */}
          <div className={styles.checkoutActionRow}>
            <button className={styles.clearBtn} onClick={clearCart} title="Clear Bill">
              <RotateCcw size={16} />
            </button>
            <button 
              className={styles.printBillBtn}
              onClick={handlePrintBill}
              disabled={cart.length === 0 || isSubmitting}
            >
              <Printer size={20} />
              <span>{isSubmitting ? 'Saving...' : `Print Receipt • ₹${netTotal.toFixed(0)}`}</span>
            </button>
          </div>

        </section>

      </div>

      {/* ── Receipt Modal Popup (Thermal & Bluetooth Print) ── */}
      {generatedReceipt && (
        <ReceiptModal 
          data={generatedReceipt}
          onClose={() => setGeneratedReceipt(null)}
          onNewSale={() => {
            setGeneratedReceipt(null);
            clearCart();
          }}
        />
      )}

      {/* ── Cashier Shift Summary Modal ── */}
      {showShiftModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.shiftModal}>
            <div className={styles.shiftHeader}>
              <h3>Shift Register Summary</h3>
              <button onClick={() => setShowShiftModal(false)}><X size={18} /></button>
            </div>
            
            <div className={styles.shiftStats}>
              <div className={styles.statBox}>
                <span>Total Bills Printed</span>
                <strong>{shiftTotals.billsCount}</strong>
              </div>
              <div className={styles.statBox}>
                <span>Total Gross Sales</span>
                <strong>₹{shiftTotals.totalSales.toFixed(0)}</strong>
              </div>
              <div className={styles.statBox}>
                <span>Cash in Drawer</span>
                <strong>₹{shiftTotals.cashCount.toFixed(0)}</strong>
              </div>
              <div className={styles.statBox}>
                <span>UPI / Digital</span>
                <strong>₹{shiftTotals.upiCount.toFixed(0)}</strong>
              </div>
            </div>

            <div className={styles.shiftActions}>
              <button className={styles.printShiftBtn} onClick={() => window.print()}>
                <Printer size={16} /> Print Shift Thermal Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
