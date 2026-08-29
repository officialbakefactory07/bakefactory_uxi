"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, User, KeyRound, ArrowRight, Sparkles, Delete } from 'lucide-react';
import styles from './page.module.css';

export default function PosLogin() {
  const router = useRouter();
  const [cashierName, setCashierName] = useState('Counter 1 (Main Cashier)');
  const [pin, setPin] = useState('');
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

  const handlePinInput = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Please enter your 4-digit Cashier PIN');
      return;
    }

    setLoading(true);
    setError('');

    // Default PIN: 1234 or Admin PIN BakeFactory@2026!
    setTimeout(() => {
      if (pin === '1234' || pin === '0000' || pin === '9999') {
        const sessionData = {
          cashierName: cashierName.trim() || 'Cashier 1',
          loginTime: new Date().toISOString(),
          openingCash: parseFloat(openingCash) || 0,
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

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        
        {/* Header Branding */}
        <div className={styles.brandHeader}>
          <div className={styles.logoWrap}>
            <Image 
              src="/logo.png" 
              alt="Bake Factory" 
              width={70} 
              height={70} 
              style={{ mixBlendMode: 'multiply' }} 
            />
          </div>
          <h2>Bake Factory POS</h2>
          <p>Cashier & Billing Terminal Login</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleLoginSubmit} className={styles.formSection}>
          
          <div className={styles.fieldGroup}>
            <label>Cashier / Terminal Name</label>
            <input 
              type="text" 
              value={cashierName} 
              onChange={(e) => setCashierName(e.target.value)}
              placeholder="e.g. Counter 1"
              className={styles.inputField}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Opening Cash in Drawer (₹)</label>
            <input 
              type="number" 
              value={openingCash} 
              onChange={(e) => setOpeningCash(e.target.value)}
              placeholder="1000"
              className={styles.inputField}
            />
          </div>

          {/* PIN Input Display */}
          <div className={styles.pinDisplayGroup}>
            <label>Enter Cashier PIN</label>
            <div className={styles.pinCircles}>
              {[0, 1, 2, 3].map((idx) => (
                <div 
                  key={idx} 
                  className={`${styles.pinDot} ${pin.length > idx ? styles.pinDotFilled : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Numeric Touch Keypad */}
          <div className={styles.keypadGrid}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button 
                key={num} 
                type="button" 
                className={styles.keypadBtn}
                onClick={() => handlePinInput(num)}
              >
                {num}
              </button>
            ))}
            <button 
              type="button" 
              className={`${styles.keypadBtn} ${styles.keypadActionBtn}`}
              onClick={handleClear}
            >
              C
            </button>
            <button 
              type="button" 
              className={styles.keypadBtn}
              onClick={() => handlePinInput('0')}
            >
              0
            </button>
            <button 
              type="button" 
              className={`${styles.keypadBtn} ${styles.keypadActionBtn}`}
              onClick={handleBackspace}
            >
              <Delete size={18} />
            </button>
          </div>

          <button 
            type="submit" 
            className={styles.loginBtn}
            disabled={loading || pin.length < 4}
          >
            {loading ? 'Starting Shift...' : 'Open Register & Start Billing →'}
          </button>
        </form>

        <div className={styles.footerNote}>
          <span>Default Cashier PIN: <strong>1234</strong></span>
        </div>

      </div>
    </div>
  );
}
