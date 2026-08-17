"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';

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

    // Small delay to simulate verification
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem('bf_admin_session', 'authenticated');
        router.push('/dmins/dashboard');
      } else {
        setError('Invalid credentials. Access denied.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Image src="/logo.png" alt="Bake Factory" width={90} height={90} style={{ mixBlendMode: 'multiply' }} />
        </div>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.subtitle}>Restricted — Authorized personnel only</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label>Username</label>
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
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? (
              <span className={styles.btnSpinner} />
            ) : (
              '🔐 Access Dashboard'
            )}
          </button>
        </form>

        <p className={styles.footer}>
          This page is not publicly accessible. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
