import crypto from 'crypto';

/**
 * Generates an authentication hash for AZUL payment requests by concatenating the specified fields and authentication key, encoding the result in UTF-16LE, and creating an HMAC using the SHA512 algorithm. This hash is used to authenticate requests to AZUL's API and must be generated according to their specifications to ensure successful payment processing.
 *
 * @param fields - An array of strings representing the fields required by AZUL for authentication, in the order specified by their documentation.
 * @param authKey - The authentication key provided by AZUL, used as the secret for generating the HMAC.
 * @returns A hexadecimal string representing the generated authentication hash, which can be included in AZUL API requests for secure authentication.
 */
export function generateAuthHash(fields: string[], authKey: string): string {
  /**
   * Step 1: Concatenate the fields and auth key into a single string. The fields should be in the order specified by AZUL documentation, and the auth key is appended at the end.
   */
  const concatenated = [...fields, authKey].join('');

  /**
   * Step 2: Create a buffer from the concatenated string using UTF-16LE encoding, as required by AZUL.
   */
  const msgBuffer = Buffer.from(concatenated, 'utf16le');

  /**
   * Step 3: Create a buffer from the auth key using ASCII encoding, which will be used as the secret for HMAC.
   */
  const keyBuffer = Buffer.from(authKey, 'ascii');

  /**
   * Step 4: Use the crypto module to create an HMAC object with the SHA512 algorithm and the auth key buffer as the secret. Update the HMAC with the message buffer and generate the digest in hexadecimal format.
   * Return the resulting hash as a hexadecimal string, which can be included in the AZUL API request for authentication.
   * The crypto.createHmac function creates an HMAC object using the specified algorithm and key. The update method is used to input the message data, and the digest method generates the final hash in the specified encoding (hex in this case).
   */
  return crypto.createHmac('sha512', keyBuffer).update(msgBuffer).digest('hex');
}
