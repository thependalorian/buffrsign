// BuffrSign Platform - Pydantic AI Agents Integration
// Structured AI agents for document analysis and workflow automation

'use client';

import { getDocument, getUser, createDocument } from '../database/db-utils';
import { AlignedModels } from './aligned-models';


// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'training';
  version: string;
}

export interface AgentResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  confidence: number;
  processing_time_ms: number;
  agent_id: string;
  timestamp: string;
}

export interface DocumentAnalysisAgentResponse {
  document_summary: string;
  key_entities: Entity[];
  sentiment_analysis: SentimentAnalysis;
  compliance_issues: ComplianceIssue[];
  recommendations: string[];
  confidence_score: number;
}

export interface Entity {
  text: string;
  type: 'person' | 'organization' | 'date' | 'amount' | 'location' | 'legal_term';
  confidence: number;
  start_position: number;
  end_position: number;
}

export interface SentimentAnalysis {
  overall_sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  sentiment_scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface ComplianceIssue {
  type: 'legal' | 'financial' | 'regulatory' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  relevant_section: string;
}

export interface WorkflowAgentResponse {
  workflow_id: string;
  current_step: string;
  next_actions: WorkflowAction[];
  estimated_completion_time: number;
  status: 'in_progress' | 'completed' | 'failed' | 'paused';
}

export interface WorkflowAction {
  action_type: 'approve' | 'reject' | 'modify' | 'request_info' | 'escalate';
  description: string;
  required_inputs: string[];
  estimated_time_minutes: number;
}

// ============================================================================
// PYDANTIC AI AGENTS SERVICE
// ============================================================================

export class PydanticAIAgents {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor(apiBaseUrl: string = '/api/ai', apiKey?: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey || '';
  }

  // ============================================================================
  // AGENT MANAGEMENT
  // ============================================================================

  /**
   * Get available AI agents
   */
  async getAvailableAgents(): Promise<{ success: boolean; agents?: AIAgent[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, agents: result.agents };
    } catch (error) {
      console.error('Get agents error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get agents' };
    }
  }

