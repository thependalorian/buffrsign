/**
 * LangGraph API Route
 * Handles LangGraph workflow orchestration operations
 * Matches Python backend: /api/v1/ai/langgraph
 */

import { NextRequest, NextResponse } from 'next/server';
import { LangGraphWorkflowOrchestrator } from '@/lib/ai/langgraph-workflows';
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
      workflow_id,
      input_data,
      execution_id,
      service_type,
      operation_name,
      params,
      document_id,
      signers,
      workflow_type,
      analysis_type,
      enable_compliance
    } = body;

    const langGraph = new LangGraphWorkflowOrchestrator();
    
    let result;
    
    switch (operation) {
      case 'start_workflow':
        if (!workflow_id || !input_data) {
          return NextResponse.json(
            { error: 'workflow_id and input_data are required for start_workflow' },
            { status: 400 }
          );
        }
        result = await langGraph.startWorkflow(workflow_id, input_data, {
          workflow_type: workflow_id,
          user_id: user?.sub || 'unknown',
          priority: 'medium'
        });
        break;
        
      case 'get_workflow_status':
        if (!execution_id) {
          return NextResponse.json(
            { error: 'execution_id is required for get_workflow_status' },
            { status: 400 }
          );
        }
        result = await langGraph.getWorkflowState(execution_id);
        break;
        
      case 'execute_service_operation':
        if (!service_type || !operation_name || !params) {
          return NextResponse.json(
            { error: 'service_type, operation_name, and params are required for execute_service_operation' },
            { status: 400 }
          );
        }
        result = await langGraph.executeServiceOperation(service_type, operation_name, params);
        break;
        
      case 'start_signature_workflow':
        if (!document_id || !signers) {
          return NextResponse.json(
            { error: 'document_id and signers are required for start_signature_workflow' },
            { status: 400 }
          );
        }
        result = await langGraph.startSignatureWorkflow(document_id, signers, workflow_type || 'sequential');
        break;
        
      case 'start_document_workflow':
        if (!document_id) {
          return NextResponse.json(
            { error: 'document_id is required for start_document_workflow' },
            { status: 400 }
          );
        }
        result = await langGraph.startDocumentWorkflow(document_id, analysis_type || 'comprehensive', enable_compliance !== false);
        break;
        
      case 'pause_workflow':
        if (!execution_id) {
          return NextResponse.json(
            { error: 'execution_id is required for pause_workflow' },
            { status: 400 }
          );
        }
        result = await langGraph.pauseWorkflow(execution_id);
        break;
        
      case 'resume_workflow':
        if (!execution_id) {
          return NextResponse.json(
            { error: 'execution_id is required for resume_workflow' },
            { status: 400 }
          );
        }
        result = await langGraph.resumeWorkflow(execution_id);
        break;
        
      case 'cancel_workflow':
        if (!execution_id) {
          return NextResponse.json(
            { error: 'execution_id is required for cancel_workflow' },
            { status: 400 }
          );
        }
        result = await langGraph.cancelWorkflow(execution_id);
        break;
        
      case 'get_workflow_result':
        if (!execution_id) {
          return NextResponse.json(
            { error: 'execution_id is required for get_workflow_result' },
            { status: 400 }
          );
        }
        result = await langGraph.getWorkflowResult(execution_id);
        break;
        
      case 'get_workflow_history':
        if (!execution_id) {
          return NextResponse.json(
            { error: 'execution_id is required for get_workflow_history' },
            { status: 400 }
          );
        }
        result = await langGraph.getWorkflowHistory(execution_id);
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }

    if (typeof result === 'object' && result && 'success' in result && !result.success) {
      return NextResponse.json(
        { error: (result as any).error || 'Operation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('LangGraph API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
