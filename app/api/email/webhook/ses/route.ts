/**
 * AWS SES Webhook API Route
 * 
 * Handles AWS SES webhook events (via SNS) for email status updates.
 * POST /api/email/webhook/ses
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email';
import { EmailWebhookEvent } from '@/lib/types/email';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-amz-sns-signature');
    const timestamp = request.headers.get('x-amz-sns-timestamp');

    // Parse SNS message
    const snsMessage = JSON.parse(body);

    // Verify SNS message type
    if (snsMessage.Type === 'SubscriptionConfirmation') {
      // Handle SNS subscription confirmation
      console.log('SNS subscription confirmation received');
      return NextResponse.json({ success: true, message: 'Subscription confirmed' });
    }

    if (snsMessage.Type !== 'Notification') {
      return NextResponse.json(
        { error: 'Invalid SNS message type' },
        { status: 400 }
      );
    }

    // Verify webhook signature (if configured)
    if (signature && timestamp) {
      const emailService = new EmailService();
      const provider = emailService['providers'].get('ses');
      if (provider && provider.verifyWebhookSignature && !provider.verifyWebhookSignature(body, signature, timestamp)) {
        console.warn('Invalid SES webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse SES event from SNS message
    const sesEvent = JSON.parse(snsMessage.Message);

    // Initialize email service
    const emailService = new EmailService();

    // Parse webhook event
    const provider = emailService['providers'].get('ses');
    const webhookEvent: EmailWebhookEvent | null = provider && provider.parseWebhookEvent ? provider.parseWebhookEvent(snsMessage) : {
      event: sesEvent.eventType,
      timestamp: new Date(sesEvent.mail.timestamp).getTime(),
      messageId: sesEvent.mail.messageId,
      email: sesEvent.mail.destination[0],
      reason: sesEvent.bounce?.bounceType || sesEvent.complaint?.complaintFeedbackType || 'Unknown',
    };

    if (webhookEvent) {
      // Handle the webhook event
      await emailService.handleWebhookEvent(webhookEvent);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('SES webhook API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
