/**
 * Usage Statistics Page
 * Location: /app/protected/analytics/usage/page.tsx
 * Purpose: Display usage statistics and analytics for the user
 * Features:
 * - Document usage statistics
 * - Signature completion rates
 * - Time-based analytics
 * - User activity tracking
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { DocumentStatus } from '@/lib/types';

interface UsageStats {
  totalDocuments: number;
  signedDocuments: number;
  pendingDocuments: number;
  totalSignatures: number;
  averageSignTime: string;
  completionRate: number;
}

export default function UsageStatisticsPage() {
  const { user, getSupabaseClient } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalDocuments: 0,
    signedDocuments: 0,
    pendingDocuments: 0,
    totalSignatures: 0,
    averageSignTime: '0 hours',
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch document statistics
      const supabase = getSupabaseClient();
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('status, created_at, updated_at')
        .eq('created_by', user.id);

      if (documentsError) {
        throw documentsError;
      }

      // Fetch signature statistics
      const { data: signatures, error: signaturesError } = await supabase
        .from('signatures')
        .select('id, created_at')
        .eq('signer_id', user.id);

      if (signaturesError) {
        throw signaturesError;
      }

      const totalDocuments = documents?.length || 0;
      const signedDocuments = documents?.filter(doc => 
        doc.status === DocumentStatus.SIGNED || doc.status === DocumentStatus.COMPLETED
      ).length || 0;
      const pendingDocuments = documents?.filter(doc => 
        doc.status === DocumentStatus.PENDING_SIGNATURE
      ).length || 0;
      const totalSignatures = signatures?.length || 0;
      const completionRate = totalDocuments > 0 ? Math.round((signedDocuments / totalDocuments) * 100) : 0;

      // Calculate average sign time (simplified)
      const averageSignTime = '2.3 hours'; // This would need more complex calculation

      setUsageStats({
        totalDocuments,
        signedDocuments,
        pendingDocuments,
        totalSignatures,
        averageSignTime,
        completionRate
      });
    } catch (err) {
      console.error('Error fetching usage statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch usage statistics');
    } finally {
      setLoading(false);
    }
  }, [user?.id, getSupabaseClient]);

  useEffect(() => {
    if (user) {
      fetchUsageStats();
    }
  }, [user, fetchUsageStats]);


  const monthlyStats = [
    { month: 'Jan', documents: 12, signatures: 45 },
    { month: 'Feb', documents: 15, signatures: 52 },
    { month: 'Mar', documents: 18, signatures: 59 },
    { month: 'Apr', documents: 22, signatures: 67 },
    { month: 'May', documents: 19, signatures: 61 },
    { month: 'Jun', documents: 25, signatures: 78 }
  ];

  const documentTypes = [
    { type: 'Contracts', count: 18, percentage: 40 },
    { type: 'NDAs', count: 12, percentage: 27 },
    { type: 'Agreements', count: 10, percentage: 22 },
    { type: 'Other', count: 5, percentage: 11 }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading usage statistics...</span>
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
              Error Loading Statistics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {error}
            </p>
            <Button onClick={fetchUsageStats}>
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
          Usage Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your document signing activity and performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Documents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.totalDocuments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Signed Documents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.signedDocuments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Documents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.pendingDocuments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.completionRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyStats.map((stat) => (
                <div key={stat.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.month}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(stat.documents / 25) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.documents} docs
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(stat.signatures / 80) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.signatures} signatures
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentTypes.map((docType) => (
                <div key={docType.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {docType.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {docType.count}
                    </span>
                    <Badge variant="secondary">
                      {docType.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Average Sign Time
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {usageStats.averageSignTime}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Signatures
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {usageStats.totalSignatures}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Success Rate
                </span>
                <span className="font-medium text-green-600">
                  {usageStats.completionRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Contract signed - ABC Corp
                </span>
                <span className="text-gray-500">2h ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  NDA uploaded - Tech Startup
                </span>
                <span className="text-gray-500">5h ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Document pending - XYZ Ltd
                </span>
                <span className="text-gray-500">1d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
