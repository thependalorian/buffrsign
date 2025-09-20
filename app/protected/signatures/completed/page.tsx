/**
 * Completed Signatures Page
 * Location: /app/protected/signatures/completed/page.tsx
 * Purpose: Display documents that have been completed/signed
 * Features:
 * - List of completed signature documents
 * - Signature completion tracking
 * - Document access and download
 * - Signature history and audit trail
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  User, 
  Calendar,
  Download,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { DocumentStatus, DocumentType } from '@/lib/types';

interface CompletedSignature {
  id: string;
  title: string;
  signer: string;
  completedDate: string;
  signedDate: string;
  status: DocumentStatus;
  type: DocumentType;
}

export default function CompletedSignaturesPage() {
  const { _user, getSupabaseClient } = useAuth();
  const [completedSignatures, setCompletedSignatures] = useState<CompletedSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletedSignatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const _supabase = getSupabaseClient();
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          status,
          document_type,
          created_at,
          updated_at,
          created_by
        `)
        .in('status', [DocumentStatus.SIGNED, DocumentStatus.COMPLETED])
        .order('updated_at', { ascending: false });

      if (documentsError) {
        throw documentsError;
      }

      const signatures: CompletedSignature[] = documents?.map(doc => ({
        id: doc.id,
        title: doc.title,
        signer: 'System User', // Simplified since we can't join with profiles
        completedDate: doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : 'Unknown',
        signedDate: doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : 'Unknown',
        status: doc.status as DocumentStatus,
        type: (doc.document_type as DocumentType) || DocumentType.OTHER
      })) || [];

      setCompletedSignatures(signatures);
    } catch (err) {
      console.error('Error fetching completed signatures:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch completed signatures');
    } finally {
      setLoading(false);
    }
  }, [getSupabaseClient]);

  useEffect(() => {
    if (_user) {
      fetchCompletedSignatures();
    }
  }, [_user, fetchCompletedSignatures]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'default';
      case 'agreement': return 'secondary';
      case 'nda': return 'destructive';
      case 'lease': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading completed signatures...</span>
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
            <Button onClick={fetchCompletedSignatures}>
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
          Completed Signatures
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Documents that have been successfully signed
        </p>
      </div>

      <div className="grid gap-6">
        {completedSignatures.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Completed Signatures
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No documents have been completed yet. Once you sign documents, they will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          completedSignatures.map((signature) => (
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
                        <span>Signed by: {signature.signer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Completed: {signature.completedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getTypeColor(signature.type)}>
                      {signature.type.toUpperCase()}
                    </Badge>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Signed:</span> {signature.signedDate}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
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
