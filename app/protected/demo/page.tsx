/**
 * BuffrSign Demo Page
 * 
 * Comprehensive showcase of all implemented features including:
 * - ETA 2019 Compliance Components
 * - Document Analysis & AI Integration
 * - Email Management System
 * - Neon Vector Store Integration
 * - Neo4j Knowledge Graph
 * - Signature Creation & Validation
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ETAComplianceValidator } from '@/components/compliance/ETAComplianceValidator';
import { ComplianceDashboard } from '@/components/compliance/ComplianceDashboard';
import { ComplianceStatusIndicator } from '@/components/compliance/ComplianceStatusIndicator';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentAnalysis from '@/components/ui/DocumentAnalysis';
import SignatureField from '@/components/ui/SignatureField';
import EmailNotificationList from '@/components/email/EmailNotificationList';
import EmailAnalyticsChart from '@/components/email/EmailAnalyticsChart';
import LoadingStates from '@/components/LoadingStates';
import PricingCalculator from '@/components/business/PricingCalculator';
// import { designTokens } from '@/lib/design-system';

// Mock data for demonstration
const mockDocumentData = {
  id: 'demo-doc-001',
  name: 'Sample Contract Agreement',
  type: 'contract',
  status: 'pending_signature',
  created_at: new Date().toISOString(),
  signers: [
    { id: 'signer-1', name: 'John Doe', email: 'john@example.com', status: 'pending' },
    { id: 'signer-2', name: 'Jane Smith', email: 'jane@example.com', status: 'completed' }
  ]
};

const mockSignatureData = {
  signer_id: 'demo-signer-001',
  document_id: 'demo-doc-001',
  signature_data: {
    image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMCI+Sm9obiBEb2U8L3RleHQ+PC9zdmc+',
    verification_hash: 'demo-verification-hash-12345',
    digital_signature: 'demo-digital-signature-base64',
    biometric_data: {
      type: 'signature_pressure',
      data_hash: 'demo-biometric-hash',
      device_id: 'demo-device-001'
    }
  },
  signature_type: 'electronic',
  timestamp: new Date().toISOString(),
  ip_address: '192.168.1.100',
  user_agent: 'Mozilla/5.0 (Demo Browser)',
  verification_status: 'pending'
};

const mockComplianceResult = {
  compliant: true,
  score: 95,
  issues: [] as string[],
  recommendations: [
    'Consider adding explicit withdrawal rights clause',
    'Include data protection statement for GDPR compliance'
  ],
  sections: {
    section17: {
      name: 'Legal Recognition of Data Messages',
      score: 100,
      description: 'Document meets requirements for legal recognition',
      requirements: [
        { description: 'Data message accessible for subsequent reference', met: true, evidence: 'Document stored in Supabase' },
        { description: 'Retained in original format', met: true, evidence: 'PDF format preserved' },
        { description: 'Capable of being displayed to recipient', met: true, evidence: 'Web viewer implemented' }
      ],
      issues: [] as string[],
      recommendations: [] as string[]
    },
    section20: {
      name: 'Electronic Signatures',
      score: 90,
      description: 'Signature meets electronic signature requirements',
      requirements: [
        { description: 'Uniquely linked to signatory', met: true, evidence: 'Digital signature with _user ID' },
        { description: 'Capable of identifying signatory', met: true, evidence: 'User authentication required' },
        { description: 'Created under signatory control', met: true, evidence: 'Client-side signature creation' },
        { description: 'Linked to detect changes', met: true, evidence: 'Document hash verification' }
      ],
      issues: [] as string[],
      recommendations: ['Consider adding biometric verification for enhanced security']
    },
    section21: {
      name: 'Original Information',
      score: 95,
      description: 'Document integrity maintained',
      requirements: [
        { description: 'Information integrity from generation', met: true, evidence: 'Hash verification implemented' },
        { description: 'Accessible for subsequent reference', met: true, evidence: 'Supabase storage with access controls' },
        { description: 'Presented in original format', met: true, evidence: 'PDF format preservation' }
      ],
      issues: [] as string[],
      recommendations: [] as string[]
    },
    section25: {
      name: 'Admissibility and Evidential Weight',
      score: 100,
      description: 'Document meets admissibility requirements',
      requirements: [
        { description: 'Reliable generation method', met: true, evidence: 'AI-powered _document processing' },
        { description: 'Integrity maintained', met: true, evidence: 'Cryptographic verification' },
        { description: 'Originator identified', met: true, evidence: 'User authentication and audit trail' }
      ],
      issues: [] as string[],
      recommendations: [] as string[]
    },
    chapter4: {
      name: 'Consumer Protection',
      score: 85,
      description: 'Consumer protection measures in place',
      requirements: [
        { description: 'Fair and transparent terms', met: true, evidence: 'Clear terms and conditions' },
        { description: 'Clear disclosure of requirements', met: true, evidence: 'Signature requirements explained' },
        { description: 'Right to withdraw consent', met: false, evidence: 'Withdrawal mechanism not explicitly stated' },
        { description: 'Dispute resolution mechanisms', met: true, evidence: 'Support system available' }
      ],
      issues: ['Withdrawal rights not explicitly stated'],
      recommendations: ['Add explicit withdrawal rights clause']
    }
  }
};

const _unusedMockEmailData = [
  {
    id: 'email-001',
    to: 'john@example.com',
    subject: 'Document Signature Required: Sample Contract',
    status: 'sent',
    sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    clicked_at: null
  },
  {
    id: 'email-002',
    to: 'jane@example.com',
    subject: 'Document Signature Required: Sample Contract',
    status: 'delivered',
    sent_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    clicked_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  }
];

const mockAnalyticsData = [
  { 
    id: 'analytics-1', 
    date: '2024-01-15', 
    email_type: 'document_invitation' as const,
    total_sent: 50, 
    total_delivered: 45, 
    total_opened: 38, 
    total_clicked: 12, 
    total_bounced: 2, 
    total_failed: 3,
    delivery_rate: 90, 
    open_rate: 84, 
    click_rate: 24, 
    bounce_rate: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'analytics-2', 
    date: '2024-01-16', 
    email_type: 'document_invitation' as const,
    total_sent: 55, 
    total_delivered: 52, 
    total_opened: 44, 
    total_clicked: 18, 
    total_bounced: 1, 
    total_failed: 2,
    delivery_rate: 95, 
    open_rate: 85, 
    click_rate: 35, 
    bounce_rate: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('compliance');
  const [isLoading, setIsLoading] = useState(false);
  const [complianceResult, setComplianceResult] = useState(mockComplianceResult);

  const tabs = [
    { id: 'compliance', label: 'ETA 2019 Compliance', icon: '🛡️' },
    { id: 'documents', label: 'Document Analysis', icon: '📄' },
    { id: 'signatures', label: 'Signature Creation', icon: '✍️' },
    { id: 'email', label: 'Email Management', icon: '📧' },
    { id: 'analytics', label: 'Analytics & Pricing', icon: '📊' },
    { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️' }
  ];

  const handleComplianceChange = (result: typeof mockComplianceResult) => {
    setComplianceResult(result);
  };

  const handleDocumentUpload = (documentId: string) => {
    console.log('Document uploaded:', documentId);
    setIsLoading(true);
    // Simulate processing
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleSignatureCreate = (signature: unknown) => {
    console.log('Signature created:', signature);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'compliance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ETAComplianceValidator
                documentId={mockDocumentData.id}
                signatureData={mockSignatureData}
                onComplianceChange={handleComplianceChange}
              />
              <ComplianceDashboard
                documentId={mockDocumentData.id}
                signatureData={mockSignatureData}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <ComplianceStatusIndicator
                    compliant={complianceResult.compliant}
                    score={complianceResult.score}
                    framework="ETA2019"
                    size="lg"
                    showScore
                    showTooltip
                  />
                  <div>
                    <h3 className="font-semibold text-buffr-blue">Overall Compliance</h3>
                    <p className="text-sm text-slate-600">{complianceResult.score}% Compliant</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-buffr-purple">Issues Found</h3>
                    <p className="text-sm text-slate-600">{complianceResult.issues.length} Issues</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">!</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-buffr-indigo">Recommendations</h3>
                    <p className="text-sm text-slate-600">{complianceResult.recommendations.length} Suggestions</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-blue mb-4">Document Upload & Analysis</h3>
                <DocumentUpload
                  userId="demo-user-001"
                  onUploadSuccess={handleDocumentUpload}
                  className="mb-4"
                />
                {isLoading && <LoadingStates.DocumentProcessing documentName="demo.pdf" processingStage="analysis" progress={75} />}
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-purple mb-4">AI Document Analysis</h3>
                <DocumentAnalysis
                  _document={new File(['demo content'], 'demo.pdf', { type: 'application/pdf' })}
                  onAnalysis={(analysis) => console.log('Analysis:', analysis)}
                  onFieldDetection={(fields) => console.log('Fields:', fields)}
                  onComplianceCheck={(compliance) => console.log('Compliance:', compliance)}
                />
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-buffr-indigo mb-4">Neon Vector Store Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-base-200 rounded-lg">
                  <h4 className="font-semibold text-buffr-blue">Document Embeddings</h4>
                  <p className="text-sm text-slate-600 mt-2">Vector embeddings stored in Neon via Python backend (embedder.py)</p>
                </div>
                <div className="p-4 bg-base-200 rounded-lg">
                  <h4 className="font-semibold text-buffr-purple">Semantic Search</h4>
                  <p className="text-sm text-slate-600 mt-2">AI-powered document search using OpenAI embeddings</p>
                </div>
                <div className="p-4 bg-base-200 rounded-lg">
                  <h4 className="font-semibold text-buffr-indigo">Knowledge Retrieval</h4>
                  <p className="text-sm text-slate-600 mt-2">RAG (Retrieval Augmented Generation) for compliance queries</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'signatures':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-blue mb-4">Signature Creation</h3>
                <SignatureField
                  method="draw"
                  validation={null}
                  compliance={{ standards_met: ['eta_2019'], overall_compliant: true, compliance_score: 95, missing_requirements: [] }}
                  onSignature={handleSignatureCreate}
                  onValidation={(validation) => console.log('Validation:', validation)}
                />
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-purple mb-4">Signature Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <div className="w-8 h-8 bg-buffr-blue rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✍️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Draw Signature</h4>
                      <p className="text-sm text-slate-600">Mouse or touch-based signature drawing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <div className="w-8 h-8 bg-buffr-purple rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">⌨️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Type Signature</h4>
                      <p className="text-sm text-slate-600">Text-based signature input</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <div className="w-8 h-8 bg-buffr-indigo rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📁</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Upload Signature</h4>
                      <p className="text-sm text-slate-600">Upload image or PDF signature</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-blue mb-4">Email Notifications</h3>
                <EmailNotificationList
                  documentId={mockDocumentData.id}
                  _emailType="document_invitation"
                  limit={10}
                  showFilters={true}
                />
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-purple mb-4">Email Analytics</h3>
                <EmailAnalyticsChart
                  data={mockAnalyticsData}
                  type="delivery"
                  groupBy="day"
                />
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-buffr-indigo mb-4">SendGrid Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-base-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-buffr-blue">98.5%</div>
                  <div className="text-sm text-slate-600">Delivery Rate</div>
                </div>
                <div className="p-4 bg-base-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-buffr-purple">2.1s</div>
                  <div className="text-sm text-slate-600">Avg Send Time</div>
                </div>
                <div className="p-4 bg-base-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-buffr-indigo">85%</div>
                  <div className="text-sm text-slate-600">Open Rate</div>
                </div>
                <div className="p-4 bg-base-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-success">32%</div>
                  <div className="text-sm text-slate-600">Click Rate</div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-blue mb-4">Pricing Calculator</h3>
                <PricingCalculator
                  userType="pro"
                  onCostChange={(cost) => console.log('Cost:', cost)}
                />
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-purple mb-4">AI Cost Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                    <span>Groq Llama 3.1 8B</span>
                    <span className="font-semibold text-buffr-blue">N$0.00000176/token</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                    <span>Groq Llama 3.1 70B</span>
                    <span className="font-semibold text-buffr-purple">N$0.0000088/token</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                    <span>DeepSeek AI (Fallback)</span>
                    <span className="font-semibold text-buffr-indigo">N$0.000014/token</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-success/20 rounded-lg border border-success">
                    <span className="font-semibold">Savings vs OpenAI</span>
                    <span className="font-bold text-success">99.5%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'infrastructure':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-blue mb-4">Supabase (PostgreSQL)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Primary Database</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authentication</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Storage</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Real-time</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-purple mb-4">Neon Vector Store</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Vector Embeddings</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Semantic Search</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RAG Queries</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Document Similarity</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-buffr-indigo mb-4">Neo4j Knowledge Graph</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Document Relationships</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance Rules</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User Networks</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audit Trails</span>
                    <span className="text-success">✓ Active</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-base-200 rounded-lg">
                  <p className="text-xs text-slate-600">
                    Powered by Graphiti + Neo4j via Python backend (graph_utils.py, graph_builder.py)
                  </p>
                </div>
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-buffr-blue mb-4">Infrastructure Architecture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-buffr-purple mb-3">Data Flow</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-buffr-blue rounded-full"></div>
                      <span>Document Upload → Supabase Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-buffr-purple rounded-full"></div>
                      <span>AI Analysis → Neon Vector Store</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-buffr-indigo rounded-full"></div>
                      <span>Compliance Check → Neo4j Knowledge Graph</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>Email Notifications → SendGrid</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-buffr-indigo mb-3">AI Integration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-buffr-blue rounded-full"></div>
                      <span>LlamaIndex → Document Intelligence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-buffr-purple rounded-full"></div>
                      <span>Pydantic AI → Structured Agents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-buffr-indigo rounded-full"></div>
                      <span>LangGraph → Workflow Orchestration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <span>Groq/DeepSeek → LLM Processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-buffr-blue mb-2">BuffrSign Demo</h1>
          <p className="text-lg text-slate-600">
            Comprehensive showcase of our TypeScript-based digital signature platform with AI-powered compliance
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'outline'}
                size="md"
                state="default"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>

        {/* Footer Info */}
        <Card className="p-6 bg-gradient-to-r from-buffr-blue/10 to-buffr-purple/10">
          <div className="text-center">
            <h3 className="text-xl font-bold text-buffr-blue mb-2">Ready for Production</h3>
            <p className="text-slate-600 mb-4">
              This demo showcases a complete, production-ready digital signature platform built with TypeScript, 
              featuring ETA 2019 compliance, AI-powered document analysis, and enterprise-grade infrastructure.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>TypeScript Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>ETA 2019 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>99.5% AI Cost Savings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Enterprise Infrastructure</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
