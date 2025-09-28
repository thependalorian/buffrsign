import { NextResponse } from 'next/server';

/**
 * Health Check API Endpoint
 * Used by Docker health checks and monitoring systems
 * 
 * @route GET /api/health
 * @returns Health status and system information
 */
export async function GET() {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      services: {
        supabase: await checkSupabaseHealth(),
        ai: await checkAIHealth(),
        email: await checkEmailHealth(),
      }
    };

    return NextResponse.json(healthStatus, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV || 'development',
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

/**
 * Check Supabase connection health
 */
async function checkSupabaseHealth(): Promise<{ status: string; message?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return { status: 'unhealthy', message: 'Missing Supabase configuration' };
    }

    // Simple connectivity check
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      method: 'HEAD',
    });

    if (response.ok) {
      return { status: 'healthy' };
    } else {
      return { status: 'unhealthy', message: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

/**
 * Check AI services health
 */
async function checkAIHealth(): Promise<{ status: string; message?: string }> {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!groqKey && !openaiKey) {
      return { status: 'unhealthy', message: 'No AI service keys configured' };
    }

    // Check if at least one AI service is configured
    const hasValidKeys = (groqKey && groqKey.length > 0) || (openaiKey && openaiKey.length > 0);
    
    if (hasValidKeys) {
      return { status: 'healthy' };
    } else {
      return { status: 'unhealthy', message: 'AI service keys are empty' };
    }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: error instanceof Error ? error.message : 'AI service check failed' 
    };
  }
}

/**
 * Check email service health
 */
async function checkEmailHealth(): Promise<{ status: string; message?: string }> {
  try {
    const sendgridKey = process.env.SENDGRID_API_KEY;
    
    if (!sendgridKey) {
      return { status: 'unhealthy', message: 'SendGrid API key not configured' };
    }

    if (sendgridKey.length === 0) {
      return { status: 'unhealthy', message: 'SendGrid API key is empty' };
    }

    return { status: 'healthy' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: error instanceof Error ? error.message : 'Email service check failed' 
    };
  }
}
