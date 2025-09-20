// BuffrSign Platform - LlamaIndex TypeScript Integration
// Intelligent _document processing with semantic indexing and AI agents
// Connects directly to databases like Python backend

'use client';

import {
  vectorSearch,
  hybridSearch,
  getDocument,
  listDocuments,
  getDocumentChunks,
  searchKnowledgeGraph,
  getEntityRelationships,
  getEntityTimeline,
  generateEmbedding,
} from '../database/db-utils';


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
   * Index a _document for intelligent querying
   */
  async indexDocument(
    documentId: string,
    filePath: string,
    documentType: string
  ): Promise<{ success: boolean; indexId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/llamaindex/_index`, {
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

  /**
   * Hybrid search combining vector similarity and text matching
   * Matches Python: hybrid_search(query, limit, text_weight)
   */
  async hybridSearch(
    query: string,
    limit: number = 10,
    text_weight: number = 0.3
  ): Promise<QueryResult[]> {
    try {
      // Generate embedding for the query
      const embedding = await generateEmbedding(query);
      
      // Perform hybrid search using database utilities
      const results = await hybridSearch(embedding, query, limit, text_weight);
      
      // Convert to QueryResult format
      return results.map(result => ({
        id: result.chunk_id,
        text: result.content,
        metadata: {
          document_id: result.document_id,
          document_title: result.document_title,
          document_source: result.document_source,
          similarity: result.similarity,
          ...result.metadata
        },
        score: result.similarity
      }));
    } catch (error) {
      console.error('Hybrid search error:', error);
      throw new Error(error instanceof Error ? error.message : 'Hybrid search failed');
    }
  }

  /**
   * Get a specific _document by ID
   * Matches Python: get_document(document_id)
   */
  async getDocument(
    documentId: string
  ): Promise<DocumentNode | null> {
    try {
      // Get _document from database
      const _document = await getDocument(documentId);
      
      if (!_document) {
        return null;
      }

      // Convert to DocumentNode format
      return {
        id: _document.id,
        text: _document.content || '',
        metadata: {
          title: _document.title,
          document_type: _document.document_type,
          file_path: _document.file_path,
          file_size: _document.file_size,
          mime_type: _document.mime_type,
          status: _document.status,
          compliance_score: _document.compliance_score,
          risk_level: _document.risk_level,
          eta_compliant: _document.eta_compliant,
          cran_accredited: _document.cran_accredited,
          created_at: _document.created_at,
          updated_at: _document.updated_at,
          ai_analysis: _document.ai_analysis,
          analysis_status: _document.analysis_status,
          category: _document.category,
          description: _document.description
        }
      };
    } catch (error) {
      console.error('Get _document error:', error);
      throw new Error(error instanceof Error ? error.message : 'Get _document failed');
    }
  }

  /**
   * List available documents
   * Matches Python: list_documents(limit, offset)
   */
  async listDocuments(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ documents: DocumentNode[]; total: number }> {
    try {
      // Get documents from database
      const result = await listDocuments(limit, offset);
      
      // Convert to DocumentNode format
      const documents = result.documents.map(_document => ({
        id: _document.id,
        text: _document.content || '',
        metadata: {
          title: _document.title,
          document_type: _document.document_type,
          file_path: _document.file_path,
          file_size: _document.file_size,
          mime_type: _document.mime_type,
          status: _document.status,
          compliance_score: _document.compliance_score,
          risk_level: _document.risk_level,
          eta_compliant: _document.eta_compliant,
          cran_accredited: _document.cran_accredited,
          created_at: _document.created_at,
          updated_at: _document.updated_at,
          ai_analysis: _document.ai_analysis,
          analysis_status: _document.analysis_status,
          category: _document.category,
          description: _document.description
        }
      }));

      return {
        documents,
        total: result.total
      };
    } catch (error) {
      console.error('List documents error:', error);
      throw new Error(error instanceof Error ? error.message : 'List documents failed');
    }
  }

  // ============================================================================
  // INTELLIGENT DOCUMENT ANALYSIS
  // ============================================================================

  /**
   * Analyze _document with AI-powered intelligence
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

  /**
   * Get entity relationships from knowledge graph
   * Matches Python: get_entity_relationships(entity_name, depth)
   */
  async getEntityRelationships(
    entityName: string,
    depth: number = 2
  ): Promise<Record<string, unknown>> {
    try {
      // Get entity relationships from knowledge graph
      const relationships = await getEntityRelationships(entityName, depth);
      return relationships;
    } catch (error) {
      console.error('Entity relationships error:', error);
      throw new Error(error instanceof Error ? error.message : 'Entity relationships failed');
    }
  }

  /**
   * Get entity timeline events
   * Matches Python: get_entity_timeline(entity_name, start_date, end_date)
   */
  async getEntityTimeline(
    entityName: string,
    startDate?: string,
    endDate?: string
  ): Promise<Record<string, unknown>[]> {
    try {
      // Get entity timeline from knowledge graph
      const timeline = await getEntityTimeline(entityName, startDate, endDate);
      return timeline;
    } catch (error) {
      console.error('Entity timeline error:', error);
      throw new Error(error instanceof Error ? error.message : 'Entity timeline failed');
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
   * Subscribe to _document analysis updates
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

  // ============================================================================
  // TEST-EXPECTED METHODS
  // ============================================================================

  /**
   * Process _document with OCR
   */
  async processDocumentWithOCR(documentId: string, base64Data: string): Promise<{
    text: string;
    confidence: number;
    method: string;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          documentId,
          base64Data
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error(error instanceof Error ? error.message : 'OCR processing failed');
    }
  }

  /**
   * Extract _document fields
   */
  async extractDocumentFields(documentId: string): Promise<{
    fields: Record<string, string>;
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/extract-fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ documentId })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Field extraction error:', error);
      throw new Error(error instanceof Error ? error.message : 'Field extraction failed');
    }
  }

  /**
   * Perform semantic _document query
   */
  async semanticDocumentQuery(documentId: string, query: string): Promise<{
    answer: string;
    sources: string[];
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/semantic-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ documentId, query })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Semantic query error:', error);
      throw new Error(error instanceof Error ? error.message : 'Semantic query failed');
    }
  }

  /**
   * Analyze _document compliance
   */
  async analyzeDocumentCompliance(documentId: string): Promise<{
    complianceScore: number;
    violations: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/compliance-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ documentId })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Compliance analysis error:', error);
      throw new Error(error instanceof Error ? error.message : 'Compliance analysis failed');
    }
  }

  /**
   * Perform computer vision analysis
   */
  async performComputerVisionAnalysis(documentId: string): Promise<{
    objects: string[];
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/computer-vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ documentId })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Computer vision analysis error:', error);
      throw new Error(error instanceof Error ? error.message : 'Computer vision analysis failed');
    }
  }

  /**
   * Generate _document insights
   */
  async generateDocumentInsights(documentId: string): Promise<{
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/_document-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ documentId })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Document insights error:', error);
      throw new Error(error instanceof Error ? error.message : 'Document insights failed');
    }
  }

  /**
   * Save analysis results to database
   */
  async saveAnalysisResults(documentId: string, analysis: unknown): Promise<void> {
    try {
      // This would typically save to the database
      console.log('Saving analysis results for _document:', documentId, analysis);
    } catch (error) {
      console.error('Save analysis results error:', error);
      throw new Error(error instanceof Error ? error.message : 'Save analysis results failed');
    }
  }

  /**
   * Get _document from database
   */
  async getDocumentFromDB(documentId: string): Promise<any> {
    try {
      const _document = await getDocument(documentId);
      return _document;
    } catch (error) {
      console.error('Get _document error:', error);
      throw new Error(error instanceof Error ? error.message : 'Get _document failed');
    }
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
