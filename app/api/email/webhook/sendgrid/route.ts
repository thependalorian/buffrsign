/**
 * SendGrid Webhook API Route
 * 
 * Handles SendGrid webhook events for email status updates.
 * POST /api/email/webhook/sendgrid
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email';
import { EmailWebhookEvent } from '@/lib/types/email';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-twilio-email-event-webhook-signature');
    const timestamp = request.headers.get('x-twilio-email-event-webhook-timestamp');

    // Parse webhook events
    const events = JSON.parse(body);

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Initialize email service
    const emailService = new EmailService();

    // Process each event
    for (const event of events) {
      try {
        // Verify webhook signature (if configured)
        if (signature && timestamp) {
          const provider = emailService['providers'].get('sendgrid');
          if (provider && !provider.verifyWebhookSignature(body, signature, timestamp)) {
            console.warn('Invalid SendGrid webhook signature');
            continue;
          }
        }

        // Parse webhook event
        const provider = emailService['providers'].get('sendgrid');
        const webhookEvent: EmailWebhookEvent | null = provider 
          ? provider.parseWebhookEvent(event)
          : {
              event: event.event,
              timestamp: event.timestamp,
              messageId: event.sg_message_id,
              email: event.email,
              reason: event.reason,
              url: event.url,
              userAgent: event.useragent,
              ip: event.ip,
            };

        if (webhookEvent) {
          // Handle the webhook event
          await emailService.handleWebhookEvent('sendgrid', webhookEvent);
        }
      } catch (eventError) {
        console.error('Error processing SendGrid webhook event:', eventError);
        // Continue processing other events
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('SendGrid webhook API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
