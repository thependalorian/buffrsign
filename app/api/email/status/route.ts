/**
 * Email System Status API Route
 * 
 * GET /api/email/status - Get email system status and configuration
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailConfig } from '@/lib/config/email-config';

export async function GET(): Promise<NextResponse> {
  try {
    // Get authenticated user
    const _supabase = createClient();
    const { data: { _user: _user }, error: authError } = await supabase.auth.getUser();

    if (authError || !_user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get system configuration
    const systemConfig = {
      provider: emailConfig.provider,
      fromEmail: emailConfig.fromEmail,
      fromName: emailConfig.fromName,
      appUrl: emailConfig.appUrl,
      queueEnabled: emailConfig.emailQueueEnabled,
      retryAttempts: emailConfig.emailRetryAttempts,
      retryDelay: emailConfig.emailRetryDelay,
      batchSize: emailConfig.emailBatchSize,
      rateLimit: emailConfig.emailRateLimit
    };

    // Check database connectivity
    let dbStatus = 'unknown';
    try {
      const { error: dbError } = await supabase
        .from('email_system_config')
        .select('id')
        .limit(1);
      
      dbStatus = dbError ? 'error' : 'connected';
    } catch {
      dbStatus = 'error';
    }

    // Get queue status
    let queueStatus = 'unknown';
    let queueCount = 0;
    try {
      const { data: queueData, error: queueError } = await supabase
        .from('email_queue')
        .select('id, status')
        .in('status', ['pending', 'processing', 'failed']);
      
      if (!queueError) {
        queueCount = queueData?.length || 0;
        queueStatus = 'active';
      } else {
        queueStatus = 'error';
      }
    } catch {
      queueStatus = 'error';
    }

    // Get recent email statistics
    let recentStats = null;
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('email_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);
      
      if (!statsError && statsData) {
        recentStats = {
          totalSent: statsData.reduce((sum, day) => sum + (day.emails_sent || 0), 0),
          totalDelivered: statsData.reduce((sum, day) => sum + (day.emails_delivered || 0), 0),
          totalOpened: statsData.reduce((sum, day) => sum + (day.emails_opened || 0), 0),
          totalClicked: statsData.reduce((sum, day) => sum + (day.emails_clicked || 0), 0),
          totalBounced: statsData.reduce((sum, day) => sum + (day.emails_bounced || 0), 0)
        };
      }
    } catch (error) {
      console.error('Error fetching recent stats:', error);
    }

    // Check email provider connectivity (basic check)
    let providerStatus = 'unknown';
    try {
      // This is a basic check - in production you might want to make an actual API call
      const hasApiKey = emailConfig.provider === 'sendgrid' ? !!emailConfig.sendgridApiKey :
                       emailConfig.provider === 'resend' ? !!emailConfig.resendApiKey :
                       emailConfig.provider === 'ses' ? !!emailConfig.awsAccessKeyId : false;
      
      providerStatus = hasApiKey ? 'configured' : 'not_configured';
    } catch {
      providerStatus = 'error';
    }

    const systemStatus = {
      // Configuration
      ...systemConfig,
      
      // System health
      health: {
        database: dbStatus,
        provider: providerStatus,
        queue: queueStatus,
        overall: dbStatus === 'connected' && providerStatus === 'configured' ? 'healthy' : 'degraded'
      },
      
      // Queue information
      queue: {
        status: queueStatus,
        pendingCount: queueCount,
        enabled: emailConfig.emailQueueEnabled
      },
      
      // Recent statistics
      recentStats,
      
      // Timestamp
      lastChecked: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      status: systemStatus
    });

  } catch (error: unknown) {
    console.error('Email status API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
