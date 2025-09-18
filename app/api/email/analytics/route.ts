/**
 * Email Analytics API Route
 * 
 * Handles fetching email analytics data.
 * POST /api/email/analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailAnalyticsRequest, EmailAnalyticsResponse } from '@/lib/types/email';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: EmailAnalyticsRequest = await request.json();

    // Validate required fields
    if (!body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: 'Missing required fields: start_date, end_date' },
        { status: 400 }
      );
    }

    // Validate date format
    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Fetch analytics data
    let query = supabase
      .from('email_analytics')
      .select('*')
      .gte('date', body.start_date)
      .lte('date', body.end_date)
      .order('date', { ascending: true });

    if (body.email_type) {
      query = query.eq('email_type', body.email_type);
    }

    const { data: analytics, error: analyticsError } = await query;

    if (analyticsError) {
      throw analyticsError;
    }

    // Calculate summary statistics
    const summary = {
      total_sent: analytics?.reduce((sum, item) => sum + item.total_sent, 0) || 0,
      total_delivered: analytics?.reduce((sum, item) => sum + item.total_delivered, 0) || 0,
      total_opened: analytics?.reduce((sum, item) => sum + item.total_opened, 0) || 0,
      total_clicked: analytics?.reduce((sum, item) => sum + item.total_clicked, 0) || 0,
      avg_delivery_rate: analytics?.length ? 
        Math.round(analytics.reduce((sum, item) => sum + item.delivery_rate, 0) / analytics.length) : 0,
      avg_open_rate: analytics?.length ? 
        Math.round(analytics.reduce((sum, item) => sum + item.open_rate, 0) / analytics.length) : 0,
      avg_click_rate: analytics?.length ? 
        Math.round(analytics.reduce((sum, item) => sum + item.click_rate, 0) / analytics.length) : 0,
    };

    const response: EmailAnalyticsResponse = {
      analytics: analytics || [],
      summary,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Email analytics API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const emailType = searchParams.get('email_type');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: start_date, end_date' },
        { status: 400 }
      );
    }

    // Fetch analytics data
    let query = supabase
      .from('email_analytics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (emailType) {
      query = query.eq('email_type', emailType);
    }

    const { data: analytics, error: analyticsError } = await query;

    if (analyticsError) {
      throw analyticsError;
    }

    // Calculate summary statistics
    const summary = {
      total_sent: analytics?.reduce((sum, item) => sum + item.total_sent, 0) || 0,
      total_delivered: analytics?.reduce((sum, item) => sum + item.total_delivered, 0) || 0,
      total_opened: analytics?.reduce((sum, item) => sum + item.total_opened, 0) || 0,
      total_clicked: analytics?.reduce((sum, item) => sum + item.total_clicked, 0) || 0,
      avg_delivery_rate: analytics?.length ? 
        Math.round(analytics.reduce((sum, item) => sum + item.delivery_rate, 0) / analytics.length) : 0,
      avg_open_rate: analytics?.length ? 
        Math.round(analytics.reduce((sum, item) => sum + item.open_rate, 0) / analytics.length) : 0,
      avg_click_rate: analytics?.length ? 
        Math.round(analytics.reduce((sum, item) => sum + item.click_rate, 0) / analytics.length) : 0,
    };

    const response: EmailAnalyticsResponse = {
      analytics: analytics || [],
      summary,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Email analytics API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
