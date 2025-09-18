/**
 * Document Token API Routes for BuffrSign
 * 
 * This file provides API endpoints for document-specific JWT token operations:
 * - Create document access tokens
 * - Create signature session tokens
 * - Validate document access permissions
 */

import { NextResponse } from 'next/server';
import { jwtService } from '@/lib/services/jwt-service';
import { createClient } from '@/lib/supabase/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/jwt-middleware';

// Create Supabase client
const getSupabaseClient = async () => await createClient();

/**
 * POST /api/documents/[id]/token - Create document access token
 */
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const documentId = pathParts[pathParts.length - 2]; // Get the document ID from the URL path
    const user = request.user;
    const { permissions = ['read'], signatureId, workflowId } = await request.json();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has access to the document
    const supabase = await getSupabaseClient();
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('id, owner_id, shared_with, status')
      .eq('id', documentId)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check document access permissions
    const hasAccess = document.owner_id === user.sub || 
                     (document.shared_with && document.shared_with.includes(user.sub));

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to document' },
        { status: 403 }
      );
    }

    let tokenResponse;

    if (signatureId) {
      // Create signature session token
      tokenResponse = await jwtService.createSignatureToken(
        user.sub,
        documentId,
        signatureId,
        workflowId
      );
    } else {
      // Create document access token
      tokenResponse = await jwtService.createDocumentToken(
        user.sub,
        documentId,
        permissions
      );
    }

    // Log document access
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: user.sub,
      p_action: signatureId ? 'signature_access' : 'document_access',
      p_token_type: signatureId ? 'signature' : 'document',
      p_success: true,
      p_metadata: {
        document_id: documentId,
        signature_id: signatureId,
        workflow_id: workflowId,
        permissions,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      data: tokenResponse,
      document: {
        id: document.id,
        status: document.status,
      },
    });
  } catch (error) {
    console.error('Document token creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create document token' },
      { status: 500 }
    );
  }
}, { requireDocumentAccess: true });

/**
 * GET /api/documents/[id]/token - Validate document access
 */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const documentId = pathParts[pathParts.length - 2]; // Get the document ID from the URL path
    const user = request.user;
    const token = request.token;

    if (!user || !token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get document information
    const supabase = await getSupabaseClient();
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('id, title, owner_id, shared_with, status, created_at')
      .eq('id', documentId)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if token is valid for this document
    let isValidAccess = false;
    let tokenType = 'access';

    if (user.tokenType === 'document' && user.documentId === documentId) {
      isValidAccess = true;
      tokenType = 'document';
    } else if (user.tokenType === 'signature' && user.documentId === documentId) {
      isValidAccess = true;
      tokenType = 'signature';
    } else if (document.owner_id === user.sub || 
               (document.shared_with && document.shared_with.includes(user.sub))) {
      isValidAccess = true;
      tokenType = 'access';
    }

    if (!isValidAccess) {
      return NextResponse.json(
        { error: 'Invalid document access' },
        { status: 403 }
      );
    }

    // Log access validation
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: user.sub,
      p_action: 'document_access',
      p_token_type: tokenType,
      p_success: true,
      p_metadata: {
        document_id: documentId,
        validation_type: 'access_check',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        document: {
          id: document.id,
          title: document.title,
          status: document.status,
          created_at: document.created_at,
        },
        access: {
          type: tokenType,
          permissions: user.permissions,
          expires_at: new Date(user.exp * 1000).toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Document access validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate document access' },
      { status: 500 }
    );
  }
}, { requireDocumentAccess: true });

/**
 * DELETE /api/documents/[id]/token - Revoke document token
 */
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const documentId = pathParts[pathParts.length - 2]; // Get the document ID from the URL path
    const user = request.user;
    const token = request.token;

    if (!user || !token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only allow revoking document or signature tokens
    if (user.tokenType !== 'document' && user.tokenType !== 'signature') {
      return NextResponse.json(
        { error: 'Invalid token type for revocation' },
        { status: 400 }
      );
    }

    // Blacklist the token
    await jwtService.blacklistToken(token);

    // Log token revocation
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: user.sub,
      p_action: 'revoke',
      p_token_type: user.tokenType,
      p_success: true,
      p_metadata: {
        document_id: documentId,
        signature_id: user.signatureId,
        workflow_id: user.workflowId,
        revocation_type: 'document_token',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document token revoked successfully',
    });
  } catch (error) {
    console.error('Document token revocation error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke document token' },
      { status: 500 }
    );
  }
}, { requireDocumentAccess: true });
