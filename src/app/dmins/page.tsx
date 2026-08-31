"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'bakefactory_admin';
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'BakeFactory@2026!';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('bf_admin_session');
      if (session === 'authenticated') {
        router.replace('/dmins/dashboard');
      }
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem('bf_admin_session', 'authenticated');
        router.push('/dmins/dashboard');
      } else {
        setError('Invalid credentials. Access denied.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        
        {/* Bright, Crisp Circular Logo with Gold Accent */}
        <div className={styles.logoWrap}>
          <div className={styles.logoCircle}>
            <Image 
              src="/logo.png" 
              alt="Bake Factory" 
              width={76} 
              height={76} 
              className={styles.logoImg}
            />
          </div>
        </div>

        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.subtitle}>Restricted — Authorized Management Only</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label>Admin Username</label>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.passWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className={styles.showBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? (
              <span className={styles.btnSpinner} />
            ) : (
              '🔐 Access Master Dashboard'
            )}
          </button>
        </form>

        <p className={styles.footer}>
          This portal is not publicly indexed. All access sessions are logged securely.
        </p>
      </div>
    </div>
  );
}
