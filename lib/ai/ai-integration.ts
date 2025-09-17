// BuffrSign Platform - Unified AI Integration Service
// Combines LlamaIndex, Pydantic AI, LangGraph, and Data Science capabilities

'use client';

// import { Database } from '../database.types';
import { LlamaIndexDocumentIntelligence } from './llamaindex-integration';
import { PydanticAIAgents } from './pydantic-ai-agents';
import { LangGraphWorkflowOrchestrator } from './langgraph-workflows';
import { DataScienceEngine } from './data-science-engine';
import { OCRService } from './ocr-service';
import { ComputerVisionService } from './computer-vision-service';
import type {
  DocumentProcessingResults,
} from './ai-types';

// ============================================================================
// UNIFIED AI INTEGRATION SERVICE
// ============================================================================

export class BuffrSignAIIntegration {
  private llamaindex: LlamaIndexDocumentIntelligence;
  private pydanticAI: PydanticAIAgents;
  private langGraph: LangGraphWorkflowOrchestrator;
  private dataScience: DataScienceEngine;
  private ocr: OCRService;
  private computerVision: ComputerVisionService;

  constructor(apiBaseUrl: string = '/api/ai', apiKey?: string) {
    this.llamaindex = new LlamaIndexDocumentIntelligence(apiBaseUrl, apiKey);
    this.pydanticAI = new PydanticAIAgents(apiBaseUrl, apiKey);
    this.langGraph = new LangGraphWorkflowOrchestrator(apiBaseUrl, apiKey);
    this.dataScience = new DataScienceEngine(apiBaseUrl, apiKey);
    this.ocr = new OCRService(apiBaseUrl, apiKey);
    this.computerVision = new ComputerVisionService(apiBaseUrl, apiKey);
  }

  // ============================================================================
  // DOCUMENT PROCESSING PIPELINE
  // ============================================================================

  /**
   * Complete document processing pipeline
   */
  async processDocument(documentId: string, options: {
    enableAnalysis?: boolean;
    enableCompliance?: boolean;
    enableRiskAssessment?: boolean;
    enableWorkflow?: boolean;
    enableOCR?: boolean;
    enableComputerVision?: boolean;
  } = {}): Promise<{
    success: boolean;
    results?: {
      analysis?: Record<string, unknown>;
      compliance?: Record<string, unknown>;
      riskScore?: Record<string, unknown>;
      workflowId?: string;
      ocr?: Record<string, unknown>;
      computerVision?: Record<string, unknown>;
    };
    error?: string;
  }> {
    try {
      const results: Record<string, unknown> = {};

      // Document analysis with LlamaIndex
      if (options.enableAnalysis) {
        const analysisResult = await this.llamaindex.analyzeDocument(documentId, 'comprehensive');
        if (analysisResult.success) {
          results.analysis = analysisResult.analysis;
        }
      }

      // Compliance check with Pydantic AI
      if (options.enableCompliance) {
        const complianceResult = await this.pydanticAI.checkCompliance(documentId, 'ETA2019');
        if (complianceResult.success) {
          results.compliance = complianceResult.data;
        }
      }

      // Risk assessment with Data Science
      if (options.enableRiskAssessment) {
        const riskResult = await this.dataScience.predictRiskScore(documentId);
        if (riskResult.success) {
          results.riskScore = riskResult.riskScore;
        }
      }

      // Workflow orchestration
      if (options.enableWorkflow) {
        const workflowResult = await this.langGraph.createDocumentProcessingWorkflow(documentId, 'signature');
        if (workflowResult.success) {
          results.workflowId = workflowResult.workflowId;
        }
      }

      // OCR text extraction
      if (options.enableOCR) {
        const ocrResult = await this.ocr.extractText(documentId);
        if (ocrResult.success) {
          results.ocr = ocrResult.result;
        }
      }

      // Computer Vision analysis
      if (options.enableComputerVision) {
        const cvResult = await this.computerVision.performComprehensiveAnalysis(documentId);
        if (cvResult.success) {
          results.computerVision = cvResult.analysis;
        }
      }

      return { success: true, results };
    } catch (error) {
      console.error('Document processing pipeline error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Document processing failed' };
    }
  }

