import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Award, FileCheck } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Top Newsletter / Brand Banner */}
      <div className={styles.topBanner}>
        <div className={styles.topBannerContainer}>
          <div className={styles.topBannerText}>
            <span className={styles.bannerTag}>✦ FRESHLY BAKED HAPPINESS</span>
            <h3>Celebrate Every Moment with Artisanal Luxury</h3>
          </div>
          <Link href="/menu" className={styles.bannerCta}>
            Explore Our Menu &rarr;
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
                alt="Bake Factory Logo"
                width={56}
                height={56}
                className={styles.footerLogo}
              />
            </div>
            <div>
              <h3 className={styles.brandName}>BAKE FACTORY</h3>
              <p className={styles.brandSub}>Artisanal Cakes & Gourmet Desserts</p>
            </div>
          </div>
          <p className={styles.brandDesc}>
            Vijayawada&apos;s premier boutique dessert studio. Handcrafted designer cakes, authentic European pastries, and fresh oven treats prepared with 100% natural ingredients.
          </p>
          
          {/* FSSAI & Legal Entity Badge */}
          <div className={styles.fssaiBox}>
            <div className={styles.fssaiHeader}>
              <Award size={18} className={styles.goldIcon} />
              <strong>FSSAI CERTIFIED FOOD BUSINESS</strong>
            </div>
            <p className={styles.fssaiText}>
              License / Reg. No: <strong>20124043000000</strong>
            </p>
            <p className={styles.legalEntityText}>
              Legal Entity Name: <strong>Bake Factory</strong>
            </p>
          </div>

          <div className={styles.socialRow}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Products & Services</h4>
          <ul className={styles.linkList}>
            <li><Link href="/menu?category=Cakes" className={styles.footerLink}>Custom Designer Cakes</Link></li>
            <li><Link href="/menu?category=Cakes" className={styles.footerLink}>Fondant & Birthday Cakes</Link></li>
            <li><Link href="/menu?category=Desserts" className={styles.footerLink}>Pastries & Cheesecakes</Link></li>
            <li><Link href="/menu?category=Cookies" className={styles.footerLink}>Oven-Fresh Cookies</Link></li>
            <li><Link href="/menu?category=Combos" className={styles.footerLink}>Celebration Party Combos</Link></li>
            <li><Link href="/menu" className={styles.footerLink}>Same-Day Express Delivery</Link></li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Policies & Legal</h4>
          <ul className={styles.linkList}>
            <li><Link href="/terms" className={styles.footerLink}>Terms & Conditions</Link></li>
            <li><Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className={styles.footerLink}>Cancellation & Refund Policy</Link></li>
            <li><Link href="/shipping-policy" className={styles.footerLink}>Shipping & Delivery Policy</Link></li>
            <li><Link href="/contact" className={styles.footerLink}>Customer Care & Grievances</Link></li>
            <li><Link href="/about" className={styles.footerLink}>About Us & Legal Info</Link></li>
          </ul>
        </div>

        {/* Store & Contact Info */}
        <div className={styles.contactCol}>
          <h4 className={styles.colTitle}>Registered Studio & Contact</h4>
          <div className={styles.contactItems}>
            <div className={styles.contactItem}>
              <MapPin size={18} className={styles.itemIcon} />
              <span>
                <strong>Bake Factory</strong><br/>
                Maximilian Kolbe, Catholic Church Area, 12-1/2, Near Rohan&apos;s Pride Apartments, Tadepalle, Vijayawada, Andhra Pradesh &ndash; 522501, India
              </span>
            </div>

            <a href="tel:+917989499446" className={styles.contactItem}>
              <Phone size={18} className={styles.itemIcon} />
              <span>Hotline: +91 79894 99446</span>
            </a>

            <a href="mailto:officialbakefactory@gmail.com" className={styles.contactItem}>
              <Mail size={18} className={styles.itemIcon} />
              <span>Email: officialbakefactory@gmail.com</span>
            </a>

            <div className={styles.contactItem}>
              <Clock size={18} className={styles.itemIcon} />
              <span>Operating Hours: Mon &ndash; Sun: 9:00 AM &ndash; 10:30 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* PayU Payment Security Banner */}
      <div className={styles.paymentSecurityBar}>
        <div className={styles.paymentContainer}>
          <div className={styles.securityTag}>
            <ShieldCheck size={18} className={styles.securityIcon} />
            <span>100% SECURE CHECKOUT POWERED BY PAYU</span>
          </div>
          <div className={styles.paymentBadges}>
            <span className={styles.payBadge}>PayU Gateway</span>
            <span className={styles.payBadge}>UPI</span>
            <span className={styles.payBadge}>Google Pay</span>
            <span className={styles.payBadge}>PhonePe</span>
            <span className={styles.payBadge}>Paytm</span>
            <span className={styles.payBadge}>Visa</span>
            <span className={styles.payBadge}>Mastercard</span>
            <span className={styles.payBadge}>RuPay</span>
            <span className={styles.payBadge}>NetBanking</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p>
            &copy; {new Date().getFullYear()} <strong>Bake Factory</strong>. All Rights Reserved. Artisanal Studio in Vijayawada.
          </p>
          <div className={styles.bottomLinks}>
            <span>FSSAI Lic. No: 20124043000000</span>
            <span>•</span>
            <span>PCI-DSS 256-Bit SSL Encrypted</span>
            <span>•</span>
            <span>100% Food Grade Quality</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
