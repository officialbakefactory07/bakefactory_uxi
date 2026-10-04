"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Eye, EyeOff, User, ArrowLeft, ShieldAlert } from 'lucide-react';
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
      {/* Warm ambient bakery glow matching main website */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      <div className={styles.authContainer}>
        {/* Return to storefront link */}
        <div className={styles.backLinkWrap}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </Link>
        </div>

        <div className={styles.authCard}>
          {/* Brand Logo & Header */}
          <div className={styles.cardHeader}>
            <Link href="/" className={styles.logoWrap}>
              <Image 
                src="/logo.png" 
                alt="Bake Factory" 
                width={70} 
                height={70} 
                className={styles.logoImg}
                priority
              />
            </Link>
            <span className={styles.studioTag}>Bake Factory Atelier</span>
            <h1 className={styles.title}>Admin Access</h1>
            <p className={styles.subtitle}>
              Authorized management and operations portal
            </p>
          </div>

          {error && (
            <div className={styles.error}>
              <ShieldAlert size={18} className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="admin-user" className={styles.fieldLabel}>
                Admin Username
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconBox}>
                  <User size={18} />
                </div>
                <input
                  id="admin-user"
                  type="text"
                  placeholder="Enter admin username"
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
                Password
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconBox}>
                  <Lock size={18} />
                </div>
                <input
                  id="admin-pass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
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
                  <span>Signing In...</span>
                </div>
              ) : (
                'Access Master Dashboard'
              )}
            </button>
          </form>

          <p className={styles.footerNote}>
            Restricted to authorized personnel only. All access sessions are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
