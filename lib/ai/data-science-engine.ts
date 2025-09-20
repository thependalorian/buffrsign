// BuffrSign Platform - Data Science Engine
// Machine learning patterns and analytics for _document intelligence

'use client';


// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'computer_vision';
  version: string;
  accuracy: number;
  status: 'training' | 'ready' | 'deployed' | 'deprecated';
  created_at: string;
  updated_at: string;
}

export interface DocumentClassificationResult {
  document_type: string;
  confidence: number;
  subcategories: Array<{
    category: string;
    confidence: number;
  }>;
  key_features: string[];
}

export interface RiskScoreResult {
  risk_score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: RiskFactor[];
  mitigation_suggestions: string[];
  confidence: number;
}

export interface RiskFactor {
  factor: string;
  impact: number; // 0-100
  probability: number; // 0-1
  description: string;
}

export interface ComplianceScoreResult {
  overall_score: number; // 0-100
  compliance_level: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
  category_scores: {
    legal: number;
    financial: number;
    technical: number;
    regulatory: number;
  };
  violations: ComplianceViolation[];
  recommendations: string[];
}

export interface ComplianceViolation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  section: string;
  recommendation: string;
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'pattern' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  data: Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// DATA SCIENCE ENGINE
// ============================================================================

export class DataScienceEngine {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor(apiBaseUrl: string = '/api/ai', apiKey?: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey || '';
  }

  // ============================================================================
  // DOCUMENT CLASSIFICATION
  // ============================================================================

  /**
   * Classify _document type using ML
   */
  async classifyDocument(
    documentId: string,
    modelId: string = '_document-classifier-v1'
  ): Promise<{ success: boolean; classification?: DocumentClassificationResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ml/classify-_document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          model_id: modelId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, classification: result.classification };
    } catch (error) {
      console.error('Document classification error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Document classification failed' };
    }
  }

  /**
   * Predict _document risk score
   */
  async predictRiskScore(
    documentId: string,
    modelId: string = 'risk-predictor-v1'
  ): Promise<{ success: boolean; riskScore?: RiskScoreResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ml/predict-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          model_id: modelId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, riskScore: result.risk_score };
    } catch (error) {
      console.error('Risk prediction error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Risk prediction failed' };
    }
  }

  /**
   * Calculate compliance score
   */
  async calculateComplianceScore(
    documentId: string,
    complianceType: 'ETA2019' | 'CRAN' | 'GDPR' | 'general' = 'ETA2019'
  ): Promise<{ success: boolean; complianceScore?: ComplianceScoreResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ml/compliance-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          compliance_type: complianceType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, complianceScore: result.compliance_score };
    } catch (error) {
      console.error('Compliance score calculation error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Compliance score calculation failed' };
    }
  }

  /**
   * Generate analytics insights
   */
  async generateInsights(
    userId: string,
    timeRange: 'day' | 'week' | 'month' | 'quarter' = 'month',
    insightTypes: string[] = ['trend', 'pattern', 'recommendation']
  ): Promise<{ success: boolean; insights?: AnalyticsInsight[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ml/generate-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          user_id: userId,
          time_range: timeRange,
          insight_types: insightTypes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, insights: result.insights };
    } catch (error) {
      console.error('Insight generation error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Insight generation failed' };
    }
  }

  /**
   * Find similar documents
   */
  async findSimilarDocuments(
    documentId: string,
    similarityThreshold: number = 0.8,
    limit: number = 10
  ): Promise<{ success: boolean; similarDocuments?: Array<{ id: string; similarity: number; metadata: Record<string, unknown> }>; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ml/find-similar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          similarity_threshold: similarityThreshold,
          limit
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, similarDocuments: result.similar_documents };
    } catch (error) {
      console.error('Similar _document search error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Similar _document search failed' };
    }
  }
}

// ============================================================================
// REACT HOOKS FOR DATA SCIENCE ENGINE
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useDocumentClassification(documentId: string) {
  const [classification, setClassification] = useState<DocumentClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataScience = useMemo(() => new DataScienceEngine(), []);

  const classifyDocument = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await dataScience.classifyDocument(documentId);
      if (result.success && result.classification) {
        setClassification(result.classification);
      } else {
        setError(result.error || 'Classification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classification failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, dataScience]);

  useEffect(() => {
    classifyDocument();
  }, [classifyDocument]);

  return {
    classification,
    loading,
    error,
    refetch: classifyDocument
  };
}

export function useRiskPrediction(documentId: string) {
  const [riskScore, setRiskScore] = useState<RiskScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataScience = useMemo(() => new DataScienceEngine(), []);

  const predictRisk = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await dataScience.predictRiskScore(documentId);
      if (result.success && result.riskScore) {
        setRiskScore(result.riskScore);
      } else {
        setError(result.error || 'Risk prediction failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Risk prediction failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, dataScience]);

  useEffect(() => {
    predictRisk();
  }, [predictRisk]);

  return {
    riskScore,
    loading,
    error,
    refetch: predictRisk
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const dataScienceEngine = new DataScienceEngine();
export default dataScienceEngine;