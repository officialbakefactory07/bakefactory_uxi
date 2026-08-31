"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, CreditCard, Eye, EyeOff, ShieldCheck, DollarSign } from 'lucide-react';
import { verifyCashierLogin } from '@/lib/authStaff';
import styles from './page.module.css';

export default function PosLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [openingCash, setOpeningCash] = useState('1000');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If cashier session already active, redirect to POS terminal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeCashier = localStorage.getItem('bf_cashier_session');
      if (activeCashier) {
        router.replace('/pos');
      }
    }
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both Cashier Email and Password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const verifiedStaff = await verifyCashierLogin(email, password);

      if (verifiedStaff) {
        const sessionData = {
          cashierName: verifiedStaff.name || 'Counter 1 (Main Cashier)',
          email: verifiedStaff.email,
          counterName: verifiedStaff.counterName || 'Counter 1',
          openingCash: parseFloat(openingCash) || 0,
          loginTime: new Date().toISOString(),
          id: verifiedStaff.id || 'CSH-' + Math.floor(1000 + Math.random() * 9000)
        };
        localStorage.setItem('bf_cashier_session', JSON.stringify(sessionData));
        router.push('/pos');
      } else {
        setError('Invalid Cashier Email or Password. (Check with Admin if password changed)');
      }
    } catch (err: any) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        
        {/* Header Branding */}
        <div className={styles.brandHeader}>
          <div className={styles.logoWrap}>
            <div className={styles.logoCircle}>
              <Image 
                src="/logo.png" 
                alt="Bake Factory" 
                width={70} 
                height={70} 
                className={styles.logoImg}
              />
            </div>
          </div>
          <h2>Bake Factory POS</h2>
          <p>Cashier & Counter Terminal Login</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleLoginSubmit} className={styles.formSection}>
          
          <div className={styles.fieldGroup}>
            <label>Cashier Email / Username</label>
            <div className={styles.inputWrap}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                type="text" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cashier@bakefactory.in"
                className={styles.inputField}
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Cashier Password</label>
            <div className={styles.inputWrap}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.inputField}
                required
              />
              <button 
                type="button" 
                className={styles.showPassBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Opening Cash in Drawer (₹)</label>
            <div className={styles.inputWrap}>
              <DollarSign size={18} className={styles.inputIcon} />
              <input 
                type="number" 
                value={openingCash} 
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="1000"
                className={styles.inputField}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.loginBtn}
            disabled={loading}
          >
            {loading ? 'Starting Shift...' : 'Open Register & Start Billing →'}
          </button>
        </form>

        <div className={styles.footerNote}>
          <span>Default: <strong>cashier@bakefactory.in</strong> / <strong>Cashier@2026</strong></span>
          <p className={styles.adminNote}>Passwords can be managed & changed inside the Admin Panel.</p>
        </div>

      </div>
    </div>
  );
}
