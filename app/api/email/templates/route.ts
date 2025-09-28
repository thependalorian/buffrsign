import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['document_invitation', 'signature_reminder', 'document_completed', 'document_expired', 'document_rejected']),
  subject: z.string().min(1).max(200),
  html_content: z.string().min(1),
  text_content: z.string().optional(),
  variables: z.array(z.string()).optional(),
  locale: z.string().default('en-US'),
  is_active: z.boolean().default(true)
});



export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type');
    const locale = searchParams.get('locale') || 'en-US';
    const active = searchParams.get('active');

    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('locale', locale);

    if (type) {
      query = query.eq('type', type);
    }

    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data: templates, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate request body
    const validatedData = createTemplateSchema.parse(body);

    // Check if _user is authenticated
    const { data: { _user: _user }, error: authError } = await supabase.auth.getUser();
    if (authError || !_user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create template
    const { data: template, error } = await supabase
      .from('email_templates')
      .insert({
        ...validatedData,
        created_by: _user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { error: 'Failed to create template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template
    }, { status: 201 });
  } catch (error) {
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
