import crypto from 'crypto';

/**
 * Converts a decimal amount to AZUL integer format.
 * AZUL has no decimal point — last 2 digits are cents.
 * 150.00 → "15000" | 17483.21 → "1748321" | 0 → "000"
 */
export function toAzulAmount(amount: number): string {
  if (amount === 0) return '000';
  return Math.round(amount * 100).toString();
}

/**
 * Converts AZUL integer amount back to human-readable.
 * "15000" → "150.00"
 */
export function fromAzulAmount(raw: string): string {
  const n = parseInt(raw || '0', 10);
  return (n / 100).toFixed(2);
}

// ─── Core Hash Function ───────────────────────────────────────────────────────

/**
 * Generates the authentication hash for AZUL API requests.
 *
 * AZUL requires a hash of the concatenated fields and auth key, using HMAC-SHA512.
 * The fields should be in the order specified by AZUL documentation, and the auth key is appended at the end.
 * The resulting hash is returned as a hexadecimal string.
 * @param fields - An array of strings representing the fields to be included in the hash, in the correct order.
 * @param authKey - The authentication key provided by AZUL, used as the secret for HMAC.
 * @returns A hexadecimal string representing the generated hash for authentication.
 */
export function generateAuthHash(fields: string[], authKey: string): string {
  const concatenated = [...fields, authKey].join('');

  const msgBuffer = Buffer.from(concatenated, 'utf16le');
  const keyBuffer = Buffer.from(authKey, 'ascii');

  return crypto.createHmac('sha512', keyBuffer).update(msgBuffer).digest('hex');
}
