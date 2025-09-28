/**
 * Compliance Status Indicator Component
 * 
 * Purpose: Compact compliance status indicator for use in signatures and documents
 * Location: /components/compliance/ComplianceStatusIndicator.tsx
 * Features: Real-time status, tooltip details, blue-purple theme
 */

import React, { useState } from 'react';


interface ComplianceStatusIndicatorProps {
  compliant: boolean;
  score: number;
  framework: 'ETA2019' | 'eIDAS' | 'ESIGN' | 'POPIA' | 'GDPR';
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function ComplianceStatusIndicator({
  compliant,
  score,
  framework,
  size = 'md',
  showScore = true,
  showTooltip = true,
  className = ''
}: ComplianceStatusIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getComplianceColor = (compliant: boolean, score: number) => {
    if (compliant && score >= 90) return 'text-chart-2'; // Success Green
    if (compliant && score >= 70) return 'text-chart-3'; // Warning Orange
    return 'text-chart-5'; // Error Red
  };

  const getComplianceIcon = (compliant: boolean, score: number) => {
    if (compliant && score >= 90) return '✅';
    if (compliant && score >= 70) return '⚠️';
    return '❌';
  };

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'ETA2019': return '🇳🇦';
      case 'eIDAS': return '🇪🇺';
      case 'ESIGN': return '🇺🇸';
      case 'POPIA': return '🇿🇦';
      case 'GDPR': return '🇪🇺';
      default: return '📋';
    }
  };

  const getFrameworkName = (framework: string) => {
    switch (framework) {
      case 'ETA2019': return 'Electronic Transactions Act 2019 (Namibia)';
      case 'eIDAS': return 'Electronic IDentification, Authentication and trust Services (EU)';
      case 'ESIGN': return 'Electronic Signatures in Global and National Commerce Act (US)';
      case 'POPIA': return 'Protection of Personal Information Act (South Africa)';
      case 'GDPR': return 'General Data Protection Regulation (EU)';
      default: return 'Compliance Framework';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'text-xs',
          icon: 'text-sm',
          score: 'text-xs',
          tooltip: 'text-xs'
        };
      case 'lg':
        return {
          container: 'text-lg',
          icon: 'text-xl',
          score: 'text-lg',
          tooltip: 'text-sm'
        };
      default: // md
        return {
          container: 'text-sm',
          icon: 'text-base',
          score: 'text-sm',
          tooltip: 'text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses(size);
  const complianceColor = getComplianceColor(compliant, score);
  const complianceIcon = getComplianceIcon(compliant, score);
  const frameworkIcon = getFrameworkIcon(framework);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`flex items-center cursor-pointer ${sizeClasses.container}`}
        onMouseEnter={() => showTooltip && setShowDetails(true)}
        onMouseLeave={() => showTooltip && setShowDetails(false)}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className={`mr-1 ${sizeClasses.icon}`}>
          {complianceIcon}
        </span>
        <span className={`mr-1 ${sizeClasses.icon}`}>
          {frameworkIcon}
        </span>
        {showScore && (
          <span 
            className={`font-semibold ${sizeClasses.score} ${complianceColor}`}
          >
            {score}%
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 min-w-64">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">{complianceIcon}</span>
              <span className="text-lg mr-2">{frameworkIcon}</span>
              <div>
                <div className="font-semibold">{framework}</div>
                <div className={`text-xs ${sizeClasses.tooltip}`}>
                  {getFrameworkName(framework)}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-base-content/70">Status:</span>
                <span 
                  className={`font-semibold ${complianceColor}`}
                >
                  {compliant ? 'Compliant' : 'Non-Compliant'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-base-content/70">Score:</span>
                <span 
                  className={`font-semibold ${complianceColor}`}
                >
                  {score}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-base-content/70">Last Checked:</span>
                <span className="text-xs">{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2">
              <div className="w-full bg-base-300 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    compliant && score >= 90 ? 'bg-chart-2' : 
                    compliant && score >= 70 ? 'bg-chart-3' : 'bg-chart-5'
                  }`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>

            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-100"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function ComplianceBadge({
  compliant,
  score,
  framework,
  className = ''
}: Omit<ComplianceStatusIndicatorProps, 'size' | 'showScore' | 'showTooltip'>) {
  return (
    <ComplianceStatusIndicator
      compliant={compliant}
      score={score}
      framework={framework}
      size="sm"
      showScore={false}
      showTooltip={true}
      className={className}
    />
  );
}

// Full version with score
export function ComplianceScore({
  compliant,
  score,
  framework,
  className = ''
}: Omit<ComplianceStatusIndicatorProps, 'size' | 'showScore' | 'showTooltip'>) {
  return (
    <ComplianceStatusIndicator
      compliant={compliant}
      score={score}
      framework={framework}
      size="md"
      showScore={true}
      showTooltip={true}
      className={className}
    />
  );
}

export default ComplianceStatusIndicator;
