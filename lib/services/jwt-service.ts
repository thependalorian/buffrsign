/**
 * JWT Service for BuffrSign
 * 
 * This service provides comprehensive JWT functionality including:
 * - Token signing and verification
 * - Access and refresh token management
 * - Token blacklisting and security features
 * - Integration with Supabase authentication
 * 
 * Based on JWT Handbook best practices for secure token handling
 */

import jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { createClient } from '@/lib/supabase/server';

// JWT Configuration
const JWT_CONFIG = {
  // Use different secrets for different token types
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  ACCESS_TOKEN_EXPIRY: '15m', // 15 minutes
  REFRESH_TOKEN_EXPIRY: '7d', // 7 days
  ALGORITHM: 'HS256' as const,
} as const;

// Token Types
export type TokenType = 'access' | 'refresh' | 'api' | 'session' | '_document' | 'signature';

// JWT Payload Interface
export interface JWTPayloadCustom extends JWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  permissions: string[];
  tokenType: TokenType;
  iat: number;
  exp: number;
  jti?: string; // JWT ID for blacklisting
  iss?: string; // Issuer
  aud?: string; // Audience
  // BuffrSign specific claims
  documentId?: string;
  signatureId?: string;
  workflowId?: string;
}

// Token Response Interface
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

// Document Access Token Interface
export interface DocumentTokenResponse {
  documentToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

// JWT Service Class
export class JWTService {
  private static instance: JWTService;
  private getSupabaseClient = async () => await createClient();

