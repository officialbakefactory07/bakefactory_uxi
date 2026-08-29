"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User, Shield, CreditCard, Lock, ArrowRight, Eye, EyeOff, Delete } from 'lucide-react';
import styles from './page.module.css';

type RoleType = 'customer' | 'cashier' | 'admin';

const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'bakefactory_admin';
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'BakeFactory@2026!';

export default function Login() {
  const router = useRouter();

  // Role Selection: 'customer' | 'cashier' | 'admin'
  const [role, setRole] = useState<RoleType>('customer');

  // Customer State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Cashier State
  const [cashierName, setCashierName] = useState('Counter 1 (Main Cashier)');
  const [cashierPin, setCashierPin] = useState('');

  // Admin State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Common UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Customer Auth Handler
  const redirectAfterCustomerAuth = async (uid: string) => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists() && snap.data().profileComplete) {
      router.push('/');
    } else {
      router.push('/profile/complete');
    }
  };

  const handleCustomerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await redirectAfterCustomerAuth(cred.user.uid);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await redirectAfterCustomerAuth(cred.user.uid);
      }
    } catch (err: any) {
      setError(err.message || 'Customer authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      await redirectAfterCustomerAuth(cred.user.uid);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  // 2. Cashier POS Auth Handler
  const handleCashierPinInput = (num: string) => {
    if (cashierPin.length < 6) {
      setCashierPin(prev => prev + num);
      setError('');
    }
  };

  const handleCashierLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cashierPin) {
      setError('Please enter your 4-digit Cashier PIN');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      if (cashierPin === '1234' || cashierPin === '0000' || cashierPin === '9999') {
        const sessionData = {
          cashierName: cashierName.trim() || 'Cashier 1',
          loginTime: new Date().toISOString(),
          id: 'CSH-' + Math.floor(1000 + Math.random() * 9000)
        };
        localStorage.setItem('bf_cashier_session', JSON.stringify(sessionData));
        router.push('/pos');
      } else {
        setError('Invalid Cashier PIN. (Default PIN: 1234)');
        setLoading(false);
      }
    }, 400);
  };

  // 3. Admin Auth Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (adminUsername === ADMIN_USER && adminPassword === ADMIN_PASS) {
        localStorage.setItem('bf_admin_session', 'authenticated');
        router.push('/dmins/dashboard');
      } else {
        setError('Invalid Admin credentials. Access denied.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.authCard}>
        
        {/* Logo & Heading */}
        <div className={styles.cardHeader}>
          <div className={styles.logoWrap}>
            <Image src="/logo.png" alt="Bake Factory" width={64} height={64} style={{ mixBlendMode: 'multiply' }} />
          </div>
          <h1>Bake Factory Portal</h1>
          <p>Choose your account type to proceed</p>
        </div>

        {/* ── Role Selector Tabs ── */}
        <div className={styles.roleTabs}>
          <button 
            type="button"
            className={`${styles.roleTab} ${role === 'customer' ? styles.roleTabActive : ''}`}
            onClick={() => { setRole('customer'); setError(''); }}
          >
            <User size={16} />
            <span>Customer</span>
          </button>

          <button 
            type="button"
            className={`${styles.roleTab} ${role === 'cashier' ? styles.roleTabActive : ''}`}
            onClick={() => { setRole('cashier'); setError(''); }}
          >
            <CreditCard size={16} />
            <span>Cashier (POS)</span>
          </button>

          <button 
            type="button"
            className={`${styles.roleTab} ${role === 'admin' ? styles.roleTabActive : ''}`}
            onClick={() => { setRole('admin'); setError(''); }}
          >
            <Shield size={16} />
            <span>Admin</span>
          </button>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* ==================== 1. CUSTOMER LOGIN ==================== */}
        {role === 'customer' && (
          <div className={styles.tabContent}>
            <form onSubmit={handleCustomerAuth} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  placeholder="priya@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Signing In...' : (isLogin ? 'Sign In as Customer' : 'Create Account')}
              </button>
            </form>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <button type="button" onClick={handleGoogleLogin} disabled={loading} className={styles.googleBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              Continue with Google
            </button>

            <div className={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className={styles.toggleBtn}>
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        )}

        {/* ==================== 2. CASHIER POS LOGIN ==================== */}
        {role === 'cashier' && (
          <div className={styles.tabContent}>
            <form onSubmit={handleCashierLogin} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label>Cashier / Counter Name</label>
                <input 
                  type="text" 
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="Counter 1"
                  required 
                />
              </div>

              {/* PIN Display */}
              <div className={styles.pinDisplayGroup}>
                <label>Enter 4-Digit Cashier PIN</label>
                <div className={styles.pinCircles}>
                  {[0, 1, 2, 3].map((idx) => (
                    <div 
                      key={idx} 
                      className={`${styles.pinDot} ${cashierPin.length > idx ? styles.pinDotFilled : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Touch Keypad */}
              <div className={styles.keypadGrid}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button 
                    key={num} 
                    type="button" 
                    className={styles.keypadBtn}
                    onClick={() => handleCashierPinInput(num)}
                  >
                    {num}
                  </button>
                ))}
                <button 
                  type="button" 
                  className={`${styles.keypadBtn} ${styles.keypadActionBtn}`}
                  onClick={() => setCashierPin('')}
                >
                  C
                </button>
                <button 
                  type="button" 
                  className={styles.keypadBtn}
                  onClick={() => handleCashierPinInput('0')}
                >
                  0
                </button>
                <button 
                  type="button" 
                  className={`${styles.keypadBtn} ${styles.keypadActionBtn}`}
                  onClick={() => setCashierPin(prev => prev.slice(0, -1))}
                >
                  <Delete size={18} />
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading || cashierPin.length < 4} 
                className={styles.submitBtn}
              >
                {loading ? 'Opening Terminal...' : 'Open POS Terminal →'}
              </button>

              <p className={styles.roleHint}>Default Cashier PIN: <strong>1234</strong></p>
            </form>
          </div>
        )}

        {/* ==================== 3. MASTER ADMIN LOGIN ==================== */}
        {role === 'admin' && (
          <div className={styles.tabContent}>
            <form onSubmit={handleAdminLogin} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label>Admin Username</label>
                <input 
                  type="text" 
                  value={adminUsername} 
                  placeholder="Enter admin username"
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Admin Password</label>
                <div className={styles.passWrap}>
                  <input 
                    type={showAdminPass ? 'text' : 'password'} 
                    value={adminPassword} 
                    placeholder="Enter admin password"
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    className={styles.showPassBtn}
                    onClick={() => setShowAdminPass(!showAdminPass)}
                  >
                    {showAdminPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Verifying Admin...' : '🔐 Access Admin Dashboard'}
              </button>

              <p className={styles.roleHint}>Master control panel with site settings & daily revenue</p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
