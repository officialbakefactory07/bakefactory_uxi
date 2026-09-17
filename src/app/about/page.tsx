import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, Heart, Sparkles, ShieldCheck, Cake, Clock, Users, ArrowRight, Building2, CheckCircle2, Truck, Utensils } from 'lucide-react';
import styles from './page.module.css';

export const metadata = {
  title: 'Our Story, Legal Entity & FSSAI Standards | Bake Factory',
  description: 'Discover the passion, FSSAI certified master bakers, and artisanal philosophy behind Bake Factory in Vijayawada.',
};

export default function About() {
  const pillars = [
    {
      icon: <Award size={26} />,
      title: "Master Patisserie Craft",
      desc: "Every dessert is sculpted with precision using traditional European pastry techniques perfected over years of baking."
    },
    {
      icon: <Heart size={26} />,
      title: "100% Pure & Fresh Dairy",
      desc: "We strictly bake with fresh dairy butter, premium chocolates, real fruit purees, and 100% vegetarian / eggless options."
    },
    {
      icon: <Cake size={26} />,
      title: "Custom Designer Artistry",
      desc: "From intricate fondant wedding tiers to handcrafted birthday centerpieces, our pastry artists turn celebration dreams into edible art."
    },
    {
      icon: <ShieldCheck size={26} />,
      title: "FSSAI Food Safety Standards",
      desc: "Operating strictly under FSSAI License No. 20124043000000 with zero harmful chemical preservatives and daily sanitized kitchens."
    }
  ];

  const services = [
    {
      title: "Custom Designer & Fondant Cakes",
      desc: "Bespoke celebration cakes tailored for birthdays, weddings, baby showers, and milestones. Available in eggless and regular variations."
    },
    {
      title: "Artisanal European Pastries & Cheesecakes",
      desc: "Single-origin chocolate truffle pastries, baked New York cheesecakes, blueberry swirl tarts, and gourmet mousse cups."
    },
    {
      title: "Oven-Fresh Cookies & Tea-Time Bakes",
      desc: "Chocochip cookies, almond butter crisps, dark fudge brownies, and savory tea companions baked in small daily batches."
    },
    {
      title: "Same-Day Express Delivery Services",
      desc: "Temperature-controlled 45–60 minute delivery network covering Vijayawada, Tadepalle, Mangalagiri, and adjacent pin codes."
    }
  ];

  return (
    <div className={styles.page}>
      {/* 1. Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <span className={styles.heroTag}>✦ OUR SWEET HERITAGE & LEGAL PROFILE</span>
          <h1 className={styles.heroTitle}>Baking Memories, One Celebration at a Time</h1>
          <p className={styles.heroSubtitle}>
            What started as a heartfelt kitchen experiment in Vijayawada has evolved into a premier boutique dessert studio known for unmatched craftsmanship, food safety excellence, and irresistible flavors.
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
                At <strong>Bake Factory</strong>, we believe that true baking is both an art and a science. Founded by culinary enthusiasts in Vijayawada, our mission has always been simple: create desserts that taste as extraordinary as they look.
              </p>
              <p>
                From the crisp flake of our artisanal crusts to the velvety smooth crumb of our celebration cakes, each recipe undergoes meticulous testing to achieve the perfect balance of richness, moisture, and aroma.
              </p>
              <div className={styles.quoteBox}>
                <p className={styles.quoteText}>
                  &ldquo;We don&apos;t simply bake cakes; we craft the centerpiece for your life&apos;s most precious memories.&rdquo;
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

      {/* 3. Official Business Registration & FSSAI Standards Section */}
      <section className={styles.legalSection}>
        <div className={styles.storyContainer}>
          <div className={styles.legalWrapper}>
            <div className={styles.legalHeader}>
              <Award size={28} className={styles.badgeGoldIcon} />
              <div>
                <h2>Official Business Entity & Food Safety Registration</h2>
                <p>Committed to 100% regulatory compliance, consumer transparency, and certified food hygiene standards.</p>
              </div>
            </div>

            <div className={styles.legalGrid}>
              <div className={styles.legalItem}>
                <Building2 size={22} className={styles.legalIcon} />
                <div>
                  <strong>Legal Business Entity</strong>
                  <p>Bake Factory</p>
                  <span>Trade Name: Bake Factory Artisanal Studio</span>
                </div>
              </div>

              <div className={styles.legalItem}>
                <Award size={22} className={styles.legalIcon} />
                <div>
                  <strong>FSSAI Registration / License</strong>
                  <p>License No: 20124043000000</p>
                  <span>Food Safety and Standards Authority of India</span>
                </div>
              </div>

              <div className={styles.legalItem}>
                <Utensils size={22} className={styles.legalIcon} />
                <div>
                  <strong>Business Category</strong>
                  <p>Artisanal Bakery & Confectionery</p>
                  <span>Cakes, Pastries, Desserts & Online Delivery</span>
                </div>
              </div>

              <div className={styles.legalItem}>
                <Clock size={22} className={styles.legalIcon} />
                <div>
                  <strong>Operating Schedule</strong>
                  <p>Monday &ndash; Sunday: 9:00 AM &ndash; 10:30 PM</p>
                  <span>Hotline: +91 79894 99446</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complete Products & Services Overview */}
      <section className={styles.servicesSection}>
        <div className={styles.pillarsContainer}>
          <div className={styles.centerHeader}>
            <span className={styles.sectionTag}>WHAT WE OFFER</span>
            <h2>Our Products & Confectionery Services</h2>
            <p>Handcrafted daily with fresh, high-grade ingredients and delivered across Vijayawada.</p>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((srv, idx) => (
              <div key={idx} className={styles.serviceCard}>
                <div className={styles.serviceCheck}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3>{srv.title}</h3>
                  <p>{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 4 Core Pillars of Excellence */}
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
                <div className={styles.pillarIconWrap}>
                  {pillar.icon}
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Banner */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2>Ready to Taste the Artisanal Difference?</h2>
          <p>Browse our live menu, customize your dream cake, or order fresh European pastries for doorstep delivery.</p>
          <div className={styles.ctaBtnRow}>
            <Link href="/menu" className={styles.primaryCtaBtn}>
              <span>Explore Our Menu</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className={styles.secondaryCtaBtn}>
              <span>Contact Bakery Studio</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
