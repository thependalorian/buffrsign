/**
 * JWT Middleware for BuffrSign API Routes
 * 
 * This middleware provides JWT authentication and authorization for API routes.
 * It integrates with the JWT service and provides comprehensive security features.
 * 
 * Features:
 * - Token verification and validation
 * - Role-based access control
 * - Permission-based authorization
 * - Document and signature access control
 * - Rate limiting integration
 * - Request logging and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtService, type JWTPayloadCustom, type TokenType } from '@/lib/services/jwt-service';
import { createClient } from '@/lib/supabase/server';

// Middleware Configuration
const MIDDLEWARE_CONFIG = {
  // Rate limiting configuration
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100, // 100 requests per window
  // Token validation
  ALLOWED_ALGORITHMS: ['HS256'],
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },
} as const;

// Request Context Interface
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayloadCustom;
  token?: string;
  tokenType?: TokenType;
  documentId?: string;
  signatureId?: string;
}

// Middleware Options Interface
export interface JWTMiddlewareOptions {
  requiredRole?: string;
  requiredPermissions?: string[];
  tokenType?: TokenType;
  allowExpired?: boolean;
  rateLimit?: boolean;
  logRequests?: boolean;
  // BuffrSign specific options
  requireDocumentAccess?: boolean;
  requireSignatureAccess?: boolean;
  documentIdParam?: string; // Parameter name for document ID
  signatureIdParam?: string; // Parameter name for signature ID
}

// Rate Limiting Store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * JWT Middleware Class
 */
export class JWTMiddleware {
  private getSupabaseClient = async () => await createClient();

  /**
   * Main middleware function
   */
  async authenticate(
    request: NextRequest,
    options: JWTMiddlewareOptions = {}
  ): Promise<NextResponse | null> {
    try {
      // Rate limiting check
      if (options.rateLimit !== false) {
        const rateLimitResponse = this.checkRateLimit(request);
        if (rateLimitResponse) {
          return this.addSecurityHeaders(rateLimitResponse);
        }
      }

      // Extract token from request
      const token = this.extractToken(request);
      if (!token) {
        return this.createErrorResponse('No token provided', 401);
      }

      // Verify token
      const payload = await this.verifyToken(token, options.tokenType);
      if (!payload) {
        return this.createErrorResponse('Invalid token', 401);
      }

      // Check role requirements
      if (options.requiredRole && !this.checkRole(payload, options.requiredRole)) {
        return this.createErrorResponse('Insufficient role', 403);
      }

      // Check permission requirements
      if (options.requiredPermissions && !this.checkPermissions(payload, options.requiredPermissions)) {
        return this.createErrorResponse('Insufficient permissions', 403);
      }

      // Check document access requirements
      if (options.requireDocumentAccess) {
        const documentId = this.extractDocumentId(request, options.documentIdParam);
        if (!documentId) {
          return this.createErrorResponse('Document ID required', 400);
        }

        const hasDocumentAccess = await this.checkDocumentAccess(payload, documentId, token);
        if (!hasDocumentAccess) {
          return this.createErrorResponse('Document access denied', 403);
        }

        (request as AuthenticatedRequest).documentId = documentId;
      }

      // Check signature access requirements
      if (options.requireSignatureAccess) {
        const signatureId = this.extractSignatureId(request, options.signatureIdParam);
        const documentId = this.extractDocumentId(request, options.documentIdParam);
        
        if (!signatureId || !documentId) {
          return this.createErrorResponse('Signature ID and Document ID required', 400);
        }

        const hasSignatureAccess = await this.checkSignatureAccess(payload, signatureId, documentId, token);
        if (!hasSignatureAccess) {
          return this.createErrorResponse('Signature access denied', 403);
        }

        (request as AuthenticatedRequest).signatureId = signatureId;
        (request as AuthenticatedRequest).documentId = documentId;
      }

      // Log request if enabled
      if (options.logRequests) {
        this.logRequest(request, payload);
      }

      // Add user context to request
      (request as AuthenticatedRequest).user = payload;
      (request as AuthenticatedRequest).token = token;
      (request as AuthenticatedRequest).tokenType = options.tokenType || 'access';

      return null; // Continue to next middleware/handler
    } catch (error) {
      console.error('JWT Middleware error:', error);
      return this.createErrorResponse('Authentication failed', 401);
    }
  }

  /**
   * Extract token from request headers
   */
  private extractToken(request: NextRequest): string | null {
    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookie (for web clients)
    const tokenCookie = request.cookies.get('access_token');
    if (tokenCookie) {
      return tokenCookie.value;
    }

    // Check query parameter (for specific use cases)
    const tokenParam = request.nextUrl.searchParams.get('token');
    if (tokenParam) {
      return tokenParam;
    }

    return null;
  }

