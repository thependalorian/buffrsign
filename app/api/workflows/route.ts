/**
 * Workflow Management API Route
 * Handles workflow creation, status, and management
 * Matches Python backend: /api/v1/workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import { BuffrSignAIIntegration, getWorkflowState } from '@/lib/ai/ai-integration';
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

    const _user = authResult._user;
    const body = await request.json();
    
    const {
      workflow_type,
      input_data,
      userTier = 'standard'
    } = body;

    // Validate required fields
    if (!workflow_type || !input_data) {
      return NextResponse.json(
        { error: 'workflow_type and input_data are required' },
        { status: 400 }
      );
    }

    const aiIntegration = new BuffrSignAIIntegration();
    
    // Start workflow based on type
    let response;
    switch (workflow_type) {
      case 'kyc':
        response = await aiIntegration.processKYCWorkflow(
          _user?.sub || 'unknown',
          input_data.document_id,
          input_data.kyc_type || 'individual'
        );
        break;
        
      case 'signature':
        response = await aiIntegration.startSignatureWorkflow(
          input_data.document_id,
          input_data.signers || [],
          input_data.workflow_type || 'sequential'
        );
        break;
        
      case '_document':
        response = await aiIntegration.startDocumentWorkflow(
          input_data.document_id,
          input_data.analysis_type || 'comprehensive',
          input_data.enable_compliance !== false
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid workflow_type. Must be "kyc", "signature", or "_document"' },
          { status: 400 }
        );
    }

    // Handle different response types
    if (typeof response === 'object' && response && 'success' in response && !response.success) {
      return NextResponse.json(
        { error: (response as { error?: string }).error || 'Workflow creation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        workflow_id: typeof response === 'string' ? response : (response as { workflowId?: string }).workflowId || `workflow_${Date.now()}`,
        workflow_type,
        status: typeof response === 'object' && response && 'status' in response ? (response as { status?: string }).status : 'created',
        user_tier: userTier,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Workflow API Error:', error);
    
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
    // Verify JWT token and get _user information
    const authResult = await verifyJWT(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // User authenticated successfully
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflow_id');

    if (workflowId) {
      // Get specific workflow status
      const response = await getWorkflowState(workflowId);
      
      if (!response.success) {
        return NextResponse.json(
          { error: response.error || 'Failed to get workflow status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          workflow_id: workflowId,
          status: response.state?.status || 'unknown',
          current_step: response.state?.current_node || 'unknown',
          progress: response.state?.history?.length || 0,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // List _user's workflows (placeholder implementation)
      const response = { success: true, workflows: [] };

      return NextResponse.json({
        success: true,
        data: {
          workflows: response.workflows || [],
          total: response.workflows?.length || 0,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Workflow API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
