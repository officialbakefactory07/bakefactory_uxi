"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, 
  MessageCircle, Sparkles, Award
} from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    occasion: 'Celebration Cake', 
    eventDate: '', 
    message: '' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.phone.trim() || !formState.message.trim()) return;
    setSending(true);

    const fullMessage = [
      `Occasion: ${formState.occasion}`,
      formState.eventDate ? `Event Date: ${formState.eventDate}` : '',
      `Message:\n${formState.message}`
    ].filter(Boolean).join('\n\n');

    try {
      await fetch('/api/contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          message: fullMessage
        })
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
      {/* 1. Atelier Header */}
      <section className={styles.header}>
        <div className={styles.headerContainer}>
          <span className={styles.headerTag}>ATELIER CONCIERGE</span>
          <h1>Connect With Our Studio</h1>
          <p>
            Whether you are planning a bespoke tiered celebration cake, inquiring about gourmet pastries, or arranging express doorstep delivery in Tadepalle, our atelier team is at your service.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        
        {/* 2. Direct Concierge Contact Cards (2x2 on Mobile, 4-in-a-row on Desktop) */}
        <div className={styles.infoSection}>
          {/* Card 1: WhatsApp Concierge */}
          <a 
            href="https://wa.me/917989499446?text=Hi%20Bake%20Factory,%20I%20would%20like%20to%20enquire%20about%20a%20cake" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.infoCard}
          >
            <div className={`${styles.iconCircle} ${styles.iconWhatsApp}`}>
              <MessageCircle size={22} />
            </div>
            <div className={styles.cardHeaderMeta}>
              <span className={styles.cardMiniTag}>FASTEST CHAT</span>
              <h3>WhatsApp</h3>
            </div>
            <p className={styles.phoneText}>+91 79894 99446</p>
            <p className={styles.cardDesc}>Instant chats for custom designs &amp; same-day delivery.</p>
            <span className={styles.cardAction}>Chat &rarr;</span>
          </a>

          {/* Card 2: Phone Hotline */}
          <a href="tel:+917989499446" className={styles.infoCard}>
            <div className={styles.iconCircle}>
              <Phone size={22} />
            </div>
            <div className={styles.cardHeaderMeta}>
              <span className={styles.cardMiniTag}>DIRECT CALL</span>
              <h3>Call Studio</h3>
            </div>
            <p className={styles.phoneText}>+91 79894 99446</p>
            <p className={styles.cardDesc}>Speak directly with our chefs for rush orders &amp; guidance.</p>
            <span className={styles.cardAction}>Call Now &rarr;</span>
          </a>

          {/* Card 3: Studio Location */}
          <a 
            href="https://www.google.com/maps/search/BAKE+FACTORY+%5BCakes+and+Desserts,+Maximilian+Kolbe,+Catholic+Church+Area,+12-1%2F2,+near+Rohan's+Pride+Appartments,+Tadepalle,+Sitanagaram,+Tadepalli,+Tadepalle,+Andhra+Pradesh+522501,+India/@16.4815522,80.6128612,17z" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.infoCard}
          >
            <div className={styles.iconCircle}>
              <MapPin size={22} />
            </div>
            <div className={styles.cardHeaderMeta}>
              <span className={styles.cardMiniTag}>STUDIO</span>
              <h3>Visit Atelier</h3>
            </div>
            <p className={styles.addressText}>
              Amaravathi Road, Undavalli, Tadepalle &ndash; 522501
            </p>
            <p className={styles.cardDesc}>Self pickup &amp; custom cake consultations.</p>
            <span className={styles.cardAction}>Directions &rarr;</span>
          </a>

          {/* Card 4: Email Concierge */}
          <a href="mailto:officialbakefactory@gmail.com" className={styles.infoCard}>
            <div className={`${styles.iconCircle} ${styles.iconEmail}`}>
              <Mail size={22} />
            </div>
            <div className={styles.cardHeaderMeta}>
              <span className={styles.cardMiniTag}>OFFICIAL INQUIRY</span>
              <h3>Email Desk</h3>
            </div>
            <p className={styles.phoneText}>officialbakefactory@gmail.com</p>
            <p className={styles.cardDesc}>Corporate bulk gifting &amp; event catering inquiries.</p>
            <span className={styles.cardAction}>Write Us &rarr;</span>
          </a>
        </div>

        {/* 3. Form & Timings Split Grid */}
        <div className={styles.contentGrid}>
          {/* Custom Cake & Order Inquiry Form */}
          <div className={styles.formSection}>
            <div className={styles.formHeader}>
              <Sparkles size={20} className={styles.formIcon} />
              <h2>Bespoke Cake &amp; Order Inquiry</h2>
            </div>
            <p className={styles.formSub}>
              Share your celebration details below. Our chefs will review and reach out with tailored flavor profiles.
            </p>

            {submitted ? (
              <div className={styles.successBox}>
                <CheckCircle2 size={44} className={styles.successIcon} />
                <h3>Thank You, {formState.name}!</h3>
                <p>Your inquiry has been received. Our atelier team will connect with you via WhatsApp / Phone shortly.</p>
                <button 
                  className={styles.resetBtn}
                  onClick={() => {
                    setSubmitted(false);
                    setFormState({ name: '', email: '', phone: '', occasion: 'Celebration Cake', eventDate: '', message: '' });
                  }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                {/* Row 1 (2 by 2): Full Name & Phone */}
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="name">Full Name <span className={styles.reqStar}>*</span></label>
                    <input 
                      type="text" 
                      id="name" 
                      required 
                      placeholder="e.g. Anand Varma"
                      value={formState.name}
                      onChange={e => setFormState({...formState, name: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="phone">Phone / WhatsApp <span className={styles.reqStar}>*</span></label>
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

                {/* Row 2 (2 by 2): Occasion & Delivery Date */}
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="occasion">Occasion / Type</label>
                    <select
                      id="occasion"
                      value={formState.occasion}
                      onChange={e => setFormState({...formState, occasion: e.target.value})}
                      className={styles.selectInput}
                    >
                      <option value="Celebration Cake">Celebration Cake</option>
                      <option value="Wedding / Tier Cake">Wedding / Tier Cake</option>
                      <option value="Birthday Party">Birthday Party</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Baby Shower / Milestone">Baby Shower / Milestone</option>
                      <option value="Corporate Event / Gifting">Corporate Event / Gifting</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="eventDate">Delivery / Event Date</label>
                    <input 
                      type="date" 
                      id="eventDate" 
                      value={formState.eventDate}
                      onChange={e => setFormState({...formState, eventDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* Row 3: Email Address */}
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email Address <span className={styles.optionalTag}>(Optional)</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="you@example.com"
                    value={formState.email}
                    onChange={e => setFormState({...formState, email: e.target.value})}
                  />
                </div>

                {/* Row 4: Message */}
                <div className={styles.inputGroup}>
                  <label htmlFor="message">Cake Specifications / Requirements <span className={styles.reqStar}>*</span></label>
                  <textarea 
                    id="message" 
                    required 
                    rows={3} 
                    placeholder="Tell us about your celebration theme, flavor preferences (e.g. Belgian Truffle, Lotus Biscoff), dietary needs (eggless), or approximate guest count..."
                    value={formState.message}
                    onChange={e => setFormState({...formState, message: e.target.value})}
                  />
                </div>

                <button type="submit" disabled={sending} className={styles.submitBtn}>
                  <Send size={17} />
                  <span>{sending ? 'Transmitting to Atelier...' : 'Submit Consultation Request'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Side Atelier Details */}
          <div className={styles.sideSection}>
            {/* Operating Hours Card */}
            <div className={styles.hoursCard}>
              <div className={styles.hoursHeader}>
                <div className={styles.hoursIconCircle}>
                  <Clock size={20} className={styles.hoursIcon} />
                </div>
                <div>
                  <h3>Atelier Timings</h3>
                  <span>Fresh Bakes &bull; 7 Days a Week</span>
                </div>
              </div>

              <div className={styles.timingsList}>
                <div className={styles.timingRow}>
                  <span className={styles.timingDay}>Monday &ndash; Sunday</span>
                  <span className={styles.timingTime}>9:00 AM &ndash; 11:00 PM</span>
                </div>
                <div className={styles.timingRow}>
                  <span className={styles.timingDay}>Express Delivery</span>
                  <span className={styles.timingTime}>45–60 mins (Tadepalle &amp; Vijayawada)</span>
                </div>
                <div className={styles.timingRow}>
                  <span className={styles.timingDay}>Midnight Surprise</span>
                  <span className={styles.timingTime}>11:00 PM &ndash; 12:30 AM (Pre-booked)</span>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className={styles.mapCard}>
              <iframe 
                title="Bake Factory Location"
                src="https://maps.google.com/maps?q=16.4815522,80.6128612&hl=en;z=14&output=embed"
                width="100%" 
                height="210" 
                style={{ border: 0, borderRadius: '16px', display: 'block' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* 4. Elegant Minimal Credential Badge */}
        <div className={styles.credentialFooter}>
          <div className={styles.credentialPill}>
            <Award size={15} className={styles.credentialIcon} />
            <span>FSSAI Reg. No: <strong>20126141002411</strong></span>
            <span className={styles.credentialDot}>&bull;</span>
            <span>100% Food Safety Certified</span>
            <span className={styles.credentialDot}>&bull;</span>
            <span>Tadepalle, Andhra Pradesh</span>
          </div>
        </div>

      </div>
    </div>
  );
}
