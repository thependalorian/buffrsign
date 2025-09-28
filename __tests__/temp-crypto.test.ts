
import { Crypto } from '../lib/crypto';

describe('Crypto Class Isolation Test', () => {
  let cryptoInstance: Crypto;

  beforeEach(() => {
    cryptoInstance = new Crypto();
  });

  it('should generate a key pair, sign data, and verify successfully', async () => {
    const { publicKey, privateKey } = await cryptoInstance.generateKeyPair();
    const data = 'test data to sign';
    const signature = await cryptoInstance.sign(data, privateKey);
    const isValid = await cryptoInstance.verify(data, signature, publicKey);

    expect(isValid).toBe(true);
  });
});
