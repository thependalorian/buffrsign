// BuffrSign Platform - Unified AI Integration Service
// Combines LlamaIndex, Pydantic AI, LangGraph, and Data Science capabilities

import { LlamaIndexDocumentIntelligence } from './llamaindex-integration';
import { PydanticAIAgents } from './pydantic-ai-agents';
import { GroqAIIntegration } from './groq-integration';
import { LangGraphWorkflowOrchestrator } from './langgraph-workflows';
import { DataScienceEngine } from './data-science-engine';
import { OCRService } from './ocr-service';
import { ComputerVisionService } from './computer-vision-service';
import { langfuseService, DocumentAnalysisTrace, AIProviderMetrics } from '../services/langfuse-service';

import type {
  DocumentProcessingResults,
  UserTier,
  GroqMessage,
  GroqAnalysisRequest,
  GroqComplianceRequest,
  GroqLegalExplanationRequest,
} from './ai-types';

// ============================================================================
// UNIFIED AI INTEGRATION SERVICE
// ============================================================================

export class BuffrSignAIIntegration {
  private llamaindex: LlamaIndexDocumentIntelligence;
  private pydanticAI: PydanticAIAgents;
  private groqAI: GroqAIIntegration;
  public langGraph: LangGraphWorkflowOrchestrator;
  private dataScience: DataScienceEngine;
  private ocr: OCRService;
  private computerVision: ComputerVisionService;
  private langfuse: typeof langfuseService;

  constructor(
    apiBaseUrl: string = '/api/ai', 
    apiKey?: string,
    services?: {
      llamaindex?: LlamaIndexDocumentIntelligence;
      pydanticAI?: PydanticAIAgents;
      groqAI?: GroqAIIntegration;
      langGraph?: LangGraphWorkflowOrchestrator;
      dataScience?: DataScienceEngine;
      ocr?: OCRService;
      computerVision?: ComputerVisionService;
    }
  ) {
    this.llamaindex = services?.llamaindex || new LlamaIndexDocumentIntelligence(apiBaseUrl, apiKey);
    this.pydanticAI = services?.pydanticAI || new PydanticAIAgents(apiBaseUrl, apiKey);
    this.groqAI = services?.groqAI || new GroqAIIntegration(apiBaseUrl, apiKey);
    this.langGraph = services?.langGraph || new LangGraphWorkflowOrchestrator(apiBaseUrl, apiKey);
    this.dataScience = services?.dataScience || new DataScienceEngine(apiBaseUrl, apiKey);
    this.ocr = services?.ocr || new OCRService(apiBaseUrl, apiKey);
    this.computerVision = services?.computerVision || new ComputerVisionService(apiBaseUrl, apiKey);
    this.langfuse = langfuseService;
  }

  // ============================================================================
  // LANGFUSE TRACKING METHODS
  // ============================================================================

  /**
   * Track document analysis with Langfuse
   */
  private async trackDocumentAnalysis(trace: DocumentAnalysisTrace): Promise<void> {
    try {
      await this.langfuse.trackDocumentAnalysis(trace);
    } catch (error) {
      console.error('Failed to track document analysis:', error);
    }
  }

  /**
   * Track AI provider metrics
   */
  private async trackAIProviderMetrics(
    serviceName: string,
    input: any,
    output: any,
    metrics: AIProviderMetrics
  ): Promise<void> {
    try {
      await this.langfuse.trackAIServiceCall(serviceName, input, output, metrics);
    } catch (error) {
      console.error(`Failed to track AI provider metrics for ${serviceName}:`, error);
    }
  }

  // ============================================================================
  // GROQ AI METHODS (User Tier-Based)
  // ============================================================================

  /**
   * Get BuffrSign AI assistant response with user tier-based model selection
   */
  async getBuffrSignAssistantResponse(
    userMessage: string,
    userTier: UserTier,
    context?: {
      documentType?: string;
      workflowStage?: string;
      previousMessages?: GroqMessage[];
    }
  ) {
    return this.groqAI.getBuffrSignAssistantResponse(userMessage, userTier, context);
  }

