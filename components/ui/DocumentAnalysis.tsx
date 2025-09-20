/**
 * BuffrSign Document Analysis Component
 * 
 * Purpose: AI-powered _document analysis with Groq integration
 * Location: /components/ui/DocumentAnalysis.tsx
 * Features: TypeScript-based, real-time analysis, compliance checking
 */

import React, { useState, useCallback } from 'react';
import { DocumentAnalysisProps, DocumentAnalysis, SignatureField, RiskAssessment } from '@/lib/design-system';
import { cn } from '@/lib/utils';

const DocumentAnalysis: React.FC<DocumentAnalysisProps> = ({
  _document,
  onAnalysis,
  onFieldDetection,
  onComplianceCheck
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [progress, setProgress] = useState(0);

  // AI-powered _document analysis using Groq
  const analyzeDocument = useCallback(async () => {
    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Step 1: Document type detection
      setProgress(20);
      const typeResponse = await fetch('/api/ai/analyze-_document-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _document })
      });
      const documentType = await typeResponse.json();

      // Step 2: Field extraction
      setProgress(40);
      const fieldsResponse = await fetch('/api/ai/extract-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _document, documentType })
      });
      const extractedFields = await fieldsResponse.json();

      // Step 3: Signature field detection
      setProgress(60);
      const signatureFieldsResponse = await fetch('/api/ai/detect-signature-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _document, extractedFields })
      });
      const signatureFields = await signatureFieldsResponse.json();

      // Step 4: Compliance checking
      setProgress(80);
      const complianceResponse = await fetch('/api/ai/check-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          _document, 
          documentType, 
          extractedFields,
          signatureFields 
        })
      });
      const complianceStatus = await complianceResponse.json();

      // Step 5: Risk assessment
      setProgress(90);
      const riskResponse = await fetch('/api/ai/assess-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          _document, 
          documentType, 
          extractedFields,
          signatureFields,
          complianceStatus
        })
      });
      const riskAssessment = await riskResponse.json();

      // Step 6: Generate recommendations
      setProgress(95);
      const recommendationsResponse = await fetch('/api/ai/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          _document, 
          documentType, 
          extractedFields,
          signatureFields,
          complianceStatus,
          riskAssessment
        })
      });
      const recommendations = await recommendationsResponse.json();

      // Complete analysis
      setProgress(100);
      const completeAnalysis: DocumentAnalysis = {
        document_type: documentType.type,
        confidence: documentType.confidence,
        extracted_fields: extractedFields.fields,
        compliance_score: complianceStatus.score,
        risk_assessment: riskAssessment,
        recommendations: recommendations.recommendations,
        signature_locations: signatureFields.fields,
        ai_insights: recommendations.insights
      };

      setAnalysis(completeAnalysis);
      onAnalysis(completeAnalysis);
      onFieldDetection(signatureFields.fields);
      onComplianceCheck(complianceStatus);

    } catch (error) {
      console.error('Document analysis failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [_document, onAnalysis, onFieldDetection, onComplianceCheck]);

  // Start analysis when component mounts
  React.useEffect(() => {
    if (_document) {
      analyzeDocument();
    }
  }, [_document, analyzeDocument]);

  // Render analysis progress
  const renderProgress = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analyzing Document</h3>
        <span className="text-sm text-neutral-600">{progress}%</span>
      </div>
      
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div 
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-sm text-neutral-600">
        {progress < 20 && "Detecting _document type..."}
        {progress >= 20 && progress < 40 && "Extracting fields..."}
        {progress >= 40 && progress < 60 && "Detecting signature fields..."}
        {progress >= 60 && progress < 80 && "Checking compliance..."}
        {progress >= 80 && progress < 90 && "Assessing risk..."}
        {progress >= 90 && progress < 100 && "Generating recommendations..."}
        {progress === 100 && "Analysis complete!"}
      </div>
    </div>
  );

  // Render analysis results
  const renderResults = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        {/* Document Type & Confidence */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <h3 className="text-lg font-semibold mb-2">Document Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600">Document Type</p>
              <p className="font-medium">{analysis.document_type}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Confidence</p>
              <p className="font-medium">{Math.round(analysis.confidence * 100)}%</p>
            </div>
          </div>
        </div>

        {/* Extracted Fields */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <h3 className="text-lg font-semibold mb-2">Extracted Fields</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.extracted_fields.map((field, _index) => (
              <div key={_index} className="flex justify-between items-center p-2 bg-neutral-50 rounded">
                <span className="text-sm font-medium">{field.name}</span>
                <span className="text-sm text-neutral-600">{field.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Fields */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <h3 className="text-lg font-semibold mb-2">Signature Fields</h3>
          <div className="space-y-2">
            {analysis.signature_locations.map((field, _index) => (
              <div key={_index} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <div>
                  <p className="font-medium">{field.field_name}</p>
                  <p className="text-sm text-neutral-600">
                    Page {field.location.page} • {field.required ? 'Required' : 'Optional'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {field.required && (
                    <span className="px-2 py-1 text-xs bg-error-100 text-error-700 rounded">
                      Required
                    </span>
                  )}
                  <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600">
                    Sign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <h3 className="text-lg font-semibold mb-2">Compliance Status</h3>
          <div className="flex items-center space-x-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              analysis.compliance_score >= 80 ? 'bg-success-500' : 
              analysis.compliance_score >= 60 ? 'bg-warning-500' : 'bg-error-500'
            )} />
            <span className="font-medium">
              {analysis.compliance_score >= 80 ? 'Compliant' : 
               analysis.compliance_score >= 60 ? 'Partially Compliant' : 'Non-Compliant'}
            </span>
            <span className="text-sm text-neutral-600">
              ({Math.round(analysis.compliance_score)}% score)
            </span>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Risk</span>
              <span className={cn(
                'px-2 py-1 text-xs rounded font-medium',
                analysis.risk_assessment.overall_risk === 'low' ? 'bg-success-100 text-success-700' :
                analysis.risk_assessment.overall_risk === 'medium' ? 'bg-warning-100 text-warning-700' :
                analysis.risk_assessment.overall_risk === 'high' ? 'bg-error-100 text-error-700' :
                'bg-red-100 text-red-700'
              )}>
                {analysis.risk_assessment.overall_risk.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Risk Score</span>
              <span className="font-medium">{analysis.risk_assessment.risk_score}/100</span>
            </div>
          </div>
          
          {analysis.risk_assessment.risk_factors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Risk Factors:</p>
              <div className="space-y-1">
                {analysis.risk_assessment.risk_factors.map((factor, _index) => (
                  <div key={_index} className="text-sm text-neutral-600">
                    • {factor.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
          <div className="space-y-2">
            {analysis.ai_insights.map((insight, _index) => (
              <div key={_index} className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-700">{insight.category}</p>
                    <p className="text-sm text-blue-600">{insight.insight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, _index) => (
              <div key={_index} className="flex items-start space-x-2">
                <div className={cn(
                  'w-2 h-2 rounded-full mt-2',
                  rec.priority === 'high' ? 'bg-error-500' :
                  rec.priority === 'medium' ? 'bg-warning-500' : 'bg-success-500'
                )} />
                <div>
                  <p className="text-sm font-medium">{rec.description}</p>
                  {rec.action_required && (
                    <p className="text-xs text-neutral-600">Action required</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {isAnalyzing ? renderProgress() : renderResults()}
    </div>
  );
};

export default DocumentAnalysis;
