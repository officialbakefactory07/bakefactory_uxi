"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Award,
  Heart,
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
  Gift,
} from 'lucide-react';
import styles from './page.module.css';

export default function About() {
  const stats = [
    { value: '100% Fresh', label: 'Artisanal Handcrafted Bakes', icon: Cake },
    { value: '100%', label: 'Pure Dairy Butter & Real Cocoa', icon: Heart },
    { value: '45–60m', label: 'Express Delivery Network', icon: Truck },
    { value: '4.9 / 5', label: 'Top Customer Satisfaction Rating', icon: Star },
  ];

  const craftSteps = [
    {
      step: '01',
      title: 'Finest Natural Ingredients',
      subtitle: 'Pure Ingredients Only',
      desc: 'We use genuine Belgian couverture chocolate, fresh dairy butter, natural vanilla, and hand-selected seasonal fruits. Zero margarine, zero artificial premixes.',
      icon: Leaf,
    },
    {
      step: '02',
      title: 'Small-Batch Daily Baking',
      subtitle: 'Fresh Out of the Oven',
      desc: 'Our sponges are baked fresh daily in small batches to guarantee unmatched moisture, airy sponge texture, and mouth-watering freshness.',
      icon: Flame,
    },
    {
      step: '03',
      title: 'Artisan Pastry Decor',
      subtitle: 'Handcrafted with Love',
      desc: 'Every celebration cake is intricately finished by hand — from silky chocolate ganache drizzles and fresh whipped cream to custom birthday themes.',
      icon: ChefHat,
    },
    {
      step: '04',
      title: 'Safe Doorstep Delivery',
      subtitle: 'Delivered Fresh & Intact',
      desc: 'Packaged in sturdy luxury gift boxes and delivered carefully across Vijayawada, Tadepalle & Undavalli in 45–60 minutes.',
      icon: Truck,
    },
  ];

  const bentoStandards = [
    {
      title: 'Real Belgian Chocolate',
      tag: 'RICH COCOA BUTTER',
      desc: 'We strictly melt authentic Belgian chocolate with pure cocoa butter for rich, melt-in-your-mouth ganache instead of cheap compound chocolate.',
      icon: Award,
      badge: 'Gourmet Grade',
    },
    {
      title: '100% Pure Dairy Butter',
      tag: 'FRESH MILK CREAM & BUTTER',
      desc: 'Every bite is enriched with fresh dairy butter and whipped dairy creams. We never use hydrogenated vegetable fats (Dalda/Vanaspati).',
      icon: Heart,
      badge: 'Zero Margarine',
    },
    {
      title: 'Delicious Eggless Options',
      tag: '100% VEGETARIAN FRIENDLY',
      desc: 'Our eggless sponge recipes achieve the exact same cloud-like softness, height, and velvety texture that everyone loves.',
      icon: Leaf,
      badge: 'Pure Veg Available',
    },
    {
      title: 'Baked Fresh Every Morning',
      tag: 'OVEN-FRESH ON EVENT DAY',
      desc: 'Your celebration cake is baked fresh on the very morning of delivery. We never freeze sponges or deliver day-old leftover bakes.',
      icon: Clock,
      badge: 'Always Fresh',
    },
    {
      title: 'FSSAI Certified Hygiene',
      tag: 'REG. NO: 20126141002411',
      desc: 'Our kitchen maintains strict food safety standards, regular sanitization, and certified hygienic food preparation.',
      icon: ShieldCheck,
      badge: 'Certified Safe',
    },
    {
      title: 'Complimentary Party Kit',
      tag: 'FREE WITH EVERY CAKE',
      desc: 'Includes designer birthday candles, cake knife, wooden cutlery, and a personalized celebration greeting card.',
      icon: Gift,
      badge: 'All-In-One Box',
    },
  ];

  const specialtyCreations = [
    {
      title: 'Custom Birthday & Theme Cakes',
      desc: 'From colorful kids birthday themes to elegant milestone anniversary tiers, crafted exactly as you envision.',
      link: '/menu?category=Cakes',
    },
    {
      title: 'Gourmet Cheesecakes & Desserts',
      desc: 'Creamy baked New York cheesecakes with blueberry swirls and buttery biscuit crusts.',
      link: '/menu?category=Desserts',
    },
    {
      title: 'Dessert Jars & Chocolate Truffles',
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
            <ChefHat size={15} className={styles.goldSparkle} />
            <span>ARTISANAL BAKERY • VIJAYAWADA &amp; TADEPALLE</span>
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
            Real ingredients, pure dairy butter, and authentic bakery craft. 
            Every tier, crumb, and chocolate drizzle is baked fresh daily in small batches using 
            100% fresh dairy butter, rich Belgian cocoa, and hand-selected fruits.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className={styles.heroBtnGroup}
          >
            <Link href="/menu" className={styles.primaryHeroBtn}>
              <span>Explore Bakery Menu</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className={styles.secondaryHeroBtn}>
              <Phone size={17} />
              <span>Talk to Our Bakers</span>
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
                <span className={styles.sectionKicker}>OUR STORY &amp; PASSION</span>
                <h2 className={styles.sectionTitle}>
                  Baked with Love, Served with Pride
                </h2>
              </div>

              <p className={styles.storyParagraph}>
                At <strong>Bake Factory</strong>, we started with a clear belief: that a celebration cake 
                should not just look magnificent on the table &mdash; it must taste absolutely heavenly upon the very first bite.
              </p>

              <p className={styles.storyParagraph}>
                We prepare everything fresh using authentic bakery traditions. We hand-whisk fresh dairy cream, 
                melt rich Belgian chocolate, and bake tender, fluffy sponges that melt in your mouth. No premixes, no artificial compromises.
              </p>

              <div className={styles.pullQuoteCard}>
                <div className={styles.quoteMark}>“</div>
                <p className={styles.quoteBody}>
                  We do not simply bake cakes. We create the sweet centerpiece of your family&apos;s 
                  most cherished memories, birthdays, and celebrations.
                </p>
                <div className={styles.quoteSignature}>
                  <strong>— Bake Factory Bakers</strong>
                  <span>Vijayawada &amp; Tadepalle</span>
                </div>
              </div>

              {/* FSSAI Credential Pill */}
              <div className={styles.fssaiPill}>
                <ShieldCheck size={22} className={styles.fssaiIcon} />
                <div>
                  <strong>FSSAI Certified Food Safety Standards</strong>
                  <span>Govt. Registration No. <strong>20126141002411</strong> • Fresh Daily Preparation &amp; Strict Hygiene</span>
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
              {/* Main Showstopper Image (Cake) */}
              <div className={styles.mainImageFrame}>
                <Image
                  src="/about-cake.jpg"
                  alt="Bake Factory Artisanal Celebration Cake"
                  width={600}
                  height={500}
                  className={styles.collageImgMain}
                  priority
                />
                <div className={styles.imageOverlayGradient} />
                <div className={styles.goldBadgeFloating}>
                  <Heart size={18} />
                  <div>
                    <strong>Handcrafted Daily</strong>
                    <span>Fresh Cream &amp; Wild Berries</span>
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
                  <span>Master Pastry Chef</span>
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
            <span className={styles.sectionKicker}>OUR BAKING PROCESS</span>
            <h2 className={styles.sectionTitle}>How We Craft Your Cake</h2>
            <p className={styles.centerSubtitle}>
              From premium ingredients to safe doorstep delivery, 
              here is the care and craftsmanship poured into every single order.
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

      {/* ── 4. THE STANDARDS SHOWCASE ── */}
      <section className={styles.bentoSection}>
        <div className={styles.storyContainer}>
          <div className={styles.centerSectionHeader}>
            <span className={styles.sectionKicker}>THE BAKE FACTORY PROMISE</span>
            <h2 className={styles.sectionTitle}>Ingredients &amp; Standards We Swear By</h2>
            <p className={styles.centerSubtitle}>
              Quality and honesty are at the heart of our bakery. Here is what goes into our cakes &mdash; and what we strictly avoid.
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
            <span className={styles.sectionKicker}>OUR SPECIALTIES</span>
            <h2 className={styles.sectionTitle}>Our Signature Creations</h2>
            <p className={styles.centerSubtitle}>
              From fresh birthday cakes to gourmet dessert jars, discover our most loved bakery treats.
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
                  <strong>Bakery Operating Hours</strong>
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
          <span className={styles.ctaKicker}>CELEBRATE WITH BAKE FACTORY</span>
          <h2 className={styles.ctaGrandTitle}>
            Ready to Taste the Difference?
          </h2>
          <p className={styles.ctaGrandSubtitle}>
            Whether you need a rich chocolate truffle cake delivered in 45 minutes or want to 
            plan a custom celebration cake for a wedding or birthday, 
            our bakers are ready to bake for you.
          </p>

          <div className={styles.ctaGrandBtnRow}>
            <Link href="/menu" className={styles.ctaPrimaryBtn}>
              <Cake size={18} />
              <span>Browse Live Menu &amp; Order</span>
              <ArrowRight size={18} />
            </Link>

            <Link href="/contact" className={styles.ctaSecondaryBtn}>
              <Phone size={17} />
              <span>Contact Bake Factory</span>
            </Link>
          </div>

          <div className={styles.ctaGuaranteesRow}>
            <span>• 100% Fresh Daily</span>
            <span>• Pure Dairy Butter</span>
            <span>• 45–60 Min Delivery</span>
            <span>• Pure Veg Eggless Available</span>
          </div>
        </div>
      </section>

    </div>
  );
}
