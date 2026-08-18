import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, Heart, Sparkles, ShieldCheck, Cake, Clock, Users, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export const metadata = {
  title: 'Our Story & Heritage | Bake Factory',
  description: 'Discover the passion, master bakers, and artisanal philosophy behind Bake Factory in Vijayawada.',
};

export default function About() {
  const pillars = [
    {
      icon: <Award size={26} />,
      title: "Master Patisserie Craft",
      desc: "Every dessert is sculpted with precision using traditional French & European pastry techniques perfected over years."
    },
    {
      icon: <Heart size={26} />,
      title: "100% Pure & Fresh",
      desc: "We strictly bake with fresh dairy butter, Madagascar vanilla, organic chocolates, and seasonal fresh fruits."
    },
    {
      icon: <Cake size={26} />,
      title: "Custom Designer Artistry",
      desc: "From delicate multi-tiered wedding cakes to themed birthday centerpieces, our pastry artists turn dreams into edible art."
    },
    {
      icon: <ShieldCheck size={26} />,
      title: "Zero Preservatives",
      desc: "No chemical additives or artificial shelf-extenders. Everything on our counter is baked fresh daily in small batches."
    }
  ];

  return (
    <div className={styles.page}>
      {/* 1. Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <span className={styles.heroTag}>✦ OUR SWEET HERITAGE</span>
          <h1 className={styles.heroTitle}>Baking Memories, One Celebration at a Time</h1>
          <p className={styles.heroSubtitle}>
            What started as a heartfelt kitchen experiment in Vijayawada has evolved into a premier boutique dessert studio known for unmatched craftsmanship and irresistible flavors.
          </p>
        </div>
      </section>

      {/* 2. Story Split Section */}
      <section className={styles.storySection}>
        <div className={styles.storyContainer}>
          <div className={styles.storyGrid}>
            <div className={styles.storyText}>
              <span className={styles.sectionTag}>THE GENESIS</span>
              <h2>Born Out of a Deep Passion for Authentic Baking</h2>
              <p>
                At Bake Factory, we believe that true baking is both an art and a science. Founded by lifelong culinary enthusiasts, our mission has always been simple: create desserts that taste as extraordinary as they look.
              </p>
              <p>
                From the crisp flake of our artisanal crusts to the velvety smooth crumb of our celebration cakes, each recipe undergoes meticulous testing to achieve the perfect balance of richness, moisture, and aroma.
              </p>
              <div className={styles.quoteBox}>
                <p className={styles.quoteText}>
                  "We don't simply bake cakes; we craft the centerpiece for your life's most precious memories."
                </p>
                <span className={styles.quoteAuthor}>— Head Pastry Chef & Founders, Bake Factory</span>
              </div>
            </div>

            <div className={styles.storyVisual}>
              <div className={styles.visualCardMain}>
                <div 
                  className={styles.storyImg} 
                  style={{ backgroundImage: `url('/hero-banner.jpg')` }}
                />
                <div className={styles.storyStatBadge}>
                  <Sparkles size={20} className={styles.badgeGoldIcon} />
                  <div>
                    <strong>10,000+</strong>
                    <span>Celebrations Sweetened</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4 Core Pillars of Excellence */}
      <section className={styles.pillarsSection}>
        <div className={styles.pillarsContainer}>
          <div className={styles.centerHeader}>
            <span className={styles.sectionTag}>THE BAKE FACTORY PHILOSOPHY</span>
            <h2>Our Four Pillars of Quality</h2>
            <p>Every single creation that leaves our ovens adheres to our uncompromising standards.</p>
          </div>

          <div className={styles.pillarsGrid}>
            {pillars.map((pillar, idx) => (
              <div key={idx} className={styles.pillarCard}>
                <div className={styles.pillarIcon}>{pillar.icon}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Social & Connect Section */}
      <section className={styles.connectSection}>
        <div className={styles.connectCard}>
          <span className={styles.connectTag}>✦ CONNECT WITH OUR KITCHEN</span>
          <h2>Follow Our Baking Adventures</h2>
          <p>Peek behind the scenes in our bakery studio, watch custom cake decorating reels, and be the first to know about seasonal flavors.</p>
          <div className={styles.socialBtnRow}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialButton}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> Follow on Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialButton}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> Join on Facebook
            </a>
          </div>
        </div>
      </section>

      {/* 5. Bottom Call to Action */}
      <section className={styles.ctaStrip}>
        <div className={styles.ctaStripContainer}>
          <div>
            <h3>Ready to Experience Luxury in Every Bite?</h3>
            <p>Order online for fresh doorstep delivery or visit our bakery studio in Tadepalle.</p>
          </div>
          <Link href="/menu" className={styles.ctaMenuLink}>
            Explore Our Menu <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