  /**
   * Analyze document with Groq AI based on user tier
   */
  async analyzeDocumentWithGroq(request: GroqAnalysisRequest) {
    const startTime = Date.now();
    
    try {
      const result = await this.groqAI.analyzeDocument(request);
      
      // Track successful analysis
      await this.trackDocumentAnalysis({
        documentId: 'unknown', // GroqAnalysisRequest doesn't have documentId
        documentType: request.analysisType || 'unknown',
        confidence: 0.8, // Default confidence since GroqResponse doesn't have this
        complianceScore: 0.7, // Default compliance score
        processingTime: Date.now() - startTime,
        aiServices: ['groq'],
        riskLevel: 'medium', // Default risk level
        signatureFieldsDetected: 0, // Default since GroqResponse doesn't have this
      });

      return result;
    } catch (error) {
      // Track error
      await this.langfuse.trackError('groq-document-analysis', error as Error, {
        documentId: 'unknown', // GroqAnalysisRequest doesn't have documentId
        documentType: request.analysisType || 'unknown',
        processingTime: Date.now() - startTime,
      });
      
      throw error;
    }
  }

  /**
   * Check compliance with Groq AI based on user tier
   */
  async checkComplianceWithGroq(request: GroqComplianceRequest) {
    return this.groqAI.checkCompliance(request);
  }

  /**
   * Explain legal terms with Groq AI based on user tier
   */
  async explainLegalTermsWithGroq(request: GroqLegalExplanationRequest) {
    return this.groqAI.explainLegalTerms(request);
  }

  /**
   * Analyze contract for signature requirements with Groq AI
   */
  async analyzeContractForSignatures(
    contractContent: string,
    userTier: UserTier
  ) {
    return this.groqAI.analyzeContractForSignatures(contractContent, userTier);
  }

  /**
   * Check ETA 2019 compliance with Groq AI
   */
  async checkETA2019ComplianceWithGroq(
    documentContent: string,
    userTier: UserTier
  ) {
    return this.groqAI.checkETA2019Compliance(documentContent, userTier);
  }

  /**
   * Generate streaming response for real-time chat
   */
  async generateStreamingResponse(
    messages: GroqMessage[],
    userTier: UserTier,
    onChunk: (chunk: string) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ) {
    return this.groqAI.generateStreamingResponse(messages, userTier, onChunk, options);
  }

  /**
   * Get model information for user tier
   */
  getGroqModelInfo(userTier: UserTier) {
    return this.groqAI.getModelInfo(userTier);
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

  // ============================================================================
  // DOCUMENT INTELLIGENCE TOOLS (LlamaIndex)
  // ============================================================================

  /**
   * Process document with OCR
   */
  async processDocumentWithOCR(documentId: string, base64Data: string): Promise<{
    text: string;
    confidence: number;
    method: string;
  }> {
    try {
      const result = await this.llamaindex.processDocumentWithOCR(documentId, base64Data);
      return result;
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error(error instanceof Error ? error.message : 'OCR processing failed');
    }
  }

  /**
   * Extract document fields
   */
  async extractDocumentFields(documentId: string): Promise<{
    fields: Record<string, string>;
    confidence: number;
  }> {
    try {
      const result = await this.llamaindex.extractDocumentFields(documentId);
      return result;
    } catch (error) {
      console.error('Field extraction error:', error);
      throw new Error(error instanceof Error ? error.message : 'Field extraction failed');
    }
  }

  /**
   * Perform semantic document query
   */
  async semanticDocumentQuery(documentId: string, query: string): Promise<{
    answer: string;
    sources: string[];
    confidence: number;
  }> {
    try {
      const result = await this.llamaindex.semanticDocumentQuery(documentId, query);
      return result;
    } catch (error) {
      console.error('Semantic query error:', error);
      throw new Error(error instanceof Error ? error.message : 'Semantic query failed');
    }
  }

  /**
   * Analyze document compliance
   */
  async analyzeDocumentCompliance(documentId: string): Promise<{
    complianceScore: number;
    violations: string[];
    recommendations: string[];
  }> {
    try {
      const result = await this.llamaindex.analyzeDocumentCompliance(documentId);
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
      const result = await this.llamaindex.performComputerVisionAnalysis(documentId);
      return result;
    } catch (error) {
      console.error('Computer vision analysis error:', error);
      throw new Error(error instanceof Error ? error.message : 'Computer vision analysis failed');
    }
  }

  /**
   * Generate document insights
   */
  async generateDocumentInsights(documentId: string): Promise<{
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const result = await this.llamaindex.generateDocumentInsights(documentId);
      return result;
    } catch (error) {
      console.error('Document insights error:', error);
      throw new Error(error instanceof Error ? error.message : 'Document insights failed');
    }
  }

  // ============================================================================
  // STRUCTURED AI AGENT TOOLS (Pydantic AI)
  // ============================================================================

