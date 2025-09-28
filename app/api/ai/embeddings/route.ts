// BuffrSign Platform - Embeddings API Route
// Generates embeddings using OpenAI to match Python backend

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { EmbeddingsRequestSchema, validateRequest, type EmbeddingsRequest } from '@/lib/validation/ai-schemas';
import { checkEmbeddingsRateLimit } from '@/lib/security/rate-limiter';
import { withAISecurity } from '@/lib/security/security-headers';
import { ErrorSanitizer } from '@/lib/security/error-sanitizer';
import { verifyJWT } from '@/lib/middleware/jwt-middleware';

// ============================================================================
// OPENAI CLIENT CONFIGURATION
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// EMBEDDINGS API ROUTE
// ============================================================================

export const POST = withAISecurity(async (request: NextRequest) => {
  const requestId = crypto.randomUUID();
  let authResult: any; // Declare authResult outside try block
  
  try {
    // Check rate limit (strict for embeddings)
    const rateLimitResponse = await checkEmbeddingsRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Verify JWT token
    authResult = await verifyJWT(request);
    if (!authResult.success) {
      return ErrorSanitizer.createErrorResponse(
        'Unauthorized',
        401,
        { requestId }
      );
    }

    // Parse and validate request body
    let body: EmbeddingsRequest;
    try {
      body = await request.json();
    } catch {
      return ErrorSanitizer.createErrorResponse(
        'Invalid JSON in request body',
        400,
        { requestId }
      );
    }

    // Validate request data
    const validatedData = validateRequest(EmbeddingsRequestSchema, body);

    if (!process.env.OPENAI_API_KEY) {
      return ErrorSanitizer.createErrorResponse(
        'Service configuration error',
        500,
        { requestId }
      );
    }

    // Generate embedding using OpenAI
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Same as Python backend
      input: validatedData.text,
    });

    const embedding = response.data[0].embedding;

    return NextResponse.json({
      success: true,
      embedding,
      model: 'text-embedding-3-small',
      usage: response.usage,
      requestId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    ErrorSanitizer.logError(error, {
      endpoint: 'ai/embeddings',
      requestId,
      additionalInfo: { userId: authResult?._user?.sub } // Use optional chaining
    });
    
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return ErrorSanitizer.createErrorResponse(error, 400, { requestId });
    }
    
    return ErrorSanitizer.handleAIError(error, 'embeddings', requestId);
  }
}, {
  maxRequestSize: 512 * 1024, // 512KB for embeddings
  timeoutMs: 15000 // 15 seconds
});
