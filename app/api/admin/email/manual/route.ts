/**
 * Admin Manual Email API Route for BuffrSign
 * 
 * API endpoint for admin manual email sending with document-specific conflict prevention
 * Founder: George Nekwaya (george@buffr.ai +12065308433)
 */

import { NextRequest, NextResponse } from 'next/server';
import { BuffrSignAdminEmailControlsService } from '@/lib/services/email/admin-email-controls';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action,
      adminId,
      adminName,
      emailType,
      recipients,
      subject,
      content,
      scheduledFor,
      priority,
      reason,
      requestId,
      approverId,
      approverName,
      rejectionReason
    } = body;

    if (!adminId || !adminName) {
      return NextResponse.json(
        { error: 'Admin ID and name are required' },
        { status: 400 }
      );
    }

    const adminService = new BuffrSignAdminEmailControlsService();

    switch (action) {
      case 'submit_request':
        if (!emailType || !recipients || !subject || !content || !reason) {
          return NextResponse.json(
            { error: 'Missing required fields for email request' },
            { status: 400 }
          );
        }

        const emailRequest = await adminService.submitManualEmailRequest({
          adminId,
          adminName,
          emailType,
          recipients,
          subject,
          content,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          priority: priority || 'normal',
          reason
        });

        return NextResponse.json({
          success: true,
          data: emailRequest,
          message: 'Manual email request submitted successfully'
        });

      case 'approve_request':
        if (!requestId || !approverId || !approverName) {
          return NextResponse.json(
            { error: 'Request ID, approver ID and name are required' },
            { status: 400 }
          );
        }

        await adminService.approveManualEmailRequest(requestId, approverId, approverName);

        return NextResponse.json({
          success: true,
          message: 'Manual email request approved successfully'
        });

      case 'reject_request':
        if (!requestId || !approverId || !rejectionReason) {
          return NextResponse.json(
            { error: 'Request ID, approver ID and rejection reason are required' },
            { status: 400 }
          );
        }

        await adminService.rejectManualEmailRequest(requestId, approverId, rejectionReason);

        return NextResponse.json({
          success: true,
          message: 'Manual email request rejected successfully'
        });

      case 'send_immediate':
        if (!emailType || !recipients || !subject || !content || !reason) {
          return NextResponse.json(
            { error: 'Missing required fields for immediate email send' },
            { status: 400 }
          );
        }

        await adminService.sendManualEmailImmediate({
          adminId,
          adminName,
          emailType,
          recipients,
          subject,
          content,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          priority: priority || 'normal',
          reason
        }, adminId);

        return NextResponse.json({
          success: true,
          message: 'Manual email sent immediately'
        });

      case 'cancel_request':
        if (!requestId || !rejectionReason) {
          return NextResponse.json(
            { error: 'Request ID and cancellation reason are required' },
            { status: 400 }
          );
        }

        await adminService.cancelManualEmail(requestId, adminId, rejectionReason);

        return NextResponse.json({
          success: true,
          message: 'Manual email request cancelled successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('BuffrSign admin manual email API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process admin email request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const adminId = searchParams.get('adminId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const adminService = new BuffrSignAdminEmailControlsService();

    switch (action) {
      case 'pending_requests':
        const pendingRequests = await adminService.getPendingManualEmailRequests();
        return NextResponse.json({
          success: true,
          data: pendingRequests
        });

      case 'queue_status':
        const queueStatus = await adminService.getEmailQueueStatus();
        return NextResponse.json({
          success: true,
          data: queueStatus
        });

      case 'admin_activity':
        const activity = await adminService.getAdminEmailActivity(adminId || undefined, limit);
        return NextResponse.json({
          success: true,
          data: activity
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('BuffrSign admin manual email GET API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin email data' },
      { status: 500 }
    );
  }
}
