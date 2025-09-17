// BuffrSign Platform - LlamaIndex TypeScript Integration
// Intelligent document processing with semantic indexing and AI agents

'use client';


// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface DocumentNode {
  id: string;
  text: string;
  metadata: {
    page_number?: number;
    section?: string;
    document_type?: string;
    confidence?: number;
    [key: string]: unknown;
  };
  embedding?: number[];
}

export interface QueryResult {
  nodes: DocumentNode[];
  score: number;
  metadata: {
    query: string;
    method: string;
    timestamp: string;
  };
}

export interface DocumentAnalysisResult {
  document_id: string;
  summary: string;
  key_clauses: string[];
  signature_fields: SignatureField[];
  compliance_score: number;
  eta_compliance: ETACompliance;
  recommendations: string[];
  risk_assessment: RiskAssessment;
  processing_time_ms: number;
  confidence_scores: ConfidenceScores;
}

export interface SignatureField {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  field_type: 'signature' | 'initial' | 'date' | 'text';
  confidence: number;
}

export interface ETACompliance {
  compliant: boolean;
  score: number;
  violations: string[];
  recommendations: string[];
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  mitigation_strategies: string[];
}

export interface ConfidenceScores {
  overall: number;
  text_extraction: number;
  field_detection: number;
  compliance_check: number;
}

// ============================================================================
// LLAMAINDEX DOCUMENT INTELLIGENCE SERVICE
// ============================================================================

export class LlamaIndexDocumentIntelligence {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor(apiBaseUrl: string = '/api/ai', apiKey?: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey || '';
  }

  // ============================================================================
  // DOCUMENT INDEXING AND PROCESSING
  // ============================================================================

  /**
   * Index a document for intelligent querying
   */
  async indexDocument(
    documentId: string,
    filePath: string,
    documentType: string
  ): Promise<{ success: boolean; indexId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          file_path: filePath,
          document_type: documentType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, indexId: result.index_id };
    } catch (error) {
      console.error('Document indexing error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Indexing failed' };
    }
  }

  /**
   * Query indexed documents with natural language
   */
  async queryDocuments(
    query: string,
    documentIds?: string[],
    limit: number = 5
  ): Promise<{ success: boolean; results?: QueryResult[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          query,
          document_ids: documentIds,
          limit
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, results: result.results };
    } catch (error) {
      console.error('Document query error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Query failed' };
    }
  }

  // ============================================================================
  // INTELLIGENT DOCUMENT ANALYSIS
  // ============================================================================

  /**
   * Analyze document with AI-powered intelligence
   */
  async analyzeDocument(
    documentId: string,
    analysisType: 'comprehensive' | 'signature_fields' | 'compliance' | 'risk_assessment' = 'comprehensive'
  ): Promise<{ success: boolean; analysis?: DocumentAnalysisResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          analysis_type: analysisType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, analysis: result.analysis };
    } catch (error) {
      console.error('Document analysis error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Analysis failed' };
    }
  }

  /**
   * Extract key clauses from document
   */
  async extractKeyClauses(
    documentId: string,
    clauseTypes: string[] = ['payment', 'termination', 'liability', 'confidentiality']
  ): Promise<{ success: boolean; clauses?: { type: string; text: string; confidence: number }[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/extract-clauses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          clause_types: clauseTypes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, clauses: result.clauses };
    } catch (error) {
      console.error('Clause extraction error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Clause extraction failed' };
    }
  }

  /**
   * Detect signature fields in document
   */
  async detectSignatureFields(
    documentId: string
  ): Promise<{ success: boolean; fields?: SignatureField[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/detect-signatures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, fields: result.signature_fields };
    } catch (error) {
      console.error('Signature field detection error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Signature detection failed' };
    }
  }

  // ============================================================================
  // COMPLIANCE AND LEGAL ANALYSIS
  // ============================================================================

  /**
   * Check ETA 2019 compliance
   */
  async checkETACompliance(
    documentId: string
  ): Promise<{ success: boolean; compliance?: ETACompliance; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/eta-compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, compliance: result.compliance };
    } catch (error) {
      console.error('ETA compliance check error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Compliance check failed' };
    }
  }

  /**
   * Perform risk assessment
   */
  async assessRisk(
    documentId: string
  ): Promise<{ success: boolean; assessment?: RiskAssessment; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/risk-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, assessment: result.assessment };
    } catch (error) {
      console.error('Risk assessment error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Risk assessment failed' };
    }
  }

  // ============================================================================
  // TEMPLATE GENERATION
  // ============================================================================

  /**
   * Generate smart legal template
   */
  async generateTemplate(
    templateType: string,
    requirements: Record<string, unknown>,
    jurisdiction: string = 'Namibia'
  ): Promise<{ success: boolean; template?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/generate-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          template_type: templateType,
          requirements,
          jurisdiction
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, template: result.template };
    } catch (error) {
      console.error('Template generation error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Template generation failed' };
    }
  }

  // ============================================================================
  // KNOWLEDGE BASE QUERIES
  // ============================================================================

  /**
   * Query legal knowledge base
   */
  async queryLegalKnowledge(
    question: string,
    context?: string
  ): Promise<{ success: boolean; answer?: string; sources?: string[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/legal-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          question,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, answer: result.answer, sources: result.sources };
    } catch (error) {
      console.error('Legal knowledge query error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Knowledge query failed' };
    }
  }

  // ============================================================================
  // BATCH PROCESSING
  // ============================================================================

  /**
   * Process multiple documents in batch
   */
  async batchProcessDocuments(
    documentIds: string[],
    operations: string[]
  ): Promise<{ success: boolean; results?: Record<string, unknown>; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/batch-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_ids: documentIds,
          operations
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, results: result.results };
    } catch (error) {
      console.error('Batch processing error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Batch processing failed' };
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to document analysis updates
   */
  subscribeToAnalysisUpdates(
    documentId: string,
    callback: (update: DocumentAnalysisResult) => void
  ): () => void {
    // Implementation would use WebSocket or Server-Sent Events
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      const result = await this.analyzeDocument(documentId, 'comprehensive');
      if (result.success && result.analysis) {
        callback(result.analysis);
      }
    }, 5000);

    return () => clearInterval(interval);
  }
}

// ============================================================================
// REACT HOOKS FOR LLAMAINDEX INTEGRATION
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useLlamaIndexAnalysis(documentId: string) {
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const llamaIndex = useMemo(() => new LlamaIndexDocumentIntelligence(), []);

  const analyzeDocument = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await llamaIndex.analyzeDocument(documentId, 'comprehensive');
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, llamaIndex]);

  useEffect(() => {
    analyzeDocument();
  }, [analyzeDocument]);

  return {
    analysis,
    loading,
    error,
    refetch: analyzeDocument
  };
}

export function useLlamaIndexQuery(query: string, documentIds?: string[]) {
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const llamaIndex = useMemo(() => new LlamaIndexDocumentIntelligence(), []);

  const executeQuery = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await llamaIndex.queryDocuments(query, documentIds);
      if (result.success && result.results) {
        setResults(result.results);
      } else {
        setError(result.error || 'Query failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  }, [query, documentIds, llamaIndex]);

  useEffect(() => {
    const timeoutId = setTimeout(executeQuery, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [executeQuery]);

  return {
    results,
    loading,
    error,
    refetch: executeQuery
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const llamaindexService = new LlamaIndexDocumentIntelligence();
export default llamaindexService;
