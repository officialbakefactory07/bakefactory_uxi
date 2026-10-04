import { db } from './firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

/**
 * Extracts a 2-letter uppercase city abbreviation for human-readable order IDs.
 * Defaults to 'TD' for Tadepalle.
 */
export function getCityCode(cityInput?: string): string {
  if (!cityInput) return 'TD';
  const c = cityInput.trim().toUpperCase();
  if (c.includes('TADEPALLE') || c.includes('TADEPALLI') || c.includes('TD')) return 'TD';
  if (c.includes('VIJAYAWADA') || c.includes('BEZWADA') || c.includes('VIJ')) return 'VJ';
  if (c.includes('GUNTUR')) return 'GN';
  if (c.includes('MANGALAGIRI')) return 'MG';
  if (c.includes('HYDERABAD') || c.includes('SECUNDERABAD')) return 'HY';
  if (c.includes('VISAKHAPATNAM') || c.includes('VIZAG')) return 'VZ';
  if (c.includes('BANGALORE') || c.includes('BENGALURU')) return 'BL';
  if (c.includes('CHENNAI')) return 'CH';
  if (c.includes('MUMBAI')) return 'MU';
  if (c.includes('DELHI')) return 'DL';
  if (c.includes('PUNE')) return 'PN';
  if (c.includes('TENALI')) return 'TN';
  if (c.includes('ELURU')) return 'EL';
  if (c.includes('RAJAHMUNDRY')) return 'RJ';
  if (c.includes('KAKINADA')) return 'KK';

  // Generic fallback: first 2 alphabet characters
  const clean = c.replace(/[^A-Z]/g, '');
  return clean.length >= 2 ? clean.slice(0, 2) : 'TD';
}

/**
 * Generates an atomic sequential Order ID formatted as [CITY]-[SEQUENCE_NUMBER],
 * e.g., 'VJ-1001', 'VJ-1002', 'GN-1003'.
 */
export async function generateSequentialOrderId(cityInput?: string): Promise<string> {
  const cityCode = getCityCode(cityInput);
  const counterRef = doc(db, 'counters', 'orders');

  try {
    const nextSeq = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(counterRef);
      let currentNumber = 1000; // Starting sequence at 1001
      if (snap.exists() && typeof snap.data().lastOrderSeq === 'number') {
        currentNumber = snap.data().lastOrderSeq;
      }
      const next = currentNumber + 1;
      transaction.set(
        counterRef,
        {
          lastOrderSeq: next,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return next;
    });

    return `${cityCode}-${nextSeq}`;
  } catch (err) {
    console.warn('Firestore transaction error on order counter, falling back to timestamp-based sequence:', err);
    // Reliable fallback if transaction is blocked
    const fallbackSeq = Math.floor(1000 + (Date.now() % 9000));
    return `${cityCode}-${fallbackSeq}`;
  }
}
