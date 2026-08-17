import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.brand}>BAKE FACTORY</h3>
          <p className={styles.tagline}>Freshly baked cakes and desserts for every occasion.</p>
        </div>
        <div className={styles.section}>
          <h4 className={styles.heading}>Quick Links</h4>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/about" className={styles.link}>About Us</Link>
          <Link href="/menu" className={styles.link}>Our Menu</Link>
        </div>
        <div className={styles.section}>
          <h4 className={styles.heading}>Contact</h4>
          <p className={styles.text} style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
            <a 
              href="https://www.google.com/maps/search/BAKE+FACTORY+%5BCakes+and+Desserts,+Maximilian+Kolbe,+Catholic+Church+Area,+12-1%2F2,+near+Rohan's+Pride+Appartments,+Tadepalle,+Sitanagaram,+Tadepalli,+Tadepalle,+Andhra+Pradesh+522501,+India/@16.4815522,80.6128612,17z?hl=en&entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              BAKE FACTORY [Cakes and Desserts, Maximilian Kolbe, Catholic Church Area, 12-1/2, near Rohan's Pride Appartments, Tadepalle, Sitanagaram, Tadepalli, Tadepalle, Andhra Pradesh 522501, India]
            </a>
          </p>
          <p className={styles.text}>Phone: <a href="tel:+917989499446">+91 79894 99446</a></p>
          <p className={styles.text}>Email: <a href="mailto:officialbakefactory@gmail.com">officialbakefactory@gmail.com</a></p>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} Bake Factory. All rights reserved.</p>
      </div>
    </footer>
  );
};
