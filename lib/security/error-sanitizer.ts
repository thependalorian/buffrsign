/**
 * Error Sanitization Utility
 * Sanitizes errors to prevent information disclosure
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

// Error types that should be sanitized
const SENSITIVE_ERROR_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /credential/i,
  /auth/i,
  /database/i,
  /connection/i,
  /sql/i,
  /query/i,
  /stack/i,
  /trace/i,
  /file[_-]?path/i,
  /directory/i,
  /env/i,
  /config/i
];

// Safe error messages for different error types
const SAFE_ERROR_MESSAGES = {
  validation: 'Invalid request data',
  authentication: 'Authentication failed',
  authorization: 'Access denied',
  notFound: 'Resource not found',
  rateLimit: 'Too many requests',
  timeout: 'Request timeout',
  server: 'Internal server error',
  network: 'Network error',
  ai: 'AI service temporarily unavailable',
  database: 'Database error',
  file: 'File processing error',
  unknown: 'An unexpected error occurred'
} as const;

// Error sanitizer class
export class ErrorSanitizer {
  /**
   * Sanitize error message to prevent information disclosure
   */
  static sanitizeErrorMessage(error: unknown, isProduction: boolean = true): string {
    if (!isProduction) {
      // In development, show more details
      return error instanceof Error ? error.message : 'Unknown error';
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if error contains sensitive information
    const containsSensitiveInfo = SENSITIVE_ERROR_PATTERNS.some(pattern => 
      pattern.test(errorMessage)
    );
    
    if (containsSensitiveInfo) {
      return this.classifyError(error);
    }
    
    // If no sensitive info, return a safe version of the message
    return this.sanitizeMessage(errorMessage);
  }
  
  /**
   * Classify error type and return appropriate safe message
   */
  private static classifyError(error: unknown): string {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return SAFE_ERROR_MESSAGES.validation;
    }
    
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
      return SAFE_ERROR_MESSAGES.authentication;
    }
    
    if (errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
      return SAFE_ERROR_MESSAGES.authorization;
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return SAFE_ERROR_MESSAGES.notFound;
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return SAFE_ERROR_MESSAGES.rateLimit;
    }
    
    if (errorMessage.includes('timeout')) {
      return SAFE_ERROR_MESSAGES.timeout;
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return SAFE_ERROR_MESSAGES.network;
    }
    
    if (errorMessage.includes('ai') || errorMessage.includes('groq') || errorMessage.includes('openai')) {
      return SAFE_ERROR_MESSAGES.ai;
    }
    
    if (errorMessage.includes('database') || errorMessage.includes('sql')) {
      return SAFE_ERROR_MESSAGES.database;
    }
    
    if (errorMessage.includes('file') || errorMessage.includes('upload')) {
      return SAFE_ERROR_MESSAGES.file;
    }
    
    return SAFE_ERROR_MESSAGES.server;
  }
  
  /**
   * Sanitize message by removing sensitive information
   */
  private static sanitizeMessage(message: string): string {
    return message
      .replace(/api[_-]?key[=:]\s*[^\s]+/gi, 'api_key=***')
      .replace(/secret[=:]\s*[^\s]+/gi, 'secret=***')
      .replace(/password[=:]\s*[^\s]+/gi, 'password=***')
      .replace(/token[=:]\s*[^\s]+/gi, 'token=***')
      .replace(/\/[^\s]*\/[^\s]*/g, '/path/to/file') // Remove file paths
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***') // Remove emails
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '***.***.***.***') // Remove IPs
      .substring(0, 200); // Limit message length
  }
  
  /**
   * Create sanitized error response
   */
  static createErrorResponse(
    error: unknown,
    status: number = 500,
    additionalData: Record<string, unknown> = {}
  ): NextResponse {
    const isProduction = process.env.NODE_ENV === 'production';
    const sanitizedMessage = this.sanitizeErrorMessage(error, isProduction);
    
    const responseData = {
      error: sanitizedMessage,
      timestamp: new Date().toISOString(),
      status,
      ...additionalData
    };
    
    // Add request ID for tracking if available
    if (additionalData.requestId) {
      responseData.requestId = additionalData.requestId;
    }
    
    return NextResponse.json(responseData, { status });
  }
  
  /**
   * Log error securely (without sensitive information)
   */
  static logError(
    error: unknown,
    context: {
      endpoint?: string;
      userId?: string;
      requestId?: string;
      additionalInfo?: Record<string, unknown>;
    } = {}
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: this.sanitizeErrorMessage(error, isProduction),
      context: {
        endpoint: context.endpoint,
        userId: context.userId,
        requestId: context.requestId,
        ...context.additionalInfo
      }
    };
    
    // In production, only log sanitized errors
    if (isProduction) {
      console.error(JSON.stringify(logData));
    } else {
      // In development, log more details
      console.error('Error:', error);
      console.error('Context:', logData);
    }
  }
  
  /**
   * Handle validation errors specifically
   */
  static handleValidationError(
    validationError: z.ZodError,
    requestId?: string
  ): NextResponse {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      return this.createErrorResponse(
        'Invalid request data',
        400,
        { requestId }
      );
    }
    
    // In development, show validation details
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: validationError.errors || validationError.message,
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 400 }
    );
  }
  
  /**
   * Handle AI service errors
   */
  static handleAIError(
    error: unknown,
    service: string,
    requestId?: string
  ): NextResponse {
    this.logError(error, {
      endpoint: `ai/${service}`,
      additionalInfo: { service }
    });
    
    return this.createErrorResponse(
      `AI service temporarily unavailable`,
      503,
      { 
        requestId,
        retryAfter: 60 // Suggest retry after 60 seconds
      }
    );
  }
  
  /**
   * Handle rate limit errors
   */
  static handleRateLimitError(
    retryAfter: number,
    requestId?: string
  ): NextResponse {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
        timestamp: new Date().toISOString(),
        requestId
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString()
        }
      }
    );
  }
}

// Convenience functions
export const sanitizeError = ErrorSanitizer.sanitizeErrorMessage;
export const createErrorResponse = ErrorSanitizer.createErrorResponse;
export const logError = ErrorSanitizer.logError;
