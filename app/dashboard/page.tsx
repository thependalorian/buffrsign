// BuffrSign Platform - Main Dashboard Page
// Provides comprehensive overview of _user's digital signature activities

'use client';

import React from 'react';
import Link from 'next/link';
import DashboardLayout, { DashboardSection, DashboardCard, DashboardStats } from '../../components/dashboard/DashboardLayout';

// ============================================================================
// DASHBOARD PAGE COMPONENT
// ============================================================================

export default function DashboardPage() {
  // const { _user } = useAuth(); // TODO: Implement _user-specific features

  // ============================================================================
  // MOCK DATA (Replace with real data from API)
  // ============================================================================

  const stats = [
    {
      label: 'Total Documents',
      value: '24',
      change: { value: 12, type: 'increase' as const },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      label: 'Pending Signatures',
      value: '3',
      change: { value: 2, type: 'decrease' as const },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      label: 'Active Workflows',
      value: '7',
      change: { value: 3, type: 'increase' as const },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      label: 'KYC Status',
      value: 'Verified', // TODO: Implement proper KYC status check
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const recentDocuments = [
    {
      id: '1',
      title: 'Employment Contract - John Doe',
      type: 'Contract',
      status: 'Signed',
      lastModified: '2 hours ago',
      participants: 2,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Service Agreement - ABC Corp',
      type: 'Agreement',
      status: 'Pending Signature',
      lastModified: '1 day ago',
      participants: 3,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'NDA - Confidential Project',
      type: 'Legal',
      status: 'Draft',
      lastModified: '3 days ago',
      participants: 2,
      priority: 'low'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Document signed',
      description: 'Employment Contract signed by all parties',
      timestamp: '2 hours ago',
      type: 'success'
    },
    {
      id: '2',
      action: 'Workflow created',
      description: 'New signature workflow created for Service Agreement',
      timestamp: '1 day ago',
      type: 'info'
    },
    {
      id: '3',
      action: 'Document uploaded',
      description: 'NDA _document uploaded and ready for review',
      timestamp: '3 days ago',
      type: 'info'
    }
  ];

  const quickActions = [
    {
      label: 'Upload Document',
      description: 'Upload a new _document for signature',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      href: '/protected/documents/upload',
      color: 'primary'
    },
    {
      label: 'Create Workflow',
      description: 'Set up a new signature workflow',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      href: '/protected/workflows',
      color: 'secondary'
    },
    {
      label: 'View Templates',
      description: 'Browse _document templates',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      href: '/protected/templates',
      color: 'accent'
    }
  ];

  // ============================================================================
  // RENDER DASHBOARD
  // ============================================================================

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back! HereHere'sapos;s what's happening with your documents and workflows."
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', active: true }
      ]}
    >
      {/* Welcome Message */}
      <div className="mb-6">
        <div className="alert alert-info">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Welcome to BuffrSign!</h3>
            <div className="text-sm">
              Your account is fully verified. You can now use all platform features.
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <DashboardSection
        title="Overview"
        subtitle="Key metrics and performance indicators"
        className="mb-6"
      >
        <DashboardStats stats={stats} />
      </DashboardSection>

      {/* Quick Actions */}
      <DashboardSection
        title="Quick Actions"
        subtitle="Get started with common tasks"
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <DashboardCard
              key={action.label}
              title={action.label}
              subtitle={action.description}
              className="text-center"
              hover={true}
              onClick={() => window.location.href = action.href}
            >
              <div className="flex flex-col items-center">
                <div className={`text-${action.color} mb-3`}>
                  {action.icon}
                </div>
                <button className={`btn btn-${action.color} btn-sm`}>
                  {action.label}
                </button>
              </div>
            </DashboardCard>
          ))}
        </div>
      </DashboardSection>

      {/* Recent Documents & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Documents */}
        <DashboardSection
          title="Recent Documents"
          subtitle="Your latest _document activity"
          actions={
            <Link href="/protected/documents" className="btn btn-primary btn-sm">
              View All
            </Link>
          }
        >
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-base-100 rounded-lg border border-base-300 hover:border-primary/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="badge badge-xs badge-outline">{doc.type}</span>
                      <span className={`badge badge-xs ${
                        doc.status === 'Signed' ? 'badge-success' :
                        doc.status === 'Pending Signature' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {doc.status}
                      </span>
                      <span className={`badge badge-xs ${
                        doc.priority === 'high' ? 'badge-error' :
                        doc.priority === 'medium' ? 'badge-warning' :
                        'badge-success'
                      }`}>
                        {doc.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-base-content/70">{doc.lastModified}</p>
                  <p className="text-xs text-base-content/50">{doc.participants} participants</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        {/* Recent Activity */}
        <DashboardSection
          title="Recent Activity"
          subtitle="Latest platform activities"
          actions={
            <a href="/protected/analytics" className="btn btn-primary btn-sm">
              View All
            </a>
          }
        >
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-base-100 rounded-lg border border-base-300"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-success' :
                  activity.type === 'warning' ? 'bg-warning' :
                  'bg-info'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-base-content/70 mt-1">{activity.description}</p>
                  <p className="text-xs text-base-content/50 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      {/* KYC Status & Compliance */}
      {true && ( // TODO: Implement KYC status check
        <DashboardSection
          title="KYC Verification Required"
          subtitle="Complete your identity verification to unlock all features"
          className="mb-6"
        >
          <div className="alert alert-warning">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="font-bold">Verification Required</h3>
              <div className="text-sm">
                To use all platform features, please complete your KYC verification. 
                This includes uploading identity documents and completing the verification process.
              </div>
            </div>
            <div className="flex-none">
              <a href="/protected/compliance" className="btn btn-warning btn-sm">
                Complete KYC
              </a>
            </div>
          </div>
        </DashboardSection>
      )}

      {/* Platform Features */}
      <DashboardSection
        title="Platform Features"
        subtitle="Explore what BuffrSign can do for you"
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            title="AI-Powered Analysis"
            subtitle="Intelligent _document processing with LlamaIndex"
            className="text-center"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <p className="text-sm text-base-content/70">
                Upload documents and let AI automatically detect signature fields, 
                extract key information, and provide compliance insights.
              </p>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Secure Signatures"
            subtitle="ETA 2019 compliant digital signatures"
            className="text-center"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm text-base-content/70">
                Legally binding digital signatures with PKI certificates, 
                audit trails, and compliance validation.
              </p>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Workflow Automation"
            subtitle="Streamlined signature workflows with LangGraph"
            className="text-center"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-sm text-base-content/70">
                Create automated signature workflows with multiple participants, 
                approval gates, and real-time tracking.
              </p>
            </div>
          </DashboardCard>
        </div>
      </DashboardSection>
    </DashboardLayout>
  );
}
