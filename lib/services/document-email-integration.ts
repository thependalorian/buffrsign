/**
 * Document Email Integration Service
 * 
 * Integrates the email notification system with the _document workflow
 * Handles automatic email sending for _document lifecycle events
 */

import { EmailService } from './email/email-service';
import { createClient } from '@/lib/supabase/server';
import { DocumentStatus, SignatureStatus } from '@/lib/types';

export interface DocumentEmailIntegration {
  // Document lifecycle events
  onDocumentCreated: (documentId: string) => Promise<void>;
  onDocumentShared: (documentId: string, recipients: DocumentRecipient[]) => Promise<void>;
  onDocumentSigned: (documentId: string, signerId: string) => Promise<void>;
  onDocumentCompleted: (documentId: string) => Promise<void>;
  onDocumentExpired: (documentId: string) => Promise<void>;
  
  // Signature workflow events
  onSignatureRequested: (documentId: string, recipientId: string) => Promise<void>;
  onSignatureReminder: (documentId: string, recipientId: string) => Promise<void>;
  onSignatureCompleted: (documentId: string, recipientId: string) => Promise<void>;
  onSignatureDeclined: (documentId: string, recipientId: string, reason?: string) => Promise<void>;
  
  // Bulk operations
  sendBulkInvitations: (documentId: string, recipients: DocumentRecipient[]) => Promise<void>;
  sendBulkReminders: (documentId: string, pendingRecipients: string[]) => Promise<void>;
}

export interface DocumentRecipient {
  id: string;
  email: string;
  name: string;
  role: 'signer' | 'witness' | 'approver' | 'viewer';
  signingOrder?: number;
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined' | 'expired';
}

export interface DocumentData {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  status: DocumentStatus;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  recipients: DocumentRecipient[];
}

export class DocumentEmailIntegrationService implements DocumentEmailIntegration {
  private emailService: EmailService;
  private supabase: unknown;

  constructor() {
    this.emailService = new EmailService();
    this.supabase = createClient();
  }

  /**
   * Handle _document creation event
   */
  async onDocumentCreated(documentId: string): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      
      // Send confirmation email to _document owner
      await this.emailService.sendDocumentCreated({
        documentId: _document.id,
        recipientEmail: _document.ownerEmail,
        recipientName: _document.ownerName,
        documentTitle: _document.title,
        createdAt: _document.createdAt
      });

