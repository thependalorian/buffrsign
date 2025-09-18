/**
 * AI Chat API Route
 * Handles general AI interactions for document processing
 * Matches Python backend: /api/v1/ai/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { BuffrSignAIIntegration } from '@/lib/ai/ai-integration';
import { verifyJWT } from '@/lib/middleware/jwt-middleware';
import type { UserTier } from '@/lib/ai/ai-types';

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token and get user information
    const authResult = await verifyJWT(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = authResult;
    const body = await request.json();
    
    const {
      message,
      session_id,
      document_id,
      workflow_id,
      context = {},
      userTier = 'standard'
    } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate user tier
    if (!['standard', 'pro'].includes(userTier)) {
      return NextResponse.json(
        { error: 'Invalid user tier. Must be "standard" or "pro"' },
        { status: 400 }
      );
    }

    const aiIntegration = new BuffrSignAIIntegration();
    
    // Process request through AI agent
    const response = await aiIntegration.getBuffrSignAssistantResponse(
      message,
      userTier as UserTier,
      {
        documentType: context.document_type,
        workflowStage: context.workflow_stage,
        previousMessages: context.previous_messages || []
      }
    );

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'AI processing failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        response: response.data?.content || 'No response received',
        session_id: session_id || `session_${Date.now()}`,
        document_id,
        workflow_id,
        user_tier: userTier,
        model: aiIntegration.getGroqModelInfo(userTier as UserTier).model,
        timestamp: new Date().toISOString(),
        usage: response.data?.usage
      }
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
