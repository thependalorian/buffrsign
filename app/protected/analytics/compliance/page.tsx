"use client";

/**
 * Compliance Reports Page
 * Location: /app/protected/analytics/compliance/page.tsx
 * Purpose: Display compliance reports and audit trails
 * Features:
 * - Compliance status tracking
 * - Audit trail reports
 * - Regulatory compliance metrics
 * - Risk assessment reports
 */

import { useState, useEffect, useCallback } from 'react';
import { Shield, FileCheck, AlertTriangle, CheckCircle2, Download, Eye, Calendar, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useAuth } from '@/lib/contexts/auth-context';

interface ComplianceStats {
  totalDocuments: number;
  compliantDocuments: number;
  nonCompliantDocuments: number;
  complianceRate: number;
  lastAuditDate: string;
  nextAuditDate: string;
}

export default function ComplianceReportsPage() {
  const { user, supabase } = useAuth();
  const [complianceStats, setComplianceStats] = useState<ComplianceStats>({
    totalDocuments: 0,
    compliantDocuments: 0,
    nonCompliantDocuments: 0,
    complianceRate: 0,
    lastAuditDate: '',
    nextAuditDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplianceStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch _document compliance data
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('id, status, created_at')
        .eq('created_by', user.id);

      if (documentsError) {
        throw documentsError;
      }

      const totalDocuments = documents?.length || 0;
      // Mock compliance data since compliance_score column doesn't exist
      const compliantDocuments = Math.floor(totalDocuments * 0.85); // 85% compliance rate
      const nonCompliantDocuments = totalDocuments - compliantDocuments;
      const complianceRate = totalDocuments > 0 ? Math.round((compliantDocuments / totalDocuments) * 100) : 0;

      // Mock audit dates - in reality these would come from audit records
      const lastAuditDate = '2024-01-10';
      const nextAuditDate = '2024-04-10';

      setComplianceStats({
        totalDocuments,
        compliantDocuments,
        nonCompliantDocuments,
        complianceRate,
        lastAuditDate,
        nextAuditDate
      });
    } catch (err) {
      console.error('Error fetching compliance statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance statistics');
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase]);

  useEffect(() => {
    if (user) {
      fetchComplianceStats();
    }
  }, [user, fetchComplianceStats]);


  const complianceReports = [
    {
      id: '1',
      title: 'ETA 2019 Compliance Report',
      type: 'Regulatory',
      status: 'compliant',
      lastUpdated: '2024-01-15',
      documents: 38,
      issues: 0
    },
    {
      id: '2',
      title: 'GDPR Compliance Audit',
      type: 'Privacy',
      status: 'compliant',
      lastUpdated: '2024-01-12',
      documents: 42,
      issues: 0
    },
    {
      id: '3',
      title: 'SOX Compliance Review',
      type: 'Financial',
      status: 'warning',
      lastUpdated: '2024-01-08',
      documents: 15,
      issues: 2
    },
    {
      id: '4',
      title: 'Industry Standards Check',
      type: 'Industry',
      status: 'compliant',
      lastUpdated: '2024-01-05',
      documents: 45,
      issues: 0
    }
  ];

  const auditTrail = [
    {
      id: '1',
      action: 'Document Signed',
      user: 'John Smith',
      document: 'Service Agreement - ABC Corp',
      timestamp: '2024-01-15 14:30:00',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      action: 'Document Uploaded',
      user: 'Sarah Johnson',
      document: 'NDA - Tech Startup',
      timestamp: '2024-01-15 13:45:00',
      ipAddress: '192.168.1.101',
      status: 'success'
    },
    {
      id: '3',
      action: 'Compliance Check Failed',
      user: 'System',
      document: 'Contract Amendment - XYZ Ltd',
      timestamp: '2024-01-15 12:20:00',
      ipAddress: 'System',
      status: 'warning'
    },
    {
      id: '4',
      action: 'Document Deleted',
      user: 'Mike Wilson',
      document: 'Draft Agreement - Old Version',
      timestamp: '2024-01-15 11:15:00',
      ipAddress: '192.168.1.102',
      status: 'success'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'warning': return 'secondary';
      case 'non-compliant': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'non-compliant': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileCheck className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading compliance reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {error}
            </p>
            <Button onClick={fetchComplianceStats}>
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
          Compliance Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor compliance status and audit trails
        </p>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Documents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {complianceStats.totalDocuments}
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
                  Compliant Documents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {complianceStats.compliantDocuments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Non-Compliant
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {complianceStats.nonCompliantDocuments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Compliance Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {complianceStats.complianceRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Compliance Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {report.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {report.type} • {report.documents} documents
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getStatusColor(report.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(report.status)}
                            {report.status}
                          </div>
                        </Badge>
                        {report.issues > 0 && (
                          <Badge variant="destructive">
                            {report.issues} issues
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Last updated: {report.lastUpdated}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditTrail.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-1 rounded-full ${
                    entry.status === 'success' 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-yellow-100 dark:bg-yellow-900'
                  }`}>
                    {entry.status === 'success' ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.action}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {entry.document}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{entry.user}</span>
                      <span>•</span>
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View Full Audit Trail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Schedule */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Audit Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Last Audit
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {complianceStats.lastAuditDate}
              </p>
              <Badge variant="default" className="mt-2">
                Completed
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Next Audit
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {complianceStats.nextAuditDate}
              </p>
              <Badge variant="secondary" className="mt-2">
                Scheduled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