  /**
   * Extract document ID from request
   */
  private extractDocumentId(request: NextRequest, paramName: string = 'documentId'): string | null {
    // Check URL path parameters
    const pathSegments = request.nextUrl.pathname.split('/');
    const documentIndex = pathSegments.findIndex(segment => segment === 'documents');
    if (documentIndex !== -1 && pathSegments[documentIndex + 1]) {
      return pathSegments[documentIndex + 1];
    }

    // Check query parameters
    const queryParam = request.nextUrl.searchParams.get(paramName);
    if (queryParam) {
      return queryParam;
    }

    // Check request body (for POST requests)
    // Note: This would require parsing the body, which is not available in middleware
    // This should be handled in the API route handler instead

    return null;
  }

  /**
   * Extract signature ID from request
   */
  private extractSignatureId(request: NextRequest, paramName: string = 'signatureId'): string | null {
    // Check URL path parameters
    const pathSegments = request.nextUrl.pathname.split('/');
    const signatureIndex = pathSegments.findIndex(segment => segment === 'signatures');
    if (signatureIndex !== -1 && pathSegments[signatureIndex + 1]) {
      return pathSegments[signatureIndex + 1];
    }

    // Check query parameters
    const queryParam = request.nextUrl.searchParams.get(paramName);
    if (queryParam) {
      return queryParam;
    }

    return null;
  }

