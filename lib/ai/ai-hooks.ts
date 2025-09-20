"use client";

// BuffrSign Platform - AI Integration React Hooks
// Client-side hooks for AI integration services

import { useState, useEffect, useCallback } from 'react';
import { BuffrSignAIIntegration } from './ai-integration';
import type { DocumentProcessingResults } from './ai-types';

// ============================================================================
// REACT HOOKS FOR UNIFIED AI INTEGRATION
// ============================================================================

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
        setError(result.error || 'Complete _document analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Complete _document analysis failed');
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
