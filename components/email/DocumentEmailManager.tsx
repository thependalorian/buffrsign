"use client";

/**
 * Document Email Manager Component
 * 
 * Comprehensive email management interface for document workflows
 */

import React, { useState } from 'react';
import { useDocumentEmailIntegration } from '@/lib/hooks/useDocumentEmailIntegration';
import { DocumentRecipient } from '@/lib/hooks/useDocumentEmailIntegration';

interface DocumentEmailManagerProps {
  documentId: string;
  documentTitle: string;
  onEmailSent?: (type: string, recipient: string) => void;
}

export const DocumentEmailManager: React.FC<DocumentEmailManagerProps> = ({
  documentId,
  documentTitle,
  onEmailSent
}) => {
  const {
    notifications,
    recipients,
    loading,
    error,
    sendInvitations,
    sendReminders,
    sendInvitation,
    sendReminder,
    notifyCompletion,
    notifyExpiration,
    notifyDecline,
    refreshNotifications,
    refreshRecipients
  } = useDocumentEmailIntegration(documentId);

  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Handle bulk invitation sending
  const handleBulkInvitations = async () => {
    if (selectedRecipients.length === 0) {
      alert('Please select recipients to send invitations to');
      return;
    }

    try {
      const selectedRecipientData = recipients.filter(r => selectedRecipients.includes(r.id));
      await sendInvitations(selectedRecipientData);
      setSelectedRecipients([]);
      setShowBulkActions(false);
      onEmailSent?.('invitations', `${selectedRecipientData.length} recipients`);
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
    }
  };

  // Handle bulk reminder sending
  const handleBulkReminders = async () => {
    if (selectedRecipients.length === 0) {
      alert('Please select recipients to send reminders to');
      return;
    }

    try {
      await sendReminders(selectedRecipients);
      setSelectedRecipients([]);
      setShowBulkActions(false);
      onEmailSent?.('reminders', `${selectedRecipients.length} recipients`);
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
    }
  };

  // Handle individual actions
  const handleSendInvitation = async (recipientId: string, recipientName: string) => {
    try {
      await sendInvitation(recipientId);
      onEmailSent?.('invitation', recipientName);
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  const handleSendReminder = async (recipientId: string, recipientName: string) => {
    try {
      await sendReminder(recipientId);
      onEmailSent?.('reminder', recipientName);
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const handleNotifyDecline = async (recipientId: string, recipientName: string) => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    try {
      await notifyDecline(recipientId, declineReason);
      setDeclineReason('');
      onEmailSent?.('decline', recipientName);
    } catch (error) {
      console.error('Error notifying decline:', error);
    }
  };

  // Toggle recipient selection
  const toggleRecipientSelection = (recipientId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId) 
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  // Select all recipients
  const selectAllRecipients = () => {
    setSelectedRecipients(recipients.map(r => r.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedRecipients([]);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Management</h2>
          <p className="text-gray-600">Manage email notifications for "{documentTitle}"</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshNotifications}
            className="btn btn-outline btn-sm"
            disabled={loading}
          >
            Refresh
          </button>
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="btn btn-primary btn-sm"
            disabled={recipients.length === 0}
          >
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Bulk Actions</h3>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={selectAllRecipients}
                className="btn btn-outline btn-sm"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="btn btn-outline btn-sm"
              >
                Clear Selection
              </button>
              <span className="text-sm text-gray-600 self-center">
                {selectedRecipients.length} selected
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBulkInvitations}
                className="btn btn-primary"
                disabled={selectedRecipients.length === 0 || loading}
              >
                Send Invitations
              </button>
              <button
                onClick={handleBulkReminders}
                className="btn btn-secondary"
                disabled={selectedRecipients.length === 0 || loading}
              >
                Send Reminders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipients List */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Document Recipients</h3>
          
          {recipients.length === 0 ? (
            <p className="text-gray-500">No recipients added to this document.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedRecipients.length === recipients.length}
                        onChange={selectAllRecipients}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((recipient) => (
                    <tr key={recipient.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedRecipients.includes(recipient.id)}
                          onChange={() => toggleRecipientSelection(recipient.id)}
                        />
                      </td>
                      <td>
                        <div className="font-medium">{recipient.name}</div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-600">{recipient.email}</div>
                      </td>
                      <td>
                        <span className="badge badge-outline">
                          {recipient.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          recipient.status === 'signed' ? 'badge-success' :
                          recipient.status === 'declined' ? 'badge-error' :
                          recipient.status === 'expired' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {recipient.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {recipient.status === 'pending' && (
                            <button
                              onClick={() => handleSendInvitation(recipient.id, recipient.name)}
                              className="btn btn-xs btn-primary"
                              disabled={loading}
                            >
                              Invite
                            </button>
                          )}
                          {recipient.status === 'sent' && (
                            <button
                              onClick={() => handleSendReminder(recipient.id, recipient.name)}
                              className="btn btn-xs btn-secondary"
                              disabled={loading}
                            >
                              Remind
                            </button>
                          )}
                          {recipient.status === 'pending' && (
                            <button
                              onClick={() => handleNotifyDecline(recipient.id, recipient.name)}
                              className="btn btn-xs btn-error"
                              disabled={loading}
                            >
                              Decline
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Email Notifications History */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Email Notifications History</h3>
          
          {notifications.length === 0 ? (
            <p className="text-gray-500">No email notifications sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Sent At</th>
                    <th>Delivered At</th>
                    <th>Opened At</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id}>
                      <td>
                        <div>
                          <div className="font-medium">{notification.recipient_name}</div>
                          <div className="text-sm text-gray-600">{notification.recipient_email}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-outline">
                          {notification.template_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          notification.status === 'delivered' ? 'badge-success' :
                          notification.status === 'bounced' ? 'badge-error' :
                          notification.status === 'opened' ? 'badge-info' :
                          'badge-warning'
                        }`}>
                          {notification.status}
                        </span>
                      </td>
                      <td>
                        {notification.sent_at ? new Date(notification.sent_at).toLocaleString() : '-'}
                      </td>
                      <td>
                        {notification.delivered_at ? new Date(notification.delivered_at).toLocaleString() : '-'}
                      </td>
                      <td>
                        {notification.opened_at ? new Date(notification.opened_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Document Actions */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Document Actions</h3>
          <div className="flex gap-2">
            <button
              onClick={notifyCompletion}
              className="btn btn-success"
              disabled={loading}
            >
              Notify Completion
            </button>
            <button
              onClick={notifyExpiration}
              className="btn btn-warning"
              disabled={loading}
            >
              Notify Expiration
            </button>
          </div>
        </div>
      </div>

      {/* Decline Reason Modal */}
      {declineReason && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Decline Reason</h3>
            <div className="py-4">
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Please provide a reason for declining..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="modal-action">
              <button
                onClick={() => setDeclineReason('')}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => setDeclineReason('')}
                className="btn btn-primary"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
