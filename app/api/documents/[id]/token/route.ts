/**
 * Document Token API Routes for BuffrSign
 * 
 * This file provides API endpoints for _document-specific JWT token operations:
 * - Create _document access tokens
 * - Create signature session tokens
 * - Validate _document access permissions
 */

import { NextResponse } from 'next/server';
import { jwtService } from '@/lib/services/jwt-service';
import { createClient } from '@/lib/supabase/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/jwt-middleware';

// Create Supabase client
const getSupabaseClient = async () => await createClient();

/**
 * POST /api/documents/[id]/token - Create _document access token
 */
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const documentId = pathParts[pathParts.length - 2]; // Get the _document ID from the URL path
    const _user = request._user;
    const { permissions = ['read'], signatureId, workflowId } = await request.json();

    if (!_user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if _user has access to the document
    const supabase = await getSupabaseClient();
    const { data: _document, error: documentError } = await supabase
      .from('documents')
      .select('id, owner_id, shared_with, status')
      .eq('id', documentId)
      .single();

    if (documentError || !_document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check _document access permissions
    const hasAccess = _document.owner_id === _user.sub || 
                     (_document.shared_with && (Array.isArray(_document.shared_with) ? _document.shared_with.includes(_user.sub) : false));

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to _document' },
        { status: 403 }
      );
    }

    let tokenResponse;

    if (signatureId) {
      // Create signature session token
      tokenResponse = await jwtService.createSignatureToken(
        _user.sub,
        documentId,
        signatureId,
        workflowId
      );
    } else {
      // Create _document access token
      tokenResponse = await jwtService.createDocumentToken(
        _user.sub,
        documentId,
        permissions
      );
    }

    // Log _document access
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: _user.sub,
      p_action: signatureId ? 'signature_access' : 'document_access',
      p_token_type: signatureId ? 'signature' : '_document',
      p_success: true,
      p_metadata: {
        document_id: documentId,
        signature_id: signatureId,
        workflow_id: workflowId,
        permissions,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('_user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      data: tokenResponse,
      _document: {
        id: _document.id,
        status: _document.status,
      },
    });
  } catch (error) {
    console.error('Document token creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create _document token' },
      { status: 500 }
    );
  }
}, { requireDocumentAccess: true });

/**
 * GET /api/documents/[id]/token - Validate _document access
 */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const documentId = pathParts[pathParts.length - 2]; // Get the _document ID from the URL path
    const _user = request._user;
    const token = request.token;

    if (!_user || !token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get _document information
    const supabase = await getSupabaseClient();
    const { data: _document, error: documentError } = await supabase
      .from('documents')
      .select('id, title, owner_id, shared_with, status, created_at')
      .eq('id', documentId)
      .single();

    if (documentError || !_document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if token is valid for this document
    let isValidAccess = false;
    let tokenType = 'access';

    if (_user.tokenType === '_document' && _user.documentId === documentId) {
      isValidAccess = true;
      tokenType = '_document';
    } else if (_user.tokenType === 'signature' && _user.documentId === documentId) {
      isValidAccess = true;
      tokenType = 'signature';
    } else if (_document.owner_id === _user.sub || 
                (_document.shared_with && (Array.isArray(_document.shared_with) ? _document.shared_with.includes(_user.sub) : false))) {
      isValidAccess = true;
      tokenType = 'access';
    }

    if (!isValidAccess) {
      return NextResponse.json(
        { error: 'Invalid _document access' },
        { status: 403 }
      );
    }

    // Log access validation
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: _user.sub,
      p_action: 'document_access',
      p_token_type: tokenType,
      p_success: true,
      p_metadata: {
        document_id: documentId,
        validation_type: 'access_check',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('_user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        _document: {
          id: _document.id,
          title: _document.title,
          status: _document.status,
          created_at: _document.created_at,
        },
        access: {
          type: tokenType,
          permissions: _user.permissions,
          expires_at: new Date(_user.exp * 1000).toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Document access validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate _document access' },
      { status: 500 }
    );
  }
}, { requireDocumentAccess: true });

/**
 * DELETE /api/documents/[id]/token - Revoke _document token
 */
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const documentId = pathParts[pathParts.length - 2]; // Get the _document ID from the URL path
    const _user = request._user;
    const token = request.token;

    if (!_user || !token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only allow revoking _document or signature tokens
    if (_user.tokenType !== '_document' && _user.tokenType !== 'signature') {
      return NextResponse.json(
        { error: 'Invalid token type for revocation' },
        { status: 400 }
      );
    }

    // Blacklist the token
    await jwtService.blacklistToken(token);

    // Log token revocation
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: _user.sub,
      p_action: 'revoke',
      p_token_type: _user.tokenType,
      p_success: true,
      p_metadata: {
        document_id: documentId,
        signature_id: _user.signatureId,
        workflow_id: _user.workflowId,
        revocation_type: 'document_token',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('_user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document token revoked successfully',
    });
  } catch (error) {
    console.error('Document token revocation error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke _document token' },
      { status: 500 }
    );
  }
}, { requireDocumentAccess: true });
