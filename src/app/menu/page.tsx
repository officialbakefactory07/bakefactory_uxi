"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './page.module.css';
import { ShoppingCart, Search, Star, Plus, Minus } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const CATEGORIES = ["All", "Cakes", "Desserts", "Cookies", "Combos"];

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  ingredients?: string;
  description?: string;
  image?: string;
  rating?: number;
  ratingCount?: number;
  subcategory?: string;
}

function MenuContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  const { items: cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category');
  const subParam = searchParams.get('subcategory');

  useEffect(() => {
    if (catParam) {
      const matched = CATEGORIES.find(c => c.toLowerCase() === catParam.toLowerCase());
      if (matched) {
        setActiveCategory(matched);
        if (subParam) {
          const subcategories = ["All", "Dry Cakes", "Cool Cakes", "Designed Cakes", "Fancy Cakes", "Semi Foundant Cakes", "Foundant Cakes"];
          const matchedSub = subcategories.find(s => s.toLowerCase() === subParam.toLowerCase());
          if (matchedSub) {
            setActiveSubcategory(matchedSub);
          } else {
            setActiveSubcategory("All");
          }
        } else {
          setActiveSubcategory("All");
        }
      } else {
        setActiveCategory("All");
        setActiveSubcategory("All");
      }
    } else {
      setActiveCategory("All");
      setActiveSubcategory("All");
    }
  }, [catParam, subParam]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menu"));
        const items: MenuItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({ 
            id: doc.id, 
            name: data.name || '',
            category: data.category || 'Cakes',
            price: data.price || 0,
            ingredients: data.ingredients || data.description || '',
            description: data.description || data.ingredients || '',
            image: data.image || '',
            rating: data.rating || 4.8,
            ratingCount: data.ratingCount || Math.floor(Math.random() * 80) + 80,
            subcategory: data.subcategory || ''
          } as MenuItem);
        });
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenu();
  }, []);

  const [flyingItems, setFlyingItems] = useState<any[]>([]);

  const triggerFlyAnimation = (
    e: React.MouseEvent, 
    type: 'image' | 'number', 
    src?: string, 
    text?: string
  ) => {
    const cartEl = document.getElementById('cart-link');
    if (!cartEl) return;

    const rect = cartEl.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    const startX = e.clientX;
    const startY = e.clientY;

    const id = Math.random().toString(36).substring(2, 9);
    
    setFlyingItems(prev => [
      ...prev,
      {
        id,
        type,
        src,
        text,
        startX,
        startY,
        endX,
        endY
      }
    ]);
  };

  const bumpCart = () => {
    const cartEl = document.getElementById('cart-link');
    if (cartEl) {
      cartEl.classList.remove('cart-bump');
      void cartEl.offsetWidth; // trigger reflow
      cartEl.classList.add('cart-bump');
    }
  };

  const handleAddToCart = (item: MenuItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    };
    addToCart(cartItem);

    if (e) {
      triggerFlyAnimation(e, 'image', item.image || '/logo.png');
    }
  };

  const getItemQuantity = (itemId: string) => {
    const found = cart.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  const handleIncrement = (item: MenuItem, currentQty: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const newQty = currentQty + 1;
    updateQuantity(item.id, newQty);

    if (e) {
      triggerFlyAnimation(e, 'number', undefined, `+${newQty}`);
    }
  };

  const handleDecrement = (item: MenuItem, currentQty: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (currentQty <= 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, currentQty - 1);
    }
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter items by category & search query
  const filteredAndGroupedItems = useMemo(() => {
    let result = menuItems;

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // Group items by category
    const groups: Record<string, MenuItem[]> = {};
    
    result.forEach(item => {
      // If we are looking for a specific category, skip others
      if (activeCategory !== "All" && item.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return;
      }
      
      // If activeCategory is Cakes and activeSubcategory is not All, filter by subcategory
      if (activeCategory === "Cakes" && activeSubcategory !== "All" && item.subcategory?.toLowerCase() !== activeSubcategory.toLowerCase()) {
        return;
      }
      
      const cat = item.category;
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });

    return groups;
  }, [menuItems, activeCategory, activeSubcategory, searchQuery]);

  return (
    <div className={styles.page}>
      {/* Menu Header Banner */}
      <div className={styles.menuHeader}>
        <span className={styles.menuTag}>✦ FRESH FROM OUR OVENS</span>
        <h1>Artisanal Dessert Menu</h1>
        <p>Explore handcrafted cakes, signature pastries, and freshly baked sweet indulgences.</p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search desserts..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className={styles.categoriesOuter}>
        <div className={styles.categories}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`${styles.categoryTab} ${activeCategory === cat ? styles.activeTab : ''}`}
              onClick={() => {
                setActiveCategory(cat);
                setActiveSubcategory("All");
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cakes Subcategory pills */}
      {activeCategory === "Cakes" && (
        <div className={styles.subcategoriesOuter}>
          <div className={styles.subcategories}>
            {["All", "Dry Cakes", "Cool Cakes", "Designed Cakes", "Fancy Cakes", "Semi Foundant Cakes", "Foundant Cakes"].map(sub => (
              <button 
                key={sub} 
                className={`${styles.subcategoryTab} ${activeSubcategory === sub ? styles.activeSubTab : ''}`}
                onClick={() => setActiveSubcategory(sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu List */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading menu...</p>
        </div>
      ) : Object.keys(filteredAndGroupedItems).length === 0 ? (
        <div className={styles.emptyState}>
          <p>No items found matching your selection.</p>
        </div>
      ) : (
        <div className={styles.menuListContainer}>
          {Object.entries(filteredAndGroupedItems).map(([category, items]) => (
            <div key={category} className={styles.categorySection}>
              {/* Category Header */}
              <div className={styles.categoryHeader}>
                <span className={styles.categorySubheading}>THIS IS WHAT WE SERVE YOU</span>
                <h2>{category}</h2>
                <div className={styles.headerLine} />
              </div>

              {/* Category Items List */}
              <div className={styles.itemsList}>
                {items.map(item => {
                  const qty = getItemQuantity(item.id);
                  const isExpanded = !!expandedDescriptions[item.id];
                  const descText = item.description || item.ingredients || '';
                  const showMoreBtn = descText.length > 90;
                  const displayedText = isExpanded ? descText : (showMoreBtn ? descText.slice(0, 90) + '...' : descText);

                  return (
                    <div 
                      key={item.id} 
                      className={styles.menuItemRow}
                      onClick={() => setSelectedItem(item)}
                    >
                      
                      {/* Left: Item Information */}
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        <p className={styles.itemPrice}>₹{item.price.toFixed(0)}</p>
                        
                        {/* Rating */}
                        <div className={styles.ratingRow}>
                          <span className={styles.ratingBadge}>
                            <Star size={11} fill="currentColor" style={{ marginRight: '2px' }} /> {item.rating?.toFixed(1) || '4.8'}
                          </span>
                          <span className={styles.ratingCount}>({item.ratingCount || '120+'})</span>
                        </div>

                        {/* Description / Ingredients */}
                        {descText && (
                          <p className={styles.itemDescription}>
                            {displayedText}
                            {showMoreBtn && (
                              <button 
                                className={styles.moreBtn} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDescription(item.id);
                                }}
                              >
                                {isExpanded ? ' less' : ' more'}
                              </button>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Right: Item Image & floating ADD/Counter button */}
                      <div className={styles.imageContainer}>
                        <div className={styles.itemImageWrapper}>
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className={styles.itemImage} />
                          ) : (
                            <div className={styles.imagePlaceholder}>
                              <span>{item.category.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>

                        {/* ADD/Quantity controller floating button */}
                        <div 
                          className={styles.actionButtonContainer}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {qty === 0 ? (
                            <button 
                              key="add-btn"
                              className={styles.addBtn}
                              onClick={(e) => handleAddToCart(item, e)}
                            >
                              + Add
                            </button>
                          ) : (
                            <div key="qty-ctrl" className={styles.quantityCtrl}>
                              <button className={styles.qtyBtn} onClick={(e) => handleDecrement(item, qty, e)}>
                                <Minus size={12} strokeWidth={3} />
                              </button>
                              <span className={styles.qtyText}>{qty}</span>
                              <button className={styles.qtyBtn} onClick={(e) => handleIncrement(item, qty, e)}>
                                <Plus size={12} strokeWidth={3} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Popup Modal with animations */}
      <AnimatePresence>
        {selectedItem && (
          <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button className={styles.closeModalBtn} onClick={() => setSelectedItem(null)}>
                &times;
              </button>

              {/* Large Image */}
              <div className={styles.modalImageContainer}>
                {selectedItem.image ? (
                  <motion.img 
                    src={selectedItem.image} 
                    alt={selectedItem.name} 
                    className={styles.modalImage}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 4, 
                      ease: "easeInOut" 
                    }}
                  />
                ) : (
                  <div className={styles.modalImagePlaceholder}>
                    <span>{selectedItem.category.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Details below the image */}
              <div className={styles.modalDetails}>
                <h2 className={styles.modalName}>{selectedItem.name}</h2>
                <div className={styles.modalMetaRow}>
                  <span className={styles.modalPrice}>₹{selectedItem.price.toFixed(0)}</span>
                  <div className={styles.modalRatingRow}>
                    <span className={styles.modalRatingBadge}>
                      <Star size={12} fill="currentColor" style={{ marginRight: '2px' }} /> {selectedItem.rating?.toFixed(1) || '4.8'}
                    </span>
                    <span className={styles.modalRatingCount}>({selectedItem.ratingCount || '120+'})</span>
                  </div>
                </div>

                <div className={styles.modalDivider} />

                <h4 className={styles.modalSectionTitle}>Description</h4>
                <p className={styles.modalDescription}>
                  {selectedItem.description || selectedItem.ingredients || 'Delicious fresh dessert made with passion and premium ingredients.'}
                </p>

                {selectedItem.subcategory && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <h4 className={styles.modalSectionTitle} style={{ marginBottom: '0.4rem' }}>Category Detail</h4>
                    <span className={styles.modalSubcategoryTag}>{selectedItem.subcategory}</span>
                  </div>
                )}

                {/* Footer Action: Add to Cart */}
                <div className={styles.modalActionRow}>
                  {getItemQuantity(selectedItem.id) === 0 ? (
                    <button 
                      className={styles.modalAddBtn}
                      onClick={(e) => handleAddToCart(selectedItem, e)}
                    >
                      Add to Cart • ₹{selectedItem.price.toFixed(0)}
                    </button>
                  ) : (
                    <div className={styles.modalQuantityCtrl}>
                      <span className={styles.modalQuantityLabel}>Added to Cart</span>
                      <div className={styles.quantityCtrl}>
                        <button className={styles.qtyBtn} onClick={(e) => handleDecrement(selectedItem, getItemQuantity(selectedItem.id), e)}>
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className={styles.qtyText}>{getItemQuantity(selectedItem.id)}</span>
                        <button className={styles.qtyBtn} onClick={(e) => handleIncrement(selectedItem, getItemQuantity(selectedItem.id), e)}>
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flying Items Animations */}
      {flyingItems.map(item => (
        <motion.div
          key={item.id}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            x: item.startX,
            y: item.startY,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
          initial={{ opacity: 1, scale: item.type === 'image' ? 1 : 1.2, x: item.startX, y: item.startY }}
          animate={{ 
            x: item.endX - 15, // center offset for cart link
            y: [item.startY, Math.min(item.startY, item.endY) - 100, item.endY - 15], 
            scale: item.type === 'image' ? 0.22 : 0.35, 
            opacity: [1, 1, 0.9, 0]
          }}
          transition={{ 
            duration: 0.85, 
            ease: [0.25, 1, 0.5, 1] 
          }}
          onAnimationComplete={() => {
            setFlyingItems(prev => prev.filter(f => f.id !== item.id));
            bumpCart();
          }}
        >
          {item.type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={item.src} 
              alt="" 
              style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '2px solid #C96B2C',
                boxShadow: '0 4px 12px rgba(62, 31, 13, 0.2)'
              }} 
            />
          ) : (
            <span 
              style={{ 
                fontFamily: 'var(--font-poppins)', 
                fontWeight: 800, 
                fontSize: '1.4rem', 
                color: '#C96B2C',
                textShadow: '0 2px 4px rgba(255,255,255,0.9), 0 0 2px rgba(201, 107, 44, 0.5)'
              }}
            >
              {item.text}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function Menu() {
  return (
    <Suspense fallback={
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading menu...</p>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
