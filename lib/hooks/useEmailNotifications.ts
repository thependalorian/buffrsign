/**
 * useEmailNotifications Hook
 * 
 * React hook for managing email notifications in BuffrSign.
 * Provides functionality to send emails, track status, and manage notifications.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  EmailNotification,
  EmailType,
  EmailStatus,
  SendEmailRequest,
  SendEmailResponse,
  UseEmailNotificationsOptions,
} from '@/lib/types/email';

export function useEmailNotifications(options: UseEmailNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const _supabase = createClient();

  /**
   * Fetch email notifications
   */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('email_notifications')
        .select('*')
        .order('sent_at', { ascending: false });

      if (options.documentId) {
        query = query.eq('document_id', options.documentId);
      }

      if (options._emailType) {
        query = query.eq('email_type', options._emailType);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setNotifications(data || []);
    } catch (err: unknown) {
      setError(err.message || 'Failed to fetch email notifications');
    } finally {
      setLoading(false);
    }
  }, [options.documentId, options._emailType, options.limit, options.offset, supabase]);

  /**
   * Send email
   */
  const sendEmail = useCallback(async (request: SendEmailRequest): Promise<SendEmailResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Refresh notifications after sending
      await fetchNotifications();

      return result;
    } catch (err: unknown) {
      setError(err.message || 'Failed to send email');
      return {
        success: false,
        error: err.message || 'Failed to send email',
      };
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  /**
   * Get email statistics
   */
  const getEmailStats = useCallback(async (documentId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_email_notification_stats', { doc_id: documentId });

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err: unknown) {
      setError(err.message || 'Failed to fetch email statistics');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /**
   * Retry failed email
   */
  const retryEmail = useCallback(async (notificationId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/email/retry/${notificationId}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to retry email');
      }

      // Refresh notifications after retry
      await fetchNotifications();

      return result.success;
    } catch (err: unknown) {
      setError(err.message || 'Failed to retry email');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  /**
   * Cancel scheduled email
   */
  const cancelEmail = useCallback(async (notificationId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/email/cancel/${notificationId}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel email');
      }

      // Refresh notifications after cancellation
      await fetchNotifications();

      return result.success;
    } catch (err: unknown) {
      setError(err.message || 'Failed to cancel email');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  /**
   * Get notification by ID
   */
  const getNotification = useCallback(async (id: string): Promise<EmailNotification | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err: unknown) {
      setError(err.message || 'Failed to fetch notification');
      return null;
    }
  }, [supabase]);

  /**
   * Filter notifications by status
   */
  const getNotificationsByStatus = useCallback((status: EmailStatus): EmailNotification[] => {
    return notifications.filter(notification => notification.status === status);
  }, [notifications]);

  /**
   * Filter notifications by type
   */
  const getNotificationsByType = useCallback((type: EmailType): EmailNotification[] => {
    return notifications.filter(notification => notification.email_type === type);
  }, [notifications]);

  /**
   * Get recent notifications
   */
  const getRecentNotifications = useCallback((hours: number = 24): EmailNotification[] => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return notifications.filter(notification => 
      new Date(notification.sent_at) >= cutoff
    );
  }, [notifications]);

  /**
   * Get failed notifications
   */
  const getFailedNotifications = useCallback((): EmailNotification[] => {
    return notifications.filter(notification => 
      notification.status === 'failed' || notification.status === 'bounced'
    );
  }, [notifications]);

  /**
   * Get delivery rate
   */
  const getDeliveryRate = useCallback((): number => {
    if (notifications.length === 0) return 0;
    
    const delivered = notifications.filter(n => n.status === 'delivered').length;
    return Math.round((delivered / notifications.length) * 100);
  }, [notifications]);

  /**
   * Get open rate
   */
  const getOpenRate = useCallback((): number => {
    const delivered = notifications.filter(n => n.status === 'delivered' || n.status === 'opened' || n.status === 'clicked');
    if (delivered.length === 0) return 0;
    
    const opened = notifications.filter(n => n.status === 'opened' || n.status === 'clicked').length;
    return Math.round((opened / delivered.length) * 100);
  }, [notifications]);

  /**
   * Get click rate
   */
  const getClickRate = useCallback((): number => {
    const opened = notifications.filter(n => n.status === 'opened' || n.status === 'clicked');
    if (opened.length === 0) return 0;
    
    const clicked = notifications.filter(n => n.status === 'clicked').length;
    return Math.round((clicked / opened.length) * 100);
  }, [notifications]);

  // Load notifications on mount and when options change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    // Data
    notifications,
    loading,
    error,

    // Actions
    sendEmail,
    retryEmail,
    cancelEmail,
    fetchNotifications,
    getNotification,
    getEmailStats,

    // Filters
    getNotificationsByStatus,
    getNotificationsByType,
    getRecentNotifications,
    getFailedNotifications,

    // Analytics
    getDeliveryRate,
    getOpenRate,
    getClickRate,

    // Computed values
    totalNotifications: notifications.length,
    failedCount: getFailedNotifications().length,
    recentCount: getRecentNotifications().length,
  };
}
