/**
 * Email Notification List Component
 * 
 * A component for displaying and managing email notifications.
 * Uses DaisyUI components for consistent styling.
 */

'use client';

import { useState } from 'react';
import { useEmailNotifications } from '@/lib/hooks/useEmailNotifications';
import { EmailNotificationListProps, EmailType, EmailStatus } from '@/lib/types/email';

function EmailNotificationList({
  documentId,
  _emailType,
  limit = 50,
  showFilters = true,
}: EmailNotificationListProps) {
  const {
    notifications,
    loading,
    error,
    retryEmail,
    cancelEmail,
    getNotificationsByStatus,
    getNotificationsByType,
    getFailedNotifications,
    getDeliveryRate,
    getOpenRate,
    getClickRate,
  } = useEmailNotifications({
    documentId,
    _emailType,
    limit,
  });

  const [statusFilter, setStatusFilter] = useState<EmailStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EmailType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesType = typeFilter === 'all' || notification.email_type === typeFilter;
    const matchesSearch = searchTerm === '' || 
      notification.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.subject.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusBadge = (status: EmailStatus) => {
    const statusConfig = {
      sent: { color: 'badge-info', text: 'Sent' },
      delivered: { color: 'badge-success', text: 'Delivered' },
      opened: { color: 'badge-primary', text: 'Opened' },
      clicked: { color: 'badge-secondary', text: 'Clicked' },
      bounced: { color: 'badge-error', text: 'Bounced' },
      failed: { color: 'badge-warning', text: 'Failed' },
    };

    const config = statusConfig[status];
    return <span className={`badge ${config.color}`}>{config.text}</span>;
  };

  const getTypeBadge = (type: EmailType) => {
    const typeConfig = {
      document_invitation: { color: 'badge-primary', text: 'Invitation' },
      signature_reminder: { color: 'badge-warning', text: 'Reminder' },
      document_signed: { color: 'badge-success', text: 'Signed' },
      document_completed: { color: 'badge-info', text: 'Completed' },
      document_expired: { color: 'badge-error', text: 'Expired' },
      document_rejected: { color: 'badge-error', text: 'Rejected' },
      document_viewed: { color: 'badge-neutral', text: 'Viewed' },
      welcome_email: { color: 'badge-accent', text: 'Welcome' },
      password_reset: { color: 'badge-ghost', text: 'Password Reset' },
    };

    const config = typeConfig[type];
    return <span className={`badge ${config.color}`}>{config.text}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Windhoek',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Email Notifications</h2>
          <div className="stats stats-horizontal shadow">
            <div className="stat">
              <div className="stat-title">Total</div>
              <div className="stat-value text-primary">{notifications.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Delivery Rate</div>
              <div className="stat-value text-success">{getDeliveryRate()}%</div>
            </div>
            <div className="stat">
              <div className="stat-title">Open Rate</div>
              <div className="stat-value text-info">{getOpenRate()}%</div>
            </div>
            <div className="stat">
              <div className="stat-title">Click Rate</div>
              <div className="stat-value text-secondary">{getClickRate()}%</div>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="flex gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EmailStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="opened">Opened</option>
                <option value="clicked">Clicked</option>
                <option value="bounced">Bounced</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Type</span>
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as EmailType | 'all')}
              >
                <option value="all">All Types</option>
                <option value="document_invitation">Document Invitation</option>
                <option value="signature_reminder">Signature Reminder</option>
                <option value="document_signed">Document Signed</option>
                <option value="document_completed">Document Completed</option>
                <option value="document_expired">Document Expired</option>
                <option value="document_rejected">Document Rejected</option>
                <option value="document_viewed">Document Viewed</option>
                <option value="welcome_email">Welcome Email</option>
                <option value="password_reset">Password Reset</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Search</span>
              </label>
              <input
                type="text"
                placeholder="Search emails or subjects..."
                className="input input-bordered w-full max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-muted-foreground">No email notifications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Provider</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id}>
                    <td>
                      <div className="font-medium">{notification.email_address}</div>
                    </td>
                    <td>
                      <div className="max-w-xs truncate" title={notification.subject}>
                        {notification.subject}
                      </div>
                    </td>
                    <td>{getTypeBadge(notification.email_type)}</td>
                    <td>{getStatusBadge(notification.status)}</td>
                    <td>
                      <div className="text-sm">{formatDate(notification.sent_at)}</div>
                    </td>
                    <td>
                      <span className="badge badge-outline">{notification.provider}</span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {(notification.status === 'failed' || notification.status === 'bounced') && (
                          <button
                            className="btn btn-sm btn-outline btn-primary"
                            onClick={() => retryEmail(notification.id)}
                          >
                            Retry
                          </button>
                        )}
                        {notification.status === 'sent' && (
                          <button
                            className="btn btn-sm btn-outline btn-error"
                            onClick={() => cancelEmail(notification.id)}
                          >
                            Cancel
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

        {getFailedNotifications().length > 0 && (
          <div className="alert alert-warning mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>
              {getFailedNotifications().length} email(s) failed to send. 
              You can retry them using the Retry button.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export { EmailNotificationList };
export default EmailNotificationList;
