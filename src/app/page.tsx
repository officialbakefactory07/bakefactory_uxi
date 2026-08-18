"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button/Button';
import { ChevronRight, Sparkles, Star, Award, ShieldCheck, Truck, Heart, ArrowRight, Clock, Cake } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function Home() {
  const [bakeryImage, setBakeryImage] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        setBakeryImage(snap.data().bakeryImage || '');
      }
    }, (err) => {
      console.error("Error listening to settings in Home page:", err);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'categories'), async (snap) => {
      if (snap.exists()) {
        setCategories(snap.data().categories || []);
      } else {
        const defaultCats = [
          {
            id: 'cakes',
            name: 'Cakes',
            tagline: 'Dry, Cool & Custom Designer',
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
            subcategories: [
              'Dry Cakes',
              'Cool Cakes',
              'Designed Cakes',
              'Fancy Cakes',
              'Semi Foundant Cakes',
              'Foundant Cakes'
            ]
          },
          {
            id: 'desserts',
            name: 'Desserts',
            tagline: 'Gourmet Sweet Indulgences',
            image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',
            subcategories: []
          },
          {
            id: 'cookies',
            name: 'Cookies',
            tagline: 'Oven-Fresh Butter Delights',
            image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
            subcategories: []
          },
          {
            id: 'combos',
            name: 'Combos',
            tagline: 'Celebration Boxes & Treats',
            image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80',
            subcategories: []
          }
        ];
        try {
          await setDoc(doc(db, 'settings', 'categories'), { categories: defaultCats });
          setCategories(defaultCats);
        } catch (err) {
          console.error("Error seeding categories:", err);
        }
      }
    });
    return () => unsub();
  }, []);

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Vijayawada",
      comment: "The customized chocolate truffle cake for our anniversary was sheer perfection! Rich flavor, delicate texture, and gorgeous presentation.",
      rating: 5,
      role: "Verified Customer"
    },
    {
      name: "Rajesh Varma",
      location: "Tadepalle",
      comment: "Best artisan bakery in the region. Their fondant craftsmanship and fresh fruit fillings are unmatched in Vijayawada.",
      rating: 5,
      role: "Regular Foodie"
    },
    {
      name: "Sneha Reddy",
      location: "Guntur",
      comment: "Ordered a 3-tier designer cake for my daughter's birthday. Every single guest complimented the taste. 10/10 recommend Bake Factory!",
      rating: 5,
      role: "Party Host"
    }
  ];

  return (
    <div className={styles.page}>
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeSparkle}>✦</span>
            <span>ARTISANAL BAKERY & DESSERT STUDIO</span>
          </div>

          <h1 className={styles.heroTitle}>
            Love at <span className={styles.goldItalic}>First Bite</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            Handcrafted desserts made with passion and unforgettable flavors. Experience luxury in every bite, right here in Vijayawada.
          </p>
          
          <div className={styles.ctaButtons}>
            <Link href="/menu">
              <button className={styles.exploreBtn}>
                Explore Menu <span className={styles.arrowIcon}>&rarr;</span>
              </button>
            </Link>
            <Link href="/about">
              <button className={styles.storyBtn}>Our Story</button>
            </Link>
          </div>
          
          <div className={styles.ratingSection}>
            <div className={styles.avatars}>
              <div className={styles.avatar} style={{ zIndex: 4, background: '#D4A017' }}>A</div>
              <div className={styles.avatar} style={{ zIndex: 3, background: '#8E44AD' }}>R</div>
              <div className={styles.avatar} style={{ zIndex: 2, background: '#2E7D32' }}>M</div>
              <div className={styles.avatarCount}>+10K</div>
            </div>
            <div className={styles.ratingInfo}>
              <div className={styles.stars}>
                <span className={styles.starGold}>★★★★★</span> <span className={styles.ratingNum}>4.9</span>
              </div>
              <div className={styles.ratingLabel}>LOVED BY 10,000+ DESSERT ENTHUSIASTS</div>
            </div>
          </div>
        </div>

        {/* Floating Feature Cards */}
        <div className={styles.heroFloatingCards}>
          <div className={styles.floatingCard}>
            <div className={styles.cardIconBadge}>✨</div>
            <div className={styles.cardInfo}>
              <strong>Oven-Fresh Daily</strong>
              <span>100% Pure Organic Ingredients</span>
            </div>
          </div>
          <div className={`${styles.floatingCard} ${styles.floatingCardSecondary}`}>
            <div className={styles.cardIconBadge}>🍰</div>
            <div className={styles.cardInfo}>
              <strong>Signature Cakes</strong>
              <span>Custom Designed for Celebrations</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Elevated Stats Bar */}
      <section className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>5+</span>
          <span className={styles.statLabel}>YEARS OF EXCELLENCE</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>50+</span>
          <span className={styles.statLabel}>GOURMET RECIPES</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>10K+</span>
          <span className={styles.statLabel}>HAPPY CLIENTS</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>100%</span>
          <span className={styles.statLabel}>FRESHLY BAKED</span>
        </div>
      </section>

      {/* 3. Featured Categories Collection */}
      <section className={styles.categories}>
        <div className={styles.sectionHeaderCenter}>
          <div className={styles.collectionHeading}>OUR SIGNATURE COLLECTION</div>
          <h2 className={styles.sectionTitle}>Indulge in Handcrafted Perfection</h2>
          <p className={styles.sectionSubtitle}>
            From velvety rich fondants to melt-in-the-mouth artisan pastries, explore our freshly baked creations.
          </p>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link 
                href={`/menu?category=${cat.id}`} 
                className={styles.categoryCard}
              >
                <div className={styles.imageContainer}>
                  <div className={styles.peekingBadge}>
                    <span>View &rarr;</span>
                  </div>
                  
                  <div 
                    className={styles.categoryImage} 
                    style={{ backgroundImage: `url(${cat.image})` }}
                  />
                </div>
                <h3 className={styles.categoryTitle}>{cat.name}</h3>
                <p className={styles.categoryTagline}>{cat.tagline}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className={styles.centerAction}>
          <Link href="/menu">
            <button className={styles.viewFullMenuBtn}>
              Explore Full Dessert Menu <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>

      {/* 4. Artisanal Philosophy / Why Choose Us */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeaderCenter}>
            <div className={styles.collectionHeading}>THE BAKE FACTORY STANDARD</div>
            <h2 className={styles.sectionTitle}>Why Dessert Lovers Choose Us</h2>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <Award size={28} />
              </div>
              <h3>Master Patisserie Quality</h3>
              <p>Every cake is sculpted by seasoned bakers using time-tested European techniques and premium chocolates.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <ShieldCheck size={28} />
              </div>
              <h3>100% Pure & Fresh</h3>
              <p>No artificial preservatives or frozen batters. Only fresh dairy butter, real vanilla, and organic fruits.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <Cake size={28} />
              </div>
              <h3>Bespoke Custom Designs</h3>
              <p>Dreaming of a custom theme, wedding masterpiece, or photo cake? We bring your celebration vision to life.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrap}>
                <Truck size={28} />
              </div>
              <h3>Safe & Timely Delivery</h3>
              <p>Temperature-controlled careful handling so your tiered creations arrive pristine and ready to celebrate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. About Story Snippet */}
      <section className={styles.aboutSnippet}>
        <div className={styles.aboutGrid}>
          <motion.div 
            className={styles.aboutText}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className={styles.collectionHeading}>OUR BAKERY HERITAGE</div>
            <h2>Crafted with Passion, Rooted in Love</h2>
            <p>
              At Bake Factory, we believe that every celebration deserves a touch of sweetness. Founded by passionate bakers in Vijayawada, we use only the finest natural ingredients to bring you recipes that have been perfected over time.
            </p>
            <p>
              From morning fresh cookies to showstopper multi-tier wedding cakes, our ovens never stop creating moments of pure delight.
            </p>

            <div className={styles.aboutHighlights}>
              <div className={styles.highlightItem}>
                <span className={styles.highlightDot}>✦</span>
                <span>FSSAI Certified Food Standards</span>
              </div>
              <div className={styles.highlightItem}>
                <span className={styles.highlightDot}>✦</span>
                <span>Eggless & Custom Dietary Options</span>
              </div>
            </div>

            <Link href="/about" className={styles.storyLinkBtn}>
              Read Our Full Story <ChevronRight size={18} />
            </Link>
          </motion.div>

          <motion.div 
            className={styles.aboutImageWrapper}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          >
            {bakeryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bakeryImage} alt="Bake Factory Bakery Studio" className={styles.aboutImage} />
            ) : (
              <div className={styles.aboutImagePlaceholder}>
                <div className={styles.placeholderImg}>
                  <Cake size={48} />
                  <span>Artisan Bakery Studio</span>
                </div>
              </div>
            )}
            <div className={styles.floatingStoryBadge}>
              <Award size={20} className={styles.goldBadgeIcon} />
              <div>
                <strong>Vijayawada's Favorite</strong>
                <span>Artisan Dessert House</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsContainer}>
          <div className={styles.sectionHeaderCenter}>
            <div className={styles.collectionHeading}>CUSTOMER LOVE</div>
            <h2 className={styles.sectionTitle}>Sweet Words from Our Patrons</h2>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((item, idx) => (
              <div key={idx} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>★★★★★</div>
                <p className={styles.testimonialText}>"{item.comment}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>{item.name[0]}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.location} • {item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call To Action Strip */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <span className={styles.ctaTag}>✦ READY FOR SOMETHING SWEET?</span>
            <h2>Order Your Custom Celebration Cake Today</h2>
            <p>Choose from our delicious catalog or speak directly with our head pastry chef for bespoke designs.</p>
            <div className={styles.ctaButtonRow}>
              <Link href="/menu">
                <button className={styles.ctaPrimaryBtn}>Order Online Now &rarr;</button>
              </Link>
              <Link href="/contact">
                <button className={styles.ctaSecondaryBtn}>Custom Cake Consultation</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
