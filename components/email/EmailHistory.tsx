
'use client';

import { useState, useEffect } from 'react';
// Assuming a hook for user emails exists or will be created
// import { useUserEmails } from '@/lib/hooks/useUserEmails';

export function EmailHistory() {
  // const { emails, loading, error } = useUserEmails(userId);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEmails([
        { id: 'e1', subject: 'Document Ready for Signature', sent_at: new Date().toISOString(), status: 'sent' },
        { id: 'e2', subject: 'Document Signed by John Doe', sent_at: new Date(Date.now() - 86400000).toISOString(), status: 'sent' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Email History</h2>
      {loading && <p>Loading email history...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email) => (
              <tr key={email.id}>
                <td>{email.subject}</td>
                <td>{new Date(email.sent_at).toLocaleDateString()}</td>
                <td>{email.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