  // ============================================================================
  // KYC WORKFLOW INTEGRATION
  // ============================================================================

  /**
   * Complete KYC workflow with AI integration
   */
  async processKYCWorkflow(userId: string, documentId: string, kycType: 'individual' | 'business' | 'enhanced' = 'individual'): Promise<{
    success: boolean;
    workflowId?: string;
    results?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      // Create KYC workflow
      const workflowResult = await this.langGraph.createKYCWorkflow(userId, documentId, kycType);
      if (!workflowResult.success) {
        return { success: false, error: workflowResult.error };
      }

      // Start workflow execution
      const executionResult = await this.langGraph.startWorkflow(
        workflowResult.workflowId!,
        { user_id: userId, document_id: documentId, kyc_type: kycType },
        { workflow_type: 'kyc', user_id: userId, document_id: documentId, priority: 'high' }
      );

      if (!executionResult.success) {
        return { success: false, error: executionResult.error };
      }

    return {
        success: true,
        workflowId: workflowResult.workflowId,
        results: { executionId: executionResult.executionId }
      };
    } catch (error) {
      console.error('KYC workflow error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'KYC workflow failed' };
    }
  }

  // ============================================================================
  // INTELLIGENT DOCUMENT ANALYSIS
  // ============================================================================

  /**
   * Multi-modal document analysis
   */
  async analyzeDocumentIntelligently(documentId: string): Promise<{
    success: boolean;
    analysis?: {
      classification: Record<string, unknown>;
      entities: Record<string, unknown>;
      sentiment: Record<string, unknown>;
      compliance: Record<string, unknown>;
      riskScore: Record<string, unknown>;
      insights: Record<string, unknown>;
    };
    error?: string;
  }> {
    try {
      const analysis: {
        classification: Record<string, unknown>;
        entities: Record<string, unknown>;
        sentiment: Record<string, unknown>;
        compliance: Record<string, unknown>;
        riskScore: Record<string, unknown>;
        insights: Record<string, unknown>;
      } = {
        classification: {},
        entities: {},
        sentiment: {},
        compliance: {},
        riskScore: {},
        insights: {}
      };

      // Document classification
      const classificationResult = await this.dataScience.classifyDocument(documentId);
      if (classificationResult.success && classificationResult.classification) {
        analysis.classification = classificationResult.classification as unknown as Record<string, unknown>;
      }

      // Entity extraction
      const entityResult = await this.pydanticAI.extractEntities(documentId);
      if (entityResult.success && entityResult.data) {
        analysis.entities = entityResult.data as unknown as Record<string, unknown>;
      }

      // Sentiment analysis
      const sentimentResult = await this.pydanticAI.analyzeSentiment(documentId);
      if (sentimentResult.success && sentimentResult.data) {
        analysis.sentiment = sentimentResult.data as unknown as Record<string, unknown>;
      }

      // Compliance check
      const complianceResult = await this.pydanticAI.checkCompliance(documentId, 'ETA2019');
      if (complianceResult.success && complianceResult.data) {
        analysis.compliance = complianceResult.data as unknown as Record<string, unknown>;
      }

      // Risk assessment
      const riskResult = await this.dataScience.predictRiskScore(documentId);
      if (riskResult.success && riskResult.riskScore) {
        analysis.riskScore = riskResult.riskScore as unknown as Record<string, unknown>;
      }

      // Generate insights
      const insightsResult = await this.dataScience.generateInsights('system', 'month');
      if (insightsResult.success && insightsResult.insights) {
        analysis.insights = insightsResult.insights as unknown as Record<string, unknown>;
      }

      return { success: true, analysis };
    } catch (error) {
      console.error('Intelligent document analysis error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Document analysis failed' };
    }
  }

