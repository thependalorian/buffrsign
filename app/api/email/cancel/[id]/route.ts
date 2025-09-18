/**
 * Email Cancel API Route
 * 
 * Handles cancelling scheduled email notifications.
 * POST /api/email/cancel/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Get the email notification
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

    // Check if user has permission to cancel this email
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

    // Check if email can be cancelled
    if (notification.status === 'sent' || notification.status === 'delivered') {
      return NextResponse.json(
        { error: 'Email cannot be cancelled - already sent' },
        { status: 400 }
      );
    }

    // Cancel the email notification
    const { error: updateError } = await supabase
      .from('email_notifications')
      .update({
        status: 'cancelled',
        error_message: 'Cancelled by user',
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (updateError) {
      throw updateError;
    }

    // Also cancel any scheduled reminders for this notification
    if (notification.document_id) {
      await supabase
        .from('scheduled_reminders')
        .update({
          status: 'cancelled',
          error_message: 'Cancelled due to email cancellation',
          updated_at: new Date().toISOString(),
        })
        .eq('document_id', notification.document_id)
        .eq('status', 'pending');
    }

    return NextResponse.json({
      success: true,
      message: 'Email cancelled successfully',
    });
  } catch (error: any) {
    console.error('Email cancel API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
