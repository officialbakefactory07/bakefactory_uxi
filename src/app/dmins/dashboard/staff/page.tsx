"use client";

import React, { useState, useEffect } from 'react';
import { 
  KeyRound, Shield, UserCheck, Plus, Trash2, Edit2, Check, X, 
  Lock, Eye, EyeOff, Mail, Store, AlertCircle, Save, Sparkles, RefreshCw 
} from 'lucide-react';
import { 
  getAdminCredentials, updateAdminCredentials, 
  getStaffAccounts, StaffAccount, AdminCredentials, 
  DEFAULT_ADMIN_USER, DEFAULT_ADMIN_PASS, DEFAULT_CASHIER_EMAIL, DEFAULT_CASHIER_PASS 
} from '@/lib/authStaff';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import styles from './page.module.css';

export default function StaffAccessPage() {
  // Admin Credentials State
  const [adminUsername, setAdminUsername] = useState(DEFAULT_ADMIN_USER);
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PASS);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');

  // Cashier Staff Accounts State
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Modal / Add Staff State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffAccount>({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
    counterName: 'Counter 1',
    isActive: true
  });
  const [showModalPass, setShowModalPass] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffMsg, setStaffMsg] = useState('');

  // Load existing credentials & staff list
  const loadData = async () => {
    setLoadingStaff(true);
    try {
      const adminCreds = await getAdminCredentials();
      setAdminUsername(adminCreds.username);
      setAdminPassword(adminCreds.password);

      const staff = await getStaffAccounts();
      if (staff.length === 0) {
        // If empty, show default cashier placeholder
        setStaffList([
          {
            id: 'default_csh_1',
            name: 'Counter 1 (Main Cashier)',
            email: DEFAULT_CASHIER_EMAIL,
            password: DEFAULT_CASHIER_PASS,
            role: 'cashier',
            counterName: 'Main Counter',
            isActive: true
          }
        ]);
      } else {
        setStaffList(staff);
      }
    } catch (err) {
      console.error('Error loading staff & admin data:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Save Admin Credentials
  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) return;
    setSavingAdmin(true);
    setAdminSuccessMsg('');

    try {
      await updateAdminCredentials({ username: adminUsername, password: adminPassword });
      setAdminSuccessMsg('Admin credentials updated successfully! New password is now active.');
      setTimeout(() => setAdminSuccessMsg(''), 4000);
    } catch (err: any) {
      alert('Failed to update admin credentials: ' + err.message);
    } finally {
      setSavingAdmin(false);
    }
  };

  // 2. Open Add / Edit Modal
  const openAddModal = () => {
    setEditingStaffId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'cashier',
      counterName: 'Counter ' + (staffList.length + 1),
      isActive: true
    });
    setShowAddModal(true);
  };

  const openEditModal = (staff: StaffAccount) => {
    setEditingStaffId(staff.id || null);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: staff.password,
      role: staff.role || 'cashier',
      counterName: staff.counterName || 'Counter 1',
      isActive: staff.isActive !== false
    });
    setShowAddModal(true);
  };

  // 3. Save / Update Cashier Staff
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill out all required fields.');
      return;
    }

    setSavingStaff(true);
    try {
      if (editingStaffId && editingStaffId !== 'default_csh_1') {
        // Update in Firestore
        const ref = doc(db, 'staff_accounts', editingStaffId);
        await updateDoc(ref, {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim(),
          role: formData.role,
          counterName: formData.counterName.trim(),
          isActive: formData.isActive,
          updatedAt: serverTimestamp()
        });
      } else {
        // Add new to Firestore
        await addDoc(collection(db, 'staff_accounts'), {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim(),
          role: formData.role,
          counterName: formData.counterName.trim(),
          isActive: formData.isActive,
          createdAt: serverTimestamp()
        });
      }

      setShowAddModal(false);
      await loadData();
      setStaffMsg('Cashier account saved successfully!');
      setTimeout(() => setStaffMsg(''), 3000);
    } catch (err: any) {
      alert('Error saving cashier account: ' + err.message);
    } finally {
      setSavingStaff(false);
    }
  };

  // 4. Delete Cashier Staff
  const handleDeleteStaff = async (staff: StaffAccount) => {
    if (!confirm(`Are you sure you want to remove cashier account for ${staff.name}?`)) return;

    try {
      if (staff.id && staff.id !== 'default_csh_1') {
        await deleteDoc(doc(db, 'staff_accounts', staff.id));
      }
      await loadData();
    } catch (err: any) {
      alert('Error deleting staff account: ' + err.message);
    }
  };

  return (
    <div className={styles.page}>
      
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Staff & Access Management</h1>
          <p className={styles.pageSub}>Control master admin passwords and billing cashier counter credentials.</p>
        </div>
        <button className={styles.refreshBtn} onClick={loadData} title="Refresh Live Credentials">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {staffMsg && <div className={styles.successBanner}><Check size={18} /> {staffMsg}</div>}

      <div className={styles.gridContainer}>
        
        {/* ==================== 1. MASTER ADMIN CREDENTIALS ==================== */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconCircleAdmin}>
              <Shield size={22} />
            </div>
            <div>
              <h2>Master Admin Password</h2>
              <p>Change your master admin username and password for /dmins</p>
            </div>
          </div>

          {adminSuccessMsg && (
            <div className={styles.successBanner}>
              <Check size={16} /> {adminSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSaveAdmin} className={styles.form}>
            <div className={styles.field}>
              <label>Admin Username</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input 
                  type="text" 
                  value={adminUsername} 
                  onChange={e => setAdminUsername(e.target.value)}
                  placeholder="bakefactory_admin"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Admin Password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input 
                  type={showAdminPass ? 'text' : 'password'} 
                  value={adminPassword} 
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Enter new master password"
                  required
                />
                <button 
                  type="button" 
                  className={styles.passToggleBtn} 
                  onClick={() => setShowAdminPass(!showAdminPass)}
                >
                  {showAdminPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={savingAdmin} className={styles.saveAdminBtn}>
              <Save size={16} /> {savingAdmin ? 'Saving...' : 'Update Admin Credentials'}
            </button>
          </form>
        </div>

        {/* ==================== 2. CASHIER & COUNTER ACCOUNTS ==================== */}
        <div className={styles.card}>
          <div className={styles.cardHeaderWithAction}>
            <div className={styles.cardHeader}>
              <div className={styles.iconCircleCashier}>
                <KeyRound size={22} />
              </div>
              <div>
                <h2>POS Cashier Logins</h2>
                <p>Staff members permitted to open registers and print receipts</p>
              </div>
            </div>

            <button className={styles.addBtn} onClick={openAddModal}>
              <Plus size={16} /> Add Cashier
            </button>
          </div>

          <div className={styles.staffList}>
            {loadingStaff ? (
              <div className={styles.loadingBox}>Loading active staff accounts...</div>
            ) : staffList.length === 0 ? (
              <div className={styles.emptyBox}>No custom cashiers added. Default cashier is active.</div>
            ) : (
              staffList.map((staff, idx) => (
                <div key={staff.id || idx} className={styles.staffItem}>
                  <div className={styles.staffMeta}>
                    <div className={styles.avatarMini}>{staff.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className={styles.nameRow}>
                        <strong>{staff.name}</strong>
                        <span className={styles.roleBadge}>{staff.counterName || 'Counter 1'}</span>
                      </div>
                      <span className={styles.emailText}>Email: {staff.email}</span>
                      <span className={styles.passText}>Password: •••••••• ({staff.password})</span>
                    </div>
                  </div>

                  <div className={styles.actionRow}>
                    <button 
                      className={styles.editBtn} 
                      onClick={() => openEditModal(staff)}
                      title="Edit Password or Name"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    {staff.id !== 'default_csh_1' && (
                      <button 
                        className={styles.deleteBtn} 
                        onClick={() => handleDeleteStaff(staff)}
                        title="Delete Cashier"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ==================== MODAL: ADD / EDIT CASHIER ==================== */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingStaffId ? 'Edit Cashier Account' : 'Add New Cashier'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Cashier Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh (Counter 1)"
                  required 
                />
              </div>

              <div className={styles.field}>
                <label>Cashier Login Email / Username *</label>
                <input 
                  type="text" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. cashier1@bakefactory.in"
                  required 
                />
              </div>

              <div className={styles.field}>
                <label>Cashier Password *</label>
                <div className={styles.inputWrap}>
                  <input 
                    type={showModalPass ? 'text' : 'password'} 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter login password"
                    required 
                  />
                  <button 
                    type="button" 
                    className={styles.passToggleBtn} 
                    onClick={() => setShowModalPass(!showModalPass)}
                  >
                    {showModalPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label>Counter / Terminal Name</label>
                <input 
                  type="text" 
                  value={formData.counterName} 
                  onChange={e => setFormData({ ...formData, counterName: e.target.value })}
                  placeholder="e.g. Main Counter"
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={savingStaff} className={styles.submitModalBtn}>
                  {savingStaff ? 'Saving...' : (editingStaffId ? 'Update Cashier' : 'Create Cashier Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
