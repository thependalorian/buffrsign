/**
 * JWT Token Management API Routes for BuffrSign
 * 
 * This file provides API endpoints for JWT token operations including:
 * - Token creation and refresh
 * - Token validation
 * - Token revocation
 * - Document and signature token creation
 * - User authentication with JWT
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtService } from '@/lib/services/jwt-service';
import { createClient } from '@/lib/supabase/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/jwt-middleware';

// Create Supabase client
const getSupabaseClient = async () => await createClient();

/**
 * POST /api/auth/token - Create new token pair
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user with Supabase
    const supabase = await getSupabaseClient();
    const { data: authData, error: authError } = await (await getSupabaseClient()).auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, permissions')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Create JWT token pair
    const tokenPair = await jwtService.createTokenPair({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      permissions: profile.permissions || [],
    });

    // Log successful login
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: profile.id,
      p_action: 'login',
      p_token_type: 'access',
      p_success: true,
      p_metadata: {
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      data: tokenPair,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        permissions: profile.permissions || [],
      },
    });
  } catch (error) {
    console.error('Token creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/token - Refresh access token
 */
export async function PUT(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Refresh the access token
    const newTokenPair = await jwtService.refreshAccessToken(refreshToken);

    // Log successful refresh
    const payload = await jwtService.verifyToken(refreshToken, 'refresh');
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: payload.sub,
      p_action: 'refresh',
      p_token_type: 'refresh',
      p_success: true,
      p_metadata: {
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      data: newTokenPair,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Log failed refresh attempt
    try {
      const payload = await jwtService.verifyTokenLegacy(request.headers.get('authorization')?.replace('Bearer ', '') || '');
      await (await getSupabaseClient()).rpc('log_token_action', {
        p_user_id: payload.sub,
        p_action: 'refresh',
        p_token_type: 'refresh',
        p_success: false,
        p_error_message: error instanceof Error ? error.message : 'Unknown error',
        p_metadata: {
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
          user_agent: request.headers.get('user-agent'),
        },
      });
    } catch (logError) {
      console.error('Failed to log refresh error:', logError);
    }

    return NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/auth/token - Revoke token (logout)
 */
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const token = request.token;
    const user = request.user;

    if (!token || !user) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Blacklist the current token
    await jwtService.blacklistToken(token);

    // Revoke all user tokens (optional - for security)
    const revokeAll = request.nextUrl.searchParams.get('revoke_all') === 'true';
    if (revokeAll) {
      await jwtService.revokeAllUserTokens(user.sub);
    }

    // Log successful logout
    await (await getSupabaseClient()).rpc('log_token_action', {
      p_user_id: user.sub,
      p_action: 'logout',
      p_token_type: user.tokenType,
      p_success: true,
      p_metadata: {
        revoke_all: revokeAll,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        user_agent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Token revoked successfully',
    });
  } catch (error) {
    console.error('Token revocation error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke token' },
      { status: 500 }
    );
  }
});

/**
 * GET /api/auth/token - Validate token
 */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user;

    if (!user) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 401 }
      );
    }

    // Get fresh user profile
    const { data: profile, error: profileError } = await (await getSupabaseClient())
      .from('profiles')
      .select('id, email, role, permissions, first_name, last_name, company_name')
      .eq('id', user.sub)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          permissions: profile.permissions || [],
          first_name: profile.first_name,
          last_name: profile.last_name,
          company_name: profile.company_name,
        },
        token: {
          type: user.tokenType,
          expires_at: new Date(user.exp * 1000).toISOString(),
          issued_at: new Date(user.iat * 1000).toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Token validation failed' },
      { status: 401 }
    );
  }
});