  // ============================================================================
  // COMPREHENSIVE DOCUMENT ANALYSIS WITH OCR & COMPUTER VISION
  // ============================================================================

  /**
   * Complete document analysis with all AI services
   */
  async performCompleteDocumentAnalysis(documentId: string): Promise<{
    success: boolean;
    analysis?: {
      textExtraction: Record<string, unknown>;
      fieldDetection: Record<string, unknown>;
      signatureDetection: Record<string, unknown>;
      securityAnalysis: Record<string, unknown>;
      qualityAnalysis: Record<string, unknown>;
      classification: Record<string, unknown>;
      compliance: Record<string, unknown>;
      riskAssessment: Record<string, unknown>;
      insights: Record<string, unknown>;
    };
    error?: string;
  }> {
    try {
      const analysis: {
        textExtraction: Record<string, unknown>;
        fieldDetection: Record<string, unknown>;
        signatureDetection: Record<string, unknown>;
        securityAnalysis: Record<string, unknown>;
        qualityAnalysis: Record<string, unknown>;
        classification: Record<string, unknown>;
        compliance: Record<string, unknown>;
        riskAssessment: Record<string, unknown>;
        insights: Record<string, unknown>;
      } = {
        textExtraction: {},
        fieldDetection: {},
        signatureDetection: {},
        securityAnalysis: {},
        qualityAnalysis: {},
        classification: {},
        compliance: {},
        riskAssessment: {},
        insights: {}
      };

      // OCR text extraction
      const ocrResult = await this.ocr.extractText(documentId);
      if (ocrResult.success) {
        analysis.textExtraction = ocrResult.result as unknown as Record<string, unknown>;
      }

      // OCR field detection
      const fieldResult = await this.ocr.detectFields(documentId);
      if (fieldResult.success) {
        analysis.fieldDetection = fieldResult.result as unknown as Record<string, unknown>;
      }

      // Computer Vision signature detection
      const signatureResult = await this.computerVision.detectSignatures(documentId);
      if (signatureResult.success) {
        analysis.signatureDetection = signatureResult.result as unknown as Record<string, unknown>;
      }

      // Computer Vision security analysis
      const securityResult = await this.computerVision.analyzeDocumentSecurity(documentId);
      if (securityResult.success) {
        analysis.securityAnalysis = securityResult.result as unknown as Record<string, unknown>;
      }

      // Computer Vision quality analysis
      const qualityResult = await this.computerVision.analyzeImageQuality(documentId);
      if (qualityResult.success) {
        analysis.qualityAnalysis = qualityResult.result as unknown as Record<string, unknown>;
      }

      // Data Science classification
      const classificationResult = await this.dataScience.classifyDocument(documentId);
      if (classificationResult.success) {
        analysis.classification = classificationResult.classification as unknown as Record<string, unknown>;
      }

      // Pydantic AI compliance check
      const complianceResult = await this.pydanticAI.checkCompliance(documentId, 'ETA2019');
      if (complianceResult.success) {
        analysis.compliance = complianceResult.data as unknown as Record<string, unknown>;
      }

      // Data Science risk assessment
      const riskResult = await this.dataScience.predictRiskScore(documentId);
      if (riskResult.success) {
        analysis.riskAssessment = riskResult.riskScore as unknown as Record<string, unknown>;
      }

      // Generate insights
      const insightsResult = await this.dataScience.generateInsights('system', 'month');
      if (insightsResult.success && insightsResult.insights) {
        analysis.insights = insightsResult.insights as unknown as Record<string, unknown>;
      }

      return { success: true, analysis };
    } catch (error) {
      console.error('Complete document analysis error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Complete document analysis failed' };
    }
  }
}

// ============================================================================
// REACT HOOKS FOR UNIFIED AI INTEGRATION
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useBuffrSignAI() {
  const [aiService] = useState(() => new BuffrSignAIIntegration());
  return aiService;
}

