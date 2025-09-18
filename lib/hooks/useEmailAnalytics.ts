/**
 * useEmailAnalytics Hook
 * 
 * React hook for managing email analytics in BuffrSign.
 * Provides functionality to fetch and analyze email performance data.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  EmailAnalytics,
  EmailType,
  UseEmailAnalyticsOptions,
  EmailAnalyticsResponse,
} from '@/lib/types/email';

export function useEmailAnalytics(options: UseEmailAnalyticsOptions) {
  const [analytics, setAnalytics] = useState<EmailAnalytics[]>([]);
  const [summary, setSummary] = useState<EmailAnalyticsResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  /**
   * Fetch email analytics
   */
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: options.startDate,
          end_date: options.endDate,
          email_type: options.emailType,
          group_by: options.groupBy,
        }),
      });

      const result: EmailAnalyticsResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch email analytics');
      }

      setAnalytics(result.analytics);
      setSummary(result.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch email analytics');
    } finally {
      setLoading(false);
    }
  }, [options.startDate, options.endDate, options.emailType, options.groupBy]);

  /**
   * Get analytics by email type
   */
  const getAnalyticsByType = useCallback((emailType: EmailType): EmailAnalytics[] => {
    return analytics.filter(item => item.email_type === emailType);
  }, [analytics]);

  /**
   * Get analytics for specific date range
   */
  const getAnalyticsForDateRange = useCallback((startDate: string, endDate: string): EmailAnalytics[] => {
    return analytics.filter(item => 
      item.date >= startDate && item.date <= endDate
    );
  }, [analytics]);

  /**
   * Get total emails sent
   */
  const getTotalSent = useCallback((): number => {
    return analytics.reduce((total, item) => total + item.total_sent, 0);
  }, [analytics]);

  /**
   * Get total delivered
   */
  const getTotalDelivered = useCallback((): number => {
    return analytics.reduce((total, item) => total + item.total_delivered, 0);
  }, [analytics]);

  /**
   * Get total opened
   */
  const getTotalOpened = useCallback((): number => {
    return analytics.reduce((total, item) => total + item.total_opened, 0);
  }, [analytics]);

  /**
   * Get total clicked
   */
  const getTotalClicked = useCallback((): number => {
    return analytics.reduce((total, item) => total + item.total_clicked, 0);
  }, [analytics]);

  /**
   * Get total bounced
   */
  const getTotalBounced = useCallback((): number => {
    return analytics.reduce((total, item) => total + item.total_bounced, 0);
  }, [analytics]);

  /**
   * Get total failed
   */
  const getTotalFailed = useCallback((): number => {
    return analytics.reduce((total, item) => total + item.total_failed, 0);
  }, [analytics]);

  /**
   * Get average delivery rate
   */
  const getAverageDeliveryRate = useCallback((): number => {
    if (analytics.length === 0) return 0;
    
    const totalRate = analytics.reduce((sum, item) => sum + item.delivery_rate, 0);
    return Math.round(totalRate / analytics.length);
  }, [analytics]);

  /**
   * Get average open rate
   */
  const getAverageOpenRate = useCallback((): number => {
    if (analytics.length === 0) return 0;
    
    const totalRate = analytics.reduce((sum, item) => sum + item.open_rate, 0);
    return Math.round(totalRate / analytics.length);
  }, [analytics]);

  /**
   * Get average click rate
   */
  const getAverageClickRate = useCallback((): number => {
    if (analytics.length === 0) return 0;
    
    const totalRate = analytics.reduce((sum, item) => sum + item.click_rate, 0);
    return Math.round(totalRate / analytics.length);
  }, [analytics]);

  /**
   * Get average bounce rate
   */
  const getAverageBounceRate = useCallback((): number => {
    if (analytics.length === 0) return 0;
    
    const totalRate = analytics.reduce((sum, item) => sum + item.bounce_rate, 0);
    return Math.round(totalRate / analytics.length);
  }, [analytics]);

  /**
   * Get best performing email type
   */
  const getBestPerformingType = useCallback((): EmailType | null => {
    if (analytics.length === 0) return null;

    const typeStats = new Map<EmailType, { total: number; rate: number }>();

    analytics.forEach(item => {
      const existing = typeStats.get(item.email_type) || { total: 0, rate: 0 };
      typeStats.set(item.email_type, {
        total: existing.total + item.total_sent,
        rate: existing.rate + item.delivery_rate,
      });
    });

    let bestType: EmailType | null = null;
    let bestRate = 0;

    typeStats.forEach((stats, type) => {
      const avgRate = stats.rate / (stats.total > 0 ? 1 : 1);
      if (avgRate > bestRate) {
        bestRate = avgRate;
        bestType = type;
      }
    });

    return bestType;
  }, [analytics]);

  /**
   * Get worst performing email type
   */
  const getWorstPerformingType = useCallback((): EmailType | null => {
    if (analytics.length === 0) return null;

    const typeStats = new Map<EmailType, { total: number; rate: number }>();

    analytics.forEach(item => {
      const existing = typeStats.get(item.email_type) || { total: 0, rate: 0 };
      typeStats.set(item.email_type, {
        total: existing.total + item.total_sent,
        rate: existing.rate + item.delivery_rate,
      });
    });

    let worstType: EmailType | null = null;
    let worstRate = 100;

    typeStats.forEach((stats, type) => {
      const avgRate = stats.rate / (stats.total > 0 ? 1 : 1);
      if (avgRate < worstRate) {
        worstRate = avgRate;
        worstType = type;
      }
    });

    return worstType;
  }, [analytics]);

  /**
   * Get trend data for charts
   */
  const getTrendData = useCallback(() => {
    return analytics.map(item => ({
      date: item.date,
      sent: item.total_sent,
      delivered: item.total_delivered,
      opened: item.total_opened,
      clicked: item.total_clicked,
      bounced: item.total_bounced,
      failed: item.total_failed,
      deliveryRate: item.delivery_rate,
      openRate: item.open_rate,
      clickRate: item.click_rate,
      bounceRate: item.bounce_rate,
    }));
  }, [analytics]);

  /**
   * Get performance by email type
   */
  const getPerformanceByType = useCallback(() => {
    const typeMap = new Map<EmailType, {
      totalSent: number;
      totalDelivered: number;
      totalOpened: number;
      totalClicked: number;
      totalBounced: number;
      totalFailed: number;
      avgDeliveryRate: number;
      avgOpenRate: number;
      avgClickRate: number;
      avgBounceRate: number;
    }>();

    analytics.forEach(item => {
      const existing = typeMap.get(item.email_type) || {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        totalFailed: 0,
        avgDeliveryRate: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        avgBounceRate: 0,
      };

      typeMap.set(item.email_type, {
        totalSent: existing.totalSent + item.total_sent,
        totalDelivered: existing.totalDelivered + item.total_delivered,
        totalOpened: existing.totalOpened + item.total_opened,
        totalClicked: existing.totalClicked + item.total_clicked,
        totalBounced: existing.totalBounced + item.total_bounced,
        totalFailed: existing.totalFailed + item.total_failed,
        avgDeliveryRate: existing.avgDeliveryRate + item.delivery_rate,
        avgOpenRate: existing.avgOpenRate + item.open_rate,
        avgClickRate: existing.avgClickRate + item.click_rate,
        avgBounceRate: existing.avgBounceRate + item.bounce_rate,
      });
    });

    // Calculate averages
    typeMap.forEach((stats, type) => {
      const count = analytics.filter(item => item.email_type === type).length;
      if (count > 0) {
        stats.avgDeliveryRate = Math.round(stats.avgDeliveryRate / count);
        stats.avgOpenRate = Math.round(stats.avgOpenRate / count);
        stats.avgClickRate = Math.round(stats.avgClickRate / count);
        stats.avgBounceRate = Math.round(stats.avgBounceRate / count);
      }
    });

    return Array.from(typeMap.entries()).map(([type, stats]) => ({
      emailType: type,
      ...stats,
    }));
  }, [analytics]);

  /**
   * Export analytics data
   */
  const exportAnalytics = useCallback((format: 'csv' | 'json' = 'json') => {
    if (format === 'csv') {
      const headers = [
        'Date',
        'Email Type',
        'Total Sent',
        'Total Delivered',
        'Total Opened',
        'Total Clicked',
        'Total Bounced',
        'Total Failed',
        'Delivery Rate',
        'Open Rate',
        'Click Rate',
        'Bounce Rate',
      ];

      const csvContent = [
        headers.join(','),
        ...analytics.map(item => [
          item.date,
          item.email_type,
          item.total_sent,
          item.total_delivered,
          item.total_opened,
          item.total_clicked,
          item.total_bounced,
          item.total_failed,
          item.delivery_rate,
          item.open_rate,
          item.click_rate,
          item.bounce_rate,
        ].join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `email-analytics-${options.startDate}-to-${options.endDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const dataStr = JSON.stringify({ analytics, summary }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `email-analytics-${options.startDate}-to-${options.endDate}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [analytics, summary, options.startDate, options.endDate]);

  // Load analytics on mount and when options change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    // Data
    analytics,
    summary,
    loading,
    error,

    // Actions
    fetchAnalytics,
    exportAnalytics,

    // Filters
    getAnalyticsByType,
    getAnalyticsForDateRange,

    // Totals
    getTotalSent,
    getTotalDelivered,
    getTotalOpened,
    getTotalClicked,
    getTotalBounced,
    getTotalFailed,

    // Averages
    getAverageDeliveryRate,
    getAverageOpenRate,
    getAverageClickRate,
    getAverageBounceRate,

    // Performance analysis
    getBestPerformingType,
    getWorstPerformingType,
    getTrendData,
    getPerformanceByType,

    // Computed values
    hasData: analytics.length > 0,
    dateRange: {
      start: options.startDate,
      end: options.endDate,
    },
  };
}
