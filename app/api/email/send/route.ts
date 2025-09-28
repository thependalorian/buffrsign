/**
 * Email Send API Route
 * 
 * Handles sending emails through the BuffrSign email system.
 * POST /api/email/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/services/email';
import { SendEmailRequest, SendEmailResponse } from '@/lib/types/email';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { _user: _user }, error: authError } = await supabase.auth.getUser();

    if (authError || !_user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SendEmailRequest = await request.json();

    // Validate required fields
    if (!body.to || !body.email_type) {
      return NextResponse.json(
        { error: 'Missing required fields: to, email_type' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Initialize email service
    const emailService = new EmailService();

    // Send email
    const result: SendEmailResponse = await emailService.sendEmail(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Email send API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
