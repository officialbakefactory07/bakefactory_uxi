import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export interface StaffAccount {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'cashier' | 'manager';
  counterName: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface AdminCredentials {
  username: string;
  password: string;
  updatedAt?: any;
}

// Fallback defaults
export const DEFAULT_ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'bakefactory_admin';
export const DEFAULT_ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'BakeFactory@2026!';

export const DEFAULT_CASHIER_EMAIL = 'cashier@bakefactory.in';
export const DEFAULT_CASHIER_PASS = 'Cashier@2026';

/**
 * Get current Admin credentials from Firestore or fallback
 */
export async function getAdminCredentials(): Promise<AdminCredentials> {
  try {
    const snap = await getDoc(doc(db, 'app_settings', 'admin_auth'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        username: data.username || DEFAULT_ADMIN_USER,
        password: data.password || DEFAULT_ADMIN_PASS,
        updatedAt: data.updatedAt
      };
    }
  } catch (err) {
    console.warn('Using default admin credentials due to Firestore fetch error:', err);
  }
  return { username: DEFAULT_ADMIN_USER, password: DEFAULT_ADMIN_PASS };
}

/**
 * Update Admin credentials in Firestore
 */
export async function updateAdminCredentials(creds: { username: string; password: string }) {
  const ref = doc(db, 'app_settings', 'admin_auth');
  await setDoc(ref, {
    username: creds.username.trim(),
    password: creds.password.trim(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Get all cashier staff accounts from Firestore
 */
export async function getStaffAccounts(): Promise<StaffAccount[]> {
  try {
    const snap = await getDocs(collection(db, 'staff_accounts'));
    const staffList: StaffAccount[] = [];
    snap.forEach(docSnap => {
      staffList.push({ id: docSnap.id, ...(docSnap.data() as Omit<StaffAccount, 'id'>) });
    });
    return staffList;
  } catch (err) {
    console.error('Error fetching staff accounts:', err);
    return [];
  }
}

/**
 * Verify Cashier Login credentials against Firestore staff_accounts or fallback
 */
export async function verifyCashierLogin(emailOrUser: string, pass: string): Promise<StaffAccount | null> {
  const cleanInput = emailOrUser.trim().toLowerCase();
  const cleanPass = pass.trim();

  // 1. Check default fallback first
  if (
    (cleanInput === DEFAULT_CASHIER_EMAIL.toLowerCase() || cleanInput === 'cashier' || cleanInput === 'counter1') &&
    cleanPass === DEFAULT_CASHIER_PASS
  ) {
    return {
      name: 'Counter 1 (Main Cashier)',
      email: DEFAULT_CASHIER_EMAIL,
      password: DEFAULT_CASHIER_PASS,
      role: 'cashier',
      counterName: 'Counter 1',
      isActive: true
    };
  }

  // 2. Query Firestore staff_accounts
  try {
    const staffList = await getStaffAccounts();
    const match = staffList.find(s => 
      s.isActive !== false &&
      (s.email.toLowerCase() === cleanInput || s.name.toLowerCase() === cleanInput) &&
      s.password === cleanPass
    );
    if (match) return match;
  } catch (err) {
    console.error('Error verifying cashier against Firestore:', err);
  }

  return null;
}
