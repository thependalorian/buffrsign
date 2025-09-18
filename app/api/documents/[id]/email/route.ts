/**
 * Document Email Integration API Routes
 * 
 * Handles email notifications for document lifecycle events
 * GET /api/documents/[id]/email - Get email notifications for a document
 * POST /api/documents/[id]/email - Send email notifications for a document
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { documentEmailIntegration } from '@/lib/services/document-email-integration';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const documentId = params.id;
    
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get email notifications for the document
    const { data: notifications, error } = await supabase
      .from('email_notifications')
      .select(`
        id,
        recipient_email,
        recipient_name,
        template_type,
        status,
        sent_at,
        delivered_at,
        opened_at,
        clicked_at,
        bounced_at,
        error_message,
        created_at
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching email notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch email notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || []
    });

  } catch (error: any) {
    console.error('Document email GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const documentId = params.id;
    const body = await request.json();
    const { action, recipients, recipientId, reason } = body;
    
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to the document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, owner_id, title')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    let result;

    switch (action) {
      case 'send_invitations':
        if (!recipients || !Array.isArray(recipients)) {
          return NextResponse.json(
            { error: 'Recipients array is required' },
            { status: 400 }
          );
        }
        result = await documentEmailIntegration.sendBulkInvitations(documentId, recipients);
        break;

      case 'send_reminders':
        if (!recipients || !Array.isArray(recipients)) {
          return NextResponse.json(
            { error: 'Recipients array is required' },
            { status: 400 }
          );
        }
        result = await documentEmailIntegration.sendBulkReminders(documentId, recipients);
        break;

      case 'send_invitation':
        if (!recipientId) {
          return NextResponse.json(
            { error: 'Recipient ID is required' },
            { status: 400 }
          );
        }
        result = await documentEmailIntegration.onSignatureRequested(documentId, recipientId);
        break;

      case 'send_reminder':
        if (!recipientId) {
          return NextResponse.json(
            { error: 'Recipient ID is required' },
            { status: 400 }
          );
        }
        result = await documentEmailIntegration.onSignatureReminder(documentId, recipientId);
        break;

      case 'notify_completion':
        result = await documentEmailIntegration.onDocumentCompleted(documentId);
        break;

      case 'notify_expiration':
        result = await documentEmailIntegration.onDocumentExpired(documentId);
        break;

      case 'notify_decline':
        if (!recipientId) {
          return NextResponse.json(
            { error: 'Recipient ID is required' },
            { status: 400 }
          );
        }
        result = await documentEmailIntegration.onSignatureDeclined(documentId, recipientId, reason);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Email action '${action}' completed successfully`,
      result
    });

  } catch (error: any) {
    console.error('Document email POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
