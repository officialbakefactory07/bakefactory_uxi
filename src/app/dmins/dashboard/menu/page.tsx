"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Search, Plus, Pencil, Trash2, X, Upload, Sparkles, Wand2, Image as ImageIcon, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';
import styles from './page.module.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  bestSeller: boolean;
  special: boolean;
  image: string;
  subcategory?: string;
}

type FormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  bestSeller: boolean;
  special: boolean;
  image: string;
  subcategory: string;
};

interface ExtractedItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  available: boolean;
  bestSeller: boolean;
  selected: boolean;
}

const CATEGORIES = ['All', 'Cakes', 'Desserts', 'Cookies', 'Combos'] as const;

const INITIAL_FORM: FormData = {
  name: '',
  description: '',
  price: '',
  category: 'Cakes',
  available: true,
  bestSeller: false,
  special: false,
  image: '',
  subcategory: '',
};

const CATEGORY_COLORS: Record<string, string> = {
  Cakes: '#d4a017',
  Desserts: '#e74c3c',
  Cookies: '#5c2f0e',
  Combos: '#2980b9',
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Standard Product Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── AI Menu Importer State (Powered by Groq Llama 3) ──
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'text' | 'image'>('text');
  const [aiTextPrompt, setAiTextPrompt] = useState('');
  const [aiImageBase64, setAiImageBase64] = useState('');
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiExtractedItems, setAiExtractedItems] = useState<ExtractedItem[]>([]);
  const [aiImporting, setAiImporting] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const aiImageInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'menu'));
      const list: MenuItem[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<MenuItem, 'id'>) });
      });
      setItems(list);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        activeCategory === 'All' ||
        item.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, searchQuery]);

  // ── File upload compress helper ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setForm((prev) => ({ ...prev, image: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ── AI Image Upload Handler ──
  const handleAiImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAiImageBase64(dataUrl);
      setAiStatusMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // ── AI Extraction Handler (Calls Groq Llama 3) ──
  const handleExtractWithAI = async () => {
    if (aiMode === 'text' && !aiTextPrompt.trim()) {
      setAiStatusMsg({ type: 'error', text: 'Please paste your menu text or product list first.' });
      return;
    }
    if (aiMode === 'image' && !aiImageBase64) {
      setAiStatusMsg({ type: 'error', text: 'Please upload a photo of your menu card first.' });
      return;
    }

    setAiExtracting(true);
    setAiStatusMsg(null);

    try {
      const res = await fetch('/api/ai-menu-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiMode === 'text' ? aiTextPrompt : undefined,
          image: aiMode === 'image' ? aiImageBase64 : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI extraction failed.');
      }

      if (data.items.length === 0) {
        setAiStatusMsg({ type: 'error', text: 'No products could be extracted. Try providing clearer text or a sharper menu image.' });
      } else {
        const mappedItems: ExtractedItem[] = data.items.map((item: any, i: number) => ({
          id: 'temp_' + i,
          name: item.name || 'Delicious Treat',
          description: item.description || 'Artisanal creation from Bake Factory',
          price: parseFloat(item.price) || 150,
          category: item.category || 'Cakes',
          subcategory: item.subcategory || '',
          available: true,
          bestSeller: item.bestSeller || false,
          selected: true,
        }));
        setAiExtractedItems(mappedItems);
        setAiStatusMsg({ type: 'success', text: `✨ Extracted ${mappedItems.length} products with AI! Review and import below.` });
      }
    } catch (err: any) {
      setAiStatusMsg({ type: 'error', text: err.message || 'Error communicating with Groq AI.' });
    } finally {
      setAiExtracting(false);
    }
  };

  // ── Bulk Import Selected Items to Firestore ──
  const handleBulkImport = async () => {
    const selectedItems = aiExtractedItems.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      alert('Please select at least one product to import.');
      return;
    }

    setAiImporting(true);
    try {
      for (const item of selectedItems) {
        await addDoc(collection(db, 'menu'), {
          name: item.name.trim(),
          description: item.description.trim(),
          price: item.price,
          category: item.category,
          subcategory: item.subcategory || '',
          available: item.available,
          bestSeller: item.bestSeller,
          special: false,
          image: '/logo.png', // Default high-res bakery emblem placeholder
          createdAt: serverTimestamp(),
        });
      }

      setAiModalOpen(false);
      setAiExtractedItems([]);
      setAiTextPrompt('');
      setAiImageBase64('');
      await fetchMenu();
      alert(`🎉 Successfully imported ${selectedItems.length} products into the Bake Factory menu!`);
    } catch (err: any) {
      alert('Error importing menu items: ' + err.message);
    } finally {
      setAiImporting(false);
    }
  };

  // ── Open Add / Edit Modal ──
  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      available: item.available,
      bestSeller: item.bestSeller,
      special: item.special,
      image: item.image,
      subcategory: item.subcategory || '',
    });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  // ── Form Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;

    setSubmitting(true);

    let finalImageUrl = form.image;

    if (form.image && form.image.startsWith('data:image')) {
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: form.image }),
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            finalImageUrl = uploadData.url;
          }
        }
      } catch (uploadError) {
        console.warn('Cloudinary upload fallback, storing data locally:', uploadError);
      }
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      category: form.category,
      available: form.available,
      bestSeller: form.bestSeller,
      special: form.special,
      image: finalImageUrl || '/logo.png',
      subcategory: form.subcategory.trim(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'menu', editingId), payload);
        setItems((prev) =>
          prev.map((i) => (i.id === editingId ? { ...i, ...payload } : i))
        );
      } else {
        const ref = await addDoc(collection(db, 'menu'), payload);
        setItems((prev) => [{ id: ref.id, ...payload }, ...prev]);
      }
      handleClose();
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      alert(`Error saving menu item: ${err.message || err}.`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'menu', id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Error deleting menu item:', err);
    }
  };

  return (
    <div className={styles.page}>
      
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Menu Management</h1>
          <p className={styles.subtitle}>
            Live Store & POS Catalog &mdash; {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={styles.aiBtn} 
            onClick={() => { setAiModalOpen(true); setAiStatusMsg(null); }}
            title="Import menu from unstructured text or menu card photo using Groq AI"
          >
            <Sparkles size={18} />
            <span>AI Menu Importer (Groq)</span>
          </button>

          <button className={styles.addBtn} onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* ── Category tabs + Search ── */}
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className={styles.emptyState}>Loading menu items…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          {searchQuery || activeCategory !== 'All'
            ? 'No items match your filters.'
            : 'No menu items yet. Click "✨ AI Menu Importer" or "+ Add Item" to populate your catalog!'}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((item) => {
            const catColor = CATEGORY_COLORS[item.category] || '#d4a017';
            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.imageWrap}>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.cardImage}
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <span>{item.name.charAt(0)}</span>
                    </div>
                  )}

                  <span
                    className={styles.catBadge}
                    style={{ backgroundColor: catColor }}
                  >
                    {item.category}
                  </span>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleOpenEdit(item)}
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <span className={styles.itemPrice}>₹{item.price.toFixed(0)}</span>
                  </div>
                  <p className={styles.itemDesc}>{item.description}</p>

                  <div className={styles.cardFooter}>
                    <span
                      className={`${styles.availDot} ${
                        item.available ? styles.availOn : styles.availOff
                      }`}
                    />
                    <span className={styles.availText}>
                      {item.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {item.bestSeller && (
                      <span className={styles.bestSellerBadge}>★ Best Seller</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 1. MODAL: AI MENU IMPORTER (POWERED BY GROQ) ── */}
      {aiModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setAiModalOpen(false)}>
          <div className={styles.aiModalCard} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className={styles.aiModalHeader}>
              <div className={styles.aiHeaderTitle}>
                <div className={styles.aiIconBadge}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2>AI Menu Extractor & Importer</h2>
                  <p>Powered by Groq Llama 3 & Vision &bull; Paste text or upload a menu photo</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setAiModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* AI Source Mode Switcher */}
            <div className={styles.aiModeSwitcher}>
              <button
                type="button"
                className={`${styles.aiModeBtn} ${aiMode === 'text' ? styles.aiModeBtnActive : ''}`}
                onClick={() => setAiMode('text')}
              >
                <FileText size={16} />
                <span>Paste Text / Raw Menu</span>
              </button>
              <button
                type="button"
                className={`${styles.aiModeBtn} ${aiMode === 'image' ? styles.aiModeBtnActive : ''}`}
                onClick={() => setAiMode('image')}
              >
                <ImageIcon size={16} />
                <span>Scan / Upload Menu Card Photo</span>
              </button>
            </div>

            {aiStatusMsg && (
              <div className={`${styles.aiStatusBanner} ${aiStatusMsg.type === 'error' ? styles.aiStatusError : styles.aiStatusSuccess}`}>
                {aiStatusMsg.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                <span>{aiStatusMsg.text}</span>
              </div>
            )}

            {/* Input Section */}
            {aiMode === 'text' ? (
              <div className={styles.aiInputBlock}>
                <div className={styles.aiPromptHeader}>
                  <label>Paste your raw items, WhatsApp messages, or price lists:</label>
                  <button 
                    type="button" 
                    className={styles.samplePromptBtn}
                    onClick={() => setAiTextPrompt(
                      "Red Velvet Truffle Cake 500g ₹450 (Rich cream cheese and velvety sponge)\n" +
                      "Blueberry Cheesecake Slice ₹180\n" +
                      "Belgian Chocolate Brownie ₹120\n" +
                      "Almond Butter Cookies (Pack of 6) ₹160\n" +
                      "Mango Passionfruit Jar Cake ₹150\n" +
                      "Custom Fondant Birthday Cake 1kg ₹850"
                    )}
                  >
                    Load Sample Items
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={aiTextPrompt}
                  onChange={(e) => setAiTextPrompt(e.target.value)}
                  placeholder="e.g.&#10;Dark Chocolate Mousse - 180&#10;Pineapple Pastry - 90&#10;Truffle Cake 1kg - 650&#10;Nutella Cupcake - 80..."
                  className={styles.aiTextarea}
                />
              </div>
            ) : (
              <div className={styles.aiInputBlock}>
                <input
                  type="file"
                  ref={aiImageInputRef}
                  onChange={handleAiImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <div 
                  className={styles.aiDropzone}
                  onClick={() => aiImageInputRef.current?.click()}
                  style={{
                    backgroundImage: aiImageBase64 ? `url(${aiImageBase64})` : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                >
                  {!aiImageBase64 ? (
                    <>
                      <Upload size={32} color="#D4A017" />
                      <p><strong>Click or drag to upload a menu photo</strong></p>
                      <span>Supports PNG, JPG of printed menus, chalkboard boards, or flyers</span>
                    </>
                  ) : (
                    <div className={styles.changeImageOverlay}>Click to change photo</div>
                  )}
                </div>
              </div>
            )}

            {/* Extract Action Button */}
            <div className={styles.aiExtractActionRow}>
              <button
                type="button"
                className={styles.extractBtn}
                onClick={handleExtractWithAI}
                disabled={aiExtracting}
              >
                <Wand2 size={18} />
                <span>{aiExtracting ? 'Analyzing with Groq AI…' : '⚡ Extract Menu Items with Groq AI'}</span>
              </button>
            </div>

            {/* Extracted Review Table */}
            {aiExtractedItems.length > 0 && (
              <div className={styles.extractedTableWrapper}>
                <div className={styles.tableHeaderRow}>
                  <h3>Review Extracted Items ({aiExtractedItems.filter(i => i.selected).length}/{aiExtractedItems.length} selected)</h3>
                  <button 
                    type="button" 
                    className={styles.toggleAllBtn}
                    onClick={() => {
                      const allSelected = aiExtractedItems.every(i => i.selected);
                      setAiExtractedItems(prev => prev.map(item => ({ ...item, selected: !allSelected })));
                    }}
                  >
                    Toggle All
                  </button>
                </div>

                <div className={styles.itemsTableScroll}>
                  <table className={styles.extractedTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>✓</th>
                        <th>Product Name</th>
                        <th style={{ width: '130px' }}>Category</th>
                        <th style={{ width: '100px' }}>Price (₹)</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiExtractedItems.map((item, idx) => (
                        <tr key={idx} className={item.selected ? styles.rowSelected : styles.rowUnselected}>
                          <td>
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) => {
                                const updated = [...aiExtractedItems];
                                updated[idx].selected = e.target.checked;
                                setAiExtractedItems(updated);
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const updated = [...aiExtractedItems];
                                updated[idx].name = e.target.value;
                                setAiExtractedItems(updated);
                              }}
                              className={styles.cellInput}
                            />
                          </td>
                          <td>
                            <select
                              value={item.category}
                              onChange={(e) => {
                                const updated = [...aiExtractedItems];
                                updated[idx].category = e.target.value as any;
                                setAiExtractedItems(updated);
                              }}
                              className={styles.cellSelect}
                            >
                              <option value="Cakes">Cakes</option>
                              <option value="Desserts">Desserts</option>
                              <option value="Cookies">Cookies</option>
                              <option value="Combos">Combos</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => {
                                const updated = [...aiExtractedItems];
                                updated[idx].price = parseFloat(e.target.value) || 0;
                                setAiExtractedItems(updated);
                              }}
                              className={styles.cellInput}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...aiExtractedItems];
                                updated[idx].description = e.target.value;
                                setAiExtractedItems(updated);
                              }}
                              className={styles.cellInput}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bulk Import Button */}
                <div className={styles.bulkImportRow}>
                  <button
                    type="button"
                    className={styles.bulkImportBtn}
                    onClick={handleBulkImport}
                    disabled={aiImporting}
                  >
                    <Plus size={18} />
                    <span>
                      {aiImporting 
                        ? 'Importing to Firestore…' 
                        : `Import ${aiExtractedItems.filter(i => i.selected).length} Items to Menu Catalog →`}
                    </span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 2. MODAL: STANDARD ADD / EDIT ITEM ── */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? 'Edit Menu Item' : 'Add New Item'}
              </h2>
              <button className={styles.closeBtn} onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>ITEM NAME *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Belgian Chocolate Cake"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>DESCRIPTION</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Rich, decadent 70% dark chocolate sponge with ganache..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* Price + Category */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>PRICE (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={styles.input}
                    placeholder="450"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>CATEGORY</label>
                  <select
                    className={styles.select}
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value, subcategory: e.target.value === 'Cakes' ? 'Dry Cakes' : '' })
                    }
                  >
                    <option value="Cakes">Cakes</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>
              </div>

              {/* Sub-category dropdown if category is Cakes */}
              {form.category === 'Cakes' && (
                <div className={styles.fieldGroup} style={{ marginTop: '1rem' }}>
                  <label className={styles.label}>SUB-CATEGORY</label>
                  <select
                    className={styles.select}
                    value={form.subcategory || 'Dry Cakes'}
                    onChange={(e) =>
                      setForm({ ...form, subcategory: e.target.value })
                    }
                  >
                    <option value="Dry Cakes">Dry Cakes</option>
                    <option value="Cool Cakes">Cool Cakes</option>
                    <option value="Designed Cakes">Designed Cakes</option>
                    <option value="Fancy Cakes">Fancy Cakes</option>
                    <option value="Semi Foundant Cakes">Semi Foundant Cakes</option>
                    <option value="Foundant Cakes">Foundant Cakes</option>
                  </select>
                </div>
              )}

              {/* Image upload */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>IMAGE</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
                <div
                  className={styles.uploadArea}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundImage: form.image ? `url(${form.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: form.image ? '150px' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {!form.image && (
                    <>
                      <Upload size={28} className={styles.uploadIcon} />
                      <p className={styles.uploadText}>
                        Click or drag to upload an image
                      </p>
                      <span className={styles.uploadHint}>
                        PNG, JPG up to 5MB
                      </span>
                    </>
                  )}
                  {form.image && (
                    <div style={{
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      color: 'white',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      padding: '2rem 0',
                    }}>
                      Change Image
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) =>
                      setForm({ ...form, available: e.target.checked })
                    }
                  />
                  <span>Available</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.bestSeller}
                    onChange={(e) =>
                      setForm({ ...form, bestSeller: e.target.checked })
                    }
                  />
                  <span>Best Seller</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.special}
                    onChange={(e) =>
                      setForm({ ...form, special: e.target.checked })
                    }
                  />
                  <span>Special</span>
                </label>
              </div>

              {/* Actions */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving…'
                    : editingId
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
