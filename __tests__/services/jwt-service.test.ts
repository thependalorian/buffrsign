/**
 * JWT Service Tests for BuffrSign
 * 
 * This file contains comprehensive tests for the JWT service functionality
 * including _document and signature token management.
 */

import { JWTService, jwtService } from '../../lib/services/jwt-service';
import { createClient } from '../../lib/supabase/server';

// Mock Supabase client
jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-_user-id',
              email: 'test@example.com',
              role: '_user',
              permissions: ['read', 'write'],
            },
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        data: { id: 'test-token-id' },
        error: null,
      })),
      upsert: jest.fn(() => ({
        data: { id: 'test-token-id' },
        error: null,
      })),
      delete: jest.fn(() => ({
        data: null,
        error: null,
      })),
    })),
    rpc: jest.fn(() => ({
      data: null,
      error: null,
    })),
  })),
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-random-string'),
  })),
  randomUUID: jest.fn(() => 'mock-uuid'),
}));

describe('JWTService', () => {
  let service: JWTService;

  beforeEach(() => {
    service = JWTService.getInstance();
    jest.clearAllMocks();
  });

  describe('Token Creation', () => {
    it('should create an access token', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read', 'write'],
        tokenType: 'access' as const,
      };

      const token = await service.createToken(payload, 'access');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should create a _document token', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read', 'write'],
        tokenType: '_document' as const,
        documentId: 'test-_document-id',
      };

      const token = await service.createToken(payload, '_document');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should create a signature token', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['sign'],
        tokenType: 'signature' as const,
        documentId: 'test-_document-id',
        signatureId: 'test-signature-id',
        workflowId: 'test-workflow-id',
      };

      const token = await service.createToken(payload, 'signature');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should create a token pair', async () => {
      const _user = {
        id: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read', 'write'],
      };

      const tokenPair = await service.createTokenPair(_user);

      expect(tokenPair).toHaveProperty('accessToken');
      expect(tokenPair).toHaveProperty('refreshToken');
      expect(tokenPair).toHaveProperty('expiresIn');
      expect(tokenPair).toHaveProperty('tokenType', 'Bearer');
      expect(tokenPair.expiresIn).toBe(15 * 60); // 15 minutes
    });
  });

  describe('Document Token Management', () => {
    it('should create _document access token', async () => {
      const documentToken = await service.createDocumentToken(
        'test-_user-id',
        'test-_document-id',
        ['read', 'write']
      );

      expect(documentToken).toHaveProperty('documentToken');
      expect(documentToken).toHaveProperty('expiresIn');
      expect(documentToken).toHaveProperty('tokenType', 'Bearer');
      expect(documentToken.expiresIn).toBe(60 * 60); // 1 hour
    });

    it('should create signature session token', async () => {
      const signatureToken = await service.createSignatureToken(
        'test-_user-id',
        'test-_document-id',
        'test-signature-id',
        'test-workflow-id'
      );

      expect(signatureToken).toHaveProperty('documentToken');
      expect(signatureToken).toHaveProperty('expiresIn');
      expect(signatureToken).toHaveProperty('tokenType', 'Bearer');
      expect(signatureToken.expiresIn).toBe(30 * 60); // 30 minutes
    });

    it('should validate _document access', async () => {
      const documentToken = await service.createDocumentToken(
        'test-_user-id',
        'test-_document-id',
        ['read']
      );

      const hasAccess = await service.validateDocumentAccess(
        documentToken.documentToken,
        'test-_document-id',
        'read'
      );

      expect(hasAccess).toBe(true);
    });

    it('should validate signature access', async () => {
      const signatureToken = await service.createSignatureToken(
        'test-_user-id',
        'test-_document-id',
        'test-signature-id'
      );

      const canSign = await service.validateSignatureAccess(
        signatureToken.documentToken,
        'test-signature-id',
        'test-_document-id'
      );

      expect(canSign).toBe(true);
    });
  });

  describe('Token Verification', () => {
    it('should verify a valid access token', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read', 'write'],
        tokenType: 'access' as const,
      };

      const token = await service.createToken(payload, 'access');
      const verifiedPayload = await service.verifyToken(token, 'access');

      expect(verifiedPayload).toMatchObject({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        tokenType: payload.tokenType,
      });
    });

    it('should verify a valid _document token', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read'],
        tokenType: '_document' as const,
        documentId: 'test-_document-id',
      };

      const token = await service.createToken(payload, '_document');
      const verifiedPayload = await service.verifyToken(token, '_document');

      expect(verifiedPayload).toMatchObject({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        tokenType: payload.tokenType,
        documentId: payload.documentId,
      });
    });

    it('should verify a valid signature token', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['sign'],
        tokenType: 'signature' as const,
        documentId: 'test-_document-id',
        signatureId: 'test-signature-id',
        workflowId: 'test-workflow-id',
      };

      const token = await service.createToken(payload, 'signature');
      const verifiedPayload = await service.verifyToken(token, 'signature');

      expect(verifiedPayload).toMatchObject({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        tokenType: payload.tokenType,
        documentId: payload.documentId,
        signatureId: payload.signatureId,
        workflowId: payload.workflowId,
      });
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(service.verifyToken(invalidToken, 'access')).rejects.toThrow();
    });

    it('should throw error for wrong token type', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read', 'write'],
        tokenType: 'access' as const,
      };

      const token = await service.createToken(payload, 'access');

      await expect(service.verifyToken(token, '_document')).rejects.toThrow();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const _user = {
        id: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read', 'write'],
      };

      const tokenPair = await service.createTokenPair(_user);
      const newTokenPair = await service.refreshAccessToken(tokenPair.refreshToken);

      expect(newTokenPair).toHaveProperty('accessToken');
      expect(newTokenPair).toHaveProperty('refreshToken');
      expect(newTokenPair.accessToken).not.toBe(tokenPair.accessToken);
    });

    it('should throw error for invalid refresh token', async () => {
      const invalidRefreshToken = 'invalid.refresh.token';

      await expect(service.refreshAccessToken(invalidRefreshToken)).rejects.toThrow();
    });
  });

  describe('Token Blacklisting', () => {
    it('should blacklist an access token', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read', 'write'],
        tokenType: 'access' as const,
      };

      const token = await service.createToken(payload, 'access');
      
      // Should not throw
      await expect(service.blacklistToken(token)).resolves.not.toThrow();
    });

    it('should blacklist a _document token', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read'],
        tokenType: '_document' as const,
        documentId: 'test-_document-id',
      };

      const token = await service.createToken(payload, '_document');
      
      // Should not throw
      await expect(service.blacklistToken(token)).resolves.not.toThrow();
    });

    it('should blacklist a signature token', async () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['sign'],
        tokenType: 'signature' as const,
        documentId: 'test-_document-id',
        signatureId: 'test-signature-id',
      };

      const token = await service.createToken(payload, 'signature');
      
      // Should not throw
      await expect(service.blacklistToken(token)).resolves.not.toThrow();
    });

    it('should throw error when blacklisting invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(service.blacklistToken(invalidToken)).rejects.toThrow();
    });
  });

  describe('Token Cleanup', () => {
    it('should clean up expired tokens', async () => {
      // Should not throw
      await expect(service.cleanupExpiredTokens()).resolves.not.toThrow();
    });

    it('should revoke all _user tokens', async () => {
      const userId = 'test-_user-id';

      // Should not throw
      await expect(service.revokeAllUserTokens(userId)).resolves.not.toThrow();
    });
  });

  describe('Legacy Token Methods', () => {
    it('should create token using legacy method', () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read', 'write'],
        tokenType: 'access' as const,
      };

      const token = service.createTokenLegacy(payload, 'access');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should verify token using legacy method', () => {
      const payload = {
        sub: 'test-_user-id',
        email: 'test@example.com',
        role: '_user',
        permissions: ['read', 'write'],
        tokenType: 'access' as const,
      };

      const token = service.createTokenLegacy(payload, 'access');
      const verifiedPayload = service.verifyTokenLegacy(token, 'access');

      expect(verifiedPayload).toMatchObject({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        tokenType: payload.tokenType,
      });
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = JWTService.getInstance();
      const instance2 = JWTService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should return the same instance as exported singleton', () => {
      const instance = JWTService.getInstance();

      expect(instance).toBe(jwtService);
    });
  });

  describe('Document Access Validation', () => {
    it('should validate _document access with correct _document ID', async () => {
      const documentToken = await service.createDocumentToken(
        'test-_user-id',
        'test-_document-id',
        ['read']
      );

      const hasAccess = await service.validateDocumentAccess(
        documentToken.documentToken,
        'test-_document-id',
        'read'
      );

      expect(hasAccess).toBe(true);
    });

    it('should reject _document access with wrong _document ID', async () => {
      const documentToken = await service.createDocumentToken(
        'test-_user-id',
        'test-_document-id',
        ['read']
      );

      const hasAccess = await service.validateDocumentAccess(
        documentToken.documentToken,
        'wrong-_document-id',
        'read'
      );

      expect(hasAccess).toBe(false);
    });

    it('should reject _document access with insufficient permissions', async () => {
      const documentToken = await service.createDocumentToken(
        'test-_user-id',
        'test-_document-id',
        ['read']
      );

      const hasAccess = await service.validateDocumentAccess(
        documentToken.documentToken,
        'test-_document-id',
        'write'
      );

      expect(hasAccess).toBe(false);
    });
  });

  describe('Signature Access Validation', () => {
    it('should validate signature access with correct IDs', async () => {
      const signatureToken = await service.createSignatureToken(
        'test-_user-id',
        'test-_document-id',
        'test-signature-id'
      );

      const canSign = await service.validateSignatureAccess(
        signatureToken.documentToken,
        'test-signature-id',
        'test-_document-id'
      );

      expect(canSign).toBe(true);
    });

    it('should reject signature access with wrong signature ID', async () => {
      const signatureToken = await service.createSignatureToken(
        'test-_user-id',
        'test-_document-id',
        'test-signature-id'
      );

      const canSign = await service.validateSignatureAccess(
        signatureToken.documentToken,
        'wrong-signature-id',
        'test-_document-id'
      );

      expect(canSign).toBe(false);
    });

    it('should reject signature access with wrong _document ID', async () => {
      const signatureToken = await service.createSignatureToken(
        'test-_user-id',
        'test-_document-id',
        'test-signature-id'
      );

      const canSign = await service.validateSignatureAccess(
        signatureToken.documentToken,
        'test-signature-id',
        'wrong-_document-id'
      );

      expect(canSign).toBe(false);
    });
  });
});
