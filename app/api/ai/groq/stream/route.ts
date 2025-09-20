/**
 * Groq LLM Streaming API Route
 * Handles real-time streaming responses for chat interface
 */

import { NextRequest } from 'next/server';
import { BuffrSignAIIntegration } from '@/lib/ai/ai-integration';
import { verifyJWT } from '@/lib/middleware/jwt-middleware';
import type { UserTier } from '@/lib/ai/ai-types';

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token and get _user information
    const authResult = await verifyJWT(request);
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await request.json();
    
    const {
      messages,
      userTier,
      options = {}
    } = body;

    // Validate _user tier
    if (!userTier || !['standard', 'pro'].includes(userTier)) {
      return new Response(
        JSON.stringify({ error: 'Invalid _user tier. Must be "standard" or "pro"' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const aiIntegration = new BuffrSignAIIntegration();
    const modelInfo = aiIntegration.getGroqModelInfo(userTier as UserTier);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metadata = {
            type: 'metadata',
            userTier,
            model: modelInfo.model,
            capabilities: modelInfo.capabilities,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(metadata)}\n\n`)
          );

          // Handle streaming response
          await aiIntegration.generateStreamingResponse(
            messages,
            userTier as UserTier,
            (chunk: string) => {
              const chunkData = {
                type: 'chunk',
                content: chunk,
                timestamp: new Date().toISOString()
              };
              
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(chunkData)}\n\n`)
              );
            },
            options
          );

          // Send completion signal
          const completion = {
            type: 'completion',
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(completion)}\n\n`)
          );

          controller.close();

        } catch (error) {
          console.error('Streaming error:', error);
          
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('Groq Streaming API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
