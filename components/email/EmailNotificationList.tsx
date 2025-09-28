'use client';

import { useState, useEffect } from 'react';
// Assuming a hook for email notifications exists or will be created
// import { useEmailNotifications } from '@/lib/hooks/useEmailNotifications';

interface EmailNotificationListProps {
  documentId?: string;
  _emailType?: string;
  limit?: number;
  showFilters?: boolean;
}

export default function EmailNotificationList( { documentId, _emailType, limit, showFilters }: EmailNotificationListProps) {
  // const { notifications, loading, error, markAsRead } = useEmailNotifications(userId);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNotifications([
        { id: 'n1', subject: 'Document Ready for Signature', created_at: new Date().toISOString(), read: false },
        { id: 'n2', subject: 'Document Signed by John Doe', created_at: new Date(Date.now() - 86400000).toISOString(), read: true },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleMarkAsRead = (id: string) => {
    alert(`Marking notification ${id} as read`);
    // Implement actual mark as read logic
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Notifications</h2>
      {loading && <p>Loading notifications...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id} className={notification.read ? 'opacity-60' : 'font-bold'}>
                <td>{notification.subject}</td>
                <td>{new Date(notification.created_at).toLocaleDateString()}</td>
                <td>{notification.read ? 'Read' : 'Unread'}</td>
                <td>
                  {!notification.read && (
                    <button onClick={() => handleMarkAsRead(notification.id)} className="btn btn-sm btn-primary">
                      Mark as Read
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}