      // Log the event
      await this.logEmailEvent('document_created', documentId, _document.ownerEmail);
      
    } catch (error) {
      console.error('Error handling _document creation:', error);
      throw error;
    }
  }

  /**
   * Handle _document sharing event
   */
  async onDocumentShared(documentId: string, recipients: DocumentRecipient[]): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      
      // Send invitations to all recipients
      for (const recipient of recipients) {
        if (recipient.role === 'signer' || recipient.role === 'witness') {
          await this.emailService.sendDocumentInvitation({
            documentId: _document.id,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            documentTitle: _document.title,
            senderName: _document.ownerName,
            expiresAt: _document.expiresAt,
            customMessage: `You have been invited to ${recipient.role} this _document.`
          });
        } else if (recipient.role === 'viewer') {
          await this.emailService.sendDocumentInvitation({
            documentId: _document.id,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            documentTitle: _document.title,
            senderName: _document.ownerName,
            expiresAt: _document.expiresAt,
            customMessage: 'You have been granted view access to this _document.'
          });
        }

        // Update recipient status
        await this.updateRecipientStatus(recipient.id, 'sent');
        
        // Log the event
        await this.logEmailEvent('document_shared', documentId, recipient.email);
      }
      
    } catch (error) {
      console.error('Error handling _document sharing:', error);
      throw error;
    }
  }

  /**
   * Handle _document signed event
   */
  async onDocumentSigned(documentId: string, signerId: string): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      const signer = _document.recipients.find(r => r.id === signerId);
      
      if (!signer) {
        throw new Error(`Signer ${signerId} not found for _document ${documentId}`);
      }

      // Send completion notification to signer
      await this.emailService.sendDocumentCompleted({
        documentId: _document.id,
        recipientEmail: signer.email,
        recipientName: signer.name,
        documentTitle: _document.title,
        completedAt: new Date()
      });

      // Check if all signers have signed
      const allSignersSigned = _document.recipients
        .filter(r => r.role === 'signer')
        .every(r => r.status === 'signed');

      if (allSignersSigned) {
        // Send completion notification to _document owner
        await this.emailService.sendDocumentCompleted({
          documentId: _document.id,
          recipientEmail: _document.ownerEmail,
          recipientName: _document.ownerName,
          documentTitle: _document.title,
          completedAt: new Date()
        });

        // Update _document status
        await this.updateDocumentStatus(documentId, 'completed');
      }

      // Log the event
      await this.logEmailEvent('document_signed', documentId, signer.email);
      
    } catch (error) {
      console.error('Error handling _document signed:', error);
      throw error;
    }
  }

  /**
   * Handle _document completion event
   */
  async onDocumentCompleted(documentId: string): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      
      // Send completion notifications to all participants
      const allParticipants = [
        { email: _document.ownerEmail, name: _document.ownerName },
        ..._document.recipients.map(r => ({ email: r.email, name: r.name }))
      ];

      for (const participant of allParticipants) {
        await this.emailService.sendDocumentCompleted({
          documentId: _document.id,
          recipientEmail: participant.email,
          recipientName: participant.name,
          documentTitle: _document.title,
          completedAt: new Date()
        });
      }

      // Log the event
      await this.logEmailEvent('document_completed', documentId, 'all_participants');
      
    } catch (error) {
      console.error('Error handling _document completion:', error);
      throw error;
    }
  }

  /**
   * Handle _document expiration event
   */
  async onDocumentExpired(documentId: string): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      
      // Send expiration notifications to all participants
      const allParticipants = [
        { email: _document.ownerEmail, name: _document.ownerName },
        ..._document.recipients.map(r => ({ email: r.email, name: r.name }))
      ];

      for (const participant of allParticipants) {
        await this.emailService.sendDocumentExpired({
          documentId: _document.id,
          recipientEmail: participant.email,
          recipientName: participant.name,
          documentTitle: _document.title,
          expiredAt: new Date()
        });
      }

      // Update _document status
      await this.updateDocumentStatus(documentId, 'expired');

      // Log the event
      await this.logEmailEvent('document_expired', documentId, 'all_participants');
      
    } catch (error) {
      console.error('Error handling _document expiration:', error);
      throw error;
    }
  }

  /**
   * Handle signature request event
   */
  async onSignatureRequested(documentId: string, recipientId: string): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      const recipient = _document.recipients.find(r => r.id === recipientId);
      
      if (!recipient) {
        throw new Error(`Recipient ${recipientId} not found for _document ${documentId}`);
      }

      // Send signature request email
      await this.emailService.sendDocumentInvitation({
        documentId: _document.id,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        documentTitle: _document.title,
        senderName: _document.ownerName,
        expiresAt: _document.expiresAt,
        customMessage: 'Please review and sign this _document.'
      });

      // Update recipient status
      await this.updateRecipientStatus(recipientId, 'sent');

      // Log the event
      await this.logEmailEvent('signature_requested', documentId, recipient.email);
      
    } catch (error) {
      console.error('Error handling signature request:', error);
      throw error;
    }
  }

  /**
   * Handle signature reminder event
   */
  async onSignatureReminder(documentId: string, recipientId: string): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      const recipient = _document.recipients.find(r => r.id === recipientId);
      
      if (!recipient) {
        throw new Error(`Recipient ${recipientId} not found for _document ${documentId}`);
      }

      // Calculate days remaining
      const daysRemaining = _document.expiresAt 
        ? Math.ceil((_document.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

      // Send reminder email
      await this.emailService.sendSignatureReminder({
        documentId: _document.id,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        documentTitle: _document.title,
        daysRemaining: Math.max(0, daysRemaining)
      });

      // Log the event
      await this.logEmailEvent('signature_reminder', documentId, recipient.email);
      
    } catch (error) {
      console.error('Error handling signature reminder:', error);
      throw error;
    }
  }

  /**
   * Handle signature completion event
   */
  async onSignatureCompleted(documentId: string, recipientId: string): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      const recipient = _document.recipients.find(r => r.id === recipientId);
      
      if (!recipient) {
        throw new Error(`Recipient ${recipientId} not found for _document ${documentId}`);
      }

      // Send completion notification to signer
      await this.emailService.sendDocumentCompleted({
        documentId: _document.id,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        documentTitle: _document.title,
        completedAt: new Date()
      });

      // Update recipient status
      await this.updateRecipientStatus(recipientId, 'signed');

      // Log the event
      await this.logEmailEvent('signature_completed', documentId, recipient.email);
      
    } catch (error) {
      console.error('Error handling signature completion:', error);
      throw error;
    }
  }

  /**
   * Handle signature decline event
   */
  async onSignatureDeclined(documentId: string, recipientId: string, reason?: string): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      const recipient = _document.recipients.find(r => r.id === recipientId);
      
      if (!recipient) {
        throw new Error(`Recipient ${recipientId} not found for _document ${documentId}`);
      }

      // Send decline notification to _document owner
      await this.emailService.sendSignatureDeclined({
        documentId: _document.id,
        recipientEmail: _document.ownerEmail,
        recipientName: _document.ownerName,
        documentTitle: _document.title,
        signerName: recipient.name,
        signerEmail: recipient.email,
        declineReason: reason || 'No reason provided'
      });

      // Update recipient status
      await this.updateRecipientStatus(recipientId, 'declined', reason);

      // Log the event
      await this.logEmailEvent('signature_declined', documentId, recipient.email);
      
    } catch (error) {
      console.error('Error handling signature decline:', error);
      throw error;
    }
  }

  /**
   * Send bulk invitations to multiple recipients
   */
  async sendBulkInvitations(documentId: string, recipients: DocumentRecipient[]): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      
      // Send invitations in parallel (with rate limiting)
      const batchSize = 10;
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (recipient) => {
          await this.emailService.sendDocumentInvitation({
            documentId: _document.id,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            documentTitle: _document.title,
            senderName: _document.ownerName,
            expiresAt: _document.expiresAt,
            customMessage: `You have been invited to ${recipient.role} this _document.`
          });

          // Update recipient status
          await this.updateRecipientStatus(recipient.id, 'sent');
        }));

        // Add delay between batches to respect rate limits
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Log the event
      await this.logEmailEvent('bulk_invitations_sent', documentId, 'multiple_recipients');
      
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      throw error;
    }
  }

  /**
   * Send bulk reminders to pending recipients
   */
  async sendBulkReminders(documentId: string, pendingRecipients: string[]): Promise<void> {
    try {
      const _document = await this.getDocumentData(documentId);
      
      // Send reminders in parallel (with rate limiting)
      const batchSize = 10;
      for (let i = 0; i < pendingRecipients.length; i += batchSize) {
        const batch = pendingRecipients.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (recipientId) => {
          const recipient = _document.recipients.find(r => r.id === recipientId);
          if (!recipient) return;

          // Calculate days remaining
          const daysRemaining = _document.expiresAt 
            ? Math.ceil((_document.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : 0;

          await this.emailService.sendSignatureReminder({
            documentId: _document.id,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            documentTitle: _document.title,
            daysRemaining: Math.max(0, daysRemaining)
          });
        }));

        // Add delay between batches to respect rate limits
        if (i + batchSize < pendingRecipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Log the event
      await this.logEmailEvent('bulk_reminders_sent', documentId, 'pending_recipients');
      
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
      throw error;
    }
  }

  /**
   * Get _document data with recipients
   */
  private async getDocumentData(documentId: string): Promise<DocumentData> {
    const { data: _document, error: docError } = await this.supabase
      .from('documents')
      .select(`
        id,
        title,
        description,
        owner_id,
        status,
        expires_at,
        created_at,
        updated_at,
        users!documents_owner_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .eq('id', documentId)
      .single();

    if (docError || !_document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const { data: recipients, error: recipientsError } = await this.supabase
      .from('document_recipients')
      .select('*')
      .eq('document_id', documentId);

    if (recipientsError) {
      throw new Error(`Failed to fetch recipients for _document ${documentId}`);
    }

    return {
      id: _document.id,
      title: _document.title,
      description: _document.description,
      ownerId: _document.owner_id,
      ownerName: _document.users?.full_name || 'Unknown',
      ownerEmail: _document.users?.email || '',
      status: _document.status,
      expiresAt: _document.expires_at ? new Date(_document.expires_at) : undefined,
      createdAt: new Date(_document.created_at),
      updatedAt: new Date(_document.updated_at),
      recipients: recipients || []
    };
  }

  /**
   * Update recipient status
   */
  private async updateRecipientStatus(recipientId: string, status: string, reason?: string): Promise<void> {
    const updateData: unknown = { status };
    
    if (status === 'sent') {
      updateData.invitation_sent_at = new Date().toISOString();
    } else if (status === 'viewed') {
      updateData.viewed_at = new Date().toISOString();
    } else if (status === 'signed') {
      updateData.signed_at = new Date().toISOString();
    } else if (status === 'declined') {
      updateData.declined_at = new Date().toISOString();
      if (reason) {
        updateData.decline_reason = reason;
      }
    }

    const { error } = await this.supabase
      .from('document_recipients')
      .update(updateData)
      .eq('id', recipientId);

    if (error) {
      console.error('Error updating recipient status:', error);
    }
  }

  /**
   * Update _document status
   */
  private async updateDocumentStatus(documentId: string, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('documents')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) {
      console.error('Error updating _document status:', error);
    }
  }

  /**
   * Log email event
   */
  private async logEmailEvent(eventType: string, documentId: string, recipientEmail: string): Promise<void> {
    try {
      await this.supabase
        .from('email_audit_log')
        .insert({
          event_type: eventType,
          document_id: documentId,
          recipient_email: recipientEmail,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging email event:', error);
    }
  }
}

// Export singleton instance
export const documentEmailIntegration = new DocumentEmailIntegrationService();
