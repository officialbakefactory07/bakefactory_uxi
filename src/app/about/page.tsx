"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Award,
  Heart,
  Sparkles,
  ShieldCheck,
  Cake,
  Clock,
  Phone,
  ArrowRight,
  Building2,
  CheckCircle2,
  Truck,
  Utensils,
  Flame,
  ChefHat,
  Leaf,
  Star,
  MapPin,
  Gift,
} from 'lucide-react';
import styles from './page.module.css';

export default function About() {
  const stats = [
    { value: '10,000+', label: 'Celebrations Sweetened', icon: Cake },
    { value: '100%', label: 'Pure Dairy Butter & Real Cocoa', icon: Heart },
    { value: '45–60m', label: 'Express Delivery Network', icon: Truck },
    { value: '4.9 ★', label: 'Over 1,200+ Foodie Reviews', icon: Star },
  ];

  const craftSteps = [
    {
      step: '01',
      title: 'Single-Origin Sourcing',
      subtitle: 'Pure Ingredients Only',
      desc: 'We source genuine Belgian couverture chocolate, fresh cultured cream butter, Madagascar bourbon vanilla, and hand-selected seasonal fruits. Zero palm oil, zero chemical premixes.',
      icon: Leaf,
    },
    {
      step: '02',
      title: 'Small-Batch Slow Baking',
      subtitle: 'Precision Temperature Craft',
      desc: 'Our sponges are baked daily in small batches with European heat circulation curves to guarantee unmatched moisture, airy sponge crumb, and heavenly aroma.',
      icon: Flame,
    },
    {
      step: '03',
      title: 'Master Pastry Artistry',
      subtitle: 'Hand-Sculpted Perfection',
      desc: 'Every celebration cake is intricately decorated by hand — from delicate French buttercream piping and mirror chocolate glazes to 24k edible gold leaf and custom fondant sculptures.',
      icon: ChefHat,
    },
    {
      step: '04',
      title: 'White-Glove Cold Transit',
      subtitle: 'Delivered In Pristine Condition',
      desc: 'Packaged in rigid, gold-foiled luxury gift boxes and delivered via shock-absorbing temperature-controlled riders across Vijayawada, Tadepalle & Undavalli.',
      icon: Truck,
    },
  ];

  const bentoStandards = [
    {
      title: 'Belgian Couverture Chocolate',
      tag: '54.5% – 70% DARK SILK',
      desc: 'We strictly melt authentic Belgian chocolate with pure cocoa butter for rich, melt-in-your-mouth ganache instead of cheap compound slabs.',
      icon: Award,
      badge: 'Gourmet Grade',
    },
    {
      title: '100% Pure Cultured Dairy',
      tag: 'FRESH MILK CREAM & BUTTER',
      desc: 'Every bite is enriched with fresh dairy butter and whipped dairy creams. We never use hydrogenated vegetable fats (Dalda/Vanaspati).',
      icon: Heart,
      badge: 'Zero Margarine',
    },
    {
      title: 'Eggless Mastery Without Compromise',
      tag: '100% VEGETARIAN FRIENDLY',
      desc: 'Our proprietary eggless sponge formulas achieve the exact same cloud-like softness, height, and velvety texture as classic European cakes.',
      icon: Sparkles,
      badge: 'Pure Veg Available',
    },
    {
      title: 'Daily Fresh Baking Promise',
      tag: 'OVEN-FRESH ON EVENT DAY',
      desc: 'Your celebration cake is baked fresh on the very morning of delivery. We never freeze sponges or deliver day-old leftover bakes.',
      icon: Clock,
      badge: 'Never Stored',
    },
    {
      title: 'FSSAI Certified Hygiene Standards',
      tag: 'REG. NO: 20126141002411',
      desc: 'Our boutique kitchen maintains daily hospital-grade sanitization protocols, UV water purification, and certified food handling protocols.',
      icon: ShieldCheck,
      badge: 'Certified Safe',
    },
    {
      title: 'Complimentary Celebration Kit',
      tag: 'FREE WITH EVERY CAKE',
      desc: 'Includes custom golden cake topper, matching designer birthday candles, cake knife, wooden cutlery, and your personalized greeting note.',
      icon: Gift,
      badge: 'All-In-One Box',
    },
  ];

  const specialtyCreations = [
    {
      title: 'Tiered Designer & Fondant Cakes',
      desc: 'From fairy-tale wedding tiers to whimsical birthday themes, our sugar artists bring any imagination to edible life.',
      link: '/menu?category=Cakes',
    },
    {
      title: 'European Gourmet Cheesecakes',
      desc: 'Baked New York style with Madagascar vanilla, wild blueberry swirls, and buttery Graham cracker crusts.',
      link: '/menu?category=Desserts',
    },
    {
      title: 'Artisanal Truffles & Jar Cakes',
      desc: 'Layered Belgian chocolate ganache, red velvet cream cheese cups, and Ferrero indulgence jars.',
      link: '/menu?category=Desserts',
    },
    {
      title: 'Oven-Fresh Cookies & Fudge Brownies',
      desc: 'Dark chocolate chunk cookies, sea-salt caramel brownies, and roasted almond tea companions.',
      link: '/menu?category=Cookies',
    },
  ];

  return (
    <div className={styles.page}>
      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className={styles.ambientGold} />
      <div className={styles.ambientCopper} />

      {/* ── 1. CINEMATIC HERO SECTION ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={styles.heroBadge}
          >
            <Sparkles size={14} className={styles.goldSparkle} />
            <span>ATELIER DE HAUTE PÂTISSERIE • VIJAYAWADA & TADEPALLE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={styles.heroTitle}
          >
            Crafted with Passion.
            <br />
            <span className={styles.heroTitleAccent}>Baked for Life&apos;s Grandest Moments.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={styles.heroSubtitle}
          >
            Where authentic European pastry technique meets pure, uncompromised indulgence. 
            Every tier, crumb, and ganache drizzle is sculpted in small daily batches using 
            100% fresh dairy butter, Belgian cocoa, and hand-selected fruits.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className={styles.heroBtnGroup}
          >
            <Link href="/menu" className={styles.primaryHeroBtn}>
              <span>Explore Artisanal Menu</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className={styles.secondaryHeroBtn}>
              <Phone size={17} />
              <span>Talk to Master Baker</span>
            </Link>
          </motion.div>
        </div>

        {/* ── STATS COUNTER STRIP ── */}
        <div className={styles.statsStripContainer}>
          <div className={styles.statsGrid}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={styles.statCard}>
                  <div className={styles.statIconCircle}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.statTextWrap}>
                    <strong className={styles.statValue}>{stat.value}</strong>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. THE GENESIS: ARTISANAL STORY (COLLAGE SPLIT) ── */}
      <section className={styles.storySection}>
        <div className={styles.storyContainer}>
          <div className={styles.storyGrid}>
            
            {/* Left Story Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.storyContent}
            >
              <div className={styles.sectionHeaderWrap}>
                <span className={styles.sectionKicker}>✦ OUR PHILOSOPHY & HERITAGE</span>
                <h2 className={styles.sectionTitle}>
                  Born from an Uncompromising Love for Authentic Baking
                </h2>
              </div>

              <p className={styles.storyParagraph}>
                At <strong>Bake Factory</strong>, we began with a sacred conviction: that a celebration centerpiece 
                should not merely look breathtaking &mdash; it must awaken the senses upon the very first bite.
              </p>

              <p className={styles.storyParagraph}>
                Frustrated by mass-market bakeries relying on chemical premixes, artificial cake improvers, 
                and hydrogenated fats, we dedicated our studio to European classical methods. We hand-whisk, 
                temperature-temper pure Belgian chocolates, and formulate proprietary sponges that melt gracefully on the tongue.
              </p>

              <div className={styles.pullQuoteCard}>
                <div className={styles.quoteMark}>“</div>
                <p className={styles.quoteBody}>
                  We do not simply bake cakes. We sculpt the sweet centerpiece of your family&apos;s 
                  most cherished memories, milestones, and dreams.
                </p>
                <div className={styles.quoteSignature}>
                  <strong>— Head Pastry Chef &amp; Founders</strong>
                  <span>Bake Factory Boutique Studio</span>
                </div>
              </div>

              {/* FSSAI Credential Pill */}
              <div className={styles.fssaiPill}>
                <ShieldCheck size={22} className={styles.fssaiIcon} />
                <div>
                  <strong>FSSAI Certified Food Safety Standards</strong>
                  <span>Govt. Registration No. <strong>20126141002411</strong> • Sterile Sanitized Atelier</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Collage */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.collageContainer}
            >
              {/* Main Showstopper Image (3-Tier Gold Cake) */}
              <div className={styles.mainImageFrame}>
                <Image
                  src="/about-cake.jpg"
                  alt="Bake Factory Artisanal 3-Tier Chocolate Cake"
                  width={600}
                  height={500}
                  className={styles.collageImgMain}
                  priority
                />
                <div className={styles.imageOverlayGradient} />
                <div className={styles.goldBadgeFloating}>
                  <Sparkles size={18} />
                  <div>
                    <strong>Handcrafted Daily</strong>
                    <span>24k Gold &amp; Wild Berries</span>
                  </div>
                </div>
              </div>

              {/* Secondary Chef Floating Image */}
              <div className={styles.secondaryImageFrame}>
                <Image
                  src="/about-chef.jpg"
                  alt="Master Pastry Chef Decorating Gourmet Desserts"
                  width={280}
                  height={220}
                  className={styles.collageImgSub}
                />
                <div className={styles.subImageBadge}>
                  <ChefHat size={16} />
                  <span>Master Patisserie</span>
                </div>
              </div>

              {/* Decorative Gold Corner Accent */}
              <div className={styles.goldBorderAccent} />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 3. THE 4-STAGE CRAFT JOURNEY ("FROM OVEN TO TABLE") ── */}
      <section className={styles.journeySection}>
        <div className={styles.storyContainer}>
          <div className={styles.centerSectionHeader}>
            <span className={styles.sectionKicker}>✦ THE ART OF PERFECTION</span>
            <h2 className={styles.sectionTitle}>How We Craft Your Masterpiece</h2>
            <p className={styles.centerSubtitle}>
              From responsible sourcing to temperature-regulated express doorstep delivery, 
              discover the craftsmanship poured into every creation.
            </p>
          </div>

          <div className={styles.journeyGrid}>
            {craftSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className={styles.journeyCard}
                >
                  <div className={styles.stepNumberBadge}>{step.step}</div>
                  <div className={styles.stepIconWrap}>
                    <Icon size={24} />
                  </div>
                  <span className={styles.stepSubtitle}>{step.subtitle}</span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. THE LUXURY BENTO STANDARDS SHOWCASE ── */}
      <section className={styles.bentoSection}>
        <div className={styles.storyContainer}>
          <div className={styles.centerSectionHeader}>
            <span className={styles.sectionKicker}>✦ THE BAKE FACTORY PROMISE</span>
            <h2 className={styles.sectionTitle}>Ingredients &amp; Standards We Never Compromise</h2>
            <p className={styles.centerSubtitle}>
              Transparency is the hallmark of gourmet culinary art. Here is exactly what goes into our cakes — and what stays out.
            </p>
          </div>

          <div className={styles.bentoGrid}>
            {bentoStandards.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className={styles.bentoCard}
                >
                  <div className={styles.bentoHeaderRow}>
                    <div className={styles.bentoIconBadge}>
                      <Icon size={22} />
                    </div>
                    <span className={styles.bentoBadgeTag}>{item.badge}</span>
                  </div>
                  <span className={styles.bentoTag}>{item.tag}</span>
                  <h3 className={styles.bentoTitle}>{item.title}</h3>
                  <p className={styles.bentoDesc}>{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. SIGNATURE CREATIONS PREVIEW ── */}
      <section className={styles.specialtiesSection}>
        <div className={styles.storyContainer}>
          <div className={styles.centerSectionHeader}>
            <span className={styles.sectionKicker}>✦ ATELIER PORTFOLIO</span>
            <h2 className={styles.sectionTitle}>Our Signature Offerings</h2>
            <p className={styles.centerSubtitle}>
              Tailored cakes and gourmet desserts for everyday cravings and grand once-in-a-lifetime milestones.
            </p>
          </div>

          <div className={styles.specialtiesGrid}>
            {specialtyCreations.map((spec, i) => (
              <Link href={spec.link} key={i} className={styles.specialtyCard}>
                <div className={styles.specialtyTop}>
                  <CheckCircle2 size={20} className={styles.specialtyCheck} />
                  <h3>{spec.title}</h3>
                </div>
                <p>{spec.desc}</p>
                <div className={styles.specialtyLinkRow}>
                  <span>Explore in Menu</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. OFFICIAL BUSINESS ENTITY & FSSAI PROFILE ── */}
      <section className={styles.legalProfileSection}>
        <div className={styles.storyContainer}>
          <div className={styles.legalBox}>
            <div className={styles.legalHeader}>
              <div className={styles.legalBadgeIcon}>
                <Award size={28} />
              </div>
              <div>
                <h2>Official Business Entity &amp; Statutory Standards</h2>
                <p>100% compliant with Indian food safety regulations, registered under the Food Safety and Standards Authority of India.</p>
              </div>
            </div>

            <div className={styles.legalGrid}>
              <div className={styles.legalGridItem}>
                <Building2 size={20} className={styles.legalIcon} />
                <div>
                  <strong>Legal Entity / FBO Name</strong>
                  <p>VENIGALLA THUSHITHA</p>
                  <span>Trade Brand: BAKE FACTORY</span>
                </div>
              </div>

              <div className={styles.legalGridItem}>
                <ShieldCheck size={20} className={styles.legalIcon} />
                <div>
                  <strong>FSSAI Registration Certificate</strong>
                  <p>Reg. No: 20126141002411</p>
                  <span>Govt. of Andhra Pradesh (Place of Issue: Guntur)</span>
                </div>
              </div>

              <div className={styles.legalGridItem}>
                <Utensils size={20} className={styles.legalIcon} />
                <div>
                  <strong>Category of Business</strong>
                  <p>Food Vending &amp; Bakery Confectionery</p>
                  <span>Cakes, Pastries, Desserts &amp; Quick Service</span>
                </div>
              </div>

              <div className={styles.legalGridItem}>
                <Clock size={20} className={styles.legalIcon} />
                <div>
                  <strong>Studio Operating Hours</strong>
                  <p>Mon &ndash; Sun: 9:00 AM &ndash; 10:30 PM</p>
                  <span>Direct Hotline: +91 79894 99446</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. LUXURY GRAND CTA ── */}
      <section className={styles.ctaGrandSection}>
        <div className={styles.ctaGrandContainer}>
          <span className={styles.ctaKicker}>✦ ELEVATE YOUR CELEBRATION</span>
          <h2 className={styles.ctaGrandTitle}>
            Ready to Experience the Artisanal Difference?
          </h2>
          <p className={styles.ctaGrandSubtitle}>
            Whether you need a last-minute same-day chocolate truffle cake or wish to 
            consult our head pastry artist for a bespoke tiered wedding centerpiece, 
            we are ready to make your sweet vision come true.
          </p>

          <div className={styles.ctaGrandBtnRow}>
            <Link href="/menu" className={styles.ctaPrimaryBtn}>
              <Sparkles size={18} />
              <span>Browse Live Menu &amp; Order</span>
              <ArrowRight size={18} />
            </Link>

            <Link href="/contact" className={styles.ctaSecondaryBtn}>
              <Phone size={17} />
              <span>Contact Bakery Atelier</span>
            </Link>
          </div>

          <div className={styles.ctaGuaranteesRow}>
            <span>✦ 100% Fresh Daily</span>
            <span>✦ Pure Dairy Butter</span>
            <span>✦ 45-Min Express Delivery</span>
            <span>✦ 100% Eggless Variations</span>
          </div>
        </div>
      </section>

    </div>
  );
}
