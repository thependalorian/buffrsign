/**
 * Groq LLM API Route
 * Handles AI requests with _user tier-based model selection
 * Integrated with existing BuffrSign AI services
 */

import { NextRequest, NextResponse } from 'next/server';
import { BuffrSignAIIntegration } from '@/lib/ai/ai-integration';
import { verifyJWT } from '@/lib/middleware/jwt-middleware';
import type { UserTier } from '@/lib/ai/ai-types';

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token and get _user information
    const authResult = await verifyJWT(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // User authenticated successfully
    const body = await request.json();
    
    const {
      messages,
      userTier,
      type = 'chat' // 'chat', 'analyze', 'explain', 'compliance'
    } = body;

    // Validate _user tier
    if (!userTier || !['standard', 'pro'].includes(userTier)) {
      return NextResponse.json(
        { error: 'Invalid _user tier. Must be "standard" or "pro"' },
        { status: 400 }
      );
    }

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const aiIntegration = new BuffrSignAIIntegration();
    let response;

    switch (type) {
      case 'analyze':
        if (!body.documentContent) {
          return NextResponse.json(
            { error: 'Document content is required for analysis' },
            { status: 400 }
          );
        }
        response = await aiIntegration.analyzeDocumentWithGroq({
          documentContent: body.documentContent,
          userTier: userTier as UserTier,
          analysisType: body.analysisType || 'basic',
          context: body.context
        });
        break;

      case 'explain':
        if (!body.terms || !Array.isArray(body.terms)) {
          return NextResponse.json(
            { error: 'Terms array is required for explanation' },
            { status: 400 }
          );
        }
        response = await aiIntegration.explainLegalTermsWithGroq({
          terms: body.terms,
          userTier: userTier as UserTier,
          context: body.context
        });
        break;

      case 'compliance':
        if (!body.documentContent) {
          return NextResponse.json(
            { error: 'Document content is required for compliance check' },
            { status: 400 }
          );
        }
        response = await aiIntegration.checkComplianceWithGroq({
          documentContent: body.documentContent,
          userTier: userTier as UserTier,
          frameworks: body.frameworks
        });
        break;

      case 'chat':
      default:
        response = await aiIntegration.getBuffrSignAssistantResponse(
          messages[messages.length - 1]?.content || '',
          userTier as UserTier,
          { previousMessages: messages }
        );
        break;
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      userTier,
      model: aiIntegration.getGroqModelInfo(userTier as UserTier).model
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = await verifyJWT(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userTier = searchParams.get('userTier') as UserTier;

    if (!userTier || !['standard', 'pro'].includes(userTier)) {
      return NextResponse.json(
        { error: 'Invalid _user tier. Must be "standard" or "pro"' },
        { status: 400 }
      );
    }

    const aiIntegration = new BuffrSignAIIntegration();
    const modelInfo = aiIntegration.getGroqModelInfo(userTier);

    return NextResponse.json({
      success: true,
      userTier,
      model: modelInfo.model,
      capabilities: modelInfo.capabilities,
      availableModels: {
        standard: process.env.GROQ_LLM_STANDARD || 'llama-3.1-8b-instant',
        pro: process.env.GROQ_LLM_PRO || 'llama-3.1-70b-versatile'
      }
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
