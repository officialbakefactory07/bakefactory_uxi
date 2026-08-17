"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from './page.module.css';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const redirectAfterAuth = async (uid: string) => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists() && snap.data().profileComplete) {
      router.push('/');
    } else {
      router.push('/profile/complete');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await redirectAfterAuth(cred.user.uid);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await redirectAfterAuth(cred.user.uid);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
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
      await redirectAfterAuth(cred.user.uid);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.authCard}>
        <div className={styles.cardHeader}>
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to order your favorite desserts' : 'Join Bake Factory for easy ordering'}</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleEmailAuth} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <Button variant="primary" type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={loading} className={styles.googleBtn}>
          Continue with Google
        </Button>

        <div className={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className={styles.toggleBtn}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </Card>
    </div>
  );
}
