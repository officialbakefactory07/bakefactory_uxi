"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { 
  Trash2, Plus, Minus, Tag, Check, MapPin, Edit3, 
  PlusCircle, ShoppingBag, ShieldCheck, Sparkles, X, Phone, User, CheckCircle2,
  Banknote, CreditCard, Wallet, Clock
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

// Pre-configured coupons for instant testing & usage
const AVAILABLE_COUPONS = [
  { code: 'WELCOME10', discountType: 'percent', value: 10, description: '10% OFF on your order' },
  { code: 'BAKE50', discountType: 'flat', value: 50, description: 'Flat ₹50 OFF on orders' },
  { code: 'SWEET20', discountType: 'percent', value: 20, description: '20% OFF sweet treats' },
];

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // User Profile & Address State
  const [profile, setProfile] = useState<any>(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  // Payment Method State: 'cod' or 'online'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

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

  const deliveryFee = totalPrice >= 300 || totalPrice === 0 ? 0 : 35;
  const finalPrice = Math.max(0, totalPrice - discountAmount + deliveryFee);

  // Apply Coupon Handler
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');
    setCouponSuccess('');

    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const found = AVAILABLE_COUPONS.find(c => c.code === code);
    if (found) {
      setAppliedCoupon(found);
      setCouponCode(code);
      setCouponSuccess(`Coupon "${found.code}" applied successfully!`);
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 or BAKE50.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Add New Address
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
        setSavedSuccessMsg('New address saved to your account!');
        setTimeout(() => setSavedSuccessMsg(''), 3000);
      } catch (e) {
        console.error('Error saving new address:', e);
      }
    }
  };

  // Edit Address
  const handleSaveEditedAddress = async () => {
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
        setSavedSuccessMsg('Address updated in your account!');
        setTimeout(() => setSavedSuccessMsg(''), 3000);
      } catch (e) {
        console.error('Error updating address:', e);
      }
    }
  };

  // Edit Phone
  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return;
    setContactPhone(phoneInput.trim());
    setIsEditingPhone(false);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { phone: phoneInput.trim() });
        setSavedSuccessMsg('Phone number updated!');
        setTimeout(() => setSavedSuccessMsg(''), 3000);
      } catch (e) {
        console.error('Error updating phone:', e);
      }
    }
  };

  // Place Order Handler
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
      await addDoc(collection(db, "orders"), {
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
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)',
        paymentStatus: paymentMethod === 'cod' ? 'Pending (COD)' : 'Pending Payment (Razorpay Ready)',
        specialInstructions: instructions,
        status: 'Preparing',
        createdAt: serverTimestamp()
      });
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
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

  if (orderSuccess) {
    return (
      <div className={styles.page}>
        <Card className={styles.emptyCartCard}>
          <CheckCircle2 size={56} color="#2e7d32" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Order Placed Successfully! 🎉</h2>
          <p>Your order is being prepared with love. You can track it in your account profile.</p>
          <Button variant="primary" onClick={() => router.push('/profile')}>View Your Orders</Button>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <Card className={styles.emptyCartCard}>
          <ShoppingBag size={56} opacity={0.3} style={{ margin: '0 auto 1rem auto' }} />
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any delicious items yet.</p>
          <Button variant="primary" onClick={() => router.push('/menu')}>Browse Menu</Button>
        </Card>
      </div>
    );
  }

  const selectedAddress = addresses[selectedAddressIndex] || '';

  return (
    <div className={styles.page}>
      
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

                  {/* Name & Unit Price */}
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemUnitPrice}>₹{item.price.toFixed(0)} per unit</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className={styles.quantityControl}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className={styles.qtyText}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Item Total Subtotal */}
                  <div className={styles.itemSubtotal}>
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </div>

                  {/* Delete Button */}
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)} title="Remove item">
                    <Trash2 size={18} />
                  </button>

                </div>
              ))}
            </div>
          </Card>

          {/* Section 2: Account & Delivery Address Details */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
              <h2><MapPin size={20} /> Delivery & Account Details</h2>
              {profile?.fullName && (
                <span className={styles.userBadge}>
                  <User size={14} /> {profile.fullName}
                </span>
              )}
            </div>

            {!user ? (
              <div className={styles.loginPrompt}>
                <p>Sign in to load your saved addresses and process orders faster.</p>
                <Button variant="primary" onClick={() => router.push('/login')}>Sign In / Register</Button>
              </div>
            ) : (
              <div className={styles.addressSectionContent}>
                
                {/* Contact Phone Row */}
                <div className={styles.phoneBlock}>
                  <div className={styles.phoneLeft}>
                    <Phone size={18} className={styles.iconGold} />
                    <div>
                      <span className={styles.blockLabel}>Contact Mobile Number</span>
                      {isEditingPhone ? (
                        <div className={styles.inlineEditRow}>
                          <input 
                            type="tel" 
                            value={phoneInput} 
                            onChange={e => setPhoneInput(e.target.value)}
                            placeholder="Enter 10-digit mobile number"
                            className={styles.inlineInput}
                          />
                          <button className={styles.smallSaveBtn} onClick={handleSavePhone}>Save</button>
                          <button className={styles.smallCancelBtn} onClick={() => setIsEditingPhone(false)}>Cancel</button>
                        </div>
                      ) : (
                        <span className={styles.blockValue}>{contactPhone || 'No mobile number added'}</span>
                      )}
                    </div>
                  </div>
                  {!isEditingPhone && (
                    <button className={styles.editIconBtn} onClick={() => setIsEditingPhone(true)}>
                      <Edit3 size={16} /> Edit Phone
                    </button>
                  )}
                </div>

                <div className={styles.dividerLine} />

                {/* Saved Address Selection */}
                <div className={styles.addressBlock}>
                  <div className={styles.addressBlockHeader}>
                    <span className={styles.blockLabel}>Select Delivery Address</span>
                    <button 
                      className={styles.addAddressBtn} 
                      onClick={() => {
                        setIsAddingNewAddress(!isAddingNewAddress);
                        setIsEditingAddress(false);
                      }}
                    >
                      <PlusCircle size={15} /> Add New Address
                    </button>
                  </div>

                  {/* Add New Address Form */}
                  {isAddingNewAddress && (
                    <div className={styles.addAddressBox}>
                      <textarea
                        rows={3}
                        value={newAddressInput}
                        onChange={e => setNewAddressInput(e.target.value)}
                        placeholder="Enter full street address, house number, landmark, city, etc."
                        className={styles.addressTextarea}
                      />
                      <div className={styles.boxActions}>
                        <button className={styles.smallSaveBtn} onClick={handleSaveNewAddress}>
                          Save Address
                        </button>
                        <button className={styles.smallCancelBtn} onClick={() => setIsAddingNewAddress(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Edit Selected Address Form */}
                  {isEditingAddress && (
                    <div className={styles.addAddressBox}>
                      <textarea
                        rows={3}
                        value={editingAddressInput}
                        onChange={e => setEditingAddressInput(e.target.value)}
                        className={styles.addressTextarea}
                      />
                      <div className={styles.boxActions}>
                        <button className={styles.smallSaveBtn} onClick={handleSaveEditedAddress}>
                          Update Address
                        </button>
                        <button className={styles.smallCancelBtn} onClick={() => setIsEditingAddress(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Address List Options */}
                  {addresses.length === 0 && !isAddingNewAddress ? (
                    <div className={styles.noAddressBox}>
                      <p>No saved address found in your account.</p>
                      <button className={styles.smallSaveBtn} onClick={() => setIsAddingNewAddress(true)}>
                        + Add Delivery Address
                      </button>
                    </div>
                  ) : (
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
                    placeholder="e.g. Ring doorbell twice, leave with security guard, allergies"
                    className={styles.instructionsInput}
                  />
                </div>

              </div>
            )}
          </Card>

          {/* Section 3: Payment Method Selection */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
              <h2><CreditCard size={20} /> Payment Method</h2>
              <span className={styles.secureTag}>
                <ShieldCheck size={13} /> Razorpay Encrypted
              </span>
            </div>

            <div className={styles.paymentOptionsList}>
              {/* Online Payment Only */}
              <div className={`${styles.paymentCard} ${styles.selectedPaymentCard}`}>
                <div className={styles.radioCol}>
                  <div className={`${styles.radioOuter} ${styles.radioChecked}`}>
                    <div className={styles.radioInner} />
                  </div>
                </div>
                <div className={styles.paymentIconBox}>
                  <CreditCard size={24} className={styles.paymentIcon} />
                </div>
                <div className={styles.paymentInfoCol}>
                  <div className={styles.paymentTitleRow}>
                    <h3>Online Payment</h3>
                    <span className={styles.razorpayBadge}>UPI / Cards / NetBanking</span>
                  </div>
                  <p className={styles.paymentDesc}>Pay securely via GPay, PhonePe, Paytm, Credit/Debit Cards, or NetBanking (Razorpay Ready).</p>
                </div>
              </div>
            </div>

            <div className={styles.razorpayNoticeBox}>
              <Sparkles size={16} className={styles.sparkleGold} />
              <span>⚡ Razorpay Gateway will launch when you click <strong>Proceed to Online Pay</strong>.</span>
            </div>

            {/* 30-Minute Cancellation Policy Alert */}
            <div className={styles.cancelPolicyBox}>
              <Clock size={18} className={styles.clockIcon} />
              <div>
                <strong>⏱️ 30-Minute Cancellation Policy</strong>
                <p>Orders can be cancelled within <strong>30 minutes</strong> of placement from your Profile &gt; Orders page. After 30 minutes, cancellation closes so our bakers can start preparing fresh goods.</p>
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

              {totalPrice < 300 && totalPrice > 0 && (
                <p className={styles.freeDeliveryTip}>
                  💡 Add ₹{(300 - totalPrice).toFixed(0)} more for FREE delivery!
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
                  ? 'Processing Order...' 
                  : `Proceed to Online Pay • ₹${finalPrice.toFixed(0)}`
                }
              </Button>

              <div className={styles.secureGuarantee}>
                <ShieldCheck size={16} /> 100% Safe & Secure Checkout
              </div>

            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
