/**
 * Langfuse Service for BuffrSign
 * 
 * Comprehensive observability and monitoring service for AI interactions.
 * Tracks document analysis, signature validation, workflow execution, and compliance checking.
 */

import { Langfuse } from 'langfuse';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface DocumentAnalysisTrace {
  documentId: string;
  documentType: string;
  confidence: number;
  complianceScore: number;
  processingTime: number;
  aiServices: string[];
  riskLevel: 'low' | 'medium' | 'high';
  signatureFieldsDetected: number;
}

export interface SignatureValidationTrace {
  signatureId: string;
  documentId: string;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'expired';
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
  validationMethod: 'electronic' | 'digital' | 'biometric' | 'handwritten';
  confidence: number;
  processingTime: number;
}

export interface WorkflowExecutionTrace {
  workflowId: string;
  documentId: string;
  participants: string[];
  currentStep: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  stepsCompleted: number;
  totalSteps: number;
  executionTime: number;
}

export interface ComplianceCheckTrace {
  documentId: string;
  framework: 'ETA2019' | 'eIDAS' | 'ESIGN' | 'POPIA' | 'GDPR';
  complianceScore: number;
  sectionsChecked: string[];
  violations: string[];
  recommendations: string[];
  processingTime: number;
}

export interface AIProviderMetrics {
  provider: 'openai' | 'groq' | 'anthropic' | 'deepseek';
  model: string;
  tokensUsed: number;
  cost: number;
  responseTime: number;
  success: boolean;
}

export interface LangfuseMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  topModels: Array<{ model: string; requests: number; tokens: number }>;
  costByProvider: Array<{ provider: string; cost: number }>;
}

// ============================================================================
// LANGFUSE SERVICE CLASS
// ============================================================================

