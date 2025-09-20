/**
 * ETA 2019 Compliance Validator Component
 * 
 * Purpose: Validates digital signatures against ETA 2019 requirements
 * Location: /components/compliance/ETAComplianceValidator.tsx
 * Features: Real-time compliance checking, detailed reporting, blue-purple theme
 */

'use client';

import React, { useState, useEffect } from 'react';
import { designTokens, componentStyles } from '@/lib/design-system';

// ETA 2019 Compliance Types
interface ETAComplianceResult {
  compliant: boolean;
  score: number;
  sections: {
    section17: ComplianceSection;
    section20: ComplianceSection;
    section21: ComplianceSection;
    section25: ComplianceSection;
    chapter4: ComplianceSection;
  };
  recommendations: string[];
  issues: string[];
  timestamp: string;
}

interface ComplianceSection {
  name: string;
  description: string;
  compliant: boolean;
  score: number;
  requirements: ComplianceRequirement[];
  issues: string[];
  recommendations: string[];
}

interface ComplianceRequirement {
  id: string;
  description: string;
  met: boolean;
  evidence: string;
  critical: boolean;
}

interface ETAComplianceValidatorProps {
  documentId: string;
  signatureData: unknown;
  onComplianceChange: (result: ETAComplianceResult) => void;
  className?: string;
}

export function ETAComplianceValidator({
  documentId,
  signatureData,
  onComplianceChange,
  className = ''
}: ETAComplianceValidatorProps) {
  const [complianceResult, setComplianceResult] = useState<ETAComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (documentId && signatureData) {
      validateETACompliance();
    }
  }, [documentId, signatureData]);

  const validateETACompliance = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/compliance/eta-2019', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          signatureData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate ETA compliance');
      }

      const result: ETAComplianceResult = await response.json();
      setComplianceResult(result);
      onComplianceChange(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <span className="ml-4 text-lg">Validating ETA 2019 Compliance...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card bg-base-100 shadow-xl border-l-4 border-error ${className}`}>
        <div className="card-body">
          <div className="flex items-center">
            <div className="text-error text-2xl mr-3">❌</div>
            <div>
              <h3 className="card-title text-error">Compliance Validation Error</h3>
              <p className="text-error-content">{error}</p>
              <button 
                className="btn btn-outline btn-error btn-sm mt-2"
                onClick={validateETACompliance}
              >
                Retry Validation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!complianceResult) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="card-title justify-center">ETA 2019 Compliance</h3>
            <p className="text-base-content/70">Ready to validate digital signature compliance</p>
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
          <div className="flex items-center">
            <div className="text-3xl mr-3">
              {getComplianceIcon(complianceResult.compliant, complianceResult.score)}
            </div>
            <div>
              <h2 className="card-title text-2xl">ETA 2019 Compliance</h2>
              <p className="text-base-content/70">
                Electronic Transactions Act 4 of 2019
              </p>
            </div>
          </div>
          <div className="text-right">
            <div 
              className="text-3xl font-bold"
              style={{ color: getComplianceColor(complianceResult.compliant, complianceResult.score) }}
            >
              {complianceResult.score}%
            </div>
            <div className="text-sm text-base-content/70">Compliance Score</div>
          </div>
        </div>

        {/* Overall Status */}
        <div 
          className={`alert mb-6 ${
            complianceResult.compliant ? 'alert-success' : 'alert-error'
          }`}
        >
          <div>
            <h3 className="font-bold">
              {complianceResult.compliant ? 'Compliant' : 'Non-Compliant'}
            </h3>
            <div className="text-sm">
              {complianceResult.compliant 
                ? 'This digital signature meets ETA 2019 requirements'
                : 'This digital signature requires attention to meet ETA 2019 requirements'
              }
            </div>
          </div>
        </div>

        {/* Compliance Sections */}
        <div className="space-y-4">
          {Object.entries(complianceResult.sections).map(([key, section]) => (
            <div key={key} className="collapse collapse-arrow bg-base-200">
              <input
                type="checkbox"
                checked={expandedSection === key}
                onChange={() => toggleSection(key)}
              />
              <div className="collapse-title text-lg font-medium flex items-center">
                <span className="mr-3">
                  {getComplianceIcon(section.compliant, section.score)}
                </span>
                <span>{section.name}</span>
                <span className="ml-auto text-sm font-normal">
                  {section.score}%
                </span>
              </div>
              <div className="collapse-content">
                <div className="pt-4">
                  <p className="text-base-content/70 mb-4">{section.description}</p>
                  
                  {/* Requirements */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <div className="space-y-2">
                      {section.requirements.map((req) => (
                        <div key={req.id} className="flex items-start">
                          <span className="mr-2 mt-1">
                            {req.met ? '✅' : '❌'}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">{req.description}</span>
                              {req.critical && (
                                <span className="badge badge-error badge-sm ml-2">Critical</span>
                              )}
                            </div>
                            {req.evidence && (
                              <p className="text-sm text-base-content/70 mt-1">
                                Evidence: {req.evidence}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Issues */}
                  {section.issues.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-error mb-2">Issues:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {section.issues.map((issue, _index) => (
                          <li key={_index} className="text-error text-sm">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {section.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-info mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {section.recommendations.map((rec, _index) => (
                          <li key={_index} className="text-info text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Recommendations */}
        {complianceResult.recommendations.length > 0 && (
          <div className="mt-6 p-4 bg-info/10 rounded-lg">
            <h3 className="font-semibold text-info mb-2">Overall Recommendations:</h3>
            <ul className="list-disc list-inside space-y-1">
              {complianceResult.recommendations.map((rec, _index) => (
                <li key={_index} className="text-info text-sm">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-base-content/50 mt-4 text-center">
          Last validated: {new Date(complianceResult.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default ETAComplianceValidator;
