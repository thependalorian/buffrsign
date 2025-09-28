/**
 * Document Email Integration Hook
 * 
 * React hook for managing email notifications in _document workflows
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';


export interface DocumentEmailNotification {
  id: string;
  recipient_email: string;
  recipient_name: string;
  template_type: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  error_message?: string;
  created_at: string;
}

export interface DocumentRecipient {
  id: string;
  email: string;
  name: string;
  role: 'signer' | 'witness' | 'approver' | 'viewer';
  signingOrder?: number;
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined' | 'expired';
}

export interface UseDocumentEmailIntegrationReturn {
  // Data
  notifications: DocumentEmailNotification[];
  recipients: DocumentRecipient[];
  loading: boolean;
  error: string | null;
  
  // Actions
  sendInvitations: (recipients: DocumentRecipient[]) => Promise<void>;
  sendReminders: (recipientIds: string[]) => Promise<void>;
  sendInvitation: (recipientId: string) => Promise<void>;
  sendReminder: (recipientId: string) => Promise<void>;
  notifyCompletion: () => Promise<void>;
  notifyExpiration: () => Promise<void>;
  notifyDecline: (recipientId: string, reason?: string) => Promise<void>;
  
  // Utilities
  refreshNotifications: () => Promise<void>;
  refreshRecipients: () => Promise<void>;
}

export function useDocumentEmailIntegration(documentId: string): UseDocumentEmailIntegrationReturn {
  const [notifications, setNotifications] = useState<DocumentEmailNotification[]>([]);
  const [recipients, setRecipients] = useState<DocumentRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch email notifications for the document
  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .select(`
          id,
          recipient_email,
          recipient_name,
          template_type,
          status,
          sent_at,
          delivered_at,
          opened_at,
          clicked_at,
          bounced_at,
          error_message,
          created_at
        `)
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data as DocumentEmailNotification[]) || []);
    } catch (err) {
      console.error('Error fetching email notifications:', err);
      setError('Failed to fetch email notifications');
    }
  }, [documentId]);

  // Fetch _document recipients
  const fetchRecipients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('document_recipients')
        .select('*')
        .eq('document_id', documentId)
        .order('signing_order', { ascending: true });

      if (error) throw error;
      setRecipients((data as DocumentRecipient[]) || []);
    } catch (err) {
      console.error('Error fetching recipients:', err);
      setError('Failed to fetch recipients');
    }
  }, [documentId]);

  // Send email action
  const sendEmailAction = useCallback(async (action: string, data?: unknown) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...(data as Record<string, unknown>) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const result = await response.json();
      
      // Refresh notifications after successful action
      await fetchNotifications();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [documentId, fetchNotifications]);

  // Send bulk invitations
  const sendInvitations = useCallback(async (recipients: DocumentRecipient[]) => {
    await sendEmailAction('send_invitations', { recipients });
  }, [sendEmailAction]);

  // Send bulk reminders
  const sendReminders = useCallback(async (recipientIds: string[]) => {
    await sendEmailAction('send_reminders', { recipients: recipientIds });
  }, [sendEmailAction]);

  // Send single invitation
  const sendInvitation = useCallback(async (recipientId: string) => {
    await sendEmailAction('send_invitation', { recipientId });
  }, [sendEmailAction]);

  // Send single reminder
  const sendReminder = useCallback(async (recipientId: string) => {
    await sendEmailAction('send_reminder', { recipientId });
  }, [sendEmailAction]);

  // Notify completion
  const notifyCompletion = useCallback(async () => {
    await sendEmailAction('notify_completion');
  }, [sendEmailAction]);

  // Notify expiration
  const notifyExpiration = useCallback(async () => {
    await sendEmailAction('notify_expiration');
  }, [sendEmailAction]);

  // Notify decline
  const notifyDecline = useCallback(async (recipientId: string, reason?: string) => {
    await sendEmailAction('notify_decline', { recipientId, reason });
  }, [sendEmailAction]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Refresh recipients
  const refreshRecipients = useCallback(async () => {
    await fetchRecipients();
  }, [fetchRecipients]);

  // Initial data fetch
  useEffect(() => {
    if (documentId) {
      fetchNotifications();
      fetchRecipients();
    }
  }, [documentId, fetchNotifications, fetchRecipients]);

  return {
    // Data
    notifications,
    recipients,
    loading,
    error,
    
    // Actions
    sendInvitations,
    sendReminders,
    sendInvitation,
    sendReminder,
    notifyCompletion,
    notifyExpiration,
    notifyDecline,
    
    // Utilities
    refreshNotifications,
    refreshRecipients,
  };
}
