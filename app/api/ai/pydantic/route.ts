/**
 * Pydantic AI API Route
 * Handles Pydantic AI agent operations
 * Matches Python backend: /api/v1/ai/pydantic
 */

import { NextRequest, NextResponse } from 'next/server';
import { PydanticAIAgents } from '@/lib/ai/pydantic-ai-agents';
import { verifyJWT } from '@/lib/middleware/jwt-middleware';

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
      operation,
      document_id,
      analysis_type,
      frameworks,
      jurisdiction,
      detailed_analysis,
      template_type,
      parameters,
      workflow_id,
      input_data
    } = body;

    const pydanticAI = new PydanticAIAgents();
    
    let result;
    
    switch (operation) {
      case 'analyze_document':
        if (!document_id) {
          return NextResponse.json(
            { error: 'document_id is required for analyze_document' },
            { status: 400 }
          );
        }
        result = await pydanticAI.analyzeDocumentWithAgent(document_id, analysis_type || 'comprehensive');
        break;
        
      case 'check_compliance':
        if (!document_id) {
          return NextResponse.json(
            { error: 'document_id is required for check_compliance' },
            { status: 400 }
          );
        }
        result = await pydanticAI.checkCompliance(document_id, 'ETA2019');
        break;
        
      case 'generate_template':
        if (!template_type) {
          return NextResponse.json(
            { error: 'template_type is required for generate_template' },
            { status: 400 }
          );
        }
        result = await pydanticAI.executeWorkflow('template_generation', 'template-generation-agent');
        break;
        
      case 'extract_entities':
        if (!document_id) {
          return NextResponse.json(
            { error: 'document_id is required for extract_entities' },
            { status: 400 }
          );
        }
        result = await pydanticAI.extractEntities(document_id);
        break;
        
      case 'analyze_sentiment':
        if (!document_id) {
          return NextResponse.json(
            { error: 'document_id is required for analyze_sentiment' },
            { status: 400 }
          );
        }
        result = await pydanticAI.analyzeSentiment(document_id);
        break;
        
      case 'get_available_agents':
        result = await pydanticAI.getAvailableAgents();
        break;
        
      case 'get_agent_details':
        if (!body.agent_id) {
          return NextResponse.json(
            { error: 'agent_id is required for get_agent_details' },
            { status: 400 }
          );
        }
        result = await pydanticAI.getAgentDetails(body.agent_id);
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Operation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (result as any).data || result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pydantic AI API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
