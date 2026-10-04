"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/Button/Button';
import {
  Star,
  ShieldCheck,
  Heart,
  ArrowRight,
  Clock,
  MessageSquarePlus,
  CheckCircle2,
  X,
  MapPin,
  MessageSquareHeart,
  ChefHat,
  Crown,
  Cake,
  Truck,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface CustomerReview {
  id: string;
  name: string;
  location: string;
  comment: string;
  rating: number;
  createdAt?: any;
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  cakes: '/category-cakes.jpg',
  desserts: '/category-desserts.jpg',
  cookies: '/category-cookies.jpg',
  combos: '/category-combos.jpg',
};

const DEFAULT_CATEGORIES = [
  {
    id: 'cakes',
    name: 'Artisanal Cakes',
    tagline: 'Dry, Cool & Custom Designer',
    image: '/category-cakes.jpg',
  },
  {
    id: 'desserts',
    name: 'Gourmet Desserts',
    tagline: 'Gourmet Sweet Indulgences',
    image: '/category-desserts.jpg',
  },
  {
    id: 'cookies',
    name: 'Butter Cookies',
    tagline: 'Oven-Fresh Butter Delights',
    image: '/category-cookies.jpg',
  },
  {
    id: 'combos',
    name: 'Celebration Combos',
    tagline: 'Celebration Boxes & Treats',
    image: '/category-combos.jpg',
  },
];

const resolveCategoryImage = (cat: any, fallbackImg?: string) => {
  const catId = (cat?.id || '').toLowerCase();
  if (catId && CATEGORY_IMAGE_MAP[catId]) {
    if (!cat?.image || cat.image.includes('unsplash') || cat.image.includes('photo-')) {
      return CATEGORY_IMAGE_MAP[catId];
    }
    return cat.image;
  }
  return cat?.image || fallbackImg || '/category-cakes.jpg';
};

export default function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  // Write Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewLocation, setReviewLocation] = useState('Vijayawada');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'categories'), async (snap) => {
      if (snap.exists()) {
        const rawCats = snap.data().categories || [];
        const normalized = rawCats.map((cat: any) => {
          const catId = (cat.id || '').toLowerCase();
          if (CATEGORY_IMAGE_MAP[catId] && (!cat.image || cat.image.includes('unsplash') || cat.image.includes('photo-'))) {
            return { ...cat, image: CATEGORY_IMAGE_MAP[catId] };
          }
          return cat;
        });
        setCategories(normalized.length > 0 ? normalized : DEFAULT_CATEGORIES);
      } else {
        const defaultCats = [
          {
            id: 'cakes',
            name: 'Cakes',
            tagline: 'Dry, Cool & Custom Designer',
            image: '/category-cakes.jpg',
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
            image: '/category-desserts.jpg',
            subcategories: []
          },
          {
            id: 'cookies',
            name: 'Cookies',
            tagline: 'Oven-Fresh Butter Delights',
            image: '/category-cookies.jpg',
            subcategories: []
          },
          {
            id: 'combos',
            name: 'Combos',
            tagline: 'Celebration Boxes & Treats',
            image: '/category-combos.jpg',
            subcategories: []
          }
        ];
        try {
          await setDoc(doc(db, 'settings', 'categories'), { categories: defaultCats });
          setCategories(defaultCats);
        } catch (err) {
          console.error("Error seeding categories:", err);
          setCategories(DEFAULT_CATEGORIES);
        }
      }
    });
    return () => unsub();
  }, []);

  // Real-time listener for Approved Customer Reviews ONLY
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'reviews'),
      (snap) => {
        const list: CustomerReview[] = [];
        snap.forEach((d) => {
          const data = d.data();
          if (data.status === 'approved') {
            list.push({
              id: d.id,
              name: data.name || 'Verified Customer',
              location: data.location || 'Vijayawada',
              comment: data.comment || '',
              rating: Number(data.rating) || 5,
              createdAt: data.createdAt,
            });
          }
        });
        setReviews(list);
        setReviewsLoading(false);
      },
      (err) => {
        console.error('Error fetching approved reviews:', err);
        setReviewsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Prefill review form if user is logged in
  useEffect(() => {
    if (user?.displayName) {
      setReviewName(user.displayName);
    }
  }, [user]);

  const handleOpenReviewModal = () => {
    setReviewSuccessMsg(false);
    if (user?.displayName) {
      setReviewName(user.displayName);
    }
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert('Please enter your name and review message.');
      return;
    }

    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        name: reviewName.trim(),
        location: reviewLocation.trim() || 'Vijayawada',
        rating: reviewRating,
        comment: reviewComment.trim(),
        userEmail: user?.email || '',
        userId: user?.uid || '',
        status: 'pending', // Requires admin approval before appearing on site!
        createdAt: serverTimestamp(),
      });

      setReviewSuccessMsg(true);
      setReviewComment('');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className={styles.page}>
      {/* 1. Hero Section - Bespoke Artisanal Atelier */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgePulseDot} />
            <span>EST. 2024 &bull; VIJAYAWADA&apos;S ARTISANAL ATELIER</span>
          </div>

          <h1 className={styles.heroTitle}>
            Where Celebrations <span className={styles.goldItalic}>Taste Extraordinary</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            From velvety Belgian chocolate gateaux and French butter pastries to bespoke tiered wedding cakes &mdash; baked fresh every dawn in Vijayawada with 100% pure dairy butter and real fruit compotes.
          </p>
          
          <div className={styles.ctaButtons}>
            <Link href="/menu">
              <button className={styles.exploreBtn}>
                <span>Order Fresh Today</span>
                <ArrowRight size={18} className={styles.arrowIcon} />
              </button>
            </Link>
            <Link href="/contact">
              <button className={styles.storyBtn}>
                <span>Custom Cake Enquiry</span>
              </button>
            </Link>
          </div>
          
          <div className={styles.trustBadge}>
            <div className={styles.trustStarsRow}>
              <div className={styles.starsCluster}>
                <Star size={15} fill="#D4A017" color="#D4A017" />
                <Star size={15} fill="#D4A017" color="#D4A017" />
                <Star size={15} fill="#D4A017" color="#D4A017" />
                <Star size={15} fill="#D4A017" color="#D4A017" />
                <Star size={15} fill="#D4A017" color="#D4A017" />
              </div>
              <span className={styles.trustRatingScore}>{avgRating}</span>
              <span className={styles.trustDivider}>&bull;</span>
              <span className={styles.trustHighlights}>
                {reviews.length > 0
                  ? `${reviews.length} Verified Patron Review${reviews.length > 1 ? 's' : ''}`
                  : '2,500+ Celebrations Made Special'}
              </span>
            </div>
            <div className={styles.trustTags}>
              <span className={styles.trustTag}>
                <CheckCircle2 size={13} className={styles.trustCheckIcon} /> 100% Pure Butter
              </span>
              <span className={styles.trustTag}>
                <CheckCircle2 size={13} className={styles.trustCheckIcon} /> Eggless Available
              </span>
              <span className={styles.trustTag}>
                <CheckCircle2 size={13} className={styles.trustCheckIcon} /> Same-Day Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Right Showcase: Mini Visual Category Strip (Compact Thumbnail Cards) */}
        <div className={styles.categoryStripContainer}>
          <div className={styles.categoryStripHeader}>
            <div className={styles.stripHeaderLeft}>
              <span className={styles.stripPulseDot} />
              <span className={styles.stripHeaderTag}>DAILY ATELIER PICKS</span>
            </div>
            <span className={styles.stripHeaderStatus}>Fresh From Oven</span>
          </div>

          <div className={styles.stripList}>
            {(categories.length > 0 ? categories.slice(0, 3) : DEFAULT_CATEGORIES).map((cat, idx) => {
              const fallback = DEFAULT_CATEGORIES[idx] || DEFAULT_CATEGORIES[0];
              const displayImage = resolveCategoryImage(cat, fallback.image);
              const displayTagline = cat.tagline || fallback.tagline;
              const displayBadge = idx === 0 ? 'Signature' : idx === 1 ? 'Popular' : 'Oven Fresh';

              return (
                <Link
                  key={cat.id}
                  href={`/menu?category=${cat.id}`}
                  className={styles.stripItem}
                >
                  <div className={styles.stripThumbWrap}>
                    <div
                      className={styles.stripThumb}
                      style={{ backgroundImage: `url(${displayImage})` }}
                    />
                    <span className={styles.stripMiniBadge}>{displayBadge}</span>
                  </div>

                  <div className={styles.stripMeta}>
                    <div className={styles.stripTitleRow}>
                      <h4 className={styles.stripName}>{cat.name}</h4>
                      <ArrowRight size={15} className={styles.stripArrow} />
                    </div>
                    <p className={styles.stripTagline}>{displayTagline}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className={styles.stripFooter}>
            <Link href="/menu" className={styles.stripExploreAllBtn}>
              <span>Explore All Treats</span>
              <ChevronRight size={15} />
            </Link>
            <span className={styles.stripHoursNote}>
              <Clock size={12} className={styles.stripClockIcon} /> Order before 6 PM for today
            </span>
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
                    style={{ backgroundImage: `url(${resolveCategoryImage(cat)})` }}
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

      {/* 4. The Atelier Heritage & Craft (Luxury About Section) */}
      <section className={styles.aboutAtelierSection}>
        <div className={styles.aboutAtelierContainer}>
          <div className={styles.aboutAtelierGrid}>
            
            {/* Left: Philosophy & Craft Story */}
            <motion.div 
              className={styles.aboutStoryCol}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.aboutBadgeRow}>
                <span className={styles.aboutPulseDot} />
                <span className={styles.aboutBadgeText}>OUR BAKERY PHILOSOPHY • EST. 2024</span>
              </div>

              <h2 className={styles.aboutMainTitle}>
                Where European Artistry Meets <span className={styles.goldItalic}>Pure Indulgence</span>
              </h2>

              <p className={styles.aboutLeadText}>
                At Bake Factory, every dessert is a celebration of uncompromising craftsmanship. 
                We refuse industrial premixes, artificial cake improvers, and hydrogenated fats &mdash; 
                instead honoring classical European baking where real flavor reigns supreme.
              </p>

              {/* 4 Culinary Pillars */}
              <div className={styles.pillarsGrid}>
                <div className={styles.pillarItem}>
                  <div className={styles.pillarIconCircle}>
                    <Heart size={18} />
                  </div>
                  <div className={styles.pillarText}>
                    <strong>100% Cultured Butter</strong>
                    <span>Pure dairy richness, zero margarine</span>
                  </div>
                </div>

                <div className={styles.pillarItem}>
                  <div className={styles.pillarIconCircle}>
                    <Crown size={18} />
                  </div>
                  <div className={styles.pillarText}>
                    <strong>Belgian Couverture</strong>
                    <span>Pure cocoa butter &amp; silky ganaches</span>
                  </div>
                </div>

                <div className={styles.pillarItem}>
                  <div className={styles.pillarIconCircle}>
                    <Leaf size={18} />
                  </div>
                  <div className={styles.pillarText}>
                    <strong>Real Vanilla &amp; Berries</strong>
                    <span>Farm-fresh compotes, no artificial syrup</span>
                  </div>
                </div>

                <div className={styles.pillarItem}>
                  <div className={styles.pillarIconCircle}>
                    <Clock size={18} />
                  </div>
                  <div className={styles.pillarText}>
                    <strong>Dawn-Baked Fresh</strong>
                    <span>Oven-fresh on your event day</span>
                  </div>
                </div>
              </div>

              <div className={styles.aboutCtaRow}>
                <Link href="/about">
                  <button className={styles.aboutDiscoverBtn}>
                    <span>Discover Our Story &amp; Standards</span>
                    <ArrowRight size={17} />
                  </button>
                </Link>
                <Link href="/contact" className={styles.aboutConsultLink}>
                  <span>Book Custom Consultation &rarr;</span>
                </Link>
              </div>
            </motion.div>

            {/* Right: Layered Visual Atelier Composition */}
            <motion.div 
              className={styles.aboutVisualCol}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.visualFrameWrap}>
                <div 
                  className={styles.visualMainPhoto} 
                  style={{ backgroundImage: `url('/category-cakes.jpg')` }}
                >
                  <div className={styles.visualOverlayGradient} />
                  <div className={styles.visualFloatingBadge}>
                    <ChefHat size={16} className={styles.goldIcon} />
                    <div>
                      <strong>Master Pastry Art</strong>
                      <span>Vijayawada Atelier</span>
                    </div>
                  </div>
                </div>

                {/* Floating Secondary Inset Card */}
                <div className={styles.visualSubCard}>
                  <div 
                    className={styles.visualSubPhoto} 
                    style={{ backgroundImage: `url('/about-chef.jpg')` }} 
                  />
                  <div className={styles.visualSubMeta}>
                    <div className={styles.starsSmall}>
                      <Star size={12} fill="#D4A017" color="#D4A017" />
                      <Star size={12} fill="#D4A017" color="#D4A017" />
                      <Star size={12} fill="#D4A017" color="#D4A017" />
                      <Star size={12} fill="#D4A017" color="#D4A017" />
                      <Star size={12} fill="#D4A017" color="#D4A017" />
                    </div>
                    <strong>10,000+ Celebrations</strong>
                    <span>Handcrafted in Vijayawada</span>
                  </div>
                </div>

                {/* Luxury Gold Border Accent */}
                <div className={styles.visualGoldBorder} />
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* 6. Authentic Customer Reviews (Admin Approved) */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsContainer}>
          <div className={styles.reviewsHeaderRow}>
            <div className={styles.sectionHeaderLeft}>
              <div className={styles.collectionHeading}>AUTHENTIC EXPERIENCES</div>
              <h2 className={styles.sectionTitle}>Sweet Words from Our Patrons</h2>
              <p className={styles.sectionSubtitle}>
                Real feedback from our dessert lovers in Vijayawada &amp; Tadepalle.
              </p>
            </div>

            <button className={styles.writeReviewBtn} onClick={handleOpenReviewModal}>
              <MessageSquarePlus size={18} />
              <span>Write a Review</span>
            </button>
          </div>

          {reviewsLoading ? (
            <div className={styles.loadingReviews}>
              <div className={styles.spinner} />
              <p>Loading customer reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.emptyReviewsCard}>
              <MessageSquareHeart size={44} className={styles.emptyHeartIcon} />
              <h3>Be the First to Review Bake Factory!</h3>
              <p>Have you enjoyed our cakes or desserts? Share your experience with the community.</p>
              <button className={styles.writeFirstReviewBtn} onClick={handleOpenReviewModal}>
                <Star size={16} fill="#23160E" /> Share Your Review
              </button>
            </div>
          ) : (
            <div className={styles.testimonialsGrid}>
              {reviews.map((item) => (
                <div key={item.id} className={styles.testimonialCard}>
                  <div className={styles.testimonialStars}>
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                  </div>
                  <p className={styles.testimonialText}>&ldquo;{item.comment}&rdquo;</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        <MapPin size={12} style={{ display: 'inline', marginRight: '2px' }} />
                        {item.location || 'Vijayawada'} &bull; Verified Customer
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Call To Action Strip */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <span className={styles.ctaTag}>READY FOR SOMETHING SWEET?</span>
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

      {/* Write a Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setReviewModalOpen(false)}>
            <motion.div
              className={styles.modalCard}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderLeft}>
                  <Star size={18} className={styles.goldIcon} />
                  <h3>Share Your Experience</h3>
                </div>
                <button
                  className={styles.modalCloseBtn}
                  onClick={() => setReviewModalOpen(false)}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {reviewSuccessMsg ? (
                <div className={styles.successBlock}>
                  <CheckCircle2 size={52} className={styles.successIcon} />
                  <h4>Thank You For Your Review!</h4>
                  <p>
                    Your review has been submitted for verification. It will appear on our homepage once approved by our bakery team.
                  </p>
                  <button
                    className={styles.doneBtn}
                    onClick={() => setReviewModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                  {/* Star Rating Picker */}
                  <div className={styles.ratingPickerGroup}>
                    <label>YOUR RATING</label>
                    <div className={styles.starsPicker}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={styles.starPickerBtn}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          aria-label={`${star} star`}
                        >
                          <Star
                            size={32}
                            className={
                              star <= (hoverRating || reviewRating)
                                ? styles.starFilledInteractive
                                : styles.starEmptyInteractive
                            }
                            fill={star <= (hoverRating || reviewRating) ? '#D4A017' : 'none'}
                          />
                        </button>
                      ))}
                      <span className={styles.ratingScoreText}>{reviewRating} / 5 Stars</span>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className={styles.formGroup}>
                    <label>YOUR NAME <span className={styles.req}>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      required
                      className={styles.formInput}
                    />
                  </div>

                  {/* Location */}
                  <div className={styles.formGroup}>
                    <label>CITY / LOCALITY</label>
                    <input
                      type="text"
                      placeholder="e.g. Vijayawada, Tadepalle, Guntur"
                      value={reviewLocation}
                      onChange={(e) => setReviewLocation(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Review Comments */}
                  <div className={styles.formGroup}>
                    <label>YOUR FEEDBACK / REVIEW <span className={styles.req}>*</span></label>
                    <textarea
                      rows={4}
                      placeholder="What did you love about our cakes, delivery, or dessert flavors?"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.moderationNotice}>
                    <ShieldCheck size={16} />
                    <span>All reviews are verified by our team before publishing to ensure genuine customer feedback.</span>
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setReviewModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className={styles.submitReviewBtn}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
