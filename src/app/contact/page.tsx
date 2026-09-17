"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, Award, ShieldCheck, Building2, Cake, Truck } from 'lucide-react';

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
          <span className={styles.headerTag}>✦ GET IN TOUCH & LEGAL DETAILS</span>
          <h1>Customer Support & Bakery Information</h1>
          <p>Have a question about our artisanal cakes, dietary options, or express delivery in Vijayawada? Reach out to our team.</p>
        </div>
      </section>

      <div className={styles.container}>
        
        {/* 2. Business Registration & FSSAI Info Banner */}
        <div className={styles.legalInfoBanner}>
          <div className={styles.legalCard}>
            <div className={styles.legalIconBadge}>
              <Building2 size={24} />
            </div>
            <div>
              <h3>Legal Business Entity</h3>
              <p><strong>Entity Name:</strong> Bake Factory</p>
              <p><strong>Trade Name:</strong> Bake Factory Artisanal Studio</p>
              <p><strong>Category:</strong> Food & Bakery Confectionery Retailer & Delivery</p>
            </div>
          </div>

          <div className={styles.legalCard}>
            <div className={styles.legalIconBadge}>
              <Award size={24} />
            </div>
            <div>
              <h3>FSSAI License & Certification</h3>
              <p><strong>FSSAI Registration No:</strong> 20124043000000</p>
              <p><strong>Food Safety:</strong> 100% Food-grade, hygienic artisanal bakery</p>
              <p><strong>Issuing Authority:</strong> FSSAI, Government of Andhra Pradesh</p>
            </div>
          </div>

          <div className={styles.legalCard}>
            <div className={styles.legalIconBadge}>
              <Truck size={24} />
            </div>
            <div>
              <h3>Delivery & Service Area</h3>
              <p><strong>Coverage:</strong> Vijayawada & Tadepalle (PIN: 522501, 520001+)</p>
              <p><strong>Delivery Slots:</strong> Express 45–60 mins / Pre-booked slots</p>
              <p><strong>Store Pickup:</strong> Free self-pickup available daily</p>
            </div>
          </div>
        </div>

        {/* 3. Quick Contact Cards */}
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
              Bake Factory, Maximilian Kolbe, Catholic Church Area, 12-1/2, Near Rohan&apos;s Pride Apartments, Tadepalle, Vijayawada, AP &ndash; 522501
            </p>
            <span className={styles.cardAction}>Get Directions &rarr;</span>
          </a>

          <a href="tel:+917989499446" className={styles.infoCard}>
            <div className={styles.iconCircle}>
              <Phone size={24} />
            </div>
            <h3>Call or WhatsApp Hotline</h3>
            <p className={styles.phoneText}>+91 79894 99446</p>
            <span className={styles.cardAction}>Call Bakery &rarr;</span>
          </a>

          <a href="mailto:officialbakefactory@gmail.com" className={styles.infoCard}>
            <div className={styles.iconCircle}>
              <Mail size={24} />
            </div>
            <h3>Email Support & Grievances</h3>
            <p className={styles.emailText}>officialbakefactory@gmail.com</p>
            <span className={styles.cardAction}>Send Email &rarr;</span>
          </a>
        </div>

        {/* 4. Form & Hours Split */}
        <div className={styles.contentGrid}>
          {/* Contact Form */}
          <div className={styles.formSection}>
            <div className={styles.formHeader}>
              <MessageSquare size={22} className={styles.formIcon} />
              <h2>Send Us a Message</h2>
            </div>
            <p className={styles.formSub}>Fill out the details below and our team will get back to you promptly.</p>

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
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="name">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      required 
                      placeholder="e.g. Rahul Sharma"
                      value={formState.name}
                      onChange={e => setFormState({...formState, name: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="phone">Phone Number *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      required 
                      placeholder="+91 79894 99446"
                      value={formState.phone}
                      onChange={e => setFormState({...formState, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="you@example.com"
                    value={formState.email}
                    onChange={e => setFormState({...formState, email: e.target.value})}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="message">Your Message or Custom Order Details *</label>
                  <textarea 
                    id="message" 
                    required 
                    rows={4} 
                    placeholder="Tell us about your celebration date, guest count, flavor preference, or dietary requests..."
                    value={formState.message}
                    onChange={e => setFormState({...formState, message: e.target.value})}
                  />
                </div>

                <button type="submit" disabled={sending} className={styles.submitBtn}>
                  <Send size={18} />
                  <span>{sending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Operating Hours & Studio Map */}
          <div className={styles.sideSection}>
            <div className={styles.hoursCard}>
              <div className={styles.cardHeader}>
                <Clock size={20} className={styles.goldIcon} />
                <h3>Operating Hours</h3>
              </div>
              <ul className={styles.hoursList}>
                <li><span>Monday &ndash; Friday</span><strong>9:00 AM &ndash; 10:30 PM</strong></li>
                <li><span>Saturday</span><strong>9:00 AM &ndash; 11:00 PM</strong></li>
                <li><span>Sunday</span><strong>9:00 AM &ndash; 11:00 PM</strong></li>
                <li><span>Midnight Cake Delivery</span><strong>11:00 PM &ndash; 12:30 AM (Pre-booked)</strong></li>
              </ul>
            </div>

            <div className={styles.mapCard}>
              <iframe 
                title="Bake Factory Location"
                src="https://maps.google.com/maps?q=16.4815522,80.6128612&hl=es;z=14&output=embed"
                width="100%" 
                height="220" 
                style={{ border: 0, borderRadius: '12px' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