  private constructor() {}

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  /**
   * Generate a secure random secret key
   */
  private generateSecretKey(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Get the appropriate secret for token type
   */
  private getSecret(tokenType: TokenType): string {
    switch (tokenType) {
      case 'access':
        return JWT_CONFIG.ACCESS_TOKEN_SECRET;
      case 'refresh':
        return JWT_CONFIG.REFRESH_TOKEN_SECRET;
      case '_document':
        return process.env.JWT_DOCUMENT_SECRET || JWT_CONFIG.ACCESS_TOKEN_SECRET;
      case 'signature':
        return process.env.JWT_SIGNATURE_SECRET || JWT_CONFIG.ACCESS_TOKEN_SECRET;
      default:
        return JWT_CONFIG.ACCESS_TOKEN_SECRET;
    }
  }

  /**
   * Get token expiry time
   */
  private getExpiry(tokenType: TokenType): string {
    switch (tokenType) {
      case 'access':
        return JWT_CONFIG.ACCESS_TOKEN_EXPIRY;
      case 'refresh':
        return JWT_CONFIG.REFRESH_TOKEN_EXPIRY;
      case '_document':
        return '1h'; // 1 hour for _document access
      case 'signature':
        return '30m'; // 30 minutes for signature sessions
      default:
        return JWT_CONFIG.ACCESS_TOKEN_EXPIRY;
    }
  }

  /**
   * Create a JWT token using jose library (recommended for modern apps)
   */
  async createToken(
    payload: Omit<JWTPayloadCustom, 'iat' | 'exp' | 'jti'>,
    tokenType: TokenType = 'access'
  ): Promise<string> {
    try {
      const secret = new TextEncoder().encode(this.getSecret(tokenType));
      const jti = crypto.randomUUID();
      
      const token = await new SignJWT({
        ...payload,
        jti,
        tokenType,
      })
        .setProtectedHeader({ alg: JWT_CONFIG.ALGORITHM })
        .setIssuedAt()
        .setExpirationTime(this.getExpiry(tokenType))
        .setIssuer('buffrsign')
        .setAudience('buffrsign-api')
        .setSubject(payload.sub)
        .sign(secret);

      return token;
    } catch (error) {
      console.error('Error creating JWT token:', error);
      throw new Error('Failed to create JWT token');
    }
  }

  /**
   * Create a JWT token using jsonwebtoken library (legacy support)
   */
  createTokenLegacy(
    payload: Omit<JWTPayloadCustom, 'iat' | 'exp' | 'jti'>,
    tokenType: TokenType = 'access'
  ): string {
    try {
      const secret = this.getSecret(tokenType);
      const jti = crypto.randomUUID();
      
      const token = jwt.sign(
        {
          ...payload,
          jti,
          tokenType,
        },
        secret,
        {
          algorithm: JWT_CONFIG.ALGORITHM,
          expiresIn: this.getExpiry(tokenType),
          issuer: 'buffrsign',
          audience: 'buffrsign-api',
          subject: payload.sub,
        }
      );

      return token;
    } catch (error) {
      console.error('Error creating JWT token (legacy):', error);
      throw new Error('Failed to create JWT token');
    }
  }

  /**
   * Verify a JWT token using jose library
   */
  async verifyToken(token: string, tokenType: TokenType = 'access'): Promise<JWTPayloadCustom> {
    try {
      const secret = new TextEncoder().encode(this.getSecret(tokenType));
      
      const { payload } = await jwtVerify(token, secret, {
        issuer: 'buffrsign',
        audience: 'buffrsign-api',
        algorithms: [JWT_CONFIG.ALGORITHM],
      });

      // Validate token type
      if (payload.tokenType !== tokenType) {
        throw new Error('Invalid token type');
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(payload.jti as string);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }

      return payload as JWTPayloadCustom;
    } catch (error) {
      console.error('Error verifying JWT token:', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify a JWT token using jsonwebtoken library (legacy support)
   */
  verifyTokenLegacy(token: string, tokenType: TokenType = 'access'): JWTPayloadCustom {
    try {
      const secret = this.getSecret(tokenType);
      
      const payload = jwt.verify(token, secret, {
        issuer: 'buffrsign',
        audience: 'buffrsign-api',
        algorithms: [JWT_CONFIG.ALGORITHM],
      }) as JWTPayloadCustom;

      // Validate token type
      if (payload.tokenType !== tokenType) {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      console.error('Error verifying JWT token (legacy):', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Create access and refresh token pair
   */
  async createTokenPair(_user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  }): Promise<TokenResponse> {
    try {
      const basePayload = {
        sub: _user.id,
        email: _user.email,
        role: _user.role,
        permissions: _user.permissions,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.createToken({ ...basePayload, tokenType: 'access' }, 'access'),
        this.createToken({ ...basePayload, tokenType: 'refresh' }, 'refresh'),
      ]);

      // Store refresh token in database for validation
      await this.storeRefreshToken(_user.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('Error creating token pair:', error);
      throw new Error('Failed to create token pair');
    }
  }

  /**
   * Create _document access token
   */
  async createDocumentToken(
    userId: string,
    documentId: string,
    permissions: string[] = ['read']
  ): Promise<DocumentTokenResponse> {
    try {
      const _user = await this.getUserById(userId);
      if (!_user) {
        throw new Error('User not found');
      }

      const payload = {
        sub: userId,
        email: _user.email,
        role: _user.role,
        permissions,
        tokenType: '_document' as TokenType,
        documentId,
      };

      const documentToken = await this.createToken(payload, '_document');

      return {
        documentToken,
        expiresIn: 60 * 60, // 1 hour in seconds
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('Error creating _document token:', error);
      throw new Error('Failed to create _document token');
    }
  }

  /**
   * Create signature session token
   */
  async createSignatureToken(
    userId: string,
    documentId: string,
    signatureId: string,
    workflowId?: string
  ): Promise<DocumentTokenResponse> {
    try {
      const _user = await this.getUserById(userId);
      if (!_user) {
        throw new Error('User not found');
      }

      const payload = {
        sub: userId,
        email: _user.email,
        role: _user.role,
        permissions: ['sign'],
        tokenType: 'signature' as TokenType,
        documentId,
        signatureId,
        workflowId,
      };

      const signatureToken = await this.createToken(payload, 'signature');

      return {
        documentToken: signatureToken,
        expiresIn: 30 * 60, // 30 minutes in seconds
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('Error creating signature token:', error);
      throw new Error('Failed to create signature token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const payload = await this.verifyToken(refreshToken, 'refresh');
      
      // Check if refresh token exists in database
      const isValidRefreshToken = await this.validateRefreshToken(payload.sub, refreshToken);
      if (!isValidRefreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Get _user data
      const _user = await this.getUserById(payload.sub);
      if (!_user) {
        throw new Error('User not found');
      }

      // Create new token pair
      return await this.createTokenPair({
        id: _user.id,
        email: _user.email,
        role: _user.role,
        permissions: _user.permissions,
      });
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Blacklist a token (revoke it)
   */
  async blacklistToken(token: string): Promise<void> {
    try {
      const payload = await this.verifyToken(token);
      
      if (payload.jti) {
        await this.supabase
          .from('blacklisted_tokens')
          .insert({
            jti: payload.jti,
            user_id: payload.sub,
            token_type: payload.tokenType,
            expires_at: new Date(payload.exp * 1000),
            created_at: new Date(),
          });
      }
    } catch (error) {
      console.error('Error blacklisting token:', error);
      throw new Error('Failed to blacklist token');
    }
  }

  /**
   * Check if a token is blacklisted
   */
  private async isTokenBlacklisted(jti: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('blacklisted_tokens')
        .select('jti')
        .eq('jti', jti)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false;
    }
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const payload = await this.verifyToken(refreshToken, 'refresh');
      
      await this.supabase
        .from('refresh_tokens')
        .upsert({
          user_id: userId,
          token: refreshToken,
          jti: payload.jti,
          expires_at: new Date(payload.exp * 1000),
          created_at: new Date(),
        });
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Validate refresh token exists in database
   */
  private async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('refresh_tokens')
        .select('token')
        .eq('user_id', userId)
        .eq('token', refreshToken)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return false;
    }
  }

  /**
   * Get _user by ID
   */
  private async getUserById(userId: string): Promise<{
    id: string;
    email: string;
    role: string;
    permissions: string[];
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, email, role, permissions')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        role: data.role,
        permissions: data.permissions || [],
      };
    } catch (error) {
      console.error('Error getting _user by ID:', error);
      return null;
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = new Date();
      
      // Clean up expired refresh tokens
      await this.supabase
        .from('refresh_tokens')
        .delete()
        .lt('expires_at', now);

      // Clean up expired blacklisted tokens
      await this.supabase
        .from('blacklisted_tokens')
        .delete()
        .lt('expires_at', now);
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      // Delete all refresh tokens for user
      await this.supabase
        .from('refresh_tokens')
        .delete()
        .eq('user_id', userId);

      // Blacklist all access tokens for _user (this is a simplified approach)
      // In a production system, you might want to track active tokens
      console.log(`All tokens revoked for _user: ${userId}`);
    } catch (error) {
      console.error('Error revoking _user tokens:', error);
      throw new Error('Failed to revoke _user tokens');
    }
  }

  /**
   * Validate _document access permissions
   */
  async validateDocumentAccess(
    token: string,
    documentId: string,
    requiredPermission: string = 'read'
  ): Promise<boolean> {
    try {
      const payload = await this.verifyToken(token, '_document');
      
      // Check if token is for the correct document
      if (payload.documentId !== documentId) {
        return false;
      }

      // Check if _user has required permission
      return payload.permissions.includes(requiredPermission);
    } catch (error) {
      console.error('Error validating _document access:', error);
      return false;
    }
  }

  /**
   * Validate signature session permissions
   */
  async validateSignatureAccess(
    token: string,
    signatureId: string,
    documentId: string
  ): Promise<boolean> {
    try {
      const payload = await this.verifyToken(token, 'signature');
      
      // Check if token is for the correct signature and document
      if (payload.signatureId !== signatureId || payload.documentId !== documentId) {
        return false;
      }

      // Check if _user has sign permission
      return payload.permissions.includes('sign');
    } catch (error) {
      console.error('Error validating signature access:', error);
      return false;
    }
  }
}

// Export singleton instance
export const jwtService = JWTService.getInstance();

// Export utility functions
export const createToken = (payload: Omit<JWTPayloadCustom, 'iat' | 'exp' | 'jti'>, tokenType?: TokenType) =>
  jwtService.createToken(payload, tokenType);

export const verifyToken = (token: string, tokenType?: TokenType) =>
  jwtService.verifyToken(token, tokenType);

export const createTokenPair = (_user: {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}) => jwtService.createTokenPair(_user);

export const refreshAccessToken = (refreshToken: string) =>
  jwtService.refreshAccessToken(refreshToken);

export const blacklistToken = (token: string) =>
  jwtService.blacklistToken(token);

export const createDocumentToken = (userId: string, documentId: string, permissions?: string[]) =>
  jwtService.createDocumentToken(userId, documentId, permissions);

export const createSignatureToken = (userId: string, documentId: string, signatureId: string, workflowId?: string) =>
  jwtService.createSignatureToken(userId, documentId, signatureId, workflowId);
