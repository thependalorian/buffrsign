import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const _supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if _user is authenticated
    const { data: { _user: _user }, error: authError } = await supabase.auth.getUser();
    if (authError || !_user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query = supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data: queueItems, error } = await query;

    if (error) {
      console.error('Error fetching queue items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch queue items', details: error.message },
        { status: 500 }
      );
    }

    // Get queue statistics
    const { data: stats, error: statsError } = await supabase
      .from('email_queue')
      .select('status')
      .then(({ data }) => {
        if (!data) return { data: null, error: null };
        
        const stats = data.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return { data: stats, error: null };
      });

    return NextResponse.json({
      queueItems,
      statistics: stats || {},
      pagination: {
        limit,
        offset,
        total: queueItems?.length || 0
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

    // Check if _user is authenticated
    const { data: { _user: _user }, error: authError } = await supabase.auth.getUser();
    if (authError || !_user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { emailData, priority = 'normal', scheduledAt } = body;

    // Add email to queue
    const { data: queueItem, error } = await supabase
      .from('email_queue')
      .insert({
        email_data: emailData,
        priority,
        scheduled_at: scheduledAt,
        status: 'pending',
        created_by: _user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding email to queue:', error);
      return NextResponse.json(
        { error: 'Failed to add email to queue', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      queueItem
    }, { status: 201 });
  } catch {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
