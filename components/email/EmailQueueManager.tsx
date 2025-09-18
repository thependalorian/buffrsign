'use client';

import { useState, useEffect } from 'react';
import { useEmailNotifications } from '@/lib/hooks/useEmailNotifications';

interface EmailQueueItem {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recipient_email: string;
  subject: string;
  created_at: string;
  processed_at?: string;
  retry_count: number;
  error_message?: string;
  priority: 'low' | 'normal' | 'high';
}

interface EmailQueueManagerProps {
  showUserSpecific?: boolean;
  limit?: number;
}

export function EmailQueueManager({ 
  showUserSpecific = false, 
  limit = 50 
}: EmailQueueManagerProps) {
  const [queueItems, setQueueItems] = useState<EmailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'failed'>('all');

  useEffect(() => {
    fetchQueueItems();
  }, [filter, limit]);

  const fetchQueueItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/email/queue?filter=${filter}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch queue items');
      }
      
      const data = await response.json();
      setQueueItems(data.queueItems || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const retryFailedEmail = async (queueId: string) => {
    try {
      const response = await fetch(`/api/email/retry/${queueId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to retry email');
      }
      
      // Refresh the queue
      await fetchQueueItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry email');
    }
  };

  const cancelEmail = async (queueId: string) => {
    try {
      const response = await fetch(`/api/email/cancel/${queueId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel email');
      }
      
      // Refresh the queue
      await fetchQueueItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel email');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'badge-warning',
      processing: 'badge-info',
      completed: 'badge-success',
      failed: 'badge-error'
    };
    
    return (
      <div className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'badge-ghost'}`}>
        {status}
      </div>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      low: 'badge-ghost',
      normal: 'badge-primary',
      high: 'badge-error'
    };
    
    return (
      <div className={`badge badge-sm ${priorityClasses[priority as keyof typeof priorityClasses] || 'badge-ghost'}`}>
        {priority}
      </div>
    );
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Email Queue</h2>
        <div className="flex gap-2">
          <select 
            className="select select-bordered select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <button 
            className="btn btn-sm btn-outline"
            onClick={fetchQueueItems}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Status</th>
              <th>Recipient</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Retries</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queueItems.map((item) => (
              <tr key={item.id}>
                <td>{getStatusBadge(item.status)}</td>
                <td>
                  <div className="font-mono text-sm">{item.recipient_email}</div>
                </td>
                <td>
                  <div className="max-w-xs truncate" title={item.subject}>
                    {item.subject}
                  </div>
                </td>
                <td>{getPriorityBadge(item.priority)}</td>
                <td>
                  <div className="text-sm">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    {item.retry_count}/3
                  </div>
                </td>
                <td>
                  <div className="flex gap-1">
                    {item.status === 'failed' && item.retry_count < 3 && (
                      <button
                        className="btn btn-xs btn-outline btn-success"
                        onClick={() => retryFailedEmail(item.id)}
                      >
                        Retry
                      </button>
                    )}
                    {(item.status === 'pending' || item.status === 'processing') && (
                      <button
                        className="btn btn-xs btn-outline btn-error"
                        onClick={() => cancelEmail(item.id)}
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

      {queueItems.length === 0 && (
        <div className="text-center py-8 text-base-content/70">
          No emails in queue
        </div>
      )}

      {queueItems.some(item => item.status === 'failed') && (
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>Some emails have failed. Check the queue and retry if necessary.</span>
        </div>
      )}
    </div>
  );
}
