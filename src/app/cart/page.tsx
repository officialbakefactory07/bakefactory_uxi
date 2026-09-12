"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart, CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { 
  Trash2, Plus, Minus, Tag, Check, MapPin, Edit3, 
  PlusCircle, ShoppingBag, ShieldCheck, Sparkles, X, Phone, User, CheckCircle2,
  Banknote, CreditCard, Wallet, Clock, AlertCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

// Pre-configured coupons for instant testing & usage
const AVAILABLE_COUPONS = [
  { code: 'WELCOME10', discountType: 'percent', value: 10, description: '10% OFF on your order' },
  { code: 'BAKE50', discountType: 'flat', value: 50, description: 'Flat ₹50 OFF on orders' },
  { code: 'SWEET20', discountType: 'percent', value: 20, description: '20% OFF sweet treats' },
];

function CartContent() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentErrorParam = searchParams.get('payment_error');

  // User Profile & Address State
  const [profile, setProfile] = useState<any>(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  // Payment Method State: 'online' (PayU) or 'cod'
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');

  // Address Selection & Management State
  const [addresses, setAddresses] = useState<string[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressInput, setEditingAddressInput] = useState('');

  // Contact Info State
  const [contactPhone, setContactPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: string; value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Order & Submission State
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Fetch account profile & saved addresses from Firestore
  useEffect(() => {
    if (!user) {
      setFetchingProfile(false);
      return;
    }

    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setContactPhone(data.phone || '');
          setPhoneInput(data.phone || '');

          const list: string[] = [];
          if (data.address && data.address.trim()) {
            list.push(data.address.trim());
          }
          if (Array.isArray(data.savedAddresses)) {
            data.savedAddresses.forEach((addr: string) => {
              if (addr && !list.includes(addr.trim())) {
                list.push(addr.trim());
              }
            });
          }
          setAddresses(list);
          setSelectedAddressIndex(0);
        }
      })
      .catch(err => {
        console.error("Error fetching user profile in Cart:", err);
      })
      .finally(() => {
        setFetchingProfile(false);
      });
  }, [user]);

  // Calculate coupon discount
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percent') {
      return Math.round((totalPrice * appliedCoupon.value) / 100);
    } else if (appliedCoupon.discountType === 'flat') {
      return Math.min(appliedCoupon.value, totalPrice);
    }
    return 0;
  }, [appliedCoupon, totalPrice]);

  const deliveryFee = totalPrice >= 499 || totalPrice === 0 ? 0 : 35;
  const finalPrice = Math.max(0, totalPrice - discountAmount + deliveryFee);

  // Apply Coupon Handler
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');
    setCouponSuccess('');

    if (!code) {
      setCouponError('Please enter a valid coupon code.');
      return;
    }

    const found = AVAILABLE_COUPONS.find(c => c.code === code);
    if (found) {
      setAppliedCoupon(found);
      setCouponCode(found.code);
      setCouponSuccess(`🎉 Coupon ${found.code} applied successfully!`);
    } else {
      setCouponError('Invalid coupon code. Try BAKE50 or WELCOME10.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  // Save new delivery address
  const handleSaveNewAddress = async () => {
    if (!newAddressInput.trim()) return;
    const updatedList = [...addresses, newAddressInput.trim()];
    setAddresses(updatedList);
    setSelectedAddressIndex(updatedList.length - 1);
    setIsAddingNewAddress(false);
    setNewAddressInput('');

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          address: updatedList[0],
          savedAddresses: updatedList
        });
        setSavedSuccessMsg('Address saved to your profile!');
        setTimeout(() => setSavedSuccessMsg(''), 3000);
      } catch (err) {
        console.error('Error saving address to profile:', err);
      }
    }
  };

  // Update existing address
  const handleUpdateAddress = async () => {
    if (!editingAddressInput.trim()) return;
    const updatedList = [...addresses];
    updatedList[selectedAddressIndex] = editingAddressInput.trim();
    setAddresses(updatedList);
    setIsEditingAddress(false);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          address: updatedList[0],
          savedAddresses: updatedList
        });
        setSavedSuccessMsg('Address updated successfully!');
        setTimeout(() => setSavedSuccessMsg(''), 3000);
      } catch (err) {
        console.error('Error updating address in profile:', err);
      }
    }
  };

  // Save contact phone
  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return;
    setContactPhone(phoneInput.trim());
    setIsEditingPhone(false);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          phone: phoneInput.trim()
        });
        setSavedSuccessMsg('Phone number updated!');
        setTimeout(() => setSavedSuccessMsg(''), 3000);
      } catch (err) {
        console.error('Error updating phone in profile:', err);
      }
    }
  };

  // Place Order Handler (PayU Payment Gateway or COD)
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    const currentAddress = addresses[selectedAddressIndex] || newAddressInput.trim();
    if (!currentAddress) {
      alert('Please enter or select a delivery address before placing your order.');
      return;
    }

    if (!contactPhone) {
      alert('Please enter a contact mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        userId: user.uid,
        userEmail: user.email,
        userName: profile?.fullName || user.displayName || 'Customer',
        contactPhone,
        deliveryAddress: currentAddress,
        items,
        subtotal: totalPrice,
        discount: discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        deliveryFee,
        totalPrice: finalPrice,
        paymentMethod: paymentMethod === 'online' ? 'PayU Payment Gateway' : 'Cash on Delivery (COD)',
        paymentStatus: paymentMethod === 'online' ? 'Pending Payment (PayU)' : 'Pending (COD)',
        specialInstructions: instructions,
        status: 'Preparing',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "orders"), orderPayload);

      // If Online Payment via PayU
      if (paymentMethod === 'online') {
        const payuRes = await fetch('/api/payu/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: docRef.id,
            amount: finalPrice,
            customerName: profile?.fullName || user.displayName || 'Customer',
            email: user.email,
            phone: contactPhone,
            productInfo: `Bake Factory Order #${docRef.id.slice(0, 8)} (${items.length} items)`
          })
        });

        const payuData = await payuRes.json();

        if (!payuRes.ok || !payuData.success) {
          throw new Error(payuData.error || 'Failed to initialize PayU payment');
        }

        // Clear local cart before redirecting to PayU
        clearCart();

        // Create dynamic form and POST to PayU Gateway
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payuData.actionUrl;

        Object.keys(payuData.params).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = payuData.params[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // If Cash on Delivery (COD)
      if (user.email) {
        fetch('/api/order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            order: {
              id: docRef.id,
              ...orderPayload,
              createdAt: new Date().toISOString()
            }
          })
        }).catch(e => console.error('Error triggering order email:', e));
      }

      clearCart();
      router.push(`/order-success?id=${docRef.id}&status=cod`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      alert(error.message || "There was an error placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || fetchingProfile) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <p>Loading your cart & account details...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <Card className={styles.emptyCartCard}>
          <ShoppingBag size={56} opacity={0.3} style={{ margin: '0 auto 1rem auto' }} />
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven&apos;t added any delicious items yet.</p>
          <Button variant="primary" onClick={() => router.push('/menu')}>Browse Menu</Button>
        </Card>
      </div>
    );
  }

  const selectedAddress = addresses[selectedAddressIndex] || '';

  return (
    <div className={styles.page}>
      
      {/* Payment Error Alert from PayU Callback */}
      {paymentErrorParam && (
        <div className={styles.errorToastBanner}>
          <AlertCircle size={18} />
          <span>Payment Failed or Cancelled: {decodeURIComponent(paymentErrorParam)}. You can retry payment below.</span>
        </div>
      )}

      {/* Header Notification Toast */}
      {savedSuccessMsg && (
        <div className={styles.toastBanner}>
          <Check size={18} /> {savedSuccessMsg}
        </div>
      )}

      <div className={styles.headerTitleRow}>
        <h1 className={styles.pageTitle}>Checkout & Order Summary</h1>
        <span className={styles.itemBadge}>{totalItems} Item{totalItems > 1 ? 's' : ''}</span>
      </div>

      <div className={styles.cartContainer}>

        {/* ── LEFT COLUMN: Cart Items List & Account / Delivery Address ── */}
        <div className={styles.leftColumn}>
          
          {/* Section 1: Order Items List */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
              <h2><ShoppingBag size={20} /> Order Items ({totalItems})</h2>
              <button className={styles.clearBtn} onClick={clearCart}>Clear All</button>
            </div>

            <div className={styles.cartItemsList}>
              {items.map(item => (
                <div key={item.id} className={styles.cartItemRow}>
                  
                  {/* Thumbnail Image */}
                  <div className={styles.itemImageWrapper}>
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className={styles.itemImage} />
                    ) : (
                      <div className={styles.itemPlaceholder}>
                        <span>{item.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={styles.itemInfoCol}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemPricePerUnit}>₹{item.price.toFixed(0)} each</p>
                    
                    {item.note && (
                      <div className={styles.cakeNoteBadge}>
                        <span>↳ Message: &ldquo;{item.note}&rdquo;</span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className={styles.quantityControls}>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Total Price & Delete */}
                  <div className={styles.itemTotalCol}>
                    <span className={styles.itemTotalPrice}>₹{(item.price * item.quantity).toFixed(0)}</span>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </Card>

          {/* Section 2: Account & Delivery Address */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
              <h2><MapPin size={20} /> Delivery Details</h2>
              {user && <span className={styles.userEmailTag}>{user.email}</span>}
            </div>

            {!user ? (
              <div className={styles.guestPrompt}>
                <p>Please log in or register to place your order and earn loyalty points.</p>
                <Button variant="secondary" onClick={() => router.push('/login')}>
                  <User size={16} /> Log In to Continue
                </Button>
              </div>
            ) : (
              <div className={styles.deliveryDetailsForm}>
                
                {/* Contact Phone Row */}
                <div className={styles.phoneBlock}>
                  <div className={styles.blockHeader}>
                    <label><Phone size={16} /> Contact Phone Number</label>
                    {!isEditingPhone && (
                      <button 
                        className={styles.textLinkBtn} 
                        onClick={() => {
                          setPhoneInput(contactPhone);
                          setIsEditingPhone(true);
                        }}
                      >
                        <Edit3 size={13} /> {contactPhone ? 'Change' : 'Add Phone'}
                      </button>
                    )}
                  </div>

                  {isEditingPhone ? (
                    <div className={styles.phoneEditRow}>
                      <input 
                        type="tel"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        placeholder="e.g. +91 79894 99446"
                        className={styles.addressInput}
                      />
                      <button className={styles.saveSmallBtn} onClick={handleSavePhone}>Save</button>
                      <button className={styles.cancelSmallBtn} onClick={() => setIsEditingPhone(false)}>Cancel</button>
                    </div>
                  ) : (
                    <p className={styles.phoneDisplay}>
                      {contactPhone || <span className={styles.missingWarn}>No phone number added yet. Please add one for delivery updates.</span>}
                    </p>
                  )}
                </div>

                {/* Delivery Address Section */}
                <div className={styles.addressBlock}>
                  <div className={styles.blockHeader}>
                    <label><MapPin size={16} /> Delivery Address (Vijayawada / Tadepalle)</label>
                    {!isAddingNewAddress && !isEditingAddress && (
                      <button 
                        className={styles.textLinkBtn}
                        onClick={() => {
                          setNewAddressInput('');
                          setIsAddingNewAddress(true);
                          setIsEditingAddress(false);
                        }}
                      >
                        <PlusCircle size={14} /> Add New Address
                      </button>
                    )}
                  </div>

                  {/* Add New Address Form */}
                  {isAddingNewAddress && (
                    <div className={styles.addressEditBox}>
                      <textarea 
                        rows={3}
                        value={newAddressInput}
                        onChange={e => setNewAddressInput(e.target.value)}
                        placeholder="Enter full street address, apartment / flat number, landmark, Vijayawada pin code..."
                        className={styles.addressInput}
                      />
                      <div className={styles.editActions}>
                        <button className={styles.saveSmallBtn} onClick={handleSaveNewAddress}>Save & Select Address</button>
                        <button className={styles.cancelSmallBtn} onClick={() => setIsAddingNewAddress(false)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Edit Existing Address Form */}
                  {isEditingAddress && (
                    <div className={styles.addressEditBox}>
                      <textarea 
                        rows={3}
                        value={editingAddressInput}
                        onChange={e => setEditingAddressInput(e.target.value)}
                        placeholder="Update full address..."
                        className={styles.addressInput}
                      />
                      <div className={styles.editActions}>
                        <button className={styles.saveSmallBtn} onClick={handleUpdateAddress}>Update Address</button>
                        <button className={styles.cancelSmallBtn} onClick={() => setIsEditingAddress(false)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Address Selection List */}
                  {!isAddingNewAddress && !isEditingAddress && addresses.length === 0 && (
                    <div className={styles.noAddressBox}>
                      <p>You have no saved delivery addresses.</p>
                      <button 
                        className={styles.addFirstAddrBtn}
                        onClick={() => setIsAddingNewAddress(true)}
                      >
                        <PlusCircle size={15} /> Add Delivery Address
                      </button>
                    </div>
                  )}

                  {!isAddingNewAddress && !isEditingAddress && addresses.length > 0 && (
                    <div className={styles.addressList}>
                      {addresses.map((addr, idx) => {
                        const isSelected = selectedAddressIndex === idx;
                        return (
                          <div 
                            key={idx} 
                            className={`${styles.addressCard} ${isSelected ? styles.selectedAddressCard : ''}`}
                            onClick={() => {
                              setSelectedAddressIndex(idx);
                              setIsEditingAddress(false);
                            }}
                          >
                            <div className={styles.radioCol}>
                              <div className={`${styles.radioOuter} ${isSelected ? styles.radioChecked : ''}`}>
                                {isSelected && <div className={styles.radioInner} />}
                              </div>
                            </div>
                            <div className={styles.addressInfoCol}>
                              <span className={styles.addressTag}>
                                {idx === 0 ? 'Primary Address' : `Saved Address ${idx + 1}`}
                              </span>
                              <p className={styles.addressText}>{addr}</p>
                            </div>
                            {isSelected && (
                              <button 
                                className={styles.editAddrBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAddressInput(addr);
                                  setIsEditingAddress(true);
                                  setIsAddingNewAddress(false);
                                }}
                              >
                                <Edit3 size={15} /> Edit
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* Special Delivery Instructions */}
                <div className={styles.instructionsBlock}>
                  <label className={styles.blockLabel}>Special Delivery Instructions (Optional)</label>
                  <textarea 
                    rows={2}
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder="e.g. Ring doorbell twice, leave with security guard, custom eggless note"
                    className={styles.instructionsInput}
                  />
                </div>

              </div>
            )}
          </Card>

          {/* Section 3: Payment Method Selection (PayU & COD) */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
              <h2><CreditCard size={20} /> Payment Method</h2>
              <span className={styles.secureTag}>
                <ShieldCheck size={13} /> PayU 256-Bit SSL Encrypted
              </span>
            </div>

            <div className={styles.paymentOptionsList}>
              
              {/* Option 1: Online Payment via PayU */}
              <div 
                className={`${styles.paymentCard} ${paymentMethod === 'online' ? styles.selectedPaymentCard : ''}`}
                onClick={() => setPaymentMethod('online')}
              >
                <div className={styles.radioCol}>
                  <div className={`${styles.radioOuter} ${paymentMethod === 'online' ? styles.radioChecked : ''}`}>
                    {paymentMethod === 'online' && <div className={styles.radioInner} />}
                  </div>
                </div>
                <div className={styles.paymentIconBox}>
                  <CreditCard size={24} className={styles.paymentIcon} />
                </div>
                <div className={styles.paymentInfoCol}>
                  <div className={styles.paymentTitleRow}>
                    <h3>Online Payment (PayU Gateway)</h3>
                    <span className={styles.razorpayBadge}>Recommended</span>
                  </div>
                  <p className={styles.paymentDesc}>
                    UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), and NetBanking.
                  </p>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div 
                className={`${styles.paymentCard} ${paymentMethod === 'cod' ? styles.selectedPaymentCard : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className={styles.radioCol}>
                  <div className={`${styles.radioOuter} ${paymentMethod === 'cod' ? styles.radioChecked : ''}`}>
                    {paymentMethod === 'cod' && <div className={styles.radioInner} />}
                  </div>
                </div>
                <div className={styles.paymentIconBox}>
                  <Banknote size={24} className={styles.paymentIcon} />
                </div>
                <div className={styles.paymentInfoCol}>
                  <div className={styles.paymentTitleRow}>
                    <h3>Cash on Delivery (COD)</h3>
                    <span className={styles.codBadge}>Pay at Doorstep</span>
                  </div>
                  <p className={styles.paymentDesc}>
                    Pay with cash or scan delivery driver&apos;s UPI QR upon fresh delivery.
                  </p>
                </div>
              </div>

            </div>

            <div className={styles.razorpayNoticeBox}>
              <Sparkles size={16} className={styles.sparkleGold} />
              <span>
                {paymentMethod === 'online' 
                  ? '⚡ You will be securely redirected to PayU to complete payment.' 
                  : '💵 Please keep exact cash or UPI ready at the time of delivery.'}
              </span>
            </div>

            {/* 30-Minute Cancellation Policy Alert */}
            <div className={styles.cancelPolicyBox}>
              <Clock size={18} className={styles.clockIcon} />
              <div>
                <strong>⏱️ 30-Minute Cancellation Policy</strong>
                <p>Orders can be cancelled within <strong>30 minutes</strong> of placement. See our full <a href="/refund-policy" target="_blank" style={{ color: '#D4A017', textDecoration: 'underline' }}>Cancellation & Refund Policy</a>.</p>
              </div>
            </div>
          </Card>

        </div>

        {/* ── RIGHT COLUMN: Coupon Codes & Final Bill Summary ── */}
        <div className={styles.rightColumn}>

          {/* Section 1: Coupon Code Card */}
          <Card className={styles.summaryCard}>
            <div className={styles.cardHeaderRow}>
              <h2><Tag size={18} /> Apply Coupon Code</h2>
            </div>

            {appliedCoupon ? (
              <div className={styles.appliedCouponBox}>
                <div className={styles.appliedCouponHeader}>
                  <Sparkles size={18} className={styles.sparkleIcon} />
                  <div>
                    <strong>{appliedCoupon.code} Applied!</strong>
                    <p>You saved ₹{discountAmount} on this order</p>
                  </div>
                </div>
                <button className={styles.removeCouponBtn} onClick={handleRemoveCoupon}>
                  Remove
                </button>
              </div>
            ) : (
              <div className={styles.couponFormContainer}>
                <div className={styles.couponInputRow}>
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code (e.g. BAKE50)"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className={styles.couponInput}
                  />
                  <button 
                    className={styles.applyBtn}
                    onClick={() => handleApplyCoupon()}
                  >
                    Apply
                  </button>
                </div>

                {couponError && <p className={styles.couponErrorMsg}>{couponError}</p>}
                {couponSuccess && <p className={styles.couponSuccessMsg}>{couponSuccess}</p>}

                {/* Preset Coupons Chips */}
                <div className={styles.presetCouponsBlock}>
                  <span className={styles.presetTitle}>Available Offers:</span>
                  <div className={styles.presetsList}>
                    {AVAILABLE_COUPONS.map(c => (
                      <button 
                        key={c.code}
                        className={styles.presetChip}
                        onClick={() => handleApplyCoupon(c.code)}
                      >
                        <Tag size={12} />
                        <strong>{c.code}</strong>
                        <span>({c.description})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Section 2: Bill Summary Card */}
          <Card className={styles.summaryCard}>
            <div className={styles.cardHeaderRow}>
              <h2>Bill Summary</h2>
            </div>

            <div className={styles.billDetails}>
              <div className={styles.billRow}>
                <span>Item Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice.toFixed(0)}</span>
              </div>

              {discountAmount > 0 && (
                <div className={`${styles.billRow} ${styles.discountRow}`}>
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className={styles.billRow}>
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className={styles.freeDelivery}>FREE</strong>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              {totalPrice < 499 && totalPrice > 0 && (
                <p className={styles.freeDeliveryTip}>
                  💡 Add ₹{(499 - totalPrice).toFixed(0)} more for FREE delivery!
                </p>
              )}

              <div className={styles.billDivider} />

              <div className={styles.totalRow}>
                <div>
                  <span className={styles.totalLabel}>To Pay</span>
                  <p className={styles.taxIncludedText}>Includes all taxes & charges</p>
                </div>
                <span className={styles.totalAmount}>₹{finalPrice.toFixed(0)}</span>
              </div>

              {/* Checkout Button */}
              <Button 
                variant="primary" 
                onClick={handleCheckout} 
                disabled={isSubmitting}
                className={styles.placeOrderBtn}
              >
                {isSubmitting 
                  ? 'Connecting to PayU...' 
                  : paymentMethod === 'online'
                  ? `Pay with PayU • ₹${finalPrice.toFixed(0)}`
                  : `Place COD Order • ₹${finalPrice.toFixed(0)}`
                }
              </Button>

              <div className={styles.secureGuarantee}>
                <ShieldCheck size={16} /> 100% Safe & Secure PayU Gateway
              </div>

            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}

export default function Cart() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading Cart...</div>}>
      <CartContent />
    </Suspense>
  );
}
