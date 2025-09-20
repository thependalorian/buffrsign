/**
 * BuffrSign Email Workflow Demo
 * 
 * Complete demonstration of email integration with BuffrSign _document workflow
 * using the buffr.ai domain
 */

import React, { useState } from 'react';
import { DocumentEmailManager } from '@/components/email/DocumentEmailManager';
import { EmailSystemDashboard } from '@/components/email/EmailSystemDashboard';
import { useDocumentEmailIntegration } from '@/lib/hooks/useDocumentEmailIntegration';

// Demo Document Data
const demoDocument = {
  id: 'demo-doc-123',
  title: 'BuffrSign Service Agreement',
  description: 'This is a demo _document showing email integration with BuffrSign workflow',
  ownerId: 'demo-_user-123',
  ownerName: 'John Smith',
  ownerEmail: 'john@buffr.ai',
  status: 'draft',
  createdAt: new Date(),
  recipients: [
    {
      id: 'recipient-1',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      role: 'signer',
      status: 'pending',
      signingOrder: 1
    },
    {
      id: 'recipient-2',
      email: 'bob@example.com',
      name: 'Bob Wilson',
      role: 'witness',
      status: 'pending',
      signingOrder: 2
    }
  ]
};

export const BuffrEmailWorkflowDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'_document' | 'dashboard' | 'integration'>('_document');
  const [emailLog, setEmailLog] = useState<string[]>([]);

  const addToLog = (message: string) => {
    setEmailLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          🚀 BuffrSign Email System Demo
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Complete email integration with <strong>buffr.ai</strong> domain
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="tabs tabs-boxed mb-8 justify-center">
        <button
          className={`tab ${activeDemo === '_document' ? 'tab-active' : ''}`}
          onClick={() => setActiveDemo('_document')}
        >
          📄 Document Workflow
        </button>
        <button
          className={`tab ${activeDemo === 'dashboard' ? 'tab-active' : ''}`}
          onClick={() => setActiveDemo('dashboard')}
        >
          📊 System Dashboard
        </button>
        <button
          className={`tab ${activeDemo === 'integration' ? 'tab-active' : ''}`}
          onClick={() => setActiveDemo('integration')}
        >
          🔗 Integration Demo
        </button>
      </div>

      {/* Document Workflow Demo */}
      {activeDemo === '_document' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📄 Document Email Workflow</h2>
              <p className="text-gray-600">
                This demonstrates how email notifications are integrated with _document workflows in BuffrSign.
                All emails will be sent from <strong>noreply@buffr.ai</strong> with links to <strong>sign.buffr.ai</strong>.
              </p>
            </div>
          </div>

          <DocumentEmailManager
            documentId={demoDocument.id}
            documentTitle={demoDocument.title}
            onEmailSent={(type, recipient) => {
              addToLog(`Email ${type} sent to ${recipient}`);
            }}
          />
        </div>
      )}

      {/* System Dashboard Demo */}
      {activeDemo === 'dashboard' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📊 Email System Dashboard</h2>
              <p className="text-gray-600">
                Comprehensive dashboard for monitoring and managing the BuffrSign email system.
                Configured for <strong>buffr.ai</strong> domain with multi-provider support.
              </p>
            </div>
          </div>

          <EmailSystemDashboard
            showUserPreferences={true}
          />
        </div>
      )}

      {/* Integration Demo */}
      {activeDemo === 'integration' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">🔗 BuffrSign Integration Demo</h2>
              <p className="text-gray-600">
                This shows how the email system integrates with the complete BuffrSign workflow.
              </p>
            </div>
          </div>

          <BuffrIntegrationDemo onEmailSent={addToLog} />
        </div>
      )}

      {/* Email Activity Log */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">📝 Email Activity Log</h3>
          <div className="bg-base-200 p-4 rounded-lg max-h-64 overflow-y-auto">
            {emailLog.length === 0 ? (
              <p className="text-gray-500 italic">No email activity yet. Try sending some emails!</p>
            ) : (
              <div className="space-y-1">
                {emailLog.map((log, _index) => (
                  <div key={_index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-actions justify-end">
            <button
              onClick={() => setEmailLog([])}
              className="btn btn-outline btn-sm"
            >
              Clear Log
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">ℹ️ System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Email Configuration</h4>
              <ul className="text-sm space-y-1">
                <li>• Domain: <strong>buffr.ai</strong></li>
                <li>• From Email: <strong>noreply@buffr.ai</strong></li>
                <li>• App URL: <strong>https://sign.buffr.ai</strong></li>
                <li>• Providers: SendGrid, Resend, AWS SES</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Integration Features</h4>
              <ul className="text-sm space-y-1">
                <li>• Document lifecycle emails</li>
                <li>• Signature workflow notifications</li>
                <li>• Bulk email operations</li>
                <li>• Real-time status tracking</li>
                <li>• Analytics and reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Integration Demo Component
const BuffrIntegrationDemo: React.FC<{ onEmailSent: (message: string) => void }> = ({ onEmailSent }) => {
  const [workflowStep, setWorkflowStep] = useState<'create' | 'invite' | 'remind' | 'complete'>('create');
  const [demoData, setDemoData] = useState(demoDocument);

  const handleWorkflowStep = async (step: string) => {
    switch (step) {
      case 'create':
        onEmailSent('Document created - confirmation email sent to owner');
        setDemoData(prev => ({ ...prev, status: 'created' }));
        break;
      case 'invite':
        onEmailSent('Invitations sent to 2 recipients');
        setDemoData(prev => ({
          ...prev,
          recipients: prev.recipients.map(r => ({ ...r, status: 'sent' }))
        }));
        break;
      case 'remind':
        onEmailSent('Reminders sent to pending recipients');
        break;
      case 'complete':
        onEmailSent('Completion notifications sent to all participants');
        setDemoData(prev => ({
          ...prev,
          status: 'completed',
          recipients: prev.recipients.map(r => ({ ...r, status: 'signed' }))
        }));
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Steps */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">🔄 Document Workflow Steps</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleWorkflowStep('create')}
              className={`btn ${workflowStep === 'create' ? 'btn-primary' : 'btn-outline'}`}
            >
              📄 Create Document
            </button>
            <button
              onClick={() => handleWorkflowStep('invite')}
              className={`btn ${workflowStep === 'invite' ? 'btn-primary' : 'btn-outline'}`}
            >
              📧 Send Invitations
            </button>
            <button
              onClick={() => handleWorkflowStep('remind')}
              className={`btn ${workflowStep === 'remind' ? 'btn-primary' : 'btn-outline'}`}
            >
              ⏰ Send Reminders
            </button>
            <button
              onClick={() => handleWorkflowStep('complete')}
              className={`btn ${workflowStep === 'complete' ? 'btn-primary' : 'btn-outline'}`}
            >
              ✅ Complete
            </button>
          </div>
        </div>
      </div>

      {/* Document Status */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">📊 Document Status</h3>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Document</div>
              <div className="stat-value text-primary">{demoData.title}</div>
              <div className="stat-desc">Status: {demoData.status}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Recipients</div>
              <div className="stat-value text-secondary">{demoData.recipients.length}</div>
              <div className="stat-desc">
                {demoData.recipients.filter(r => r.status === 'signed').length} signed
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Domain</div>
              <div className="stat-value text-accent">buffr.ai</div>
              <div className="stat-desc">Email domain</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipients List */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">👥 Document Recipients</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {demoData.recipients.map((recipient) => (
                  <tr key={recipient.id}>
                    <td>{recipient.name}</td>
                    <td>{recipient.email}</td>
                    <td>
                      <span className="badge badge-outline">
                        {recipient.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        recipient.status === 'signed' ? 'badge-success' :
                        recipient.status === 'sent' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {recipient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuffrEmailWorkflowDemo;
