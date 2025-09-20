/**
 * Signature Validation and Storage Tests
 * 
 * Purpose: Test signature validation, storage, and data integrity
 * Location: /__tests__/signature-validation-storage.test.ts
 * Features: Comprehensive validation and storage testing with TypeScript
 */

import { 
  Signature, 
  SignatureData, 
  SignatureType, 
  SignatureVerificationStatus,
  DigitalCertificate,
  BiometricData,
  Document,
  DocumentType,
  DocumentStatus,
  SignatureField,
  FieldType,
  FieldLocation,
  AuditEvent
} from '../lib/types';

// Mock storage interface
interface SignatureStorage {
  save(signature: Signature): Promise<Signature>;
  get(id: string): Promise<Signature | null>;
  update(id: string, updates: Partial<Signature>): Promise<Signature>;
  delete(id: string): Promise<boolean>;
  findByDocument(documentId: string): Promise<Signature[]>;
  findBySigner(signerId: string): Promise<Signature[]>;
}

// Mock validation service
class SignatureValidationService {
  validateSignatureData(data: SignatureData, type: SignatureType): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (type) {
      case SignatureType.ELECTRONIC:
        if (!data.image_url) {
          errors.push('Image URL is required for electronic signatures');
        }
        if (data.image_url && !this.isValidImageUrl(data.image_url)) {
          errors.push('Invalid image URL format');
        }
        break;

      case SignatureType.DIGITAL:
        if (!data.digital_signature) {
          errors.push('Digital signature data is required');
        }
        if (data.digital_signature && !this.isValidBase64(data.digital_signature)) {
          errors.push('Invalid digital signature format');
        }
        break;

      case SignatureType.BIOMETRIC:
        if (!data.biometric_data) {
          errors.push('Biometric data is required for biometric signatures');
        }
        if (data.biometric_data && !this.validateBiometricData(data.biometric_data)) {
          errors.push('Invalid biometric data');
        }
        break;

      case SignatureType.HANDWRITTEN:
        if (!data.image_url) {
          errors.push('Image URL is required for handwritten signatures');
        }
        if (data.image_url && !this.isValidImageUrl(data.image_url)) {
          errors.push('Invalid image URL format');
        }
        break;
    }

    // Common validations
    if (!data.verification_hash) {
      warnings.push('Verification hash is missing');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateSignatureIntegrity(signature: Signature): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!signature.id) errors.push('Signature ID is required');
    if (!signature.document_id) errors.push('Document ID is required');
    if (!signature.signer_id) errors.push('Signer ID is required');
    if (!signature.timestamp) errors.push('Timestamp is required');
    if (!signature.signature_data) errors.push('Signature data is required');

    // Validate timestamp format
    if (signature.timestamp && !this.isValidTimestamp(signature.timestamp)) {
      errors.push('Invalid timestamp format');
    }

    // Validate IP address
    if (signature.ip_address && !this.isValidIpAddress(signature.ip_address)) {
      warnings.push('Invalid IP address format');
    }

    // Validate signature data
    if (signature.signature_data) {
      const dataValidation = this.validateSignatureData(
        signature.signature_data, 
        signature.signature_type
      );
      errors.push(...dataValidation.errors);
      warnings.push(...dataValidation.warnings);
    }

    // Validate certificate for digital signatures
    if (signature.signature_type === SignatureType.DIGITAL && !signature.certificate_info) {
      errors.push('Certificate information is required for digital signatures');
    }

    if (signature.certificate_info && !this.validateCertificate(signature.certificate_info)) {
      errors.push('Invalid certificate information');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  private isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }

  private validateBiometricData(data: BiometricData): boolean {
    if (!data.type || !['fingerprint', 'face', 'voice'].includes(data.type)) {
      return false;
    }
    if (!data.data_hash || data.data_hash.length < 10) {
      return false;
    }
    if (!data.device_id || data.device_id.length < 5) {
      return false;
    }
    if (!data.timestamp || !this.isValidTimestamp(data.timestamp)) {
      return false;
    }
    return true;
  }

