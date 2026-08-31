"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.message) return;
    setSending(true);

    try {
      await fetch('/api/contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });
    } catch (err) {
      console.error("Error submitting contact email:", err);
    } finally {
      setSending(false);
      setSubmitted(true);
    }
  };

  return (
    <div className={styles.page}>
      {/* 1. Header */}
      <section className={styles.header}>
        <div className={styles.headerContainer}>
          <span className={styles.headerTag}>✦ GET IN TOUCH</span>
          <h1>We'd Love to Hear from You</h1>
          <p>Have a question about custom cakes, party orders, or delivery in Vijayawada? Reach out to our bakery team.</p>
        </div>
      </section>

      <div className={styles.container}>
        {/* 2. Quick Contact Cards */}
        <div className={styles.infoSection}>
          <a 
            href="https://www.google.com/maps/search/BAKE+FACTORY+%5BCakes+and+Desserts,+Maximilian+Kolbe,+Catholic+Church+Area,+12-1%2F2,+near+Rohan's+Pride+Appartments,+Tadepalle,+Sitanagaram,+Tadepalli,+Tadepalle,+Andhra+Pradesh+522501,+India/@16.4815522,80.6128612,17z" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.infoCard}
          >
            <div className={styles.iconCircle}>
              <MapPin size={24} />
            </div>
            <h3>Visit Our Studio</h3>
            <p className={styles.addressText}>
              Catholic Church Area, Near Rohan's Pride Apartments, Tadepalle, Vijayawada 522501
            </p>
            <span className={styles.cardAction}>Get Directions &rarr;</span>
          </a>

          <a href="tel:+917989499446" className={styles.infoCard}>
            <div className={styles.iconCircle}>
              <Phone size={24} />
            </div>
            <h3>Call or WhatsApp</h3>
            <p className={styles.phoneText}>+91 79894 99446</p>
            <span className={styles.cardAction}>Call Bakery &rarr;</span>
          </a>

          <a href="mailto:officialbakefactory@gmail.com" className={styles.infoCard}>
            <div className={styles.iconCircle}>
              <Mail size={24} />
            </div>
            <h3>Email Inquiries</h3>
            <p className={styles.emailText}>officialbakefactory@gmail.com</p>
            <span className={styles.cardAction}>Send Email &rarr;</span>
          </a>
        </div>

        {/* 3. Form & Hours Split */}
        <div className={styles.contentGrid}>
          {/* Contact Form */}
          <div className={styles.formSection}>
            <div className={styles.formHeader}>
              <MessageSquare size={22} className={styles.formIcon} />
              <h2>Send Us a Message</h2>
            </div>
            <p className={styles.formSub}>Fill out the details below and we will get back to you promptly.</p>

            {submitted ? (
              <div className={styles.successBox}>
                <CheckCircle2 size={48} className={styles.successIcon} />
                <h3>Thank You, {formState.name}!</h3>
                <p>Your message has been received. Our team will contact you shortly.</p>
                <button 
                  className={styles.resetBtn}
                  onClick={() => {
                    setSubmitted(false);
                    setFormState({ name: '', email: '', phone: '', message: '' });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className={styles.contactForm} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      required
                      placeholder="e.g. Priya Sharma" 
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      placeholder="+91 98765 43210" 
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="priya@example.com" 
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Your Message / Cake Requirements *</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    required
                    placeholder="Tell us about your event date, theme, flavors, or any question..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Operating Hours & Studio Highlights */}
          <div className={styles.sideInfoSection}>
            <div className={styles.hoursCard}>
              <div className={styles.hoursHeader}>
                <Clock size={24} className={styles.hoursIcon} />
                <div>
                  <h3>Bakery Studio Timings</h3>
                  <span>Open 7 Days a Week</span>
                </div>
              </div>
              <div className={styles.timingsList}>
                <div className={styles.timingRow}>
                  <strong>Monday – Friday</strong>
                  <span>9:00 AM – 10:30 PM</span>
                </div>
                <div className={styles.timingRow}>
                  <strong>Saturday – Sunday</strong>
                  <span>9:00 AM – 11:00 PM</span>
                </div>
              </div>
            </div>

            <div className={styles.customOrderNote}>
              <h4>Planning a Custom Party Cake?</h4>
              <p>For large multi-tier fondant creations, we recommend placing orders at least 24–48 hours in advance for the best artistry and freshness.</p>
              <a href="tel:+917989499446" className={styles.hotlineLink}>
                <Phone size={16} /> Direct Cake Hotline: +91 79894 99446
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