  /**
   * Verify JWT token
   */
  private async verifyToken(token: string, tokenType?: TokenType): Promise<JWTPayloadCustom | null> {
    try {
      const payload = await jwtService.verifyToken(token, tokenType);
      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Check if user has required role
   */
  private checkRole(payload: JWTPayloadCustom, requiredRole: string): boolean {
    return payload.role === requiredRole || payload.role === 'admin';
  }

  /**
   * Check if user has required permissions
   */
  private checkPermissions(payload: JWTPayloadCustom, requiredPermissions: string[]): boolean {
    if (payload.role === 'admin') {
      return true; // Admin has all permissions
    }

    return requiredPermissions.every(permission => 
      payload.permissions.includes(permission)
    );
  }

  /**
   * Check document access permissions
   */
  private async checkDocumentAccess(
    payload: JWTPayloadCustom,
    documentId: string,
    token: string
  ): Promise<boolean> {
    try {
      // For document tokens, validate specific document access
      if (payload.tokenType === 'document') {
        return await jwtService.validateDocumentAccess(token, documentId, 'read');
      }

      // For regular access tokens, check user permissions and document ownership
      const supabase = await this.getSupabaseClient();
      const { data: document, error } = await supabase
        .from('documents')
        .select('id, owner_id, shared_with')
        .eq('id', documentId)
        .single();

      if (error || !document) {
        return false;
      }

      // Check if user is owner
      if (document.owner_id === payload.sub) {
        return true;
      }

      // Check if user is in shared_with list
      if (document.shared_with && Array.isArray(document.shared_with)) {
        return document.shared_with.includes(payload.sub);
      }

      return false;
    } catch (error) {
      console.error('Error checking document access:', error);
      return false;
    }
  }

  /**
   * Check signature access permissions
   */
  private async checkSignatureAccess(
    payload: JWTPayloadCustom,
    signatureId: string,
    documentId: string,
    token: string
  ): Promise<boolean> {
    try {
      // For signature tokens, validate specific signature access
      if (payload.tokenType === 'signature') {
        return await jwtService.validateSignatureAccess(token, signatureId, documentId);
      }

      // For regular access tokens, check signature permissions
      const supabase = await this.getSupabaseClient();
      const { data: signature, error } = await supabase
        .from('signatures')
        .select('id, signer_id, document_id, status')
        .eq('id', signatureId)
        .eq('document_id', documentId)
        .single();

      if (error || !signature) {
        return false;
      }

      // Check if user is the designated signer
      if (signature.signer_id === payload.sub) {
        return true;
      }

      // Check if user has admin role
      if (payload.role === 'admin') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking signature access:', error);
      return false;
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(request: NextRequest): NextResponse | null {
    const clientId = this.getClientId(request);
    const now = Date.now();

    // Clean up old entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }

    // Get current count
    const current = rateLimitStore.get(clientId);
    if (!current || current.resetTime < now) {
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + MIDDLEWARE_CONFIG.RATE_LIMIT_WINDOW,
      });
      return null;
    }

    // Check if limit exceeded
    if (current.count >= MIDDLEWARE_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
      return this.createErrorResponse('Rate limit exceeded', 429, {
        'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
        'X-RateLimit-Limit': MIDDLEWARE_CONFIG.RATE_LIMIT_MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
      });
    }

    // Increment count
    current.count++;
    return null;
  }

  /**
   * Get client identifier for rate limiting
   */
  private getClientId(request: NextRequest): string {
    // Try to get user ID from token first
    const token = this.extractToken(request);
    if (token) {
      try {
        const payload = jwtService.verifyTokenLegacy(token);
        return payload.sub;
      } catch {
        // Fall back to IP address
      }
    }

    // Fall back to IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown" || 'unknown';
    return ip;
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(MIDDLEWARE_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    message: string,
    status: number,
    additionalHeaders: Record<string, string> = {}
  ): NextResponse {
    const response = NextResponse.json(
      { error: message, status },
      { status }
    );

    // Add security headers
    this.addSecurityHeaders(response);

    // Add additional headers
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  /**
   * Log request for monitoring
   */
  private logRequest(request: NextRequest, payload: JWTPayloadCustom): void {
    const logData = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      user: payload.sub,
      role: payload.role,
      tokenType: payload.tokenType,
      documentId: payload.documentId,
      signatureId: payload.signatureId,
      ip: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
      userAgent: request.headers.get('user-agent'),
    };

    console.log('API Request:', JSON.stringify(logData));
  }
}

// Export singleton instance
export const jwtMiddleware = new JWTMiddleware();

// Export convenience functions
export const authenticate = (options?: JWTMiddlewareOptions) => 
  (request: NextRequest) => jwtMiddleware.authenticate(request, options);

export const requireAuth = (options?: JWTMiddlewareOptions) => 
  (request: NextRequest) => jwtMiddleware.authenticate(request, { ...options, rateLimit: true });

export const requireRole = (role: string, options?: Omit<JWTMiddlewareOptions, 'requiredRole'>) =>
  (request: NextRequest) => jwtMiddleware.authenticate(request, { ...options, requiredRole: role });

export const requirePermissions = (permissions: string[], options?: Omit<JWTMiddlewareOptions, 'requiredPermissions'>) =>
  (request: NextRequest) => jwtMiddleware.authenticate(request, { ...options, requiredPermissions: permissions });

export const requireAdmin = (options?: Omit<JWTMiddlewareOptions, 'requiredRole'>) =>
  (request: NextRequest) => jwtMiddleware.authenticate(request, { ...options, requiredRole: 'admin' });

export const requireDocumentAccess = (options?: Omit<JWTMiddlewareOptions, 'requireDocumentAccess'>) =>
  (request: NextRequest) => jwtMiddleware.authenticate(request, { ...options, requireDocumentAccess: true });

export const requireSignatureAccess = (options?: Omit<JWTMiddlewareOptions, 'requireSignatureAccess'>) =>
  (request: NextRequest) => jwtMiddleware.authenticate(request, { ...options, requireSignatureAccess: true });

// Higher-order function for API route protection
export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options?: JWTMiddlewareOptions
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResponse = await jwtMiddleware.authenticate(request, options);
    if (authResponse) {
      return authResponse;
    }

    return handler(request as AuthenticatedRequest);
  };
}

// Higher-order function for role-based protection
export function withRole(
  role: string,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options?: Omit<JWTMiddlewareOptions, 'requiredRole'>
) {
  return withAuth(handler, { ...options, requiredRole: role });
}

// Higher-order function for permission-based protection
export function withPermissions(
  permissions: string[],
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options?: Omit<JWTMiddlewareOptions, 'requiredPermissions'>
) {
  return withAuth(handler, { ...options, requiredPermissions: permissions });
}

// Higher-order function for admin-only protection
export function withAdmin(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options?: Omit<JWTMiddlewareOptions, 'requiredRole'>
) {
  return withAuth(handler, { ...options, requiredRole: 'admin' });
}

// Higher-order function for document access protection
export function withDocumentAccess(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options?: Omit<JWTMiddlewareOptions, 'requireDocumentAccess'>
) {
  return withAuth(handler, { ...options, requireDocumentAccess: true });
}

// Higher-order function for signature access protection
export function withSignatureAccess(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options?: Omit<JWTMiddlewareOptions, 'requireSignatureAccess'>
) {
  return withAuth(handler, { ...options, requireSignatureAccess: true });
}

// Simple JWT verification function for API routes
export async function verifyJWT(request: NextRequest): Promise<{ success: boolean; user?: JWTPayloadCustom; error?: string }> {
  try {
    const authResponse = await jwtMiddleware.authenticate(request, { rateLimit: false });
    if (authResponse) {
      return { success: false, error: 'Authentication failed' };
    }
    
    const authenticatedRequest = request as AuthenticatedRequest;
    return { success: true, user: authenticatedRequest.user };
  } catch (error) {
    console.error('JWT verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}