  private isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }

  private isValidIpAddress(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  private validateCertificate(cert: DigitalCertificate): boolean {
    if (!cert.issuer || cert.issuer.length < 3) return false;
    if (!cert.serial_number || cert.serial_number.length < 5) return false;
    if (!cert.valid_from || !this.isValidTimestamp(cert.valid_from)) return false;
    if (!cert.valid_until || !this.isValidTimestamp(cert.valid_until)) return false;
    if (!cert.public_key || cert.public_key.length < 10) return false;
    if (!cert.certificate_chain || cert.certificate_chain.length === 0) return false;
    return true;
  }
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Mock storage implementation
class MockSignatureStorage implements SignatureStorage {
  private signatures = new Map<string, Signature>();

  async save(signature: Signature): Promise<Signature> {
    this.signatures.set(signature.id, { ...signature });
    return signature;
  }

  async get(id: string): Promise<Signature | null> {
    return this.signatures.get(id) || null;
  }

  async update(id: string, updates: Partial<Signature>): Promise<Signature> {
    const existing = this.signatures.get(id);
    if (!existing) {
      throw new Error('Signature not found');
    }
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    this.signatures.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.signatures.delete(id);
  }

  async findByDocument(documentId: string): Promise<Signature[]> {
    return Array.from(this.signatures.values())
      .filter(sig => sig.document_id === documentId);
  }

  async findBySigner(signerId: string): Promise<Signature[]> {
    return Array.from(this.signatures.values())
      .filter(sig => sig.signer_id === signerId);
  }

  clear(): void {
    this.signatures.clear();
  }
}

// Enhanced signature service with validation and storage
class EnhancedSignatureService {
  private storage: SignatureStorage;
  private validator: SignatureValidationService;

  constructor(storage: SignatureStorage, validator: SignatureValidationService) {
    this.storage = storage;
    this.validator = validator;
  }

  async createSignature(
    documentId: string,
    signerId: string,
    signatureData: SignatureData,
    signatureType: SignatureType,
    ipAddress: string,
    userAgent: string
  ): Promise<{ signature: Signature; validation: ValidationResult }> {
    // Validate signature data
    const dataValidation = this.validator.validateSignatureData(signatureData, signatureType);
    if (!dataValidation.valid) {
      throw new Error(`Invalid signature data: ${dataValidation.errors.join(', ')}`);
    }

    // Create signature object
    const signature: Signature = {
      id: this.generateId(),
      document_id: documentId,
      signer_id: signerId,
      field_name: 'signature_field',
      signature_data: {
        ...signatureData,
        verification_hash: this.generateVerificationHash(documentId, signerId, signatureData)
      },
      signature_type: signatureType,
      timestamp: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
      verification_status: SignatureVerificationStatus.PENDING,
      certificate_info: signatureType === SignatureType.DIGITAL 
        ? await this.generateCertificate(signerId)
        : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate complete signature
    const signatureValidation = this.validator.validateSignatureIntegrity(signature);
    if (!signatureValidation.valid) {
      throw new Error(`Invalid signature: ${signatureValidation.errors.join(', ')}`);
    }

    // Save signature
    const savedSignature = await this.storage.save(signature);

    return {
      signature: savedSignature,
      validation: signatureValidation
    };
  }

  async updateSignature(
    signatureId: string,
    updates: Partial<Signature>
  ): Promise<{ signature: Signature; validation: ValidationResult }> {
    const existing = await this.storage.get(signatureId);
    if (!existing) {
      throw new Error('Signature not found');
    }

    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    const validation = this.validator.validateSignatureIntegrity(updated);
    
    if (!validation.valid) {
      throw new Error(`Invalid signature update: ${validation.errors.join(', ')}`);
    }

    const savedSignature = await this.storage.update(signatureId, updates);
    return {
      signature: savedSignature,
      validation
    };
  }

  async getSignature(signatureId: string): Promise<Signature | null> {
    return await this.storage.get(signatureId);
  }

  async getSignaturesByDocument(documentId: string): Promise<Signature[]> {
    return await this.storage.findByDocument(documentId);
  }

  async getSignaturesBySigner(signerId: string): Promise<Signature[]> {
    return await this.storage.findBySigner(signerId);
  }

  async deleteSignature(signatureId: string): Promise<boolean> {
    return await this.storage.delete(signatureId);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateVerificationHash(
    documentId: string,
    signerId: string,
    signatureData: SignatureData
  ): string {
    const data = `${documentId}:${signerId}:${JSON.stringify(signatureData)}`;
    return btoa(data).substr(0, 32);
  }

  private async generateCertificate(signerId: string): Promise<DigitalCertificate> {
    return {
      issuer: 'BuffrSign Certificate Authority',
      serial_number: this.generateId(),
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      public_key: 'mock-public-key-' + this.generateId(),
      certificate_chain: ['BuffrSign CA', 'Root CA']
    };
  }
}

describe('Signature Validation Service', () => {
  let validator: SignatureValidationService;

  beforeEach(() => {
    validator = new SignatureValidationService();
  });

  describe('Signature Data Validation', () => {
    it('should validate electronic signature data correctly', () => {
      // Arrange
      const validData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: 'hash123'
      };

      const invalidData: SignatureData = {
        image_url: 'invalid-url',
        verification_hash: 'hash123'
      };

      // Act
      const validResult = validator.validateSignatureData(validData, SignatureType.ELECTRONIC);
      const invalidResult = validator.validateSignatureData(invalidData, SignatureType.ELECTRONIC);

      // Assert
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('Invalid image URL format');
    });

    it('should validate digital signature data correctly', () => {
      // Arrange
      const validData: SignatureData = {
        digital_signature: btoa('valid-signature-data'),
        verification_hash: 'hash123'
      };

      const invalidData: SignatureData = {
        digital_signature: 'invalid-base64',
        verification_hash: 'hash123'
      };

      // Act
      const validResult = validator.validateSignatureData(validData, SignatureType.DIGITAL);
      const invalidResult = validator.validateSignatureData(invalidData, SignatureType.DIGITAL);

      // Assert
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('Invalid digital signature format');
    });

    it('should validate biometric signature data correctly', () => {
      // Arrange
      const validBiometric: BiometricData = {
        type: 'fingerprint',
        data_hash: 'biometric-hash-1234567890',
        device_id: 'device-12345',
        timestamp: new Date().toISOString()
      };

      const invalidBiometric: BiometricData = {
        type: 'invalid-type' as any,
        data_hash: 'short',
        device_id: '123',
        timestamp: 'invalid-timestamp'
      };

      const validData: SignatureData = {
        biometric_data: validBiometric,
        verification_hash: 'hash123'
      };

      const invalidData: SignatureData = {
        biometric_data: invalidBiometric,
        verification_hash: 'hash123'
      };

      // Act
      const validResult = validator.validateSignatureData(validData, SignatureType.BIOMETRIC);
      const invalidResult = validator.validateSignatureData(invalidData, SignatureType.BIOMETRIC);

      // Assert
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('Invalid biometric data');
    });

    it('should warn about missing verification hash', () => {
      // Arrange
      const dataWithoutHash: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      // Act
      const result = validator.validateSignatureData(dataWithoutHash, SignatureType.ELECTRONIC);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Verification hash is missing');
    });
  });

  describe('Signature Integrity Validation', () => {
    it('should validate complete signature integrity', () => {
      // Arrange
      const validSignature: Signature = {
        id: 'sig-123',
        document_id: 'doc-456',
        signer_id: '_user-789',
        field_name: 'signature_field',
        signature_data: {
          image_url: 'https://example.com/signature.png',
          verification_hash: 'hash123'
        },
        signature_type: SignatureType.ELECTRONIC,
        timestamp: new Date().toISOString(),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        verification_status: SignatureVerificationStatus.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Act
      const result = validator.validateSignatureIntegrity(validSignature);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      // Arrange
      const invalidSignature: Signature = {
        id: '',
        document_id: 'doc-456',
        signer_id: '_user-789',
        field_name: 'signature_field',
        signature_data: {
          image_url: 'https://example.com/signature.png',
          verification_hash: 'hash123'
        },
        signature_type: SignatureType.ELECTRONIC,
        timestamp: '',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        verification_status: SignatureVerificationStatus.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Act
      const result = validator.validateSignatureIntegrity(invalidSignature);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Signature ID is required');
      expect(result.errors).toContain('Timestamp is required');
    });

    it('should validate certificate for digital signatures', () => {
      // Arrange
      const validCertificate: DigitalCertificate = {
        issuer: 'Valid CA',
        serial_number: '123456789',
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        public_key: 'valid-public-key-1234567890',
        certificate_chain: ['CA1', 'CA2']
      };

      const invalidCertificate: DigitalCertificate = {
        issuer: 'CA',
        serial_number: '123',
        valid_from: 'invalid-date',
        valid_until: 'invalid-date',
        public_key: 'short',
        certificate_chain: []
      };

      const validSignature: Signature = {
        id: 'sig-123',
        document_id: 'doc-456',
        signer_id: '_user-789',
        field_name: 'signature_field',
        signature_data: {
          digital_signature: btoa('signature-data'),
          verification_hash: 'hash123'
        },
        signature_type: SignatureType.DIGITAL,
        timestamp: new Date().toISOString(),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        verification_status: SignatureVerificationStatus.PENDING,
        certificate_info: validCertificate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const invalidSignature: Signature = {
        ...validSignature,
        certificate_info: invalidCertificate
      };

      // Act
      const validResult = validator.validateSignatureIntegrity(validSignature);
      const invalidResult = validator.validateSignatureIntegrity(invalidSignature);

      // Assert
      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('Invalid certificate information');
    });
  });
});

describe('Signature Storage Service', () => {
  let storage: MockSignatureStorage;
  let service: EnhancedSignatureService;
  let validator: SignatureValidationService;

  beforeEach(() => {
    storage = new MockSignatureStorage();
    validator = new SignatureValidationService();
    service = new EnhancedSignatureService(storage, validator);
  });

  describe('Signature Creation with Validation', () => {
    it('should create and validate electronic signature', async () => {
      // Arrange
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      // Act
      const result = await service.createSignature(
        'doc-123',
        '_user-456',
        signatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      // Assert
      expect(result.signature).toBeDefined();
      expect(result.signature.signature_type).toBe(SignatureType.ELECTRONIC);
      expect(result.signature.document_id).toBe('doc-123');
      expect(result.signature.signer_id).toBe('_user-456');
      expect(result.validation.valid).toBe(true);
      expect(result.signature.signature_data.verification_hash).toBeDefined();
    });

    it('should create and validate digital signature with certificate', async () => {
      // Arrange
      const signatureData: SignatureData = {
        digital_signature: btoa('digital-signature-data'),
        verification_hash: ''
      };

      // Act
      const result = await service.createSignature(
        'doc-123',
        '_user-456',
        signatureData,
        SignatureType.DIGITAL,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      // Assert
      expect(result.signature).toBeDefined();
      expect(result.signature.signature_type).toBe(SignatureType.DIGITAL);
      expect(result.signature.certificate_info).toBeDefined();
      expect(result.signature.certificate_info?.issuer).toBe('BuffrSign Certificate Authority');
      expect(result.validation.valid).toBe(true);
    });

    it('should reject invalid signature data', async () => {
      // Arrange
      const invalidSignatureData: SignatureData = {
        image_url: 'invalid-url',
        verification_hash: ''
      };

      // Act & Assert
      await expect(
        service.createSignature(
          'doc-123',
          '_user-456',
          invalidSignatureData,
          SignatureType.ELECTRONIC,
          '192.168.1.1',
          'Mozilla/5.0'
        )
      ).rejects.toThrow('Invalid signature data: Invalid image URL format');
    });
  });

  describe('Signature Storage Operations', () => {
    let testSignature: Signature;

    beforeEach(async () => {
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      const result = await service.createSignature(
        'doc-123',
        '_user-456',
        signatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      testSignature = result.signature;
    });

    it('should retrieve signature by ID', async () => {
      // Act
      const retrieved = await service.getSignature(testSignature.id);

      // Assert
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(testSignature.id);
      expect(retrieved?.document_id).toBe('doc-123');
      expect(retrieved?.signer_id).toBe('_user-456');
    });

    it('should update signature with validation', async () => {
      // Arrange
      const updates = {
        verification_status: SignatureVerificationStatus.VERIFIED
      };

      // Act
      const result = await service.updateSignature(testSignature.id, updates);

      // Assert
      expect(result.signature.verification_status).toBe(SignatureVerificationStatus.VERIFIED);
      expect(result.validation.valid).toBe(true);
      expect(result.signature.updated_at).not.toBe(testSignature.updated_at);
    });

    it('should reject invalid signature updates', async () => {
      // Arrange
      const invalidUpdates = {
        timestamp: 'invalid-timestamp'
      };

      // Act & Assert
      await expect(
        service.updateSignature(testSignature.id, invalidUpdates)
      ).rejects.toThrow('Invalid signature update: Invalid timestamp format');
    });

    it('should find signatures by _document', async () => {
      // Arrange - Create another signature for the same document
      const signatureData2: SignatureData = {
        image_url: 'https://example.com/signature2.png',
        verification_hash: ''
      };

      await service.createSignature(
        'doc-123',
        '_user-789',
        signatureData2,
        SignatureType.ELECTRONIC,
        '192.168.1.2',
        'Mozilla/5.0'
      );

      // Act
      const signatures = await service.getSignaturesByDocument('doc-123');

      // Assert
      expect(signatures).toHaveLength(2);
      expect(signatures.every(sig => sig.document_id === 'doc-123')).toBe(true);
    });

    it('should find signatures by signer', async () => {
      // Arrange - Create another signature for the same signer
      const signatureData2: SignatureData = {
        image_url: 'https://example.com/signature2.png',
        verification_hash: ''
      };

      await service.createSignature(
        'doc-456',
        '_user-456',
        signatureData2,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      // Act
      const signatures = await service.getSignaturesBySigner('_user-456');

      // Assert
      expect(signatures).toHaveLength(2);
      expect(signatures.every(sig => sig.signer_id === '_user-456')).toBe(true);
    });

    it('should delete signature', async () => {
      // Act
      const deleted = await service.deleteSignature(testSignature.id);

      // Assert
      expect(deleted).toBe(true);
      
      const retrieved = await service.getSignature(testSignature.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Data Integrity Tests', () => {
    it('should maintain data integrity during updates', async () => {
      // Arrange
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      const result = await service.createSignature(
        'doc-123',
        '_user-456',
        signatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      const originalSignature = result.signature;

      // Act
      const updateResult = await service.updateSignature(originalSignature.id, {
        verification_status: SignatureVerificationStatus.VERIFIED
      });

      // Assert
      expect(updateResult.signature.id).toBe(originalSignature.id);
      expect(updateResult.signature.document_id).toBe(originalSignature.document_id);
      expect(updateResult.signature.signer_id).toBe(originalSignature.signer_id);
      expect(updateResult.signature.signature_data).toEqual(originalSignature.signature_data);
      expect(updateResult.signature.verification_status).toBe(SignatureVerificationStatus.VERIFIED);
      expect(updateResult.signature.updated_at).not.toBe(originalSignature.updated_at);
    });

    it('should handle concurrent signature creation', async () => {
      // Arrange
      const signatureData1: SignatureData = {
        image_url: 'https://example.com/signature1.png',
        verification_hash: ''
      };

      const signatureData2: SignatureData = {
        image_url: 'https://example.com/signature2.png',
        verification_hash: ''
      };

      // Act
      const [result1, result2] = await Promise.all([
        service.createSignature(
          'doc-123',
          '_user-456',
          signatureData1,
          SignatureType.ELECTRONIC,
          '192.168.1.1',
          'Mozilla/5.0'
        ),
        service.createSignature(
          'doc-123',
          '_user-789',
          signatureData2,
          SignatureType.ELECTRONIC,
          '192.168.1.2',
          'Mozilla/5.0'
        )
      ]);

      // Assert
      expect(result1.signature.id).not.toBe(result2.signature.id);
      expect(result1.signature.signer_id).toBe('_user-456');
      expect(result2.signature.signer_id).toBe('_user-789');
      expect(result1.validation.valid).toBe(true);
      expect(result2.validation.valid).toBe(true);
    });
  });
});
