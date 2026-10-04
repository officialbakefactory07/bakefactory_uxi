"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, ShoppingCart, UtensilsCrossed, Users, BarChart3, History, Tag, Settings, LogOut, ExternalLink, ChevronLeft, KeyRound, Star, Menu, X } from 'lucide-react';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/dashboard/reviews', label: 'Reviews & Ratings', icon: Star },
  { href: '/admin/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/admin/dashboard/staff', label: 'Staff & Passwords', icon: KeyRound },
  { href: '/admin/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/dashboard/history', label: 'History', icon: History },
  { href: '/admin/dashboard/offers', label: 'Offers', icon: Tag },
  { href: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('bf_admin_session');
      if (session !== 'authenticated') {
        router.replace('/admin');
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('bf_admin_session');
    router.push('/admin');
  };

  if (!authorized) return null;

  return (
    <div className={styles.adminRoot}>
      {/* Mobile Top Bar */}
      <header className={styles.mobileTopBar}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={styles.mobileBrand}>
          <Image src="/logo.png" alt="Bake Factory" width={30} height={30} style={{ mixBlendMode: 'multiply', borderRadius: '6px' }} />
          <strong>Bake Factory Admin</strong>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <Image src="/logo.png" alt="Bake Factory" width={40} height={40} style={{ mixBlendMode: 'multiply', borderRadius: '8px' }} />
            {!collapsed && (
              <div className={styles.brandText}>
                <strong>Bake Factory</strong>
                <span>Admin Panel</span>
              </div>
            )}
          </div>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft size={18} className={collapsed ? styles.rotated : ''} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link href="/" target="_blank" className={styles.viewStore}>
            <ExternalLink size={16} />
            {!collapsed && <span>View Store</span>}
          </Link>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>A</div>
            {!collapsed && (
              <div className={styles.adminMeta}>
                <strong>Admin</strong>
                <span>Admin</span>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
