import * as sodium from 'libsodium-wrappers';

export interface KeyPair {
  publicKey: string; // base64
  privateKey: string; // base64
}

export interface EncryptedMessage {
  ciphertext: string; // base64
  nonce: string; // base64
  senderPublicKey: string; // base64
}

let initialized = false;

async function ensureSodiumReady(): Promise<void> {
  if (!initialized) {
    await sodium.ready;
    initialized = true;
  }
}

/**
 * Generate a new key pair for a recipient
 */
export async function generateKeyPair(): Promise<KeyPair> {
  await ensureSodiumReady();
  const keyPair = sodium.crypto_box_keypair();
  return {
    publicKey: sodium.to_base64(keyPair.publicKey),
    privateKey: sodium.to_base64(keyPair.privateKey),
  };
}

/**
 * Encrypt a message using recipient's public key
 * Returns ciphertext, nonce, and ephemeral sender public key
 */
export async function encryptMessage(
  message: string,
  recipientPublicKey: string
): Promise<EncryptedMessage> {
  await ensureSodiumReady();

  // Generate ephemeral key pair for sender
  const ephemeralKeyPair = sodium.crypto_box_keypair();

  const messageBytes = sodium.from_string(message);
  const recipientPubKeyBytes = sodium.from_base64(recipientPublicKey);
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

  const ciphertext = sodium.crypto_box_easy(
    messageBytes,
    nonce,
    recipientPubKeyBytes,
    ephemeralKeyPair.privateKey
  );

  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce),
    senderPublicKey: sodium.to_base64(ephemeralKeyPair.publicKey),
  };
}

/**
 * Decrypt a message using recipient's private key
 */
export async function decryptMessage(
  encrypted: EncryptedMessage,
  recipientPrivateKey: string
): Promise<string> {
  await ensureSodiumReady();

  const ciphertextBytes = sodium.from_base64(encrypted.ciphertext);
  const nonceBytes = sodium.from_base64(encrypted.nonce);
  const senderPubKeyBytes = sodium.from_base64(encrypted.senderPublicKey);
  const recipientPrivKeyBytes = sodium.from_base64(recipientPrivateKey);

  const decrypted = sodium.crypto_box_open_easy(
    ciphertextBytes,
    nonceBytes,
    senderPubKeyBytes,
    recipientPrivKeyBytes
  );

  return sodium.to_string(decrypted);
}

/**
 * Hash data (for device fingerprints, IP addresses)
 */
export async function hashData(data: string, salt: string): Promise<string> {
  await ensureSodiumReady();
  const dataBytes = sodium.from_string(data + salt);
  const hash = sodium.crypto_generichash(32, dataBytes);
  return sodium.to_base64(hash);
}

/**
 * Generate a secure random token
 */
export async function generateToken(length: number = 32): Promise<string> {
  await ensureSodiumReady();
  const bytes = sodium.randombytes_buf(length);
  return sodium.to_base64(bytes).replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
}
