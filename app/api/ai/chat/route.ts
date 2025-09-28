/**
 * AI Chat API Route
 * Handles general AI interactions for document processing
 * Matches Python backend: /api/v1/ai/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { BuffrSignAIIntegration } from '@/lib/ai/ai-integration';
import { verifyJWT } from '@/lib/middleware/jwt-middleware';
import { ChatRequestSchema, validateRequest } from '@/lib/validation/ai-schemas';
import { checkChatRateLimit } from '@/lib/security/rate-limiter';
import { withAISecurity } from '@/lib/security/security-headers';
import { ErrorSanitizer } from '@/lib/security/error-sanitizer';
import type { UserTier, ChatRequest, GroqMessage } from '@/lib/ai/ai-types';

export const POST = withAISecurity(async (request: NextRequest) => {
  const requestId = crypto.randomUUID();
  let authResult: any; // Declare authResult outside try block
  
  try {
    // Check rate limit
    const rateLimitResponse = await checkChatRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Verify JWT token and get user information
    const authResult = await verifyJWT(request);
    if (!authResult.success) {
      return ErrorSanitizer.createErrorResponse(
        'Unauthorized',
        401,
        { requestId }
      );
    }

    // Parse and validate request body
    let body: ChatRequest;
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
    const validatedData = validateRequest(ChatRequestSchema, body);

    const aiIntegration = new BuffrSignAIIntegration();
    
    // Process request through AI agent
    const response = await aiIntegration.getBuffrSignAssistantResponse(
      validatedData.message,
      validatedData.userTier as UserTier,
      {
        documentType: validatedData.context?.document_type,
        workflowStage: validatedData.context?.workflow_stage,
        previousMessages: (validatedData.context?.previous_messages as string[] || []).map(msg => ({ role: '_user', content: msg }))
      }
    );

    if (!response.success) {
      return ErrorSanitizer.handleAIError(
        response.error || 'AI processing failed',
        'chat',
        requestId
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        response: response.data?.content || 'No response received',
        session_id: validatedData.session_id || `session_${Date.now()}`,
        document_id: validatedData.document_id,
        workflow_id: validatedData.workflow_id,
        user_tier: validatedData.userTier,
        model: aiIntegration.getGroqModelInfo(validatedData.userTier as UserTier).model,
        timestamp: new Date().toISOString(),
        usage: response.data?.usage,
        requestId
      }
    });

  } catch (error) {
    ErrorSanitizer.logError(error, {
      endpoint: 'ai/chat',
      requestId,
      additionalInfo: { userId: authResult._user?.sub }
    });
    
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return ErrorSanitizer.createErrorResponse(error, 400, { requestId });
    }
    
    return ErrorSanitizer.createErrorResponse(error, 500, { requestId });
  }
}, {
  maxRequestSize: 1024 * 1024, // 1MB
  timeoutMs: 30000 // 30 seconds
});
