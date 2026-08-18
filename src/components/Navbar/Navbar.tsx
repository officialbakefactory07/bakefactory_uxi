"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, User, Package, Heart, MapPin, LogOut, ChevronDown, Menu, X, PhoneCall, Sparkles } from 'lucide-react';
import styles from './Navbar.module.css';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  
  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Listen to profile updates in real-time
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      }
    }, (err) => {
      console.error("Error listening to user profile in Navbar:", err);
    });
    return () => unsub();
  }, [user]);

  // Track window scroll to change header background
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/');
  };

  const getAvatarSrc = () => {
    const url = profile?.photoURL || user?.photoURL;
    if (url && (url.startsWith('http') || url.startsWith('/'))) {
      return url;
    }
    if (profile?.gender === 'male') {
      return '/avatar-male.svg';
    }
    if (profile?.gender === 'female') {
      return '/avatar-female.svg';
    }
    return null;
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isHome = pathname === '/';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Menu', href: '/menu' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`${styles.navbar} ${(isHome && !scrolled) ? styles.transparent : ''} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Brand Logo */}
        <Link href="/" className={styles.logo} aria-label="Bake Factory Home">
          <div className={styles.logoWrapper}>
            <Image
              src="/logo.png"
              alt="Bake Factory Logo"
              width={120}
              height={120}
              className={styles.logoImage}
              priority
            />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>BAKE FACTORY</span>
            <span className={styles.brandSubtitle}>Cakes & Gourmet Desserts</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={styles.links} aria-label="Primary Navigation">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`${styles.link} ${isActive ? styles.activeLink : ''}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Utility Section */}
        <div className={styles.rightSection}>
          {/* Direct WhatsApp / Call Shortcut on larger screens */}
          <a href="tel:+917989499446" className={styles.phoneQuickLink} title="Call Bakery">
            <PhoneCall size={17} />
            <span>Order Hotline</span>
          </a>

          {/* Cart Icon */}
          <Link href="/cart" className={styles.cartLink} id="cart-link" aria-label="Shopping Cart">
            <div className={styles.cartIconWrapper}>
              <ShoppingBag size={21} />
              {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
            </div>
          </Link>

          {/* Auth / Profile Section */}
          {user ? (
            <div className={styles.profileWrap} ref={dropdownRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User Profile Menu"
              >
                {getAvatarSrc() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getAvatarSrc()!} alt="User Avatar" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarInitials}>
                    {getInitials(profile?.fullName || user.displayName || user.email)}
                  </div>
                )}
                <ChevronDown size={14} className={dropdownOpen ? styles.chevronUp : ''} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <strong>{profile?.fullName || user.displayName || user.email?.split('@')[0]}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link href="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> My Profile
                  </Link>
                  <Link href="/profile?tab=orders" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <Package size={16} /> My Orders
                  </Link>
                  <Link href="/profile?tab=wishlist" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <Heart size={16} /> Wishlist
                  </Link>
                  <Link href="/profile?tab=addresses" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <MapPin size={16} /> Saved Addresses
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.dropdownLogout} onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.loginLink}>
              <span>Login</span>
            </Link>
          )}

          {/* Hamburger Menu Button */}
          <button
            className={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileLinks}>
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.mobileLink} ${isActive ? styles.mobileActiveLink : ''}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className={styles.mobileFooterActions}>
            <a href="tel:+917989499446" className={styles.mobilePhoneBtn}>
              <PhoneCall size={16} /> Call +91 79894 99446
            </a>
            {!user && (
              <Link href="/login" className={styles.mobileLoginBtn}>
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
