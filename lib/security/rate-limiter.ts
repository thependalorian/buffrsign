/**
 * Rate Limiting Service for AI Endpoints
 * Implements sliding window rate limiting with Redis
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configurations for different endpoint types
const RATE_LIMITS = {
  // AI Chat endpoints - more permissive for user interaction
  chat: {
    window: "1 m", // 1 minute
    limit: 20, // 20 requests per minute
    burst: 5 // Allow 5 burst requests
  },
  
  // AI Analysis endpoints - moderate limits
  analysis: {
    window: "1 m", // 1 minute
    limit: 10, // 10 requests per minute
    burst: 3 // Allow 3 burst requests
  },
  
  // AI Compliance endpoints - stricter limits
  compliance: {
    window: "1 m", // 1 minute
    limit: 5, // 5 requests per minute
    burst: 2 // Allow 2 burst requests
  },
  
  // AI Embeddings - very strict limits (expensive)
  embeddings: {
    window: "1 m", // 1 minute
    limit: 3, // 3 requests per minute
    burst: 1 // Allow 1 burst request
  },
  
  // AI Workflow endpoints - moderate limits
  workflow: {
    window: "1 m", // 1 minute
    limit: 8, // 8 requests per minute
    burst: 2 // Allow 2 burst requests
  },
  
  // Streaming endpoints - more permissive
  streaming: {
    window: "1 m", // 1 minute
    limit: 15, // 15 requests per minute
    burst: 3 // Allow 3 burst requests
  }
} as const;

// Initialize Redis client
const redis = Redis.fromEnv();

// Create rate limiters for each endpoint type
const rateLimiters = {
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.chat.limit, RATE_LIMITS.chat.window),
    analytics: true,
    prefix: "ai_chat"
  }),
  
  analysis: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.analysis.limit, RATE_LIMITS.analysis.window),
    analytics: true,
    prefix: "ai_analysis"
  }),
  
  compliance: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.compliance.limit, RATE_LIMITS.compliance.window),
    analytics: true,
    prefix: "ai_compliance"
  }),
  
  embeddings: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.embeddings.limit, RATE_LIMITS.embeddings.window),
    analytics: true,
    prefix: "ai_embeddings"
  }),
  
  workflow: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.workflow.limit, RATE_LIMITS.workflow.window),
    analytics: true,
    prefix: "ai_workflow"
  }),
  
  streaming: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.streaming.limit, RATE_LIMITS.streaming.window),
    analytics: true,
    prefix: "ai_streaming"
  })
};

// Rate limiter class
export class AIRateLimiter {
  /**
   * Check rate limit for a specific endpoint type
   */
  static async checkRateLimit(
    request: NextRequest,
    endpointType: keyof typeof rateLimiters
  ): Promise<NextResponse | null> {
    try {
      const identifier = this.getClientIdentifier(request);
      const rateLimiter = rateLimiters[endpointType];
      
      const { success, limit, reset } = await rateLimiter.limit(identifier);
      
      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `Too many requests. Try again in ${retryAfter} seconds.`,
            retryAfter,
            limit,
            remaining: 0
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(reset).toISOString(),
            }
          }
        );
      }
      
      // Add rate limit headers to successful responses
      return null; // Continue processing
    } catch (error) {
      console.error('Rate limiting error:', error);
      // In case of rate limiting service failure, allow the request
      // but log the error for monitoring
      return null;
    }
  }
  
  /**
   * Get client identifier for rate limiting
   */
  private static getClientIdentifier(request: NextRequest): string {
    // Try to get user ID from JWT token first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Decode JWT payload without verification (for rate limiting only)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) {
          return `user:${payload.sub}`;
        }
      } catch {
        // Fall back to IP if token parsing fails
      }
    }
    
    // Fall back to IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    return `ip:${ip}`;
  }
  
  /**
   * Get rate limit info for a client
   */
  static async getRateLimitInfo(
    request: NextRequest,
    endpointType: keyof typeof rateLimiters
  ): Promise<{
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
  }> {
    const identifier = this.getClientIdentifier(request);
    const rateLimiter = rateLimiters[endpointType];
    
    const { limit, reset, remaining } = await rateLimiter.limit(identifier);
    
    return {
      limit,
      remaining,
      reset,
      retryAfter: remaining === 0 ? Math.ceil((reset - Date.now()) / 1000) : undefined
    };
  }
  
  /**
   * Add rate limit headers to response
   */
  static addRateLimitHeaders(
    response: NextResponse,
    limitInfo: {
      limit: number;
      remaining: number;
      reset: number;
    }
  ): NextResponse {
    response.headers.set('X-RateLimit-Limit', limitInfo.limit.toString());
    response.headers.set('X-RateLimit-Remaining', limitInfo.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(limitInfo.reset).toISOString());
    
    return response;
  }
}

// Convenience functions for different endpoint types
export const checkChatRateLimit = (request: NextRequest) => 
  AIRateLimiter.checkRateLimit(request, 'chat');

export const checkAnalysisRateLimit = (request: NextRequest) => 
  AIRateLimiter.checkRateLimit(request, 'analysis');

export const checkComplianceRateLimit = (request: NextRequest) => 
  AIRateLimiter.checkRateLimit(request, 'compliance');

export const checkEmbeddingsRateLimit = (request: NextRequest) => 
  AIRateLimiter.checkRateLimit(request, 'embeddings');

export const checkWorkflowRateLimit = (request: NextRequest) => 
  AIRateLimiter.checkRateLimit(request, 'workflow');

export const checkStreamingRateLimit = (request: NextRequest) => 
  AIRateLimiter.checkRateLimit(request, 'streaming');
