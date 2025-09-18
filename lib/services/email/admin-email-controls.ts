/**
 * Admin Email Controls Service for BuffrSign
 * 
 * Manages manual email sending by admins with document-specific conflict prevention
 * Founder: George Nekwaya (george@buffr.ai +12065308433)
 */

import { createClient } from '@/lib/supabase/client';
import { EmailService } from './email-service';

export interface EmailConflict {
  type: 'duplicate' | 'timing' | 'content' | 'frequency' | 'document_status' | 'signature_workflow';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  affectedRecipients?: string[];
  lastAutomatedEmail?: Date;
  documentId?: string;
  documentStatus?: string;
}

export interface ManualEmailRequest {
  id: string;
  adminId: string;
  adminName: string;
  emailType: 'document_invitation' | 'signature_reminder' | 'document_completed' | 'document_expired' | 'signature_declined' | 'custom';
  recipients: {
    type: 'signer' | 'document_owner' | 'custom';
    ids: string[];
    emails: string[];
    documentId?: string;
  };
  subject: string;
  content: {
    html: string;
    text: string;
  };
  scheduledFor?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent' | 'failed';
  conflicts: EmailConflict[];
  createdAt: Date;
  approvedAt?: Date;
  sentAt?: Date;
}

export interface EmailQueueItem {
  id: string;
  emailType: string;
  recipientEmail: string;
  subject: string;
  scheduledFor: Date;
  priority: number;
  status: 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  lastAttempt?: Date;
  errorMessage?: string;
  isManual: boolean;
  adminId?: string;
  documentId?: string;
}

export class BuffrSignAdminEmailControlsService {
  private emailService: EmailService;
  private supabase = createClient();

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Check for potential conflicts before sending manual email
   */
  async checkEmailConflicts(request: Omit<ManualEmailRequest, 'id' | 'status' | 'conflicts' | 'createdAt'>): Promise<EmailConflict[]> {
    const conflicts: EmailConflict[] = [];

    try {
      // Check for recent automated emails to same recipients
      const recentEmails = await this.getRecentEmailsForRecipients(request.recipients.emails, 24);
      
      for (const email of recentEmails) {
        if (email.emailType === request.emailType) {
          conflicts.push({
            type: 'duplicate',
            severity: 'high',
            message: `Recent automated ${request.emailType} email sent to ${email.recipientEmail} at ${email.sentAt}`,
            recommendation: 'Consider delaying manual email or targeting different recipients',
            affectedRecipients: [email.recipientEmail],
            lastAutomatedEmail: email.sentAt,
            documentId: email.documentId
          });
        }
      }

      // Check for document-specific conflicts
      if (request.recipients.documentId) {
        const documentConflicts = await this.checkDocumentConflicts(request.recipients.documentId, request.emailType);
        conflicts.push(...documentConflicts);
      }

      // Check for signature workflow conflicts
      const workflowConflicts = await this.checkSignatureWorkflowConflicts(request.recipients.emails, request.emailType);
      conflicts.push(...workflowConflicts);

      // Check for frequency violations
      const frequencyViolations = await this.checkFrequencyViolations(request.recipients.emails, request.emailType);
      conflicts.push(...frequencyViolations);

      // Check for timing conflicts with scheduled automation
      const timingConflicts = await this.checkTimingConflicts(request.scheduledFor, request.emailType);
      conflicts.push(...timingConflicts);

      // Check for content conflicts (similar subjects)
      const contentConflicts = await this.checkContentConflicts(request.subject, request.recipients.emails);
      conflicts.push(...contentConflicts);

    } catch (error) {
      console.error('Error checking email conflicts:', error);
      conflicts.push({
        type: 'duplicate',
        severity: 'medium',
        message: 'Unable to check for conflicts due to system error',
        recommendation: 'Proceed with caution and monitor for duplicates'
      });
    }

    return conflicts;
  }

