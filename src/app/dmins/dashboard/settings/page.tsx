"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { Save, RefreshCw, Upload, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Bake Factory');
  const [storeTagline, setStoreTagline] = useState('Cakes and Desserts');
  const [currency, setCurrency] = useState('₹');
  const [adminUser, setAdminUser] = useState('bakefactory_admin');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [formImage, setFormImage] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
          const data = snap.data();
          setStoreName(data.storeName || 'Bake Factory');
          setStoreTagline(data.storeTagline || 'Cakes and Desserts');
          setCurrency(data.currency || '₹');
          setFormImage(data.bakeryImage || '');
        }

        const catSnap = await getDoc(doc(db, 'settings', 'categories'));
        if (catSnap.exists()) {
          setCategories(catSnap.data().categories || []);
        } else {
          // Default categories list
          const defaultCats = [
            {
              id: 'cakes',
              name: 'Cakes',
              tagline: 'Dry, Cool & Fancy',
              image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
              subcategories: [
                'Dry Cakes',
                'Cool Cakes',
                'Designed Cakes',
                'Fancy Cakes',
                'Semi Foundant Cakes',
                'Foundant Cakes'
              ]
            },
            {
              id: 'desserts',
              name: 'Desserts',
              tagline: 'Sweet Indulgences',
              image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',
              subcategories: []
            },
            {
              id: 'cookies',
              name: 'Cookies',
              tagline: 'Freshly Baked',
              image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
              subcategories: []
            },
            {
              id: 'combos',
              name: 'Combos',
              tagline: 'Perfect Pairings',
              image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80',
              subcategories: []
            }
          ];
          setCategories(defaultCats);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 450;
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // Compress to 85% quality JPEG
          setFormImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryTaglineChange = (index: number, val: string) => {
    setCategories(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], tagline: val };
      return copy;
    });
  };

  const handleCategoryFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 375;
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setCategories(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], image: dataUrl };
            return copy;
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalImageUrl = formImage;

      // If store bakery image is newly selected, upload
      if (formImage && formImage.startsWith('data:')) {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: formImage }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Upload failed with status ${response.status}`);
        }

        const uploadData = await response.json();
        finalImageUrl = uploadData.url;
      }

      // For each category, if its image is newly selected (base64 string), upload to Cloudinary via server API
      const updatedCategories = [];
      for (const cat of categories) {
        let catImageUrl = cat.image || '';
        if (cat.image && cat.image.startsWith('data:')) {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: cat.image }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Category ${cat.name} upload failed: ${errData.error || response.status}`);
          }

          const uploadData = await response.json();
          catImageUrl = uploadData.url;
        }
        updatedCategories.push({
          ...cat,
          image: catImageUrl
        });
      }

      // Save general settings
      await setDoc(doc(db, 'settings', 'general'), {
        storeName,
        storeTagline,
        currency,
        bakeryImage: finalImageUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Save categories settings
      await setDoc(doc(db, 'settings', 'categories'), {
        categories: updatedCategories
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save settings: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Settings</h1>
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>
      <p className={styles.subtitle}>Manage your store configuration</p>

      <div className={styles.sections}>
        {/* Store Info */}
        <div className={styles.card}>
          <h2>Store Information</h2>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Store Name</label>
              <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Tagline</label>
              <input type="text" value={storeTagline} onChange={e => setStoreTagline(e.target.value)} />
            </div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Currency Symbol</label>
              <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} maxLength={3} />
            </div>
            <div className={styles.field}>
              <label>Time Zone</label>
              <select defaultValue="IST">
                <option value="IST">IST (India Standard Time)</option>
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
              </select>
            </div>
          </div>

          {/* Bakery Image upload */}
          <div className={styles.fieldRow} style={{ marginTop: '1.5rem' }}>
            <div className={styles.field} style={{ gridColumn: 'span 2' }}>
              <label>Bakery Image (Home Page "Our Story")</label>
              <div className={styles.imageUploadWrapper}>
                {formImage ? (
                  <div className={styles.imagePreviewWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formImage} alt="Bakery Preview" className={styles.previewImg} />
                    <button type="button" className={styles.removeImageBtn} onClick={() => setFormImage('')} aria-label="Remove image">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button type="button" className={styles.uploadTriggerBtn} onClick={() => fileInputRef.current?.click()} aria-label="Upload bakery image">
                    <Upload size={20} />
                    <span>Upload Bakery Image</span>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Explore Categories settings */}
        <div className={styles.card}>
          <h2>Explore Categories</h2>
          <p className={styles.cardDesc}>Upload cover photos and taglines for the categories featured on the homepage.</p>
          
          <div className={styles.categorySettingsGrid}>
            {categories.map((cat, idx) => (
              <div key={cat.id} className={styles.catConfigCard}>
                <h3>{cat.name}</h3>
                
                <div className={styles.catField}>
                  <label>Tagline</label>
                  <input 
                    type="text" 
                    value={cat.tagline || ''} 
                    onChange={e => handleCategoryTaglineChange(idx, e.target.value)} 
                    placeholder="e.g. Dry, Cool & Fancy"
                  />
                </div>
                
                <div className={styles.catField} style={{ marginTop: '0.8rem' }}>
                  <label>Cover Photo</label>
                  <div className={styles.catImageUpload}>
                    {cat.image ? (
                      <div className={styles.catImageWrap}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cat.image} alt={cat.name} className={styles.catPreviewImg} />
                        <button 
                          type="button" 
                          className={styles.removeImageBtn} 
                          onClick={() => {
                            setCategories(prev => {
                              const copy = [...prev];
                              copy[idx] = { ...copy[idx], image: '' };
                              return copy;
                            });
                          }}
                          aria-label="Remove category image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        className={styles.catUploadBtn} 
                        onClick={() => {
                          const input = document.getElementById(`cat-file-${cat.id}`);
                          input?.click();
                        }}
                      >
                        <Upload size={16} />
                        <span>Upload Image</span>
                      </button>
                    )}
                    <input 
                      type="file" 
                      id={`cat-file-${cat.id}`}
                      onChange={e => handleCategoryFileChange(idx, e)}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className={styles.catSubcategories}>
                    <strong>Sub-categories:</strong>
                    <div className={styles.subcatPills}>
                      {cat.subcategories.map((sub: string) => (
                        <span key={sub} className={styles.subcatPill}>{sub}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Admin Credentials */}
        <div className={styles.card}>
          <h2>Admin Credentials</h2>
          <p className={styles.cardDesc}>Change your admin login credentials. This updates the local session only.</p>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Admin Username</label>
              <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} />
            </div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Current Password</label>
              <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className={styles.field}>
              <label>New Password</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Enter new password" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? (
              <><RefreshCw size={16} className={styles.spin} /> Saving...</>
            ) : saved ? (
              <><RefreshCw size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
