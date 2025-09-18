/**
 * Email Retry API Route
 * 
 * Handles retrying failed email notifications.
 * POST /api/email/retry/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/services/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notificationId = params.id;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Get the failed email notification
    const { data: notification, error: notificationError } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (notificationError) {
      return NextResponse.json(
        { error: 'Email notification not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to retry this email
    if (notification.document_id) {
      const { data: document } = await supabase
        .from('documents')
        .select('created_by')
        .eq('id', notification.document_id)
        .single();

      if (!document || document.created_by !== user.id) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Check if email can be retried
    if (notification.status === 'sent' || notification.status === 'delivered') {
      return NextResponse.json(
        { error: 'Email cannot be retried - already sent successfully' },
        { status: 400 }
      );
    }

    if (notification.retry_count >= 3) {
      return NextResponse.json(
        { error: 'Maximum retry attempts reached' },
        { status: 400 }
      );
    }

    // Initialize email service
    const emailService = new EmailService();

    // Prepare email data for retry
    const emailData = {
      to: notification.email_address,
      subject: notification.subject,
      html_content: notification.html_content,
      text_content: notification.text_content,
      email_type: notification.email_type,
      document_id: notification.document_id,
      recipient_id: notification.recipient_id,
      provider: notification.provider,
    };

    // Send email
    const result = await emailService.sendEmail(emailData);

    if (!result.success) {
      // Update retry count
      await supabase
        .from('email_notifications')
        .update({
          retry_count: notification.retry_count + 1,
          error_message: result.error,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      return NextResponse.json(
        { error: result.error || 'Failed to retry email' },
        { status: 500 }
      );
    }

    // Update notification with new status
    await supabase
      .from('email_notifications')
      .update({
        status: 'sent',
        external_message_id: result.messageId,
        retry_count: notification.retry_count + 1,
        error_message: null,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Email retry API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
