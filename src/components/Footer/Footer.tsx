import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ShieldCheck, CreditCard } from 'lucide-react';
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
            Vijayawada&apos;s premier boutique dessert studio. Handcrafted cakes, authentic European pastries, and fresh oven treats prepared with 100% natural ingredients.
          </p>
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
          <h4 className={styles.colTitle}>Navigation</h4>
          <ul className={styles.linkList}>
            <li><Link href="/" className={styles.footerLink}>Home</Link></li>
            <li><Link href="/menu" className={styles.footerLink}>Our Menu</Link></li>
            <li><Link href="/about" className={styles.footerLink}>Our Story</Link></li>
            <li><Link href="/contact" className={styles.footerLink}>Contact & Location</Link></li>
            <li><Link href="/cart" className={styles.footerLink}>Shopping Cart</Link></li>
          </ul>
        </div>

        {/* Legal & Compliance (Mandatory for PayU Gateway Verification) */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Policies & Legal</h4>
          <ul className={styles.linkList}>
            <li><Link href="/terms" className={styles.footerLink}>Terms & Conditions</Link></li>
            <li><Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className={styles.footerLink}>Cancellation & Refund Policy</Link></li>
            <li><Link href="/shipping-policy" className={styles.footerLink}>Shipping & Delivery Policy</Link></li>
            <li><Link href="/contact" className={styles.footerLink}>Customer Grievances</Link></li>
          </ul>
        </div>

        {/* Store & Contact Info */}
        <div className={styles.contactCol}>
          <h4 className={styles.colTitle}>Bakery Studio</h4>
          <div className={styles.contactItems}>
            <a 
              href="https://www.google.com/maps/search/BAKE+FACTORY+%5BCakes+and+Desserts,+Maximilian+Kolbe,+Catholic+Church+Area,+12-1%2F2,+near+Rohan's+Pride+Appartments,+Tadepalle,+Sitanagaram,+Tadepalli,+Tadepalle,+Andhra+Pradesh+522501,+India/@16.4815522,80.6128612,17z"
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.contactItem}
            >
              <MapPin size={18} className={styles.itemIcon} />
              <span>Near Rohan&apos;s Pride Apts, Catholic Church Area, Tadepalle, Vijayawada 522501</span>
            </a>

            <a href="tel:+917989499446" className={styles.contactItem}>
              <Phone size={18} className={styles.itemIcon} />
              <span>+91 79894 99446</span>
            </a>

            <a href="mailto:officialbakefactory@gmail.com" className={styles.contactItem}>
              <Mail size={18} className={styles.itemIcon} />
              <span>officialbakefactory@gmail.com</span>
            </a>

            <div className={styles.contactItem}>
              <Clock size={18} className={styles.itemIcon} />
              <span>Mon - Sun: 9:00 AM – 10:30 PM</span>
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
            <span className={styles.payBadge}>PayU</span>
            <span className={styles.payBadge}>UPI</span>
            <span className={styles.payBadge}>GPay / PhonePe</span>
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
          <p>&copy; {new Date().getFullYear()} Bake Factory. Handcrafted with passion in Vijayawada.</p>
          <div className={styles.bottomLinks}>
            <span>FSSAI Certified Bakery</span>
            <span>•</span>
            <span>PCI-DSS 256-Bit SSL Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
