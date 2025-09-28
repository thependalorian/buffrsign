
import { ICrypto } from './interfaces';
import * as crypto from 'crypto';

export class Crypto implements ICrypto {
  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      }, (err, publicKey, privateKey) => {
        if (err) {
          console.error('Error generating key pair:', err);
          return reject(err);
        }
        console.log('Generated Key Pair - Public Key (first 50 chars):', publicKey.substring(0, 50));
        resolve({ publicKey, privateKey });
      });
    });
  }

  async sign(data: string, privateKey: string): Promise<string> {
    console.log('Signing data:', data);
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    const signature = sign.sign(Buffer.from(privateKey), 'base64');
    console.log('Generated Signature (first 50 chars):', signature.substring(0, 50));
    return signature;
  }

  async verify(data: string, signature: string, publicKey: string): Promise<boolean> {
    console.log('Verifying data:', data);
    console.log('Verifying Signature (first 50 chars):', signature.substring(0, 50));
    console.log('Verifying Public Key (first 50 chars):', publicKey.substring(0, 50));
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    const isValid = verify.verify(publicKey, signature, 'base64');
    console.log('Verification Result:', isValid);
    return isValid;
  }

  async hash(data: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

  async generateRandomBytes(size: number): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(size, (err, buf) => {
        if (err) {
          return reject(err);
        }
        resolve(buf.toString('hex'));
      });
    });
  }
}
