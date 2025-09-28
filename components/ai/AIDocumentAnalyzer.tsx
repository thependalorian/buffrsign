// BuffrSign Platform - AI Document Analyzer Component
// Advanced document analysis with real-time AI processing and visualization

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Brain, FileText, Shield, TrendingUp, Eye, CheckCircle, Loader2, Download, Share2, Settings, BarChart3, Zap, AlertTriangle } from 'lucide-react';
import Button from '../ui/button';
// Mock hooks for AI integration - these would be implemented in a real app
const useCompleteDocumentAnalysis = () => ({
  refetch: async () => ({ data: null }),
  loading: false
});

const useDocumentProcessing = () => ({
  loading: false
});

const useIntelligentAnalysis = () => ({
  loading: false
});

// ============================================================================
// TYPES
// ============================================================================

interface AnalysisProgress {
  stage: string;
  progress: number;
  message: string;
  timestamp: Date;
}

interface AnalysisResults {
  ocr?: {
    textExtraction: {
      text: string;
      confidence: number;
      language: string;
    };
    fieldDetection: {
      fields: Array<{
        name: string;
        type: string;
        position: { x: number; y: number; width: number; height: number };
        confidence: number;
      }>;
    };
  };
  computerVision?: {
    signatureDetection: {
      signatures: Array<{
        type: string;
        position: { x: number; y: number };
        confidence: number;
        isValid: boolean;
      }>;
    };
    securityAnalysis: {
      tamperingDetected: boolean;
      riskScore: number;
      anomalies: string[];
    };
    qualityAnalysis: {
      resolution: number;
      clarity: number;
      brightness: number;
      contrast: number;
    };
  };
  classification?: {
    documentType: string;
    confidence: number;
    category: string;
    subcategory?: string;
  };
  compliance?: {
    complianceScore: number;
    etaCompliance: {
      section17: 'compliant' | 'needs_review' | 'non_compliant';
      section20: 'compliant' | 'needs_review' | 'non_compliant';
      section21: 'compliant' | 'needs_review' | 'non_compliant';
    };
    recommendations: string[];
  };
  riskAssessment?: {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  };
  insights?: {
    summary: string;
    keyFindings: string[];
    actionItems: string[];
    confidence: number;
  };
}

interface AIDocumentAnalyzerProps {
  documentName: string;
  onAnalysisComplete?: (results: AnalysisResults) => void;
  onError?: (error: string) => void;
  className?: string;
}

// ============================================================================
// AI DOCUMENT ANALYZER COMPONENT
// ============================================================================

