"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, ShoppingCart, UtensilsCrossed, Users, BarChart3, History, Tag, Settings, LogOut, ExternalLink, ChevronLeft, Printer, KeyRound } from 'lucide-react';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/dmins/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dmins/dashboard/pos-sales', label: 'POS & Billing', icon: Printer },
  { href: '/dmins/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dmins/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/dmins/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dmins/dashboard/staff', label: 'Staff & Passwords', icon: KeyRound },
  { href: '/dmins/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dmins/dashboard/history', label: 'History', icon: History },
  { href: '/dmins/dashboard/offers', label: 'Offers', icon: Tag },
  { href: '/dmins/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('bf_admin_session');
      if (session !== 'authenticated') {
        router.replace('/dmins');
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('bf_admin_session');
    router.push('/dmins');
  };

  if (!authorized) return null;

  return (
    <div className={styles.adminRoot}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
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
          <Link href="/pos" target="_blank" className={styles.viewStore} style={{ background: '#FEF8E7', color: '#B8820B', fontWeight: 700, borderColor: 'rgba(212, 160, 23, 0.3)' }}>
            <Printer size={16} />
            {!collapsed && <span>Open POS Terminal</span>}
          </Link>
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
