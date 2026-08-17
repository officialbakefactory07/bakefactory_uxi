import React from 'react';
import styles from './page.module.css';

export const metadata = {
  title: 'About Us | Bake Factory',
  description: 'Learn about the founders behind Bake Factory and our baking journey.',
};

export default function About() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Our Story</h1>
        <p>Baked with love, crafted with passion.</p>
      </div>

      <div className={styles.container}>
        <section className={styles.contentSection}>
          <h2>The Founders</h2>
          <p>
            Bake Factory was born out of a shared passion for baking between two lifelong friends. 
            What started as a small kitchen experiment quickly blossomed into a fully-fledged 
            bakery dedicated to bringing joy to our community through delicious cakes, snacks, and desserts.
          </p>
          <p>
            Every recipe we use has been carefully crafted and tested to ensure the perfect balance of flavor 
            and texture. We believe in using only the highest quality ingredients, sourced locally whenever possible.
          </p>
        </section>

        <section className={styles.contentSection}>
          <h2>Our Philosophy</h2>
          <p>
            We don't just bake; we create memories. Whether it's a grand wedding cake, a simple birthday treat, 
            or a quick afternoon snack, we want every bite to remind you of home.
          </p>
        </section>

        <section className={styles.socialSection}>
          <h2>Connect With Us</h2>
          <p>Follow our baking journey on social media!</p>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink}>Instagram</a>
            <a href="#" className={styles.socialLink}>Facebook</a>
            <a href="#" className={styles.socialLink}>Twitter</a>
          </div>
        </section>
      </div>
    </div>
  );
}