  /**
   * Validate structured data
   */
  async validateStructuredData(documentId: string, data: Record<string, unknown>): Promise<{
    isValid: boolean;
    errors: string[];
    validatedData: Record<string, unknown> | null;
  }> {
    try {
      const result = await this.pydanticAI.validateStructuredData(documentId, data);
      return {
        isValid: result.valid,
        errors: result.errors,
        validatedData: result.valid ? data : null
      };
    } catch (error) {
      console.error('Structured data validation error:', error);
      throw new Error(error instanceof Error ? error.message : 'Structured data validation failed');
    }
  }

  /**
   * Extract entities
   */
  async extractEntities(documentId: string): Promise<{
    entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
  }> {
    try {
      const result = await this.pydanticAI.extractEntities(documentId);
      return {
        entities: (result.data || []).map(entity => ({
          type: entity.type,
          value: entity.text,
          confidence: entity.confidence || result.confidence
        }))
      };
    } catch (error) {
      console.error('Entity extraction error:', error);
      throw new Error(error instanceof Error ? error.message : 'Entity extraction failed');
    }
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(documentId: string): Promise<{
    sentiment: string;
    confidence: number;
    scores: Record<string, number>;
  }> {
    try {
      const result = await this.pydanticAI.analyzeSentiment(documentId);
      return {
        sentiment: result.data?.overall_sentiment || 'neutral',
        confidence: result.data?.confidence || result.confidence,
        scores: result.data?.sentiment_scores || { positive: 0, negative: 0, neutral: 1 }
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw new Error(error instanceof Error ? error.message : 'Sentiment analysis failed');
    }
  }

  /**
   * Check compliance requirements
   */
  async checkComplianceRequirements(documentId: string): Promise<{
    isCompliant: boolean;
    requirements: string[];
    score: number;
  }> {
    try {
      const result = await this.pydanticAI.checkComplianceRequirements(documentId);
      return {
        isCompliant: result.complianceScore >= 0.8, // Consider compliant if score >= 80%
        requirements: result.recommendations || [],
        score: result.complianceScore
      };
    } catch (error) {
      console.error('Compliance check error:', error);
      throw new Error(error instanceof Error ? error.message : 'Compliance check failed');
    }
  }

  /**
   * Perform risk assessment
   */
  async performRiskAssessment(documentId: string): Promise<{
    riskLevel: string;
    score: number;
    factors: string[];
    recommendations: string[];
  }> {
    try {
      const result = await this.pydanticAI.performRiskAssessment(documentId);
      return {
        riskLevel: result.riskLevel,
        score: result.riskScore,
        factors: result.riskFactors || [],
        recommendations: result.mitigationStrategies || []
      };
    } catch (error) {
      console.error('Risk assessment error:', error);
      throw new Error(error instanceof Error ? error.message : 'Risk assessment failed');
    }
  }

  // ============================================================================
  // WORKFLOW ORCHESTRATION TOOLS (LangGraph)
  // ============================================================================

  /**
   * Execute _document processing workflow
   */
  async executeDocumentProcessingWorkflow(documentId: string): Promise<{
    workflowId: string;
    status: string;
    steps: string[];
  }> {
    try {
      const result = await this.langGraph.executeDocumentProcessingWorkflow(documentId);
      return {
        workflowId: result.workflowId,
        status: result.status,
        steps: (result.result as { steps?: string[] })?.steps || []
      };
    } catch (error) {
      console.error('Document processing workflow error:', error);
      throw new Error(error instanceof Error ? error.message : 'Document processing workflow failed');
    }
  }

  /**
   * Execute KYC workflow
   */
  async executeKYCWorkflow(userId: string, documentId: string): Promise<{
    workflowId: string;
    status: string;
    confidence: number;
  }> {
    try {
      const result = await this.langGraph.executeKYCWorkflow(userId, documentId);
      return {
        workflowId: result.workflowId,
        status: result.status,
        confidence: 0.8
      };
    } catch (error) {
      console.error('KYC workflow error:', error);
      throw new Error(error instanceof Error ? error.message : 'KYC workflow failed');
    }
  }

  /**
   * Manage workflow state
   */
  async manageWorkflowState(workflowId: string): Promise<{
    currentState: string;
    nextSteps: string[];
    progress?: number;
    estimatedTimeRemaining?: number;
  }> {
    try {
      const result = await this.langGraph.manageWorkflowState(workflowId);
      return {
        currentState: result.state?.current_node || 'unknown',
        nextSteps: [],
        progress: result.state?.history?.length || 0,
        estimatedTimeRemaining: 30 // Default 30 minutes
      };
    } catch (error) {
      console.error('Workflow state management error:', error);
      throw new Error(error instanceof Error ? error.message : 'Workflow state management failed');
    }
  }

  /**
   * Handle workflow error
   */
  async handleWorkflowError(workflowId: string, error: string): Promise<{
    errorHandled: boolean;
    retryCount: number;
    nextAction: string;
    errorDetails?: string;
  }> {
    try {
      const result = await this.langGraph.handleWorkflowError(workflowId, error);
      return {
        errorHandled: result.handled,
        retryCount: 1,
        nextAction: result.recoveryAction,
        errorDetails: error
      };
    } catch (error) {
      console.error('Workflow error handling error:', error);
      throw new Error(error instanceof Error ? error.message : 'Workflow error handling failed');
    }
  }

  /**
   * Optimize _document processing
   */
  async optimizeDocumentProcessing(documentId: string): Promise<{
    optimizations: string[];
    performanceGain: number;
    estimatedTimeReduction?: number;
  }> {
    try {
      const result = await this.langGraph.optimizeDocumentProcessing(documentId);
      return {
        optimizations: result.optimizations,
        performanceGain: result.performanceGains,
        estimatedTimeReduction: 15 // Default 15 minutes reduction
      };
    } catch (error) {
      console.error('Document processing optimization error:', error);
      throw new Error(error instanceof Error ? error.message : 'Document processing optimization failed');
    }
  }

  // ============================================================================
  // PYTHON AGENT TOOL COMPATIBILITY
  // ============================================================================

  /**
   * Hybrid search combining vector similarity and text matching
   * Matches Python: hybrid_search(query, limit, text_weight)
   */
  async hybridSearch(
    query: string,
    limit: number = 10,
    text_weight: number = 0.3
  ): Promise<unknown[]> {
    try {
      const results = await this.llamaindex.hybridSearch(query, limit, text_weight);
      return results;
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
  ): Promise<unknown | null> {
    try {
      const _document = await this.llamaindex.getDocument(documentId);
      return _document;
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
  ): Promise<{ documents: unknown[]; total: number }> {
    try {
      const result = await this.llamaindex.listDocuments(limit, offset);
      return result;
    } catch (error) {
      console.error('List documents error:', error);
      throw new Error(error instanceof Error ? error.message : 'List documents failed');
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
      const relationships = await this.llamaindex.getEntityRelationships(entityName, depth);
      return relationships;
    } catch (error) {
      console.error('Get entity relationships error:', error);
      throw new Error(error instanceof Error ? error.message : 'Get entity relationships failed');
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
      const timeline = await this.llamaindex.getEntityTimeline(entityName, startDate, endDate);
      return timeline;
    } catch (error) {
      console.error('Get entity timeline error:', error);
      throw new Error(error instanceof Error ? error.message : 'Get entity timeline failed');
    }
  }

  /**
   * Execute service operation
   * Matches Python: execute_service_operation(service_type, operation, params)
   */
  async executeServiceOperation(
    serviceType: string,
    operation: string,
    params: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      const result = await this.langGraph.executeServiceOperation(serviceType, operation, params);
      return result;
    } catch (error) {
      console.error('Execute service operation error:', error);
      throw new Error(error instanceof Error ? error.message : 'Execute service operation failed');
    }
  }

  /**
   * Start signature workflow
   * Matches Python: start_signature_workflow(document_id, signers, workflow_type)
   */
  async startSignatureWorkflow(
    documentId: string,
    signers: Array<{ id: string; name: string; email: string; role: string }>,
    workflowType: 'sequential' | 'parallel' = 'sequential'
  ): Promise<string> {
    try {
      const workflowId = await this.langGraph.startSignatureWorkflow(documentId, signers, workflowType);
      return workflowId;
    } catch (error) {
      console.error('Start signature workflow error:', error);
      throw new Error(error instanceof Error ? error.message : 'Start signature workflow failed');
    }
  }

  /**
   * Start _document workflow
   * Matches Python: start_document_workflow(document_id, analysis_type, enable_compliance)
   */
  async startDocumentWorkflow(
    documentId: string,
    analysisType: 'comprehensive' | 'basic' | 'compliance' = 'comprehensive',
    enableCompliance: boolean = true
  ): Promise<string> {
    try {
      const workflowId = await this.langGraph.startDocumentWorkflow(documentId, analysisType, enableCompliance);
      return workflowId;
    } catch (error) {
      console.error('Start _document workflow error:', error);
      throw new Error(error instanceof Error ? error.message : 'Start _document workflow failed');
    }
  }
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

// Public method to access LangGraph functionality
export async function getWorkflowState(workflowId: string) {
  const _aiIntegration = new BuffrSignAIIntegration();
  return await _aiIntegration.langGraph.getWorkflowState(workflowId);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const buffrSignAI = new BuffrSignAIIntegration();
export default buffrSignAI;