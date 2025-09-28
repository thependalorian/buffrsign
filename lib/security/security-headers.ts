/**
 * Security Headers Middleware
 * Implements comprehensive security headers for AI endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for Next.js
    "style-src 'self' 'unsafe-inline'", // Allow inline styles
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.groq.com https://api.openai.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()'
  ].join(', '),
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
} as const;

// CORS configuration for AI endpoints
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://buffrsign.com',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Credentials': 'true'
} as const;

// Security headers class
export class SecurityHeaders {
  /**
   * Add security headers to response
   */
  static addSecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  /**
   * Add CORS headers to response
   */
  static addCORSHeaders(response: NextResponse): NextResponse {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  /**
   * Add all security and CORS headers
   */
  static addAllHeaders(response: NextResponse): NextResponse {
    return this.addCORSHeaders(this.addSecurityHeaders(response));
  }
  
  /**
   * Handle preflight OPTIONS request
   */
  static handlePreflightRequest(): NextResponse {
    const response = new NextResponse(null, { status: 200 });
    return this.addCORSHeaders(response);
  }
  
  /**
   * Validate origin for CORS
   */
  static validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    
    if (!origin) {
      return true; // Allow requests without origin (e.g., server-to-server)
    }
    
    const allowedOrigins = [
      'https://buffrsign.com',
      'https://app.buffrsign.com',
      'https://www.buffrsign.com'
    ];
    
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
    }
    
    return allowedOrigins.includes(origin);
  }
  
  /**
   * Create secure error response
   */
  static createSecureErrorResponse(
    message: string,
    status: number,
    additionalHeaders: Record<string, string> = {}
  ): NextResponse {
    const response = NextResponse.json(
      { 
        error: message,
        timestamp: new Date().toISOString(),
        status
      },
      { status }
    );
    
    // Add all security headers
    this.addAllHeaders(response);
    
    // Add additional headers
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  /**
   * Create secure success response
   */
  static createSecureResponse(
    data: unknown,
    status: number = 200,
    additionalHeaders: Record<string, string> = {}
  ): NextResponse {
    const response = NextResponse.json(data, { status });
    
    // Add all security headers
    this.addAllHeaders(response);
    
    // Add additional headers
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
}

// Middleware function for AI endpoints
export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return SecurityHeaders.handlePreflightRequest();
    }
    
    // Validate origin
    if (!SecurityHeaders.validateOrigin(request)) {
      return SecurityHeaders.createSecureErrorResponse(
        'Forbidden: Invalid origin',
        403
      );
    }
    
    try {
      const response = await handler(request);
      return SecurityHeaders.addAllHeaders(response);
    } catch (error) {
      console.error('Handler error:', error);
      return SecurityHeaders.createSecureErrorResponse(
        'Internal server error',
        500
      );
    }
  };
}

// Request size limiter
export function withRequestSizeLimit(
  maxSize: number = 1024 * 1024, // 1MB default
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return SecurityHeaders.createSecureErrorResponse(
        'Request too large',
        413,
        { 'Content-Length': maxSize.toString() }
      );
    }
    
    return handler(request);
  };
}

// Request timeout wrapper
export function withTimeout(
  timeoutMs: number = 30000, // 30 seconds default
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const timeoutPromise = new Promise<NextResponse>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeoutMs);
    });
    
    try {
      return await Promise.race([
        handler(request),
        timeoutPromise
      ]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Request timeout') {
        return SecurityHeaders.createSecureErrorResponse(
          'Request timeout',
          408
        );
      }
      throw error;
    }
  };
}

// Combined security middleware
export function withAISecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    maxRequestSize?: number;
    timeoutMs?: number;
  } = {}
) {
  const { maxRequestSize = 1024 * 1024, timeoutMs = 30000 } = options;
  
  return withSecurityHeaders(
    withRequestSizeLimit(
      maxRequestSize,
      withTimeout(timeoutMs, handler)
    )
  );
}
