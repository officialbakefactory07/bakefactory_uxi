import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Heart, Award, Share2 } from 'lucide-react';
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
            Vijayawada's premier boutique dessert house. Handcrafted cakes, authentic European pastries, and fresh oven treats prepared with 100% natural ingredients.
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

        {/* Specialties */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Specialties</h4>
          <ul className={styles.linkList}>
            <li><Link href="/menu?category=cakes" className={styles.footerLink}>Custom Designer Cakes</Link></li>
            <li><Link href="/menu?category=cakes" className={styles.footerLink}>Cool Cakes & Fondant</Link></li>
            <li><Link href="/menu?category=desserts" className={styles.footerLink}>Gourmet Desserts</Link></li>
            <li><Link href="/menu?category=cookies" className={styles.footerLink}>Oven-Fresh Cookies</Link></li>
            <li><Link href="/menu?category=combos" className={styles.footerLink}>Celebration Combos</Link></li>
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
              <span>Near Rohan's Pride Apts, Catholic Church Area, Tadepalle, Vijayawada 522501</span>
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

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p>&copy; {new Date().getFullYear()} Bake Factory. Handcrafted with passion.</p>
          <div className={styles.bottomLinks}>
            <span>FSSAI Certified Bakery</span>
            <span>•</span>
            <span>100% Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
