/**
 * Pending Signatures Page
 * Location: /app/protected/signatures/pending/page.tsx
 * Purpose: Display documents awaiting signatures from the user
 * Features:
 * - List of documents pending _user signature
 * - Signature status tracking
 * - Quick signature actions
 * - Document preview and details
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, User, Calendar, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { DocumentStatus } from '@/lib/types';

interface PendingSignature {
  id: string;
  title: string;
  sender: string;
  sentDate: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: DocumentStatus;
}

export default function PendingSignaturesPage() {
  const { user: _user, supabase } = useAuth();
  const [pendingSignatures, setPendingSignatures] = useState<PendingSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingSignatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          status,
          created_at,
          expires_at,
          created_by
        `)
        .eq('status', DocumentStatus.PENDING_SIGNATURE)
        .order('created_at', { ascending: false });

      if (documentsError) {
        throw documentsError;
      }

      const signatures: PendingSignature[] = documents?.map(doc => ({
        id: doc.id as string,
        title: doc.title as string,
        sender: 'System User', // Simplified since we can't join with profiles
        sentDate: doc.created_at ? new Date(doc.created_at as string).toLocaleDateString() : 'Unknown',
        dueDate: doc.expires_at ? new Date(doc.expires_at as string).toLocaleDateString() : 'No due date',
        priority: 'medium' as const, // Default priority
        status: doc.status as DocumentStatus
      })) || [];

      setPendingSignatures(signatures);
    } catch (err) {
      console.error('Error fetching pending signatures:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending signatures');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (_user) {
      fetchPendingSignatures();
    }
  }, [_user, fetchPendingSignatures]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading pending signatures...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Signatures
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {error}
            </p>
            <Button onClick={fetchPendingSignatures}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pending Signatures
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Documents awaiting your signature
        </p>
      </div>

      <div className="grid gap-6">
        {pendingSignatures.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Pending Signatures
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                You&apos;re all caught up! No documents are currently waiting for your signature.
              </p>
            </CardContent>
          </Card>
        ) : (
          pendingSignatures.map((signature) => (
            <Card key={signature.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {signature.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>From: {signature.sender}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Sent: {signature.sentDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(signature.priority)}>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(signature.priority)}
                        {signature.priority}
                      </div>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Due:</span> {signature.dueDate}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                    <Button size="sm">
                      Sign Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
