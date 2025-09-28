/**
 * Groq LLM Streaming API Route
 * Handles real-time streaming responses for chat interface
 */

import { NextRequest } from 'next/server';
import { BuffrSignAIIntegration } from '@/lib/ai/ai-integration';
import { verifyJWT } from '@/lib/middleware/jwt-middleware';
import { GroqStreamRequestSchema, validateRequest, type GroqStreamRequest } from '@/lib/validation/ai-schemas';
import { checkStreamingRateLimit } from '@/lib/security/rate-limiter';
import { ErrorSanitizer } from '@/lib/security/error-sanitizer';
import type { UserTier } from '@/lib/ai/ai-types';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    // Check rate limit
    const rateLimitResponse = await checkStreamingRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Verify JWT token and get user information
    const authResult = await verifyJWT(request);
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          requestId,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
              ? 'http://localhost:3000' 
              : 'https://buffrsign.com',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }

    // Parse and validate request body
    let body: GroqStreamRequest;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          requestId,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate request data
    const validatedData = validateRequest(GroqStreamRequestSchema, body);

    const aiIntegration = new BuffrSignAIIntegration();
    const modelInfo = aiIntegration.getGroqModelInfo(validatedData.userTier as UserTier);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metadata = {
            type: 'metadata',
            userTier: validatedData.userTier,
            model: modelInfo.model,
            capabilities: modelInfo.capabilities,
            requestId,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(metadata)}\n\n`)
          );

          // Handle streaming response
          await aiIntegration.generateStreamingResponse(
            validatedData.messages.map(msg => ({
              ...msg,
              role: msg.role === 'user' ? '_user' as const : msg.role
            })),
            validatedData.userTier as UserTier,
            (chunk: string) => {
              const chunkData = {
                type: 'chunk',
                content: chunk,
                requestId,
                timestamp: new Date().toISOString()
              };
              
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(chunkData)}\n\n`)
              );
            },
            validatedData.options
          );

          // Send completion signal
          const completion = {
            type: 'completion',
            requestId,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(completion)}\n\n`)
          );

          controller.close();

        } catch (error) {
          ErrorSanitizer.logError(error, {
            endpoint: 'ai/groq/stream',
            requestId,
            additionalInfo: { userId: authResult._user?.sub }
          });
          
          const errorData = {
            type: 'error',
            error: ErrorSanitizer.sanitizeErrorMessage(error),
            requestId,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : 'https://buffrsign.com',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Request-ID': requestId
      },
    });

  } catch (error) {
    ErrorSanitizer.logError(error, {
      endpoint: 'ai/groq/stream',
      requestId,
      additionalInfo: { userId: 'unknown' }
    });
    
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data',
          requestId,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        requestId,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
