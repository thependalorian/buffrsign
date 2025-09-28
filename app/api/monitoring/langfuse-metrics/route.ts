/**
 * Langfuse Metrics API Route
 * 
 * Provides comprehensive metrics and monitoring data from Langfuse
 * for the BuffrSign AI monitoring dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { langfuseService } from '@/lib/services/langfuse-service';

// ============================================================================
// TYPES
// ============================================================================

interface MetricsQuery {
  range?: 'hour' | 'day' | 'week' | 'month';
  startDate?: string;
  endDate?: string;
  service?: string;
  model?: string;
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query: MetricsQuery = {
      range: (searchParams.get('range') as MetricsQuery['range']) || 'day',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      service: searchParams.get('service') || undefined,
      model: searchParams.get('model') || undefined,
    };

    // Get metrics from Langfuse service
    const metrics = await langfuseService.getMetrics(query.range);

    // For now, return mock data since we need to implement actual Langfuse API integration
    // In production, this would query the Langfuse API for real metrics
    const mockMetrics = {
      totalRequests: 1247,
      totalTokens: 456789,
      totalCost: 12.45,
      averageResponseTime: 1250,
      successRate: 94.2,
      errorRate: 5.8,
      topModels: [
        { model: 'llama-3.1-8b-instant', requests: 456, tokens: 123456 },
        { model: 'gpt-4o-mini', requests: 234, tokens: 98765 },
        { model: 'llama-3.1-70b-versatile', requests: 123, tokens: 87654 },
        { model: 'deepseek-chat', requests: 89, tokens: 54321 },
        { model: 'text-embedding-3-small', requests: 345, tokens: 98765 },
      ],
      costByProvider: [
        { provider: 'groq', cost: 6.23 },
        { provider: 'openai', cost: 4.12 },
        { provider: 'deepseek', cost: 2.10 },
      ],
      recentTraces: [
        {
          id: 'trace_1',
          name: 'document-analysis',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'success',
          duration: 1200,
          tokens: 456,
        },
        {
          id: 'trace_2',
          name: 'signature-validation',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          status: 'success',
          duration: 800,
          tokens: 234,
        },
        {
          id: 'trace_3',
          name: 'compliance-check',
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
          status: 'error',
          duration: 500,
          tokens: 123,
        },
        {
          id: 'trace_4',
          name: 'workflow-execution',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          status: 'success',
          duration: 2100,
          tokens: 789,
        },
        {
          id: 'trace_5',
          name: 'document-analysis',
          timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
          status: 'success',
          duration: 1500,
          tokens: 567,
        },
      ],
    };

    return NextResponse.json(mockMetrics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error fetching Langfuse metrics:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST HANDLER FOR CUSTOM QUERIES
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, aggregation } = body;

    // Handle custom metrics queries
    // This would integrate with Langfuse API for advanced queries
    
    const customMetrics = {
      query,
      filters,
      aggregation,
      results: {
        // Mock results for custom queries
        data: [],
        total: 0,
        aggregations: {},
      },
    };

    return NextResponse.json(customMetrics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error processing custom metrics query:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process query',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}