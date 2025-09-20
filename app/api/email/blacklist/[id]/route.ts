import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const _supabase = createClient();
    const { id } = params;

    // Check if _user is authenticated
    const { data: { _user: _user }, error: authError } = await supabase.auth.getUser();
    if (authError || !_user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Remove email from blacklist
    const { error } = await supabase
      .from('email_blacklist')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Blacklist item not found' },
          { status: 404 }
        );
      }
      console.error('Error removing email from blacklist:', error);
      return NextResponse.json(
        { error: 'Failed to remove email from blacklist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email removed from blacklist successfully'
    });
  } catch {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