  /**
   * Get agent details
   */
  async getAgentDetails(agentId: string): Promise<{ success: boolean; agent?: AIAgent; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/${agentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, agent: result.agent };
    } catch (error) {
      console.error('Get agent details error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get agent details' };
    }
  }

  // ============================================================================
  // DOCUMENT ANALYSIS AGENTS
  // ============================================================================

  /**
   * Analyze document with structured AI agent
   */
  async analyzeDocumentWithAgent(
    documentId: string,
    agentId: string = 'document-analysis-agent',
    analysisType: 'comprehensive' | 'compliance' | 'entities' | 'sentiment' = 'comprehensive'
  ): Promise<AgentResponse<DocumentAnalysisAgentResponse>> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/analyze-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          agent_id: agentId,
          analysis_type: analysisType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result.analysis,
        confidence: result.confidence || 0.8,
        processing_time_ms: processingTime,
        agent_id: agentId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Document analysis agent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Document analysis failed',
        confidence: 0,
        processing_time_ms: 0,
        agent_id: agentId,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract entities from document
   */
  async extractEntities(
    documentId: string,
    entityTypes: string[] = ['person', 'organization', 'date', 'amount', 'location']
  ): Promise<AgentResponse<Entity[]>> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/extract-entities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          entity_types: entityTypes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result.entities,
        confidence: result.confidence || 0.8,
        processing_time_ms: processingTime,
        agent_id: 'entity-extraction-agent',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Entity extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Entity extraction failed',
        confidence: 0,
        processing_time_ms: 0,
        agent_id: 'entity-extraction-agent',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Perform sentiment analysis
   */
  async analyzeSentiment(
    documentId: string,
    sections?: string[]
  ): Promise<AgentResponse<SentimentAnalysis>> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/analyze-sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          sections
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result.sentiment,
        confidence: result.confidence || 0.8,
        processing_time_ms: processingTime,
        agent_id: 'sentiment-analysis-agent',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sentiment analysis failed',
        confidence: 0,
        processing_time_ms: 0,
        agent_id: 'sentiment-analysis-agent',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============================================================================
  // COMPLIANCE AGENTS
  // ============================================================================

  /**
   * Check compliance with structured agent
   */
  async checkCompliance(
    documentId: string,
    complianceType: 'ETA2019' | 'CRAN' | 'GDPR' | 'general' = 'ETA2019'
  ): Promise<AgentResponse<ComplianceIssue[]>> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/check-compliance`, {
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
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result.compliance_issues,
        confidence: result.confidence || 0.8,
        processing_time_ms: processingTime,
        agent_id: 'compliance-check-agent',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Compliance check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Compliance check failed',
        confidence: 0,
        processing_time_ms: 0,
        agent_id: 'compliance-check-agent',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============================================================================
  // WORKFLOW AGENTS
  // ============================================================================

  /**
   * Execute workflow with AI agent
   */
  async executeWorkflow(
    workflowId: string,
    agentId: string = 'workflow-orchestration-agent'
  ): Promise<AgentResponse<WorkflowAgentResponse>> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/execute-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          workflow_id: workflowId,
          agent_id: agentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result.workflow_response,
        confidence: result.confidence || 0.8,
        processing_time_ms: processingTime,
        agent_id: agentId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Workflow execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow execution failed',
        confidence: 0,
        processing_time_ms: 0,
        agent_id: agentId,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get workflow recommendations
   */
  async getWorkflowRecommendations(
    documentId: string,
    workflowType: string
  ): Promise<AgentResponse<WorkflowAction[]>> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/workflow-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          workflow_type: workflowType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result.recommendations,
        confidence: result.confidence || 0.8,
        processing_time_ms: processingTime,
        agent_id: 'workflow-recommendation-agent',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Workflow recommendations error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow recommendations failed',
        confidence: 0,
        processing_time_ms: 0,
        agent_id: 'workflow-recommendation-agent',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============================================================================
  // CUSTOM AGENT QUERIES
  // ============================================================================

  /**
   * Query custom agent with natural language
   */
  async queryAgent(
    agentId: string,
    query: string,
    context?: Record<string, unknown>
  ): Promise<AgentResponse<unknown>> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          agent_id: agentId,
          query,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result.response,
        confidence: result.confidence || 0.8,
        processing_time_ms: processingTime,
        agent_id: agentId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Agent query error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Agent query failed',
        confidence: 0,
        processing_time_ms: 0,
        agent_id: agentId,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============================================================================
  // BATCH PROCESSING
  // ============================================================================

  /**
   * Process multiple documents with agents
   */
  async batchProcessWithAgents(
    documentIds: string[],
    agentIds: string[],
    operations: string[]
  ): Promise<{ success: boolean; results?: Record<string, AgentResponse>; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/pydantic-agents/batch-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_ids: documentIds,
          agent_ids: agentIds,
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
  // TEST-EXPECTED METHODS
  // ============================================================================

  /**
   * Validate structured data
   */
  async validateStructuredData(documentId: string, data: any): Promise<{
    valid: boolean;
    errors: string[];
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/validate-structured-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ documentId, data })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Structured data validation error:', error);
      throw new Error(error instanceof Error ? error.message : 'Structured data validation failed');
    }
  }

  /**
   * Extract entities from document
   */
  async extractEntities(documentId: string): Promise<{
    entities: Entity[];
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/extract-entities`, {
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
      console.error('Entity extraction error:', error);
      throw new Error(error instanceof Error ? error.message : 'Entity extraction failed');
    }
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(documentId: string): Promise<{
    sentiment: SentimentAnalysis;
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analyze-sentiment`, {
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
      console.error('Sentiment analysis error:', error);
      throw new Error(error instanceof Error ? error.message : 'Sentiment analysis failed');
    }
  }

  /**
   * Check compliance requirements
   */
  async checkComplianceRequirements(documentId: string): Promise<{
    complianceScore: number;
    violations: ComplianceIssue[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/check-compliance`, {
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
      console.error('Compliance check error:', error);
      throw new Error(error instanceof Error ? error.message : 'Compliance check failed');
    }
  }

  /**
   * Perform risk assessment
   */
  async performRiskAssessment(documentId: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    riskFactors: string[];
    mitigationStrategies: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/risk-assessment`, {
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
      console.error('Risk assessment error:', error);
      throw new Error(error instanceof Error ? error.message : 'Risk assessment failed');
    }
  }

  /**
   * Save validation results
   */
  async saveValidationResults(documentId: string, validation: any): Promise<void> {
    try {
      // This would typically save to the database
      console.log('Saving validation results for document:', documentId, validation);
    } catch (error) {
      console.error('Save validation results error:', error);
      throw new Error(error instanceof Error ? error.message : 'Save validation results failed');
    }
  }

  /**
   * Get document metadata
   */
  async getDocumentMetadata(documentId: string): Promise<any> {
    try {
      const document = await getDocument(documentId);
      return document;
    } catch (error) {
      console.error('Get document metadata error:', error);
      throw new Error(error instanceof Error ? error.message : 'Get document metadata failed');
    }
  }
}

// ============================================================================
// REACT HOOKS FOR PYDANTIC AI AGENTS
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

export function usePydanticAIAgent(agentId: string) {
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pydanticAI = useMemo(() => new PydanticAIAgents(), []);

  const fetchAgent = useCallback(async () => {
    if (!agentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await pydanticAI.getAgentDetails(agentId);
      if (result.success && result.agent) {
        setAgent(result.agent);
      } else {
        setError(result.error || 'Failed to fetch agent');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent');
    } finally {
      setLoading(false);
    }
  }, [agentId, pydanticAI]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  return {
    agent,
    loading,
    error,
    refetch: fetchAgent
  };
}

export function useDocumentAnalysis(documentId: string, agentId: string = 'document-analysis-agent') {
  const [analysis, setAnalysis] = useState<DocumentAnalysisAgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pydanticAI = useMemo(() => new PydanticAIAgents(), []);

  const analyzeDocument = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await pydanticAI.analyzeDocumentWithAgent(documentId, agentId);
      if (result.success && result.data) {
        setAnalysis(result.data);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, agentId, pydanticAI]);

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

export function useComplianceCheck(documentId: string, complianceType: 'ETA2019' | 'CRAN' | 'GDPR' | 'general' = 'ETA2019') {
  const [compliance, setCompliance] = useState<ComplianceIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pydanticAI = useMemo(() => new PydanticAIAgents(), []);

  const checkCompliance = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await pydanticAI.checkCompliance(documentId, complianceType as 'ETA2019' | 'CRAN' | 'GDPR' | 'general');
      if (result.success && result.data) {
        setCompliance(result.data);
      } else {
        setError(result.error || 'Compliance check failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compliance check failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, complianceType, pydanticAI]);

  useEffect(() => {
    checkCompliance();
  }, [checkCompliance]);

  return {
    compliance,
    loading,
    error,
    refetch: checkCompliance
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const pydanticAIAgents = new PydanticAIAgents();
export default pydanticAIAgents;
