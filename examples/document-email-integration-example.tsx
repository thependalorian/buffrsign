/**
 * Document Email Integration Example
 * 
 * Complete example showing how to integrate email notifications
 * with document workflows in BuffrSign
 */

import React, { useState, useEffect } from 'react';
import { DocumentEmailManager } from '@/components/email/DocumentEmailManager';
import { useDocumentEmailIntegration } from '@/lib/hooks/useDocumentEmailIntegration';
import { documentEmailIntegration } from '@/lib/services/document-email-integration';

// Example 1: Document Creation with Email Integration
export const DocumentCreationExample: React.FC = () => {
  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
    recipients: [] as Array<{ email: string; name: string; role: string }>
  });
  const [loading, setLoading] = useState(false);
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);

  const handleCreateDocument = async () => {
    setLoading(true);
    try {
      // Create document
      const response = await fetch('/api/protected/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: documentData.title,
          description: documentData.description,
          recipients: documentData.recipients
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const result = await response.json();
      setCreatedDocumentId(result.data.id);

      // Automatically send email notifications
      await documentEmailIntegration.onDocumentCreated(result.data.id);
      
      if (documentData.recipients.length > 0) {
        await documentEmailIntegration.onDocumentShared(
          result.data.id,
          documentData.recipients.map(r => ({
            id: `temp-${r.email}`,
            email: r.email,
            name: r.name,
            role: r.role as any,
            status: 'pending'
          }))
        );
      }

      alert('Document created and email notifications sent!');
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = () => {
    setDocumentData(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email: '', name: '', role: 'signer' }]
    }));
  };

  const updateRecipient = (index: number, field: string, value: string) => {
    setDocumentData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      )
    }));
  };

  const removeRecipient = (index: number) => {
    setDocumentData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Document with Email Integration</h1>
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Document Details</h2>
          
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Document Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={documentData.title}
              onChange={(e) => setDocumentData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter document title"
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={documentData.description}
              onChange={(e) => setDocumentData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter document description"
              rows={3}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Recipients</span>
            </label>
            <button
              onClick={addRecipient}
              className="btn btn-outline btn-sm mb-2"
            >
              Add Recipient
            </button>
            
            {documentData.recipients.map((recipient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1"
                  placeholder="Name"
                  value={recipient.name}
                  onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                />
                <input
                  type="email"
                  className="input input-bordered input-sm flex-1"
                  placeholder="Email"
                  value={recipient.email}
                  onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                />
                <select
                  className="select select-bordered select-sm"
                  value={recipient.role}
                  onChange={(e) => updateRecipient(index, 'role', e.target.value)}
                >
                  <option value="signer">Signer</option>
                  <option value="witness">Witness</option>
                  <option value="approver">Approver</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  onClick={() => removeRecipient(index)}
                  className="btn btn-error btn-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="card-actions justify-end">
            <button
              onClick={handleCreateDocument}
              className="btn btn-primary"
              disabled={loading || !documentData.title}
            >
              {loading ? 'Creating...' : 'Create Document & Send Emails'}
            </button>
          </div>
        </div>
      </div>

      {createdDocumentId && (
        <div className="mt-6">
          <DocumentEmailManager
            documentId={createdDocumentId}
            documentTitle={documentData.title}
            onEmailSent={(type, recipient) => {
              console.log(`Email ${type} sent to ${recipient}`);
            }}
          />
        </div>
      )}
    </div>
  );
};

// Example 2: Document Workflow with Email Notifications
export const DocumentWorkflowExample: React.FC<{ documentId: string }> = ({ documentId }) => {
  const {
    notifications,
    recipients,
    sendInvitation,
    sendReminder,
    notifyCompletion,
    notifyExpiration
  } = useDocumentEmailIntegration(documentId);

  const [workflowStep, setWorkflowStep] = useState<'invite' | 'remind' | 'complete' | 'expire'>('invite');

  const handleWorkflowStep = async () => {
    try {
      switch (workflowStep) {
        case 'invite':
          // Send invitations to all pending recipients
          const pendingRecipients = recipients.filter(r => r.status === 'pending');
          for (const recipient of pendingRecipients) {
            await sendInvitation(recipient.id);
          }
          alert(`Invitations sent to ${pendingRecipients.length} recipients`);
          break;

        case 'remind':
          // Send reminders to recipients who haven't signed
          const reminderRecipients = recipients.filter(r => r.status === 'sent');
          for (const recipient of reminderRecipients) {
            await sendReminder(recipient.id);
          }
          alert(`Reminders sent to ${reminderRecipients.length} recipients`);
          break;

        case 'complete':
          await notifyCompletion();
          alert('Completion notifications sent to all participants');
          break;

        case 'expire':
          await notifyExpiration();
          alert('Expiration notifications sent to all participants');
          break;
      }
    } catch (error) {
      console.error('Error in workflow step:', error);
      alert('Failed to execute workflow step');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Document Workflow Management</h1>
      
      {/* Workflow Controls */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Workflow Actions</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setWorkflowStep('invite')}
              className={`btn ${workflowStep === 'invite' ? 'btn-primary' : 'btn-outline'}`}
            >
              Send Invitations
            </button>
            <button
              onClick={() => setWorkflowStep('remind')}
              className={`btn ${workflowStep === 'remind' ? 'btn-primary' : 'btn-outline'}`}
            >
              Send Reminders
            </button>
            <button
              onClick={() => setWorkflowStep('complete')}
              className={`btn ${workflowStep === 'complete' ? 'btn-primary' : 'btn-outline'}`}
            >
              Notify Completion
            </button>
            <button
              onClick={() => setWorkflowStep('expire')}
              className={`btn ${workflowStep === 'expire' ? 'btn-primary' : 'btn-outline'}`}
            >
              Notify Expiration
            </button>
          </div>

          <button
            onClick={handleWorkflowStep}
            className="btn btn-success"
          >
            Execute {workflowStep.charAt(0).toUpperCase() + workflowStep.slice(1)} Action
          </button>
        </div>
      </div>

      {/* Recipients Status */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Recipients Status</h2>
          
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Recipients</div>
              <div className="stat-value">{recipients.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">
                {recipients.filter(r => r.status === 'pending').length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Signed</div>
              <div className="stat-value text-success">
                {recipients.filter(r => r.status === 'signed').length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Declined</div>
              <div className="stat-value text-error">
                {recipients.filter(r => r.status === 'declined').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Notifications History */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Email Notifications History</h2>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Sent At</th>
                  <th>Delivered At</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 3: Real-time Email Status Monitoring
export const EmailStatusMonitoringExample: React.FC<{ documentId: string }> = ({ documentId }) => {
  const { notifications, refreshNotifications } = useDocumentEmailIntegration(documentId);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshNotifications();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refreshNotifications]);

  const getStatusCounts = () => {
    const counts = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0
    };

    notifications.forEach(notification => {
      counts[notification.status as keyof typeof counts]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Email Status Monitoring</h1>
      
      {/* Auto-refresh Toggle */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title">Real-time Monitoring</h2>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Auto-refresh (30s)</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">Sent</div>
          <div className="stat-value text-primary">{statusCounts.sent}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">Delivered</div>
          <div className="stat-value text-success">{statusCounts.delivered}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">Opened</div>
          <div className="stat-value text-info">{statusCounts.opened}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">Clicked</div>
          <div className="stat-value text-warning">{statusCounts.clicked}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">Bounced</div>
          <div className="stat-value text-error">{statusCounts.bounced}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-lg">
          <div className="stat-title">Failed</div>
          <div className="stat-value text-error">{statusCounts.failed}</div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Notifications</h2>
          
          <div className="space-y-2">
            {notifications.slice(0, 10).map((notification) => (
              <div key={notification.id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                <div>
                  <div className="font-medium">{notification.recipient_name}</div>
                  <div className="text-sm text-gray-600">{notification.recipient_email}</div>
                </div>
                <div className="text-right">
                  <div className="badge badge-outline">
                    {notification.template_type.replace('_', ' ')}
                  </div>
                  <div className={`badge ${
                    notification.status === 'delivered' ? 'badge-success' :
                    notification.status === 'bounced' ? 'badge-error' :
                    notification.status === 'opened' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {notification.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {notification.sent_at ? new Date(notification.sent_at).toLocaleString() : 'Not sent'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export all examples
export default {
  DocumentCreationExample,
  DocumentWorkflowExample,
  EmailStatusMonitoringExample
};