  /**
   * Submit manual email request for approval
   */
  async submitManualEmailRequest(request: Omit<ManualEmailRequest, 'id' | 'status' | 'conflicts' | 'createdAt'>): Promise<ManualEmailRequest> {
    try {
      // Check for conflicts
      const conflicts = await this.checkEmailConflicts(request);

      // Create manual email request
      const manualEmailRequest: ManualEmailRequest = {
        id: crypto.randomUUID(),
        ...request,
        status: 'pending',
        conflicts,
        createdAt: new Date()
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('manual_email_requests')
        .insert({
          id: manualEmailRequest.id,
          admin_id: manualEmailRequest.adminId,
          admin_name: manualEmailRequest.adminName,
          email_type: manualEmailRequest.emailType,
          recipients: manualEmailRequest.recipients,
          subject: manualEmailRequest.subject,
          content: manualEmailRequest.content,
          scheduled_for: manualEmailRequest.scheduledFor?.toISOString(),
          priority: manualEmailRequest.priority,
          reason: manualEmailRequest.reason,
          status: manualEmailRequest.status,
          conflicts: manualEmailRequest.conflicts,
          created_at: manualEmailRequest.createdAt.toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save manual email request: ${error.message}`);
      }

      // Log admin action
      await this.logAdminAction(manualEmailRequest.adminId, 'manual_email_request_submitted', {
        requestId: manualEmailRequest.id,
        emailType: manualEmailRequest.emailType,
        recipientCount: manualEmailRequest.recipients.emails.length,
        conflicts: conflicts.length,
        documentId: manualEmailRequest.recipients.documentId
      });

      return manualEmailRequest;

    } catch (error) {
      console.error('Error submitting manual email request:', error);
      throw error;
    }
  }

  /**
   * Send manual email immediately (bypass approval for urgent cases)
   */
  async sendManualEmailImmediate(request: Omit<ManualEmailRequest, 'id' | 'status' | 'conflicts' | 'createdAt'>, adminId: string): Promise<void> {
    try {
      // Check for critical conflicts only
      const conflicts = await this.checkEmailConflicts(request);
      const criticalConflicts = conflicts.filter(c => c.severity === 'critical');

      if (criticalConflicts.length > 0) {
        throw new Error(`Critical conflicts detected: ${criticalConflicts.map(c => c.message).join(', ')}`);
      }

      // Send emails immediately using appropriate email service method
      for (const email of request.recipients.emails) {
        let emailResponse;
        
        switch (request.emailType) {
          case 'document_invitation':
            if (request.recipients.documentId) {
              emailResponse = await this.emailService.sendDocumentInvitation({
                documentId: request.recipients.documentId,
                recipientEmail: email,
                recipientName: 'Manual Recipient', // Could be enhanced to get actual name
                documentTitle: 'Manual Document', // Could be enhanced to get actual title
                signUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign/${request.recipients.documentId}`
              });
            }
            break;
          case 'signature_reminder':
            if (request.recipients.documentId) {
              emailResponse = await this.emailService.sendSignatureReminder({
                documentId: request.recipients.documentId,
                recipientEmail: email,
                recipientName: 'Manual Recipient',
                documentTitle: 'Manual Document'
              });
            }
            break;
          case 'document_completed':
            if (request.recipients.documentId) {
              emailResponse = await this.emailService.sendDocumentCompleted({
                documentId: request.recipients.documentId,
                recipientEmail: email,
                recipientName: 'Manual Recipient',
                documentTitle: 'Manual Document'
              });
            }
            break;
          case 'document_expired':
            if (request.recipients.documentId) {
              emailResponse = await this.emailService.sendDocumentExpired({
                documentId: request.recipients.documentId,
                recipientEmail: email,
                recipientName: 'Manual Recipient',
                documentTitle: 'Manual Document',
                expiredAt: new Date()
              });
            }
            break;
          case 'signature_declined':
            if (request.recipients.documentId) {
              emailResponse = await this.emailService.sendSignatureDeclined({
                documentId: request.recipients.documentId,
                recipientEmail: email,
                recipientName: 'Manual Recipient',
                documentTitle: 'Manual Document',
                signerName: 'Unknown Signer',
                signerEmail: email,
                declineReason: 'Manual decline notification'
              });
            }
            break;
          default:
            // Custom email
            emailResponse = await this.emailService.sendEmail({
              to: email,
              subject: request.subject,
              html: request.content.html,
              text: request.content.text
            });
        }
      }

