'use client';

import { useState, useEffect } from 'react';

interface BlacklistItem {
  id: string;
  email_address: string;
  reason: string;
  created_at: string;
  created_by?: string;
}

interface EmailBlacklistManagerProps {
  showUserSpecific?: boolean;
  limit?: number;
}

export function EmailBlacklistManager({ 
  showUserSpecific = false, 
  limit = 100 
}: EmailBlacklistManagerProps) {
  const [blacklistItems, setBlacklistItems] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newReason, setNewReason] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);

  useEffect(() => {
    fetchBlacklistItems();
  }, [limit]);

  const fetchBlacklistItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/email/blacklist?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blacklist items');
      }
      
      const data = await response.json();
      setBlacklistItems(data.blacklistItems || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addToBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.trim() || !newReason.trim()) {
      setError('Email address and reason are required');
      return;
    }

    try {
      setAddingEmail(true);
      const response = await fetch('/api/email/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_address: newEmail.trim(),
          reason: newReason.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add email to blacklist');
      }
      
      // Clear form and refresh list
      setNewEmail('');
      setNewReason('');
      await fetchBlacklistItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add email to blacklist');
    } finally {
      setAddingEmail(false);
    }
  };

  const removeFromBlacklist = async (blacklistId: string) => {
    try {
      const response = await fetch(`/api/email/blacklist/${blacklistId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove email from blacklist');
      }
      
      // Refresh the list
      await fetchBlacklistItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove email from blacklist');
    }
  };

  const getReasonBadge = (reason: string) => {
    const reasonClasses = {
      'Bounced email': 'badge-error',
      'Spam complaint': 'badge-warning',
      'Manual addition': 'badge-info',
      'Invalid email': 'badge-ghost'
    };
    
    return (
      <div className={`badge ${reasonClasses[reason as keyof typeof reasonClasses] || 'badge-ghost'}`}>
        {reason}
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Email Blacklist</h2>
        <button 
          className="btn btn-sm btn-outline"
          onClick={fetchBlacklistItems}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Add to Blacklist Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Add Email to Blacklist</h3>
          <form onSubmit={addToBlacklist} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Reason</span>
              </label>
              <select
                className="select select-bordered"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                <option value="Bounced email">Bounced email</option>
                <option value="Spam complaint">Spam complaint</option>
                <option value="Manual addition">Manual addition</option>
                <option value="Invalid email">Invalid email</option>
              </select>
            </div>
            <div className="form-control">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addingEmail}
              >
                {addingEmail ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Adding...
                  </>
                ) : (
                  'Add to Blacklist'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Blacklist Items */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Email Address</th>
              <th>Reason</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blacklistItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="font-mono text-sm">{item.email_address}</div>
                </td>
                <td>{getReasonBadge(item.reason)}</td>
                <td>
                  <div className="text-sm">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-xs btn-outline btn-error"
                    onClick={() => removeFromBlacklist(item.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blacklistItems.length === 0 && (
        <div className="text-center py-8 text-base-content/70">
          No emails in blacklist
        </div>
      )}

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Total Blacklisted</div>
          <div className="stat-value text-error">{blacklistItems.length}</div>
          <div className="stat-desc">Email addresses</div>
        </div>
        <div className="stat">
          <div className="stat-title">Bounced Emails</div>
          <div className="stat-value text-warning">
            {blacklistItems.filter(item => item.reason === 'Bounced email').length}
          </div>
          <div className="stat-desc">Automatically added</div>
        </div>
        <div className="stat">
          <div className="stat-title">Manual Additions</div>
          <div className="stat-value text-info">
            {blacklistItems.filter(item => item.reason === 'Manual addition').length}
          </div>
          <div className="stat-desc">Manually added</div>
        </div>
      </div>
    </div>
  );
}
