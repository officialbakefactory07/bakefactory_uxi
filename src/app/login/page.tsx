"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Gift,
  Truck,
  HeartHandshake,
} from 'lucide-react';
import styles from './page.module.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const router = useRouter();

  const redirectAfterCustomerAuth = async (userObj: any, defaultName?: string) => {
    try {
      const userRef = doc(db, 'users', userObj.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          email: userObj.email,
          fullName: userObj.displayName || defaultName || 'Valued Customer',
          role: 'customer',
          createdAt: serverTimestamp(),
          profileComplete: true,
        });
      }

      router.push('/');
    } catch (e) {
      console.error('Error in post-auth redirect:', e);
      router.push('/');
    }
  };

  const handleCustomerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetSuccess('');

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await redirectAfterCustomerAuth(cred.user);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (fullName.trim()) {
          await updateProfile(cred.user, { displayName: fullName.trim() });
        }
        await redirectAfterCustomerAuth(cred.user, fullName.trim());
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please try again or create an account.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setResetSuccess('');
    const provider = new GoogleAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      await redirectAfterCustomerAuth(cred.user);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Sign-In was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address to receive a password reset link.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSuccess(`Password reset email sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Verify your email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background Animated Floating Glow Orbs */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      {/* Floating Animated Sparks */}
      <motion.div
        className={styles.floatingSparkle1}
        animate={{ y: [0, -15, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
      >
        ✦
      </motion.div>
      <motion.div
        className={styles.floatingSparkle2}
        animate={{ y: [0, 20, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1 }}
      >
        ✦
      </motion.div>

      <motion.div
        className={styles.authContainer}
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Main Card */}
        <div className={styles.authCard}>
          {/* Brand Emblem & Logo */}
          <div className={styles.cardHeader}>
            <motion.div
              className={styles.logoWrap}
              whileHover={{ scale: 1.08, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Image
                src="/logo.png"
                alt="Bake Factory"
                width={70}
                height={70}
                style={{ mixBlendMode: 'multiply' }}
                priority
              />
            </motion.div>

            <span className={styles.studioTag}>✦ ARTISANAL DESSERT STUDIO</span>
            <h1>{forgotPasswordMode ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Join Bake Factory'}</h1>
            <p>
              {forgotPasswordMode
                ? 'Enter your email to receive a password reset link'
                : isLogin
                ? 'Sign in to order your favorite handcrafted cakes & desserts'
                : 'Create an account for fast checkout, order tracking & rewards'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Create Account) */}
          {!forgotPasswordMode && (
            <div className={styles.tabContainer}>
              <button
                type="button"
                className={`${styles.tabBtn} ${isLogin ? styles.activeTab : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Sign In
                {isLogin && <motion.div layoutId="authTabIndicator" className={styles.tabIndicator} />}
              </button>

              <button
                type="button"
                className={`${styles.tabBtn} ${!isLogin ? styles.activeTab : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Create Account
                {!isLogin && <motion.div layoutId="authTabIndicator" className={styles.tabIndicator} />}
              </button>
            </div>
          )}

          {/* Error & Success Feedback Banners */}
          <AnimatePresence>
            {error && (
              <motion.div
                className={styles.errorAlert}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle size={17} />
                <span>{error}</span>
              </motion.div>
            )}

            {resetSuccess && (
              <motion.div
                className={styles.successAlert}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle2 size={17} />
                <span>{resetSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forgot Password View */}
          {forgotPasswordMode ? (
            <form onSubmit={handleForgotPassword} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    placeholder="e.g. priya@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Sending Reset Link...' : 'Send Password Reset Email'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotPasswordMode(false);
                  setError('');
                  setResetSuccess('');
                }}
                className={styles.backToLoginBtn}
              >
                &larr; Back to Sign In
              </button>
            </form>
          ) : (
            /* Sign In / Sign Up Form */
            <form onSubmit={handleCustomerAuth} className={styles.authForm}>
              {/* Full Name (Sign Up Only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    className={styles.formGroup}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label>Full Name</label>
                    <div className={styles.inputWrapper}>
                      <User size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        value={fullName}
                        placeholder="e.g. Priya Sharma"
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                        className={styles.formInput}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    placeholder="priya@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Password */}
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label>Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordMode(true);
                        setError('');
                        setResetSuccess('');
                      }}
                      className={styles.forgotLink}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={styles.formInput}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                <Sparkles size={16} />
                <span>
                  {loading
                    ? 'Connecting to Bakery...'
                    : isLogin
                    ? 'Sign In to Your Account'
                    : 'Create My Account'}
                </span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Google OAuth Option */}
          {!forgotPasswordMode && (
            <>
              <div className={styles.divider}>
                <span>OR CONTINUE WITH</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className={styles.googleBtn}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Member Perks Strip */}
          <div className={styles.perksStrip}>
            <div className={styles.perkItem}>
              <Gift size={14} className={styles.perkIcon} />
              <span>Earn Cake Rewards</span>
            </div>
            <div className={styles.perkItem}>
              <Truck size={14} className={styles.perkIcon} />
              <span>45-Min Express</span>
            </div>
            <div className={styles.perkItem}>
              <ShieldCheck size={14} className={styles.perkIcon} />
              <span>100% Safe Checkout</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
