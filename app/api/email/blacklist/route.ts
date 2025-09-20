import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const addToBlacklistSchema = z.object({
  email_address: z.string().email(),
  reason: z.enum(['Bounced email', 'Spam complaint', 'Manual addition', 'Invalid email'])
});

export async function GET() {
  try {
    const _supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if _user is authenticated
    const { data: { _user: _user }, error: authError } = await supabase.auth.getUser();
    if (authError || !_user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: blacklistItems, error } = await supabase
      .from('email_blacklist')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching blacklist items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blacklist items', details: error.message },
        { status: 500 }
      );
    }

    // Get blacklist statistics
    const { data: stats, error: statsError } = await supabase
      .from('email_blacklist')
      .select('reason')
      .then(({ data }) => {
        if (!data) return { data: null, error: null };
        
        const stats = data.reduce((acc, item) => {
          acc[item.reason] = (acc[item.reason] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return { data: stats, error: null };
      });

    return NextResponse.json({
      blacklistItems,
      statistics: stats || {},
      pagination: {
        limit,
        offset,
        total: blacklistItems?.length || 0
      }
    });
  } catch {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const _supabase = createClient();
    const body = await request.json();

    // Validate request body
    const validatedData = addToBlacklistSchema.parse(body);

    // Check if _user is authenticated
    const { data: { _user: _user }, error: authError } = await supabase.auth.getUser();
    if (authError || !_user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if email is already blacklisted
    const { data: existingItem, error: checkError } = await supabase
      .from('email_blacklist')
      .select('id')
      .eq('email_address', validatedData.email_address)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing blacklist item:', checkError);
      return NextResponse.json(
        { error: 'Failed to check blacklist', details: checkError.message },
        { status: 500 }
      );
    }

    if (existingItem) {
      return NextResponse.json(
        { error: 'Email address is already blacklisted' },
        { status: 409 }
      );
    }

    // Add email to blacklist
    const { data: blacklistItem, error } = await supabase
      .from('email_blacklist')
      .insert({
        email_address: validatedData.email_address,
        reason: validatedData.reason,
        created_by: _user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding email to blacklist:', error);
      return NextResponse.json(
        { error: 'Failed to add email to blacklist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blacklistItem
    }, { status: 201 });
  } catch {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
