
import { useState, useEffect } from 'react';
// Assuming an API utility will be available

export function useUserEmails(userId: string | undefined) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserEmails = async () => {
      // Placeholder for fetching user-specific email history from API
      const mockEmails = [
        { id: 'e1', subject: 'Document Ready for Signature', sent_at: new Date().toISOString(), status: 'sent' },
        { id: 'e2', subject: 'Document Signed by John Doe', sent_at: new Date(Date.now() - 86400000).toISOString(), status: 'sent' },
      ];
      setEmails(mockEmails);
      setLoading(false);
    };
    fetchUserEmails();
  }, [userId]);

  return { emails, loading, error };
}
