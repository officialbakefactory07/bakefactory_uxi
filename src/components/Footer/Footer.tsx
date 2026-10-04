import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Top Banner */}
      <div className={styles.topBanner}>
        <div className={styles.topBannerContainer}>
          <div className={styles.topBannerText}>
            <span className={styles.bannerTag}>FRESH ARTISANAL BAKES</span>
            <h3>Celebrate Life&apos;s Moments with Extraordinary Flavors</h3>
          </div>
          <Link href="/menu" className={styles.bannerCta}>
            <span>Explore Menu</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className={styles.mainContainer}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <div className={styles.brandHeader}>
            <div className={styles.logoCircle}>
              <Image
                src="/logo.png"
                alt="Bake Factory"
                width={48}
                height={48}
                className={styles.footerLogo}
              />
            </div>
            <div>
              <h3 className={styles.brandName}>BAKE FACTORY</h3>
              <p className={styles.brandSub}>Artisanal Patisserie & Bespoke Cakes</p>
            </div>
          </div>

          <p className={styles.brandDesc}>
            Tadepalle&apos;s premier boutique bakery atelier. Handcrafted with 100% pure butter, genuine Belgian chocolate, and uncompromising passion.
          </p>

          <div className={styles.socialRow}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>

        {/* Column 1: Creations */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Creations</h4>
          <ul className={styles.linkList}>
            <li><Link href="/menu?category=cakes" className={styles.footerLink}>Designer Cakes</Link></li>
            <li><Link href="/menu?category=desserts" className={styles.footerLink}>Gourmet Desserts</Link></li>
            <li><Link href="/menu?category=cookies" className={styles.footerLink}>Butter Cookies</Link></li>
            <li><Link href="/menu?category=combos" className={styles.footerLink}>Party Combos</Link></li>
          </ul>
        </div>

        {/* Column 2: Guest Care */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Guest Care</h4>
          <ul className={styles.linkList}>
            <li><Link href="/about" className={styles.footerLink}>About Us</Link></li>
            <li><Link href="/contact" className={styles.footerLink}>Contact & Studio</Link></li>
            <li><Link href="/shipping-policy" className={styles.footerLink}>Delivery Info</Link></li>
            <li><Link href="/refund-policy" className={styles.footerLink}>Refund Policy</Link></li>
          </ul>
        </div>

        {/* Column 3: Atelier Studio */}
        <div className={styles.contactCol}>
          <h4 className={styles.colTitle}>Studio & Orders</h4>
          <div className={styles.contactItems}>
            <div className={styles.contactItem}>
              <MapPin size={16} className={styles.itemIcon} />
              <span>Amaravathi Road, Undavalli, Tadepalle &ndash; 522501</span>
            </div>

            <a href="tel:+917989499446" className={styles.contactItem}>
              <Phone size={16} className={styles.itemIcon} />
              <span>+91 79894 99446</span>
            </a>

            <a href="mailto:officialbakefactory@gmail.com" className={styles.contactItem}>
              <Mail size={16} className={styles.itemIcon} />
              <span>officialbakefactory@gmail.com</span>
            </a>

            <div className={styles.contactItem}>
              <Clock size={16} className={styles.itemIcon} />
              <span>Daily: 9:00 AM &ndash; 10:30 PM</span>
            </div>
          </div>
        </div>
      </div>


      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p>
            &copy; {new Date().getFullYear()} Bake Factory. Handcrafted with passion.
          </p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>Privacy</Link>
            <span className={styles.dotDivider}>&bull;</span>
            <Link href="/terms" className={styles.bottomLink}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
