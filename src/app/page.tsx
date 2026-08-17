"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { ChevronRight } from 'lucide-react';
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
            tagline: 'Dry, Cool & Fancy',
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
            tagline: 'Sweet Indulgences',
            image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',
            subcategories: []
          },
          {
            id: 'cookies',
            name: 'Cookies',
            tagline: 'Freshly Baked',
            image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
            subcategories: []
          },
          {
            id: 'combos',
            name: 'Combos',
            tagline: 'Perfect Pairings',
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

  return (
    <div className={styles.page}>
      {/* Hero Section */}
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
                Explore Menu <span className={styles.arrowIcon}>→</span>
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

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>5+</span>
          <span className={styles.statLabel}>YEARS</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>50+</span>
          <span className={styles.statLabel}>RECIPES</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>10K+</span>
          <span className={styles.statLabel}>CUSTOMERS</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>100%</span>
          <span className={styles.statLabel}>FRESH</span>
        </div>
      </div>

      {/* About Snippet */}
      <section className={styles.aboutSnippet}>
        <div className={styles.aboutGrid}>
          <motion.div 
            className={styles.aboutText}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2>Our Story</h2>
            <p>At Bake Factory, we believe that every celebration deserves a touch of sweetness. Founded by passionate bakers, we use only the finest ingredients to bring you recipes that have been perfected over time.</p>
            <Link href="/about" className={styles.linkButton}>
              Read more about us <ChevronRight size={16} />
            </Link>
          </motion.div>
          <motion.div 
            className={styles.aboutImageWrapper}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            {bakeryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bakeryImage} alt="Bake Factory Bakery" className={styles.aboutImage} />
            ) : (
              <div className={styles.aboutImagePlaceholder}>
                <div className={styles.placeholderImg}>Bakery Image</div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className={styles.categories}>
        <div className={styles.collectionHeading}>OUR COLLECTION</div>
        <h2 className={styles.sectionTitle}>Explore Categories</h2>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/menu?category=${cat.id}`} 
              className={styles.categoryCard}
            >
              <div className={styles.imageContainer}>
                {/* Peeking Badge */}
                <div className={styles.peekingBadge} />
                
                {/* Oval Image */}
                <div 
                  className={styles.categoryImage} 
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
              </div>
              <h3 className={styles.categoryTitle}>{cat.name}</h3>
              <p className={styles.categoryTagline}>{cat.tagline}</p>
            </Link>
          ))}
        </div>
        <div className={styles.centerAction}>
           <Link href="/menu">
             <Button variant="secondary">View Full Menu</Button>
           </Link>
        </div>
      </section>
    </div>
  );
}
