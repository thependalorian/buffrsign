/**
 * LlamaIndex API Route
 * Handles LlamaIndex _document intelligence operations
 * Matches Python backend: /api/v1/ai/llamaindex
 */

import { NextRequest, NextResponse } from 'next/server';
import { LlamaIndexDocumentIntelligence } from '@/lib/ai/llamaindex-integration';
import { verifyJWT } from '@/lib/middleware/jwt-middleware';

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

    
    const body = await request.json();
    
    const {
      operation,
      document_id,
      query,
      limit,
      text_weight,
      entity_name,
      depth,
      start_date,
      end_date,
      analysis_type
    } = body;

    const llamaIndex = new LlamaIndexDocumentIntelligence();
    
    let result;
    
    switch (operation) {
      case 'hybrid_search':
        if (!query) {
          return NextResponse.json(
            { error: 'query is required for hybrid_search' },
            { status: 400 }
          );
        }
        result = await llamaIndex.hybridSearch(query, limit || 10, text_weight || 0.3);
        break;
        
      case 'get_document':
        if (!document_id) {
          return NextResponse.json(
            { error: 'document_id is required for get_document' },
            { status: 400 }
          );
        }
        result = await llamaIndex.getDocument(document_id);
        break;
        
      case 'list_documents':
        result = await llamaIndex.listDocuments(limit || 20, body.offset || 0);
        break;
        
      case 'get_entity_relationships':
        if (!entity_name) {
          return NextResponse.json(
            { error: 'entity_name is required for get_entity_relationships' },
            { status: 400 }
          );
        }
        result = await llamaIndex.getEntityRelationships(entity_name, depth || 2);
        break;
        
      case 'get_entity_timeline':
        if (!entity_name) {
          return NextResponse.json(
            { error: 'entity_name is required for get_entity_timeline' },
            { status: 400 }
          );
        }
        result = await llamaIndex.getEntityTimeline(entity_name, start_date, end_date);
        break;
        
      case 'analyze_document':
        if (!document_id) {
          return NextResponse.json(
            { error: 'document_id is required for analyze_document' },
            { status: 400 }
          );
        }
        result = await llamaIndex.analyzeDocument(document_id, analysis_type || 'comprehensive');
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }

    if (result && typeof result === 'object' && 'success' in result && !result.success) {
      return NextResponse.json(
        { error: (result as { error?: string }).error || 'Operation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('LlamaIndex API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
