import crypto from 'crypto';

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
