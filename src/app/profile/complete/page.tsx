"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import styles from './page.module.css';

export default function CompleteProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      // Pre-fill name from Google account if available
      setForm(prev => ({ ...prev, fullName: user.displayName || '' }));
      // Check if profile already complete
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists() && snap.data().profileComplete) {
          router.push('/profile');
        }
      });
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.gender) {
      alert('Please select your gender');
      return;
    }
    setSubmitting(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL || '',
        fullName: form.fullName,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        address: form.address,
        wishlist: [],
        profileComplete: true,
        createdAt: new Date().toISOString(),
      });
      router.push('/profile');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {form.gender === 'male' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/avatar-male.svg" alt="Male Avatar" className={styles.avatarImg} />
            ) : form.gender === 'female' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/avatar-female.svg" alt="Female Avatar" className={styles.avatarImg} />
            ) : (
              form.fullName ? form.fullName[0].toUpperCase() : '?'
            )}
          </div>
          <h1>Complete Your Profile</h1>
          <p>Tell us a bit about yourself to get started</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Pavan Kumar"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Gender *</label>
            <div className={styles.genderOptions}>
              <label className={`${styles.genderLabel} ${form.gender === 'male' ? styles.activeGender : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={form.gender === 'male'}
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                  required
                  className={styles.radioInput}
                />
                Male
              </label>
              <label className={`${styles.genderLabel} ${form.gender === 'female' ? styles.activeGender : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={form.gender === 'female'}
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                  required
                  className={styles.radioInput}
                />
                Female
              </label>
            </div>
          </div>

          <div className={styles.field}>
            <label>Mobile Number *</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Date of Birth *</label>
            <input
              type="date"
              value={form.dob}
              onChange={e => setForm({ ...form, dob: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Default Delivery Address</label>
            <textarea
              rows={3}
              placeholder="Flat No., Street, City, Pincode"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save & Continue →'}
          </button>
        </form>
      </div>
    </div>
  );
}