export function useDocumentProcessing(documentId: string, options: {
  enableAnalysis?: boolean;
  enableCompliance?: boolean;
  enableRiskAssessment?: boolean;
  enableWorkflow?: boolean;
  enableOCR?: boolean;
  enableComputerVision?: boolean;
} = {}) {
  const [results, setResults] = useState<DocumentProcessingResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiService = useBuffrSignAI();

  const processDocument = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.processDocument(documentId, options);
      if (result.success && result.results) {
        setResults(result.results as DocumentProcessingResults);
      } else {
        setError(result.error || 'Document processing failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Document processing failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, options, aiService]);

  useEffect(() => {
    processDocument();
  }, [processDocument]);

  return {
    results,
    loading,
    error,
    refetch: processDocument
  };
}

export function useIntelligentAnalysis(documentId: string) {
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiService = useBuffrSignAI();

  const analyzeDocument = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeDocumentIntelligently(documentId);
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Document analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Document analysis failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, aiService]);

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

export function useKYCWorkflow(userId: string, documentId: string, kycType: 'individual' | 'business' | 'enhanced' = 'individual') {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiService = useBuffrSignAI();

  const startKYCWorkflow = useCallback(async () => {
    if (!userId || !documentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.processKYCWorkflow(userId, documentId, kycType);
      if (result.success) {
        setWorkflowId(result.workflowId || null);
      } else {
        setError(result.error || 'KYC workflow failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'KYC workflow failed');
    } finally {
      setLoading(false);
    }
  }, [userId, documentId, kycType, aiService]);

  return {
    workflowId,
    loading,
    error,
    startWorkflow: startKYCWorkflow
  };
}

export function useCompleteDocumentAnalysis(documentId: string) {
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiService = useBuffrSignAI();

  const performAnalysis = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.performCompleteDocumentAnalysis(documentId);
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Complete document analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Complete document analysis failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, aiService]);

  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  return {
    analysis,
    loading,
    error,
    refetch: performAnalysis
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createDocumentProcessingOptions(
  analysis: boolean = true,
  compliance: boolean = true,
  riskAssessment: boolean = true,
  workflow: boolean = false,
  ocr: boolean = true,
  computerVision: boolean = true
) {
  return {
    enableAnalysis: analysis,
    enableCompliance: compliance,
    enableRiskAssessment: riskAssessment,
    enableWorkflow: workflow,
    enableOCR: ocr,
    enableComputerVision: computerVision
  };
}

export function getAIProcessingStatus(results: DocumentProcessingResults): {
  completed: string[];
  pending: string[];
  failed: string[];
} {
  const completed: string[] = [];
  const pending: string[] = [];
  const failed: string[] = [];

  if (results?.llamaIndex) completed.push('LlamaIndex Analysis');
  else if (results?.llamaIndex === null) failed.push('LlamaIndex Analysis');
  else pending.push('LlamaIndex Analysis');

  if (results?.pydantic) completed.push('Pydantic AI');
  else if (results?.pydantic === null) failed.push('Pydantic AI');
  else pending.push('Pydantic AI');

  if (results?.dataScience) completed.push('Data Science');
  else if (results?.dataScience === null) failed.push('Data Science');
  else pending.push('Data Science');

  if (results?.langGraph) completed.push('LangGraph Workflow');
  else if (results?.langGraph === null) failed.push('LangGraph Workflow');
  else pending.push('LangGraph Workflow');

  if (results?.ocr) completed.push('OCR');
  else if (results?.ocr === null) failed.push('OCR');
  else pending.push('OCR');

  if (results?.computerVision) completed.push('Computer Vision');
  else if (results?.computerVision === null) failed.push('Computer Vision');
  else pending.push('Computer Vision');

  return { completed, pending, failed };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const buffrSignAI = new BuffrSignAIIntegration();
export default buffrSignAI;