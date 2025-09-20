/**
 * Digital Signature Creation and Verification Tests
 * 
 * Purpose: Test digital signature creation, validation, storage, and verification
 * Location: /__tests__/digital-signature.test.ts
 * Features: Comprehensive testing of signature lifecycle with TypeScript
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

// Mock crypto functions for testing
const mockCrypto = {
  generateKeyPair: jest.fn(),
  sign: jest.fn(),
  verify: jest.fn(),
  hash: jest.fn(),
  generateRandomBytes: jest.fn()
};

// Mock database operations
const mockDatabase = {
  signatures: new Map<string, Signature>(),
  documents: new Map<string, Document>(),
  auditEvents: new Map<string, AuditEvent[]>(),
  
  saveSignature: jest.fn((signature: Signature) => {
    mockDatabase.signatures.set(signature.id, signature);
    return Promise.resolve(signature);
  }),
  
  getSignature: jest.fn((id: string) => {
    return Promise.resolve(mockDatabase.signatures.get(id));
  }),
  
  saveDocument: jest.fn((_document: Document) => {
    mockDatabase.documents.set(_document.id, _document);
    return Promise.resolve(_document);
  }),
  
  getDocument: jest.fn((id: string) => {
    return Promise.resolve(mockDatabase.documents.get(id));
  }),
  
  saveAuditEvent: jest.fn((event: AuditEvent) => {
    const events = mockDatabase.auditEvents.get(event.resource_id) || [];
    events.push(event);
    mockDatabase.auditEvents.set(event.resource_id, events);
    return Promise.resolve(event);
  })
};

// Digital Signature Service for testing
class DigitalSignatureService {
  private db = mockDatabase;
  private crypto = mockCrypto;

  async createSignature(
    documentId: string,
    signerId: string,
    signatureData: SignatureData,
    signatureType: SignatureType,
    ipAddress: string,
    userAgent: string
  ): Promise<Signature> {
    try {
      // Validate inputs
      if (!documentId || !signerId || !signatureData) {
        throw new Error('Missing required signature parameters');
      }

      // Get document
      const _document = await this.db.getDocument(documentId);
      if (!_document) {
        throw new Error('Document not found');
      }

      // Generate signature ID
      const signatureId = this.generateId();

      // Create digital certificate if needed
      const certificate = signatureType === SignatureType.DIGITAL 
        ? await this.generateDigitalCertificate(signerId)
        : undefined;

      // Generate verification hash
      const verificationHash = await this.generateVerificationHash(
        documentId, 
        signerId, 
        signatureData
      );

      // Create signature object
      const signature: Signature = {
        id: signatureId,
        document_id: documentId,
        signer_id: signerId,
        field_name: 'signature_field',
        signature_data: {
          ...signatureData,
          verification_hash: verificationHash
        },
        signature_type: signatureType,
        timestamp: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        verification_status: SignatureVerificationStatus.PENDING,
        certificate_info: certificate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save signature
      await this.db.saveSignature(signature);

      // Create audit event
      await this.createAuditEvent(
        signerId,
        'SIGNATURE_CREATED',
        'signature',
        signatureId,
        { signature_type: signatureType, document_id: documentId },
        ipAddress,
        userAgent
      );

      return signature;

    } catch (error) {
      console.error('Error creating signature:', error);
      throw error;
    }
  }

  async verifySignature(signatureId: string, documentId: string): Promise<{
    valid: boolean;
    verification_status: SignatureVerificationStatus;
    details: unknown;
  }> {
    try {
      // Get signature
      const signature = await this.db.getSignature(signatureId);
      if (!signature) {
        throw new Error('Signature not found');
      }

      // Verify signature data
      const isValid = await this.verifySignatureData(signature, documentId);

      // Update verification status
      const verificationStatus = isValid 
        ? SignatureVerificationStatus.VERIFIED 
        : SignatureVerificationStatus.FAILED;

      // Update signature
      signature.verification_status = verificationStatus;
      signature.updated_at = new Date().toISOString();
      await this.db.saveSignature(signature);

      // Create audit event
      await this.createAuditEvent(
        signature.signer_id,
        'SIGNATURE_VERIFIED',
        'signature',
        signatureId,
        { verification_status: verificationStatus, valid: isValid },
        signature.ip_address,
        signature.user_agent
      );

      return {
        valid: isValid,
        verification_status: verificationStatus,
        details: {
          signature_id: signatureId,
          document_id: documentId,
          signer_id: signature.signer_id,
          timestamp: signature.timestamp,
          certificate_valid: signature.certificate_info ? true : false
        }
      };

    } catch (error) {
      console.error('Error verifying signature:', error);
      throw error;
    }
  }

  async getSignatureAuditTrail(signatureId: string): Promise<AuditEvent[]> {
    const events = mockDatabase.auditEvents.get(signatureId) || [];
    return events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  private async generateDigitalCertificate(signerId: string): Promise<DigitalCertificate> {
    // Mock certificate generation
    return {
      issuer: 'BuffrSign Certificate Authority',
      serial_number: this.generateId(),
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      public_key: 'mock-public-key',
      certificate_chain: ['BuffrSign CA', 'Root CA']
    };
  }

  private async generateVerificationHash(
    documentId: string, 
    signerId: string, 
    signatureData: SignatureData
  ): Promise<string> {
    const data = `${documentId}:${signerId}:${JSON.stringify(signatureData)}`;
    return this.crypto.hash(data);
  }

  private async verifySignatureData(signature: Signature, documentId: string): Promise<boolean> {
    // Mock verification logic
    const expectedHash = await this.generateVerificationHash(
      documentId,
      signature.signer_id,
      signature.signature_data
    );
    
    return signature.signature_data.verification_hash === expectedHash;
  }

  private async createAuditEvent(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: unknown,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditEvent> {
    const event: AuditEvent = {
      id: this.generateId(),
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
      session_id: this.generateId(),
      severity: 'medium',
      compliance_related: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.db.saveAuditEvent(event);
    return event;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

describe('Digital Signature Service', () => {
  let signatureService: DigitalSignatureService;
  let testDocument: Document;
  let testSignatureField: SignatureField;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockDatabase.signatures.clear();
    mockDatabase.documents.clear();
    mockDatabase.auditEvents.clear();

    // Initialize service
    signatureService = new DigitalSignatureService();

    // Create test document
    testDocument = {
      id: 'test-doc-123',
      user_id: 'test-_user-456',
      title: 'Test Employment Contract',
      type: DocumentType.CONTRACT,
      status: DocumentStatus.PENDING_SIGNATURE,
      file_url: 'https://example.com/test-doc.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf',
      content_hash: 'abc123def456',
      metadata: {
        page_count: 5,
        language: 'en',
        created_by: 'test-_user-456',
        tags: ['contract', 'employment'],
        description: 'Test employment contract for signature testing'
      },
      signature_fields: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create test signature field
    testSignatureField = {
      id: 'field-1',
      name: 'Employee Signature',
      type: FieldType.SIGNATURE,
      required: true,
      location: {
        page: 1,
        x: 100,
        y: 200,
        width: 200,
        height: 50
      },
      placeholder_text: 'Please sign here'
    };

    testDocument.signature_fields = [testSignatureField];

    // Save test document
    mockDatabase.saveDocument(testDocument);
  });

  describe('Signature Creation', () => {
    it('should create an electronic signature successfully', async () => {
      // Arrange
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      // Act
      const signature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        signatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      // Assert
      expect(signature).toBeDefined();
      expect(signature.id).toBeDefined();
      expect(signature.document_id).toBe(testDocument.id);
      expect(signature.signer_id).toBe('test-_user-456');
      expect(signature.signature_type).toBe(SignatureType.ELECTRONIC);
      expect(signature.verification_status).toBe(SignatureVerificationStatus.PENDING);
      expect(signature.signature_data.verification_hash).toBeDefined();
      expect(signature.timestamp).toBeDefined();
      expect(signature.ip_address).toBe('192.168.1.1');
      expect(signature.user_agent).toBe('Mozilla/5.0 (Test Browser)');
    });

    it('should create a digital signature with certificate', async () => {
      // Arrange
      const signatureData: SignatureData = {
        digital_signature: 'base64-encoded-signature',
        verification_hash: ''
      };

      // Act
      const signature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        signatureData,
        SignatureType.DIGITAL,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      // Assert
      expect(signature).toBeDefined();
      expect(signature.signature_type).toBe(SignatureType.DIGITAL);
      expect(signature.certificate_info).toBeDefined();
      expect(signature.certificate_info?.issuer).toBe('BuffrSign Certificate Authority');
      expect(signature.certificate_info?.serial_number).toBeDefined();
      expect(signature.certificate_info?.valid_from).toBeDefined();
      expect(signature.certificate_info?.valid_until).toBeDefined();
    });

    it('should create a biometric signature', async () => {
      // Arrange
      const biometricData: BiometricData = {
        type: 'fingerprint',
        data_hash: 'biometric-hash-123',
        device_id: 'device-456',
        timestamp: new Date().toISOString()
      };

      const signatureData: SignatureData = {
        biometric_data: biometricData,
        verification_hash: ''
      };

      // Act
      const signature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        signatureData,
        SignatureType.BIOMETRIC,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      // Assert
      expect(signature).toBeDefined();
      expect(signature.signature_type).toBe(SignatureType.BIOMETRIC);
      expect(signature.signature_data.biometric_data).toBeDefined();
      expect(signature.signature_data.biometric_data?.type).toBe('fingerprint');
      expect(signature.signature_data.biometric_data?.data_hash).toBe('biometric-hash-123');
    });

    it('should throw error for missing _document', async () => {
      // Arrange
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      // Act & Assert
      await expect(
        signatureService.createSignature(
          'non-existent-doc',
          'test-_user-456',
          signatureData,
          SignatureType.ELECTRONIC,
          '192.168.1.1',
          'Mozilla/5.0 (Test Browser)'
        )
      ).rejects.toThrow('Document not found');
    });

    it('should throw error for missing required parameters', async () => {
      // Arrange
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      // Act & Assert
      await expect(
        signatureService.createSignature(
          '',
          'test-_user-456',
          signatureData,
          SignatureType.ELECTRONIC,
          '192.168.1.1',
          'Mozilla/5.0 (Test Browser)'
        )
      ).rejects.toThrow('Missing required signature parameters');
    });
  });

  describe('Signature Verification', () => {
    let testSignature: Signature;

    beforeEach(async () => {
      // Create a test signature
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      testSignature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        signatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );
    });

    it('should verify a valid signature successfully', async () => {
      // Act
      const verificationResult = await signatureService.verifySignature(
        testSignature.id,
        testDocument.id
      );

      // Assert
      expect(verificationResult.valid).toBe(true);
      expect(verificationResult.verification_status).toBe(SignatureVerificationStatus.VERIFIED);
      expect(verificationResult.details.signature_id).toBe(testSignature.id);
      expect(verificationResult.details.document_id).toBe(testDocument.id);
      expect(verificationResult.details.signer_id).toBe('test-_user-456');
    });

    it('should fail verification for non-existent signature', async () => {
      // Act & Assert
      await expect(
        signatureService.verifySignature('non-existent-signature', testDocument.id)
      ).rejects.toThrow('Signature not found');
    });

    it('should update signature verification status after verification', async () => {
      // Act
      await signatureService.verifySignature(testSignature.id, testDocument.id);

      // Assert
      const updatedSignature = await mockDatabase.getSignature(testSignature.id);
      expect(updatedSignature?.verification_status).toBe(SignatureVerificationStatus.VERIFIED);
      expect(updatedSignature?.updated_at).not.toBe(testSignature.updated_at);
    });
  });

  describe('Audit Trail', () => {
    let testSignature: Signature;

    beforeEach(async () => {
      // Create a test signature
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      testSignature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        signatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );
    });

    it('should create audit event for signature creation', async () => {
      // Act
      const auditTrail = await signatureService.getSignatureAuditTrail(testSignature.id);

      // Assert
      expect(auditTrail).toHaveLength(1);
      expect(auditTrail[0].action).toBe('SIGNATURE_CREATED');
      expect(auditTrail[0].user_id).toBe('test-_user-456');
      expect(auditTrail[0].resource_type).toBe('signature');
      expect(auditTrail[0].resource_id).toBe(testSignature.id);
      expect(auditTrail[0].details.signature_type).toBe(SignatureType.ELECTRONIC);
      expect(auditTrail[0].details.document_id).toBe(testDocument.id);
      expect(auditTrail[0].compliance_related).toBe(true);
    });

    it('should create audit event for signature verification', async () => {
      // Act
      await signatureService.verifySignature(testSignature.id, testDocument.id);
      const auditTrail = await signatureService.getSignatureAuditTrail(testSignature.id);

      // Assert
      expect(auditTrail).toHaveLength(2);
      expect(auditTrail[0].action).toBe('SIGNATURE_CREATED');
      expect(auditTrail[1].action).toBe('SIGNATURE_VERIFIED');
      expect(auditTrail[1].details.verification_status).toBe(SignatureVerificationStatus.VERIFIED);
      expect(auditTrail[1].details.valid).toBe(true);
    });

    it('should maintain chronological order of audit events', async () => {
      // Act
      await signatureService.verifySignature(testSignature.id, testDocument.id);
      const auditTrail = await signatureService.getSignatureAuditTrail(testSignature.id);

      // Assert
      expect(auditTrail).toHaveLength(2);
      const firstEvent = new Date(auditTrail[0].created_at);
      const secondEvent = new Date(auditTrail[1].created_at);
      expect(firstEvent.getTime()).toBeLessThanOrEqual(secondEvent.getTime());
    });
  });

  describe('Signature Data Validation', () => {
    it('should validate electronic signature data', async () => {
      // Arrange
      const validSignatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      // Act
      const signature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        validSignatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      // Assert
      expect(signature.signature_data.image_url).toBe(validSignatureData.image_url);
      expect(signature.signature_data.verification_hash).toBeDefined();
      expect(signature.signature_data.verification_hash).not.toBe('');
    });

    it('should validate digital signature data', async () => {
      // Arrange
      const validSignatureData: SignatureData = {
        digital_signature: 'base64-encoded-signature-data',
        verification_hash: ''
      };

      // Act
      const signature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        validSignatureData,
        SignatureType.DIGITAL,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      // Assert
      expect(signature.signature_data.digital_signature).toBe(validSignatureData.digital_signature);
      expect(signature.certificate_info).toBeDefined();
    });

    it('should validate biometric signature data', async () => {
      // Arrange
      const biometricData: BiometricData = {
        type: 'face',
        data_hash: 'face-recognition-hash-123',
        device_id: 'camera-device-789',
        timestamp: new Date().toISOString()
      };

      const validSignatureData: SignatureData = {
        biometric_data: biometricData,
        verification_hash: ''
      };

      // Act
      const signature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        validSignatureData,
        SignatureType.BIOMETRIC,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      // Assert
      expect(signature.signature_data.biometric_data).toBeDefined();
      expect(signature.signature_data.biometric_data?.type).toBe('face');
      expect(signature.signature_data.biometric_data?.data_hash).toBe('face-recognition-hash-123');
      expect(signature.signature_data.biometric_data?.device_id).toBe('camera-device-789');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      mockDatabase.saveSignature.mockRejectedValueOnce(new Error('Database connection failed'));
      
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      // Act & Assert
      await expect(
        signatureService.createSignature(
          testDocument.id,
          'test-_user-456',
          signatureData,
          SignatureType.ELECTRONIC,
          '192.168.1.1',
          'Mozilla/5.0 (Test Browser)'
        )
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle verification errors gracefully', async () => {
      // Arrange
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      const signature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        signatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      mockDatabase.getSignature.mockRejectedValueOnce(new Error('Database read error'));

      // Act & Assert
      await expect(
        signatureService.verifySignature(signature.id, testDocument.id)
      ).rejects.toThrow('Database read error');
    });
  });

  describe('Performance Tests', () => {
    it('should create signature within acceptable time', async () => {
      // Arrange
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      const startTime = Date.now();

      // Act
      await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        signatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should verify signature within acceptable time', async () => {
      // Arrange
      const signatureData: SignatureData = {
        image_url: 'https://example.com/signature.png',
        verification_hash: ''
      };

      const signature = await signatureService.createSignature(
        testDocument.id,
        'test-_user-456',
        signatureData,
        SignatureType.ELECTRONIC,
        '192.168.1.1',
        'Mozilla/5.0 (Test Browser)'
      );

      const startTime = Date.now();

      // Act
      await signatureService.verifySignature(signature.id, testDocument.id);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(executionTime).toBeLessThan(500); // Should complete within 500ms
    });
  });
});

describe('Digital Signature Integration Tests', () => {
  let signatureService: DigitalSignatureService;
  let testDocument: Document;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.signatures.clear();
    mockDatabase.documents.clear();
    mockDatabase.auditEvents.clear();

    signatureService = new DigitalSignatureService();

    testDocument = {
      id: 'integration-test-doc',
      user_id: 'integration-_user',
      title: 'Integration Test Contract',
      type: DocumentType.CONTRACT,
      status: DocumentStatus.PENDING_SIGNATURE,
      file_url: 'https://example.com/integration-test.pdf',
      file_size: 2048000,
      mime_type: 'application/pdf',
      content_hash: 'integration-hash-123',
      metadata: {
        page_count: 3,
        language: 'en',
        created_by: 'integration-_user',
        tags: ['integration', 'test'],
        description: 'Contract for integration testing'
      },
      signature_fields: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockDatabase.saveDocument(testDocument);
  });

  it('should complete full signature lifecycle', async () => {
    // Arrange
    const signatureData: SignatureData = {
      image_url: 'https://example.com/integration-signature.png',
      verification_hash: ''
    };

    // Act - Create signature
    const signature = await signatureService.createSignature(
      testDocument.id,
      'integration-_user',
      signatureData,
      SignatureType.ELECTRONIC,
      '10.0.0.1',
      'Integration Test Browser'
    );

    // Act - Verify signature
    const verificationResult = await signatureService.verifySignature(
      signature.id,
      testDocument.id
    );

    // Act - Get audit trail
    const auditTrail = await signatureService.getSignatureAuditTrail(signature.id);

    // Assert
    expect(signature).toBeDefined();
    expect(signature.verification_status).toBe(SignatureVerificationStatus.PENDING);
    
    expect(verificationResult.valid).toBe(true);
    expect(verificationResult.verification_status).toBe(SignatureVerificationStatus.VERIFIED);
    
    expect(auditTrail).toHaveLength(2);
    expect(auditTrail[0].action).toBe('SIGNATURE_CREATED');
    expect(auditTrail[1].action).toBe('SIGNATURE_VERIFIED');
  });

  it('should handle multiple signatures on same _document', async () => {
    // Arrange
    const signer1 = 'signer-1';
    const signer2 = 'signer-2';
    const signatureData1: SignatureData = {
      image_url: 'https://example.com/signer1-signature.png',
      verification_hash: ''
    };
    const signatureData2: SignatureData = {
      image_url: 'https://example.com/signer2-signature.png',
      verification_hash: ''
    };

    // Act
    const signature1 = await signatureService.createSignature(
      testDocument.id,
      signer1,
      signatureData1,
      SignatureType.ELECTRONIC,
      '192.168.1.1',
      'Browser 1'
    );

    const signature2 = await signatureService.createSignature(
      testDocument.id,
      signer2,
      signatureData2,
      SignatureType.ELECTRONIC,
      '192.168.1.2',
      'Browser 2'
    );

    // Assert
    expect(signature1.id).not.toBe(signature2.id);
    expect(signature1.signer_id).toBe(signer1);
    expect(signature2.signer_id).toBe(signer2);
    expect(signature1.document_id).toBe(testDocument.id);
    expect(signature2.document_id).toBe(testDocument.id);
  });
});
