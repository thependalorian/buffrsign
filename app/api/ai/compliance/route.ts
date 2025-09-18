/**
 * AI Compliance Check API Route
 * Handles compliance checking requests
 * Matches Python backend: /api/v1/ai/compliance
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
      document_id,
      document_content,
      frameworks = ['ETA 2019', 'Namibian Labour Act'],
      userTier = 'standard',
      context = {}
    } = body;

    // Validate required fields
    if (!document_id && !document_content) {
      return NextResponse.json(
        { error: 'Either document_id or document_content is required' },
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
    
    // If document_content is provided, use Groq for compliance checking
    if (document_content) {
      const response = await aiIntegration.checkComplianceWithGroq({
        documentContent: document_content,
        userTier: userTier as UserTier,
        frameworks
      });

      if (!response.success) {
        return NextResponse.json(
          { error: response.error || 'Compliance check failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          document_id,
          frameworks,
          user_tier: userTier,
          model: aiIntegration.getGroqModelInfo(userTier as UserTier).model,
          compliance_result: response.data?.content || 'No compliance result',
          usage: response.data?.usage,
          timestamp: new Date().toISOString()
        }
      });
    }

    // If only document_id is provided, use Pydantic AI for compliance checking
    const response = await aiIntegration.processDocument(document_id, {
      enableAnalysis: false,
      enableCompliance: true,
      enableRiskAssessment: false,
      enableWorkflow: false,
      enableOCR: false,
      enableComputerVision: false
    });

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Compliance check failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        document_id,
        frameworks,
        user_tier: userTier,
        compliance_result: response.results,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Compliance API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
