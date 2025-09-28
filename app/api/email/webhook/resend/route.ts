/**
 * Resend Webhook API Route
 * 
 * Handles Resend webhook events for email status updates.
 * POST /api/email/webhook/resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email';
import { EmailWebhookEvent } from '@/lib/types/email';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('resend-signature');
    const timestamp = request.headers.get('resend-timestamp');

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
          const provider = emailService['providers'].get('resend');
          if (provider && provider.verifyWebhookSignature && !provider.verifyWebhookSignature(body, signature, timestamp)) {
            console.warn('Invalid Resend webhook signature');
            continue;
          }
        }

        // Parse webhook event
        const provider = emailService['providers'].get('resend');
        const webhookEvent: EmailWebhookEvent | null = provider && provider.parseWebhookEvent ? provider.parseWebhookEvent(event) : {
          event: event.type,
          timestamp: new Date(event.created_at).getTime(),
          messageId: event.id,
          email: event.email,
          reason: event.reason,
        };

        if (webhookEvent) {
          // Handle the webhook event
          await emailService.handleWebhookEvent(webhookEvent);
        }
      } catch (eventError) {
        console.error('Error processing Resend webhook event:', eventError);
        // Continue processing other events
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Resend webhook API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
