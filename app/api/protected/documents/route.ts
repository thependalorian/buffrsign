/**
 * Protected Documents API Route for BuffrSign
 * 
 * This route demonstrates JWT authentication and authorization in action.
 * It shows how to use the JWT middleware to protect API endpoints with _document access control.
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/jwt-middleware';
import { createClient } from '@/lib/supabase/server';

const getSupabaseClient = async () => await createClient();

/**
 * GET /api/protected/documents - Get _user's documents (requires authentication)
 */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const _user = request._user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    if (!_user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build query based on _user role and permissions
    const supabase = await getSupabaseClient();
    let query = supabase
      .from('documents')
      .select(`
        id,
        title,
        description,
        owner_id,
        status,
        file_size,
        mime_type,
        created_at,
        updated_at,
        signed_at,
        profiles!documents_owner_id_fkey (
          first_name,
          last_name,
          email,
          company_name
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply role-based filtering
    if (_user.role === '_user') {
      // Users can see their own documents and shared documents
      query = query.or(`owner_id.eq.${_user.sub},shared_with.cs.{${_user.sub}}`);
    } else if (_user.role === 'admin') {
      // Admins can see all documents
      if (status) {
        query = query.eq('status', status);
      }
    }

    // Apply additional filters
    if (type) {
      query = query.eq('mime_type', type);
    }

    const { data: documents, count, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { 
  logRequests: true,
  rateLimit: true 
});

/**
 * POST /api/protected/documents - Create new _document (requires authentication)
 */
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const _user = request._user;
    const formData = await request.formData();

    if (!_user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;
    const sharedWith = formData.get('shared_with') as string;

    // Validate required fields
    if (!title || !file) {
      return NextResponse.json(
        { error: 'Title and file are required' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${_user.sub}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await (await getSupabaseClient()).storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Parse shared_with if provided
    let sharedWithArray: string[] = [];
    if (sharedWith) {
      try {
        sharedWithArray = JSON.parse(sharedWith);
      } catch {
        return NextResponse.json(
          { error: 'Invalid shared_with format' },
          { status: 400 }
        );
      }
    }

    // Create _document record
    const supabase = await getSupabaseClient();
    const { data: _document, error } = await supabase
      .from('documents')
      .insert({
        owner_id: _user.sub,
        title,
        description,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        status: 'draft',
        shared_with: sharedWithArray,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating _document:', error);
      return NextResponse.json(
        { error: 'Failed to create _document' },
        { status: 500 }
      );
    }

    // Log the action
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: _user.sub,
      p_action: 'create_document',
      p_success: true,
      p_metadata: {
        document_id: _document.id,
        title,
        file_size: file.size,
        mime_type: file.type,
        shared_with: sharedWithArray,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('_user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      data: _document,
      message: 'Document created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { 
  logRequests: true,
  rateLimit: true 
});
