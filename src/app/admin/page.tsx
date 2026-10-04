"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Eye, EyeOff, ShieldCheck, User, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import styles from './page.module.css';
import { getAdminCredentials } from '@/lib/authStaff';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('bf_admin_session');
      if (session === 'authenticated') {
        router.replace('/admin/dashboard');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const liveAdmin = await getAdminCredentials();
      if (username.trim() === liveAdmin.username && password.trim() === liveAdmin.password) {
        localStorage.setItem('bf_admin_session', 'authenticated');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid credentials. Access denied.');
        setLoading(false);
      }
    } catch (err) {
      setError('Login verification failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Ambient background glows & micro grid */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />
      <div className={styles.gridOverlay} />

      {/* Top Bar with Return to Store */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Return to Storefront</span>
        </Link>
        <div className={styles.systemStatusBadge}>
          <span className={styles.statusPulseDot} />
          <span>SECURE SYSTEM</span>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.cardGlowBorder} />
        
        <div className={styles.card}>
          {/* Executive Medallion */}
          <div className={styles.emblemContainer}>
            <div className={styles.emblemHalo} />
            <div className={styles.emblemRing}>
              <div className={styles.logoCircle}>
                <Image 
                  src="/logo.png" 
                  alt="Bake Factory" 
                  width={72} 
                  height={72} 
                  className={styles.logoImg}
                  priority
                />
              </div>
            </div>
          </div>

          {/* Luxury Badge */}
          <div className={styles.pillBadge}>
            <Sparkles size={12} className={styles.pillBadgeIcon} />
            <span>EXECUTIVE COMMAND PORTAL</span>
          </div>

          <h1 className={styles.title}>Admin Access</h1>
          <p className={styles.subtitle}>
            Authorized management environment • 256-bit encrypted console
          </p>

          {error && (
            <div className={styles.error}>
              <ShieldCheck size={18} className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="admin-user" className={styles.fieldLabel}>
                Administrator Username
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconBox}>
                  <User size={18} />
                </div>
                <input
                  id="admin-user"
                  type="text"
                  placeholder="Enter administrator ID"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className={styles.textInput}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-pass" className={styles.fieldLabel}>
                Security Passcode
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconBox}>
                  <KeyRound size={18} />
                </div>
                <input
                  id="admin-pass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter access passphrase"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={styles.textInput}
                />
                <button 
                  type="button" 
                  className={styles.showBtn} 
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? (
                <div className={styles.loadingWrapper}>
                  <span className={styles.btnSpinner} />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className={styles.btnContent}>
                  <Lock size={17} />
                  <span>Enter Master Dashboard</span>
                </div>
              )}
            </button>
          </form>

          {/* Security Assurance Footer */}
          <div className={styles.footerInfo}>
            <ShieldCheck size={14} className={styles.footerShieldIcon} />
            <span>Encrypted Atelier Console • Access telemetry strictly monitored</span>
          </div>
        </div>
      </div>
    </div>
  );
}
