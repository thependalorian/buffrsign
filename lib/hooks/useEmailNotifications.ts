import { useState, useEffect } from 'react';
// Assuming an API utility will be available

export function useEmailNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      // Placeholder for fetching user email notifications from API
      const mockNotifications = [
        { id: 'n1', subject: 'Document Ready for Signature', created_at: new Date().toISOString(), read: false },
        { id: 'n2', subject: 'Document Signed by John Doe', created_at: new Date(Date.now() - 86400000).toISOString(), read: true },
      ];
      setNotifications(mockNotifications);
      setLoading(false);
    };
    fetchNotifications();
  }, [userId]);

  const markAsRead = async (id: string) => {
    alert(`Marking notification ${id} as read`);
    // Call API to mark notification as read
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return { notifications, loading, error, markAsRead };
}