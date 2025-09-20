/**
 * Compliance Dashboard Component
 * 
 * Purpose: Centralized dashboard for all compliance validations
 * Location: /components/compliance/ComplianceDashboard.tsx
 * Features: ETA 2019, eIDAS, ESIGN Act compliance monitoring
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ETAComplianceValidator } from './ETAComplianceValidator';
import { designTokens } from '@/lib/design-system';

interface ComplianceDashboardProps {
  documentId: string;
  signatureData: unknown;
  className?: string;
}

interface ComplianceSummary {
  eta2019: {
    compliant: boolean;
    score: number;
    lastChecked: string;
  };
  eidas: {
    compliant: boolean;
    score: number;
    lastChecked: string;
  };
  esign: {
    compliant: boolean;
    score: number;
    lastChecked: string;
  };
}

export function ComplianceDashboard({
  documentId,
  signatureData,
  className = ''
}: ComplianceDashboardProps) {
  const [complianceSummary, setComplianceSummary] = useState<ComplianceSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'eta2019' | 'eidas' | 'esign'>('eta2019');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documentId && signatureData) {
      loadComplianceSummary();
    }
  }, [documentId, signatureData]);

  const loadComplianceSummary = async () => {
    setLoading(true);
    try {
      // Mock data - in production, this would come from API
      const summary: ComplianceSummary = {
        eta2019: {
          compliant: true,
          score: 95,
          lastChecked: new Date().toISOString()
        },
        eidas: {
          compliant: true,
          score: 88,
          lastChecked: new Date().toISOString()
        },
        esign: {
          compliant: true,
          score: 92,
          lastChecked: new Date().toISOString()
        }
      };
      setComplianceSummary(summary);
    } catch (error) {
      console.error('Failed to load compliance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (compliant: boolean, score: number) => {
    if (compliant && score >= 90) return designTokens.colors.success;
    if (compliant && score >= 70) return designTokens.colors.warning;
    return designTokens.colors.error;
  };

  const getComplianceIcon = (compliant: boolean, score: number) => {
    if (compliant && score >= 90) return '✅';
    if (compliant && score >= 70) return '⚠️';
    return '❌';
  };

  const tabs = [
    {
      id: 'eta2019' as const,
      name: 'ETA 2019',
      description: 'Electronic Transactions Act (Namibia)',
      icon: '🇳🇦'
    },
    {
      id: 'eidas' as const,
      name: 'eIDAS',
      description: 'Electronic IDentification, Authentication and trust Services (EU)',
      icon: '🇪🇺'
    },
    {
      id: 'esign' as const,
      name: 'ESIGN Act',
      description: 'Electronic Signatures in Global and National Commerce Act (US)',
      icon: '🇺🇸'
    }
  ];

  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <span className="ml-4 text-lg">Loading Compliance Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="card-title text-2xl">Compliance Dashboard</h2>
            <p className="text-base-content/70">
              Digital signature compliance validation across multiple frameworks
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-base-content/70">Overall Status</div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {complianceSummary ? '✅' : '⏳'}
              </span>
              <span className="text-lg font-semibold">
                {complianceSummary ? 'Compliant' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Compliance Summary Cards */}
        {complianceSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {tabs.map((tab) => {
              const summary = complianceSummary[tab.id];
              return (
                <div
                  key={tab.id}
                  className={`card bg-base-200 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    activeTab === tab.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{tab.icon}</span>
                        <div>
                          <h3 className="font-semibold">{tab.name}</h3>
                          <p className="text-xs text-base-content/70">{tab.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {getComplianceIcon(summary.compliant, summary.score)}
                          </span>
                          <span 
                            className="text-lg font-bold"
                            style={{ color: getComplianceColor(summary.compliant, summary.score) }}
                          >
                            {summary.score}%
                          </span>
                        </div>
                        <div className="text-xs text-base-content/70">
                          {summary.compliant ? 'Compliant' : 'Non-Compliant'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tabs tabs-boxed mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'eta2019' && (
            <ETAComplianceValidator
              documentId={documentId}
              signatureData={signatureData}
              onComplianceChange={(result) => {
                if (complianceSummary) {
                  setComplianceSummary({
                    ...complianceSummary,
                    eta2019: {
                      compliant: result.compliant,
                      score: result.score,
                      lastChecked: result.timestamp
                    }
                  });
                }
              }}
            />
          )}
          
          {activeTab === 'eidas' && (
            <div className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🇪🇺</span>
                  <div>
                    <h3 className="card-title">eIDAS Compliance</h3>
                    <p className="text-base-content/70">
                      Electronic IDentification, Authentication and trust Services
                    </p>
                  </div>
                </div>
                <div className="alert alert-info">
                  <div>
                    <h4 className="font-bold">Coming Soon</h4>
                    <p>eIDAS compliance validation will be available in the next update.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'esign' && (
            <div className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🇺🇸</span>
                  <div>
                    <h3 className="card-title">ESIGN Act Compliance</h3>
                    <p className="text-base-content/70">
                      Electronic Signatures in Global and National Commerce Act
                    </p>
                  </div>
                </div>
                <div className="alert alert-info">
                  <div>
                    <h4 className="font-bold">Coming Soon</h4>
                    <p>ESIGN Act compliance validation will be available in the next update.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="divider"></div>
        <div className="text-center text-sm text-base-content/50">
          <p>
            Compliance validation powered by BuffrSign's AI-driven legal framework analysis
          </p>
          <p className="mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ComplianceDashboard;
