// BuffrSign Platform - Document List Component
// Displays user documents with AI analysis and status

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Brain,
  Shield,
  Loader2
} from 'lucide-react';
import { documentService, DocumentWithAnalysis } from '@/lib/services/document-service';

// ============================================================================
// TYPES
// ============================================================================

interface DocumentListProps {
  userId: string;
  className?: string;
}

interface DocumentStats {
  total: number;
  pending: number;
  completed: number;
  thisMonth: number;
  aiInsights: number;
}

// ============================================================================
// DOCUMENT LIST COMPONENT
// ============================================================================

export default function DocumentList({ userId, className = '' }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentWithAnalysis[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await documentService.getUserDocuments(userId, {
        status: filter === 'all' ? undefined : filter,
        limit: 20
      });

      if (result.success) {
        setDocuments(result.documents || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch documents');
      }
    } catch {
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await documentService.getDocumentStats(userId);
      if (result.success) {
        setStats(result.stats || null);
      }
    } catch(err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [fetchDocuments, fetchStats]);

  // ============================================================================
  // DOCUMENT ACTIONS
  // ============================================================================

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const result = await documentService.deleteDocument(documentId);
      if (result.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        fetchStats(); // Refresh stats
      } else {
        alert(result.error || 'Failed to delete document');
      }
    } catch {
      alert('Failed to delete document');
    }
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      const result = await documentService.getDocumentDownloadUrl(documentId);
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        alert(result.error || 'Failed to generate download URL');
      }
    } catch {
      alert('Failed to download document');
    }
  };

  // ============================================================================
  // STATUS HELPERS
  // ============================================================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'signed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
      case 'uploaded':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'uploaded':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">AI Insights</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aiInsights}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All Documents' },
          { key: 'pending', label: 'Pending' },
          { key: 'completed', label: 'Completed' },
          { key: 'uploaded', label: 'Uploaded' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Upload your first document to get started'
                : `No documents with status "${filter}" found`
              }
            </p>
          </div>
        ) : (
          documents.map((document) => (
            <div
              key={document.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {document.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status || 'unknown')}`}>
                        {getStatusIcon(document.status || 'unknown')}
                        <span className="ml-1 capitalize">{document.status || 'Unknown'}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>•</span>
                      <span>{document.mime_type}</span>
                      <span>•</span>
                      <span>{formatDate(document.created_at || '')}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      {document.document_type && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {document.document_type}
                        </span>
                      )}
                      {document.industry && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {document.industry}
                        </span>
                      )}
                      {document.jurisdiction && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {document.jurisdiction}
                        </span>
                      )}
                      {document.is_kyc_document && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          KYC Document
                        </span>
                      )}
                    </div>

                    {/* AI Analysis Status */}
                    {document.ai_analysis_enabled && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">
                          AI Analysis: {document.ai_analysis_status || 'Pending'}
                        </span>
                        {document.ai_analysis_requests && document.ai_analysis_requests.length > 0 && document.ai_analysis_requests[0].confidence_score && (
                          <span className="text-sm text-green-600">
                            • Score: {Math.round(document.ai_analysis_requests[0].confidence_score * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadDocument(document.id)}
                    className="btn btn-ghost btn-sm"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(`/protected/documents/${document.id}`, '_blank')}
                    className="btn btn-ghost btn-sm"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="btn btn-ghost btn-sm text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
