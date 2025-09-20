/**
 * Email Preferences API Route
 * 
 * Handles _user email preferences operations.
 * GET, POST, PUT /api/email/preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailPreferencesRequest } from '@/lib/types/email';

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

    // Get _user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_email_preferences')
      .select('*')
      .eq('user_id', _user.id)
      .single();

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      throw preferencesError;
    }

    // If no preferences found, return default preferences
    if (!preferences) {
      const defaultPreferences = {
        id: '',
        user_id: _user.id,
        receive_invitations: true,
        receive_reminders: true,
        receive_status_updates: true,
        receive_marketing: false,
        reminder_frequency: 2,
        preferred_language: 'en-NA',
        timezone: 'Africa/Windhoek',
        email_format: 'html',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json(defaultPreferences);
    }

    return NextResponse.json(preferences);
  } catch (error: unknown) {
    console.error('Get email preferences API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Parse request body
    const body: EmailPreferencesRequest = await request.json();

    // Validate reminder frequency
    if (body.reminder_frequency !== undefined && body.reminder_frequency < 1) {
      return NextResponse.json(
        { error: 'Reminder frequency must be at least 1 day' },
        { status: 400 }
      );
    }

    // Validate email format
    if (body.email_format && !['html', 'text'].includes(body.email_format)) {
      return NextResponse.json(
        { error: 'Email format must be either "html" or "text"' },
        { status: 400 }
      );
    }

    // Create or update preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_email_preferences')
      .upsert({
        user_id: _user.id,
        ...body,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (preferencesError) {
      throw preferencesError;
    }

    return NextResponse.json(preferences);
  } catch (error: unknown) {
    console.error('Create/update email preferences API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
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

    // Parse request body
    const body: EmailPreferencesRequest = await request.json();

    // Validate reminder frequency
    if (body.reminder_frequency !== undefined && body.reminder_frequency < 1) {
      return NextResponse.json(
        { error: 'Reminder frequency must be at least 1 day' },
        { status: 400 }
      );
    }

    // Validate email format
    if (body.email_format && !['html', 'text'].includes(body.email_format)) {
      return NextResponse.json(
        { error: 'Email format must be either "html" or "text"' },
        { status: 400 }
      );
    }

    // Update preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_email_preferences')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', _user.id)
      .select()
      .single();

    if (preferencesError) {
      throw preferencesError;
    }

    if (!preferences) {
      return NextResponse.json(
        { error: 'Email preferences not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(preferences);
  } catch (error: unknown) {
    console.error('Update email preferences API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