      // Log immediate send action
      await this.logAdminAction(adminId, 'manual_email_sent_immediate', {
        emailType: request.emailType,
        recipientCount: request.recipients.emails.length,
        conflicts: conflicts.length,
        reason: request.reason,
        documentId: request.recipients.documentId
      });

    } catch (error) {
      console.error('Error sending manual email immediately:', error);
      throw error;
    }
  }

  /**
   * Get pending manual email requests
   */
  async getPendingManualEmailRequests(): Promise<ManualEmailRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('manual_email_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch pending requests: ${error.message}`);
      }

      return data?.map(this.mapDbToManualEmailRequest) || [];

    } catch (error) {
      console.error('Error fetching pending manual email requests:', error);
      throw error;
    }
  }

  /**
   * Get email queue status
   */
  async getEmailQueueStatus(): Promise<{
    total: number;
    pending: number;
    sending: number;
    failed: number;
    manual: number;
    automated: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('email_queue')
        .select('status, is_manual');

      if (error) {
        throw new Error(`Failed to fetch queue status: ${error.message}`);
      }

      const stats = {
        total: data?.length || 0,
        pending: 0,
        sending: 0,
        failed: 0,
        manual: 0,
        automated: 0
      };

      data?.forEach(item => {
        if (item.status === 'queued') stats.pending++;
        if (item.status === 'sending') stats.sending++;
        if (item.status === 'failed') stats.failed++;
        if (item.is_manual) stats.manual++;
        else stats.automated++;
      });

      return stats;

    } catch (error) {
      console.error('Error fetching email queue status:', error);
      throw error;
    }
  }

  // Private helper methods

  private async getRecentEmailsForRecipients(emails: string[], hoursBack: number): Promise<any[]> {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    const { data, error } = await this.supabase
      .from('email_notifications')
      .select('*')
      .in('recipient_email', emails)
      .gte('sent_at', since.toISOString())
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching recent emails:', error);
      return [];
    }

    return data || [];
  }

  private async checkDocumentConflicts(documentId: string, emailType: string): Promise<EmailConflict[]> {
    const conflicts: EmailConflict[] = [];

    try {
      // Get document status
      const { data: document } = await this.supabase
        .from('documents')
        .select('status, title, created_at')
        .eq('id', documentId)
        .single();

      if (!document) {
        conflicts.push({
          type: 'document_status',
          severity: 'critical',
          message: 'Document not found',
          recommendation: 'Verify document ID before sending email',
          documentId
        });
        return conflicts;
      }

      // Check if document status conflicts with email type
      if (document.status === 'completed' && emailType === 'document_invitation') {
        conflicts.push({
          type: 'document_status',
          severity: 'high',
          message: 'Document is already completed, invitation email may be inappropriate',
          recommendation: 'Consider sending completion notification instead',
          documentId,
          documentStatus: document.status
        });
      }

      if (document.status === 'draft' && emailType === 'signature_reminder') {
        conflicts.push({
          type: 'document_status',
          severity: 'high',
          message: 'Document is still in draft status, reminder email may be premature',
          recommendation: 'Wait for document to be sent before sending reminders',
          documentId,
          documentStatus: document.status
        });
      }

      if (document.status === 'expired' && ['document_invitation', 'signature_reminder'].includes(emailType)) {
        conflicts.push({
          type: 'document_status',
          severity: 'critical',
          message: 'Document has expired, sending invitation or reminder emails is inappropriate',
          recommendation: 'Send document expired notification instead',
          documentId,
          documentStatus: document.status
        });
      }

    } catch (error) {
      console.error('Error checking document conflicts:', error);
    }

    return conflicts;
  }

  private async checkSignatureWorkflowConflicts(emails: string[], emailType: string): Promise<EmailConflict[]> {
    const conflicts: EmailConflict[] = [];

    try {
      // Check if recipients have already signed or declined
      const { data: signatures } = await this.supabase
        .from('document_signatures')
        .select('signer_email, status, document_id')
        .in('signer_email', emails);

      signatures?.forEach(signature => {
        if (signature.status === 'signed' && emailType === 'signature_reminder') {
          conflicts.push({
            type: 'signature_workflow',
            severity: 'medium',
            message: `Recipient ${signature.signer_email} has already signed the document`,
            recommendation: 'Remove signed recipients from reminder list',
            affectedRecipients: [signature.signer_email],
            documentId: signature.document_id
          });
        }

        if (signature.status === 'declined' && ['document_invitation', 'signature_reminder'].includes(emailType)) {
          conflicts.push({
            type: 'signature_workflow',
            severity: 'high',
            message: `Recipient ${signature.signer_email} has declined to sign`,
            recommendation: 'Do not send invitation or reminder to declined signers',
            affectedRecipients: [signature.signer_email],
            documentId: signature.document_id
          });
        }
      });

    } catch (error) {
      console.error('Error checking signature workflow conflicts:', error);
    }

    return conflicts;
  }

  private async checkFrequencyViolations(emails: string[], emailType: string): Promise<EmailConflict[]> {
    const conflicts: EmailConflict[] = [];
    
    // Check if any recipient has received more than 3 emails in the last 24 hours
    const recentCounts = await this.supabase
      .from('email_notifications')
      .select('recipient_email')
      .in('recipient_email', emails)
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const emailCounts = new Map<string, number>();
    recentCounts.data?.forEach(item => {
      emailCounts.set(item.recipient_email, (emailCounts.get(item.recipient_email) || 0) + 1);
    });

    emailCounts.forEach((count, email) => {
      if (count >= 3) {
        conflicts.push({
          type: 'frequency',
          severity: 'medium',
          message: `Recipient ${email} has received ${count} emails in the last 24 hours`,
          recommendation: 'Consider delaying this email to avoid overwhelming the recipient',
          affectedRecipients: [email]
        });
      }
    });

    return conflicts;
  }

  private async checkTimingConflicts(scheduledFor: Date | undefined, emailType: string): Promise<EmailConflict[]> {
    const conflicts: EmailConflict[] = [];

    if (!scheduledFor) return conflicts;

    // Check if there's a scheduled automation for the same time
    const { data: scheduledAutomation } = await this.supabase
      .from('scheduled_reminders')
      .select('*')
      .eq('reminder_type', emailType)
      .gte('scheduled_for', new Date(scheduledFor.getTime() - 30 * 60 * 1000).toISOString())
      .lte('scheduled_for', new Date(scheduledFor.getTime() + 30 * 60 * 1000).toISOString());

    if (scheduledAutomation && scheduledAutomation.length > 0) {
      conflicts.push({
        type: 'timing',
        severity: 'medium',
        message: `Scheduled automation for ${emailType} is planned around the same time`,
        recommendation: 'Consider adjusting the timing to avoid conflicts'
      });
    }

    return conflicts;
  }

  private async checkContentConflicts(subject: string, emails: string[]): Promise<EmailConflict[]> {
    const conflicts: EmailConflict[] = [];

    // Check for similar subjects in recent emails
    const { data: similarEmails } = await this.supabase
      .from('email_notifications')
      .select('subject, recipient_email, sent_at')
      .in('recipient_email', emails)
      .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    similarEmails?.forEach(email => {
      const similarity = this.calculateStringSimilarity(subject.toLowerCase(), email.subject.toLowerCase());
      if (similarity > 0.8) {
        conflicts.push({
          type: 'content',
          severity: 'low',
          message: `Similar subject line sent to ${email.recipient_email} on ${email.sent_at}`,
          recommendation: 'Consider using a different subject line to avoid confusion',
          affectedRecipients: [email.recipient_email]
        });
      }
    });

    return conflicts;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private async logAdminAction(adminId: string, action: string, details: any): Promise<void> {
    try {
      await this.supabase
        .from('admin_email_activity')
        .insert({
          admin_id: adminId,
          action,
          details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  private mapDbToManualEmailRequest(data: any): ManualEmailRequest {
    return {
      id: data.id,
      adminId: data.admin_id,
      adminName: data.admin_name,
      emailType: data.email_type,
      recipients: data.recipients,
      subject: data.subject,
      content: data.content,
      scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
      priority: data.priority,
      reason: data.reason,
      status: data.status,
      conflicts: data.conflicts || [],
      createdAt: new Date(data.created_at),
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined
    };
  }
}
