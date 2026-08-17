import React from 'react';
import styles from './page.module.css';
import { Button } from '@/components/Button/Button';
import { MapPin, Phone, Mail } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Bake Factory',
  description: 'Get in touch with Bake Factory for your custom cake orders.',
};

export default function Contact() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Contact Us</h1>
        <p>We'd love to hear from you!</p>
      </div>

      <div className={styles.container}>
        <div className={styles.infoSection}>
          <a 
            href="https://www.google.com/maps/search/BAKE+FACTORY+%5BCakes+and+Desserts,+Maximilian+Kolbe,+Catholic+Church+Area,+12-1%2F2,+near+Rohan's+Pride+Appartments,+Tadepalle,+Sitanagaram,+Tadepalli,+Tadepalle,+Andhra+Pradesh+522501,+India/@16.4815522,80.6128612,17z?hl=en&entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.infoCard}
          >
            <MapPin size={32} className={styles.icon} />
            <h3>Visit Us</h3>
            <p style={{ fontSize: '0.82rem', lineHeight: '1.4', padding: '0 0.5rem' }}>
              BAKE FACTORY [Cakes and Desserts, Maximilian Kolbe, Catholic Church Area, 12-1/2, near Rohan's Pride Apartments, Tadepalle, Sitanagaram, Tadepalli, Tadepalle, Andhra Pradesh 522501, India]
            </p>
          </a>
          <a href="tel:+917989499446" className={styles.infoCard}>
            <Phone size={32} className={styles.icon} />
            <h3>Call Us</h3>
            <p>+91 79894 99446</p>
          </a>
          <a href="mailto:officialbakefactory@gmail.com" className={styles.infoCard}>
            <Mail size={32} className={styles.icon} />
            <h3>Email Us</h3>
            <p>officialbakefactory@gmail.com</p>
          </a>
        </div>

        <div className={styles.formSection}>
          <h2>Send us a message</h2>
          <form className={styles.contactForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" placeholder="John Doe" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" placeholder="john@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Your Message</label>
              <textarea id="message" rows={5} placeholder="How can we help you?"></textarea>
            </div>
            <Button variant="primary" type="button" className={styles.submitBtn}>
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