export default function AIDocumentAnalyzer({
  documentName,
  onAnalysisComplete,
  onError,
  className = ''
}: AIDocumentAnalyzerProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress[]>([]);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'ocr' | 'vision' | 'compliance' | 'risk' | 'insights'>('overview');
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisStartTime = useRef<Date | null>(null);

  // ============================================================================
  // AI HOOKS
  // ============================================================================
  
  const { refetch: performCompleteAnalysis, loading: analysisLoading } = useCompleteDocumentAnalysis();
  const { loading: processingLoading } = useDocumentProcessing();
  const { loading: intelligentLoading } = useIntelligentAnalysis();

  // ============================================================================
  // ANALYSIS FUNCTIONS
  // ============================================================================

  const updateProgress = useCallback((stage: string, progress: number, message: string) => {
    const newProgress: AnalysisProgress = {
      stage,
      progress,
      message,
      timestamp: new Date()
    };
    
    setAnalysisProgress(prev => [...prev, newProgress]);
    setCurrentStage(stage);
    setOverallProgress(progress);
  }, []);

  const simulateProgress = useCallback(() => {
    const stages = [
      { name: 'OCR Processing', duration: 2000, message: 'Extracting text and detecting fields...' },
      { name: 'Computer Vision', duration: 3000, message: 'Analyzing signatures and security...' },
      { name: 'Document Classification', duration: 1500, message: 'Classifying document type...' },
      { name: 'Compliance Check', duration: 2500, message: 'Validating ETA 2019 compliance...' },
      { name: 'Risk Assessment', duration: 2000, message: 'Calculating risk factors...' },
      { name: 'Generating Insights', duration: 1500, message: 'Creating analysis summary...' }
    ];

    let stageIndex = 0;

    const updateStage = () => {
      if (stageIndex < stages.length) {
        const stage = stages[stageIndex];
        const stageProgress = (stageIndex + 1) / stages.length * 100;
        
        updateProgress(stage.name, stageProgress, stage.message);
        
        setTimeout(() => {
          stageIndex++;
          updateStage();
        }, stage.duration);
      } else {
        setCurrentStage('Analysis Complete');
        setOverallProgress(100);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    };

    updateStage();
  }, [updateProgress]);

  const startAnalysis = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setResults(null);
      setAnalysisProgress([]);
      analysisStartTime.current = new Date();
      
      // Start progress simulation
      simulateProgress();
      
      // Perform complete document analysis
      await performCompleteAnalysis();

      // Note: In a real implementation, the results would be available through the hook state
      // For now, we'll simulate successful completion
      const mockResults: AnalysisResults = {
        classification: {
          documentType: 'Contract',
          confidence: 0.95,
          category: 'Legal'
        },
        compliance: {
          complianceScore: 0.95,
          etaCompliance: {
            section17: 'compliant',
            section20: 'compliant',
            section21: 'compliant'
          },
          recommendations: ['Document appears to be compliant with ETA 2019']
        },
        riskAssessment: {
          riskScore: 0.2,
          riskLevel: 'low',
          riskFactors: []
        }
      };
      
      setResults(mockResults);
      onAnalysisComplete?.(mockResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsAnalyzing(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [performCompleteAnalysis, onAnalysisComplete, onError, simulateProgress]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const intervalId = progressIntervalRef.current;
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-chart-2 bg-chart-2/10';
      case 'medium': return 'text-chart-3 bg-chart-3/10';
      case 'high': return 'text-chart-3 bg-chart-3/10';
      case 'critical': return 'text-chart-5 bg-chart-5/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-chart-2 bg-chart-2/10';
      case 'needs_review': return 'text-chart-3 bg-chart-3/10';
      case 'non_compliant': return 'text-chart-5 bg-chart-5/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-chart-1" />
            <span className="font-medium">Document Type</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {results?.classification?.documentType || 'Unknown'}
          </p>
          <p className="text-xs text-muted-foreground">
            Confidence: {results?.classification?.confidence || 0}%
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-chart-2" />
            <span className="font-medium">Compliance Score</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {results?.compliance?.complianceScore || 0}%
          </p>
          <p className="text-xs text-muted-foreground">
            ETA 2019 Compliant
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-chart-3" />
            <span className="font-medium">Risk Level</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {results?.riskAssessment?.riskLevel || 'Unknown'}
          </p>
          <p className="text-xs text-muted-foreground">
            Score: {results?.riskAssessment?.riskScore || 0}/100
          </p>
        </div>
      </div>

      {/* Key Findings */}
      {results?.insights && (
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-chart-4" />
            <span>AI Insights</span>
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Summary</h4>
              <p className="text-sm text-muted-foreground mt-1">{results.insights.summary}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Key Findings</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                {results.insights.keyFindings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOCR = () => (
    <div className="space-y-6">
      {results?.ocr && (
        <>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Text Extraction</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong>Confidence:</strong> {results.ocr.textExtraction.confidence}%
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Language:</strong> {results.ocr.textExtraction.language}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm text-foreground whitespace-pre-wrap">
                  {results.ocr.textExtraction.text}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Eye className="h-5 w-5 text-chart-2" />
              <span>Field Detection</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.ocr.fieldDetection.fields.map((field, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{field.name}</p>
                      <p className="text-sm text-muted-foreground">{field.type}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {field.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Position: ({field.position.x}, {field.position.y})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderComputerVision = () => (
    <div className="space-y-6">
      {results?.computerVision && (
        <>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-chart-2" />
              <span>Signature Detection</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.computerVision.signatureDetection.signatures.map((signature, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Signature {index + 1}</p>
                      <p className="text-sm text-muted-foreground">Type: {signature.type}</p>
                      <p className={`text-sm ${signature.isValid ? 'text-chart-2' : 'text-chart-5'}`}>
                        {signature.isValid ? 'Valid' : 'Invalid'}
                      </p>
                    </div>
                    <span className="text-xs bg-chart-2/10 text-chart-2 px-2 py-1 rounded">
                      {signature.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Position: ({signature.position.x}, {signature.position.y})
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-chart-5" />
              <span>Security Analysis</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Tampering Detected:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  results.computerVision.securityAnalysis.tamperingDetected 
                    ? 'bg-chart-5/10 text-chart-5' 
                    : 'bg-chart-2/10 text-chart-2'
                }`}>
                  {results.computerVision.securityAnalysis.tamperingDetected ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Risk Score: </span>
                <span className="text-lg font-bold text-orange-600">
                  {results.computerVision.securityAnalysis.riskScore}/100
                </span>
              </div>
              {results.computerVision.securityAnalysis.anomalies.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Anomalies Detected:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {results.computerVision.securityAnalysis.anomalies.map((anomaly, index) => (
                      <li key={index}>{anomaly}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      {results?.compliance && (
        <>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>ETA 2019 Compliance</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Score</span>
                <span className="text-2xl font-bold text-primary">
                  {results.compliance.complianceScore}%
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Section 17 (Electronic Signatures)</span>
                  <span className={`px-3 py-1 rounded text-sm ${getComplianceColor(results.compliance.etaCompliance.section17)}`}>
                    {results.compliance.etaCompliance.section17.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Section 20 (Data Integrity)</span>
                  <span className={`px-3 py-1 rounded text-sm ${getComplianceColor(results.compliance.etaCompliance.section20)}`}>
                    {results.compliance.etaCompliance.section20.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Section 21 (Authentication)</span>
                  <span className={`px-3 py-1 rounded text-sm ${getComplianceColor(results.compliance.etaCompliance.section21)}`}>
                    {results.compliance.etaCompliance.section21.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {results.compliance.recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Recommendations</span>
              </h3>
              <ul className="space-y-2">
                {results.compliance.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderRisk = () => (
    <div className="space-y-6">
      {results?.riskAssessment && (
        <>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>Risk Assessment</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Level</span>
                <span className={`px-3 py-1 rounded text-sm font-medium ${getRiskColor(results.riskAssessment.riskLevel)}`}>
                  {results.riskAssessment.riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Score</span>
                <span className="text-2xl font-bold text-orange-600">
                  {results.riskAssessment.riskScore}/100
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-chart-5" />
              <span>Risk Factors</span>
            </h3>
            <div className="space-y-4">
              {results.riskAssessment.riskFactors.map((factor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{factor.factor}</h4>
                    <span className="text-sm bg-chart-5/10 text-chart-5 px-2 py-1 rounded">
                      Impact: {factor.impact}/10
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      {results?.insights && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI-Generated Insights</span>
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Summary</h4>
              <p className="text-sm text-foreground leading-relaxed">
                {results.insights.summary}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Key Findings</h4>
              <ul className="space-y-2">
                {results.insights.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Action Items</h4>
              <ul className="space-y-2">
                {results.insights.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Analysis Confidence: {results.insights.confidence}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`bg-card rounded-lg shadow-sm border border-border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
              <Brain className="h-6 w-6 text-chart-4" />
              <span>AI Document Analysis</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{documentName}</p>
          </div>
          <div className="flex items-center space-x-2">
            {results && (
              <>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </>
            )}
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="p-6 border-b bg-primary/5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <span className="font-medium text-primary">{currentStage}</span>
              </div>
              <span className="text-sm text-primary">{overallProgress}%</span>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            {analysisProgress.length > 0 && (
              <div className="text-sm text-primary">
                {analysisProgress[analysisProgress.length - 1]?.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-6 border-b bg-chart-5/5">
          <div className="flex items-center space-x-2 text-chart-5">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Analysis Error</span>
          </div>
          <p className="text-sm text-chart-5 mt-1">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      {!isAnalyzing && !results && (
        <div className="p-6 border-b">
          <Button
            onClick={startAnalysis}
            disabled={analysisLoading || processingLoading || intelligentLoading}
            variant="primary"
            size="md"
          >
            {(analysisLoading || processingLoading || intelligentLoading) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting Analysis...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Start AI Analysis
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'ocr', label: 'OCR', icon: FileText },
                { id: 'vision', label: 'Computer Vision', icon: Eye },
                { id: 'compliance', label: 'Compliance', icon: Shield },
                { id: 'risk', label: 'Risk', icon: TrendingUp },
                { id: 'insights', label: 'Insights', icon: Brain }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as 'overview' | 'ocr' | 'vision' | 'compliance' | 'risk' | 'insights')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      selectedTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'overview' && renderOverview()}
            {selectedTab === 'ocr' && renderOCR()}
            {selectedTab === 'vision' && renderComputerVision()}
            {selectedTab === 'compliance' && renderCompliance()}
            {selectedTab === 'risk' && renderRisk()}
            {selectedTab === 'insights' && renderInsights()}
          </div>
        </>
      )}
    </div>
  );
}