export class LangfuseService {
  private langfuse: Langfuse;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = this.initializeLangfuse();
  }

  /**
   * Initialize Langfuse client
   */
  private initializeLangfuse(): boolean {
    try {
      const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
      const secretKey = process.env.LANGFUSE_SECRET_KEY;
      const baseUrl = process.env.LANGFUSE_HOST || 'https://us.cloud.langfuse.com';

      if (!publicKey || !secretKey) {
        console.warn('Langfuse credentials not found. Monitoring disabled.');
        return false;
      }

      this.langfuse = new Langfuse({
        publicKey,
        secretKey,
        baseUrl,
        flushAt: 1, // Flush immediately for real-time monitoring
        flushInterval: 1000, // 1 second flush interval
      });

      console.log('Langfuse monitoring initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Langfuse:', error);
      return false;
    }
  }

  // ============================================================================
  // DOCUMENT ANALYSIS TRACKING
  // ============================================================================

  /**
   * Track document analysis with AI services
   */
  async trackDocumentAnalysis(trace: DocumentAnalysisTrace): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.langfuse.trace({
        name: 'document-analysis',
        input: {
          documentId: trace.documentId,
          documentType: trace.documentType,
        },
        output: {
          confidence: trace.confidence,
          complianceScore: trace.complianceScore,
          riskLevel: trace.riskLevel,
          signatureFieldsDetected: trace.signatureFieldsDetected,
        },
        metadata: {
          processingTime: trace.processingTime,
          aiServices: trace.aiServices,
          timestamp: new Date().toISOString(),
        },
        tags: ['document-analysis', 'ai-processing', trace.documentType],
      });
    } catch (error) {
      console.error('Failed to track document analysis:', error);
    }
  }

  /**
   * Track individual AI service calls
   */
  async trackAIServiceCall(
    serviceName: string,
    input: any,
    output: any,
    metrics: AIProviderMetrics
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.langfuse.trace({
        name: `ai-service-${serviceName}`,
        input,
        output,
        metadata: {
          provider: metrics.provider,
          model: metrics.model,
          tokensUsed: metrics.tokensUsed,
          cost: metrics.cost,
          responseTime: metrics.responseTime,
          success: metrics.success,
          timestamp: new Date().toISOString(),
        },
        tags: ['ai-service', serviceName, metrics.provider],
      });
    } catch (error) {
      console.error(`Failed to track AI service call for ${serviceName}:`, error);
    }
  }

  // ============================================================================
  // SIGNATURE VALIDATION TRACKING
  // ============================================================================

  /**
   * Track signature validation process
   */
  async trackSignatureValidation(trace: SignatureValidationTrace): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.langfuse.trace({
        name: 'signature-validation',
        input: {
          signatureId: trace.signatureId,
          documentId: trace.documentId,
          validationMethod: trace.validationMethod,
        },
        output: {
          verificationStatus: trace.verificationStatus,
          complianceStatus: trace.complianceStatus,
          confidence: trace.confidence,
        },
        metadata: {
          processingTime: trace.processingTime,
          timestamp: new Date().toISOString(),
        },
        tags: ['signature-validation', trace.validationMethod, trace.verificationStatus],
      });
    } catch (error) {
      console.error('Failed to track signature validation:', error);
    }
  }

  // ============================================================================
  // WORKFLOW EXECUTION TRACKING
  // ============================================================================

  /**
   * Track workflow execution
   */
  async trackWorkflowExecution(trace: WorkflowExecutionTrace): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.langfuse.trace({
        name: 'workflow-execution',
        input: {
          workflowId: trace.workflowId,
          documentId: trace.documentId,
          participants: trace.participants,
        },
        output: {
          currentStep: trace.currentStep,
          status: trace.status,
          stepsCompleted: trace.stepsCompleted,
          totalSteps: trace.totalSteps,
        },
        metadata: {
          executionTime: trace.executionTime,
          progress: (trace.stepsCompleted / trace.totalSteps) * 100,
          timestamp: new Date().toISOString(),
        },
        tags: ['workflow-execution', trace.status],
      });
    } catch (error) {
      console.error('Failed to track workflow execution:', error);
    }
  }

  // ============================================================================
  // COMPLIANCE CHECKING TRACKING
  // ============================================================================

  /**
   * Track compliance checking
   */
  async trackComplianceCheck(trace: ComplianceCheckTrace): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.langfuse.trace({
        name: 'compliance-check',
        input: {
          documentId: trace.documentId,
          framework: trace.framework,
        },
        output: {
          complianceScore: trace.complianceScore,
          violations: trace.violations,
          recommendations: trace.recommendations,
        },
        metadata: {
          sectionsChecked: trace.sectionsChecked,
          processingTime: trace.processingTime,
          timestamp: new Date().toISOString(),
        },
        tags: ['compliance-check', trace.framework],
      });
    } catch (error) {
      console.error('Failed to track compliance check:', error);
    }
  }

  // ============================================================================
  // ERROR TRACKING
  // ============================================================================

  /**
   * Track errors and exceptions
   */
  async trackError(
    errorType: string,
    error: Error,
    context: Record<string, any> = {}
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.langfuse.trace({
        name: `error-${errorType}`,
        input: context,
        output: {
          error: error.message,
          stack: error.stack,
        },
        level: 'ERROR',
        metadata: {
          errorType,
          timestamp: new Date().toISOString(),
        },
        tags: ['error', errorType],
      });
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  }

  // ============================================================================
  // METRICS AND ANALYTICS
  // ============================================================================

  /**
   * Get aggregated metrics from Langfuse
   */
  async getMetrics(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<LangfuseMetrics> {
    if (!this.isEnabled) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        topModels: [],
        costByProvider: [],
      };
    }

    try {
      // This would typically involve querying Langfuse API for metrics
      // For now, return mock data - implement actual API calls as needed
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        topModels: [],
        costByProvider: [],
      };
    } catch (error) {
      console.error('Failed to get metrics:', error);
      throw error;
    }
  }

  /**
   * Flush pending traces
   */
  async flush(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.langfuse.flushAsync();
    } catch (error) {
      console.error('Failed to flush Langfuse traces:', error);
    }
  }

  /**
   * Shutdown Langfuse client
   */
  async shutdown(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.langfuse.shutdownAsync();
    } catch (error) {
      console.error('Failed to shutdown Langfuse:', error);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const langfuseService = new LangfuseService();
export default langfuseService;