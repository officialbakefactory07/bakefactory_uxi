import crypto from 'crypto';

export const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || '';
export const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || '';
export const PAYU_ENV = process.env.PAYU_ENV || 'prod'; // 'test' | 'prod'

// PayU payment endpoints
export const PAYU_PAYMENT_URL = PAYU_ENV === 'test' 
  ? 'https://test.payu.in/_payment' 
  : 'https://secure.payu.in/_payment';

/**
 * Generate SHA-512 Hash for PayU Payment Request
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayUHash(params: {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): string {
  const {
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = ''
  } = params;

  const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${PAYU_MERCHANT_SALT}`;

  return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Verify Response Hash from PayU Callback
 * Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * Or with additionalCharges if present: sha512(additionalCharges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUResponseHash(params: {
  status: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  additionalCharges?: string;
}): boolean {
  const {
    status,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    hash,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
    additionalCharges
  } = params;

  let hashSequence = `${PAYU_MERCHANT_SALT}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;

  if (additionalCharges) {
    hashSequence = `${additionalCharges}|${hashSequence}`;
  }

  const calculatedHash = crypto.createHash('sha512').update(hashSequence).digest('hex');
  return calculatedHash.toLowerCase() === hash.toLowerCase();
}
