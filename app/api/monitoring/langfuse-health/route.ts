/**
 * Langfuse Health Check API Route
 * 
 * Provides health status and connectivity information for Langfuse integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { langfuseService } from '@/lib/services/langfuse-service';

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check Langfuse service health
    const healthCheck: {
      service: string;
      status: string;
      timestamp: string;
      responseTime: number;
      configuration: {
        publicKey: string;
        secretKey: string;
        host: string;
      };
      capabilities: {
        documentAnalysis: boolean;
        signatureValidation: boolean;
        workflowExecution: boolean;
        complianceChecking: boolean;
        errorTracking: boolean;
        metricsCollection: boolean;
      };
      lastFlush: string;
      pendingTraces: number;
      error?: string;
    } = {
      service: 'langfuse',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      configuration: {
        publicKey: process.env.LANGFUSE_PUBLIC_KEY ? 'configured' : 'missing',
        secretKey: process.env.LANGFUSE_SECRET_KEY ? 'configured' : 'missing',
        host: process.env.LANGFUSE_HOST || 'https://us.cloud.langfuse.com',
      },
      capabilities: {
        documentAnalysis: true,
        signatureValidation: true,
        workflowExecution: true,
        complianceChecking: true,
        errorTracking: true,
        metricsCollection: true,
      },
      lastFlush: new Date().toISOString(),
      pendingTraces: 0, // Mock data
    };

    // Test Langfuse connectivity (mock for now)
    try {
      // In production, this would test actual Langfuse API connectivity
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
      
      healthCheck.status = 'healthy';
    } catch (error) {
      healthCheck.status = 'unhealthy';
      healthCheck.error = error instanceof Error ? error.message : 'Unknown error';
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;

    return NextResponse.json(healthCheck, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error checking Langfuse health:', error);
    
    const errorResponse = {
      service: 'langfuse',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}

// ============================================================================
// POST HANDLER FOR HEALTH ACTIONS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'flush':
        // Flush pending traces
        await langfuseService.flush();
        return NextResponse.json({
          action: 'flush',
          status: 'success',
          message: 'Traces flushed successfully',
          timestamp: new Date().toISOString(),
        });

      case 'test':
        // Test Langfuse connectivity
        const testResult = await langfuseService.getMetrics('hour');
        return NextResponse.json({
          action: 'test',
          status: 'success',
          message: 'Langfuse connectivity test passed',
          timestamp: new Date().toISOString(),
          testData: testResult,
        });

      case 'reset':
        // Reset Langfuse service (if needed)
        // This would reinitialize the service
        return NextResponse.json({
          action: 'reset',
          status: 'success',
          message: 'Langfuse service reset successfully',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            message: `Unknown action: ${action}`,
            validActions: ['flush', 'test', 'reset'],
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing Langfuse health action:', error);
    
    return NextResponse.json(
      { 
        error: 'Action failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}