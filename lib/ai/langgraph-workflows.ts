// BuffrSign Platform - LangGraph Workflow Orchestration
// Advanced workflow management with state machines and AI agents

'use client';


// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface WorkflowState {
  id: string;
  current_node: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  data: Record<string, unknown>;
  history: WorkflowStep[];
  created_at: string;
  updated_at: string;
  metadata: WorkflowMetadata;
}

export interface WorkflowStep {
  id: string;
  node_id: string;
  action: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  timestamp: string;
  duration_ms: number;
}

export interface WorkflowMetadata {
  workflow_type: string;
  document_id?: string;
  user_id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration_minutes: number;
  tags: string[];
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'start' | 'end' | 'action' | 'condition' | 'parallel' | 'ai_agent' | 'human_review';
  description: string;
  config: WorkflowNodeConfig;
  next_nodes: string[];
  conditions?: WorkflowCondition[];
}

export interface WorkflowNodeConfig {
  action_type?: string;
  agent_id?: string;
  timeout_seconds?: number;
  retry_count?: number;
  parallel_execution?: boolean;
  required_inputs?: string[];
  output_mapping?: Record<string, string>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: unknown;
  next_node: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  start_node: string;
  end_nodes: string[];
  variables: WorkflowVariable[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  default_value?: unknown;
  required: boolean;
  description: string;
}

export interface WorkflowExecutionResult {
  workflow_id: string;
  execution_id: string;
  status: 'completed' | 'failed' | 'cancelled';
  result: Record<string, unknown>;
  error?: string;
  duration_ms: number;
  steps_completed: number;
  total_steps: number;
}

// ============================================================================
// LANGGRAPH WORKFLOW ORCHESTRATOR
// ============================================================================

export class LangGraphWorkflowOrchestrator {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor(apiBaseUrl: string = '/api/ai', apiKey?: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey || '';
  }

  // ============================================================================
  // WORKFLOW DEFINITION MANAGEMENT
  // ============================================================================

  /**
   * Create a new workflow definition
   */
  async createWorkflowDefinition(
    definition: Omit<WorkflowDefinition, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; workflow?: WorkflowDefinition; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(definition)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, workflow: result.workflow };
    } catch (error) {
      console.error('Create workflow definition error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create workflow' };
    }
  }

  /**
   * Get workflow definition
   */
  async getWorkflowDefinition(
    workflowId: string
  ): Promise<{ success: boolean; workflow?: WorkflowDefinition; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/workflows/${workflowId}`, {
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
      return { success: true, workflow: result.workflow };
    } catch (error) {
      console.error('Get workflow definition error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get workflow' };
    }
  }

  /**
   * List all workflow definitions
   */
  async listWorkflowDefinitions(): Promise<{ success: boolean; workflows?: WorkflowDefinition[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/workflows`, {
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
      return { success: true, workflows: result.workflows };
    } catch (error) {
      console.error('List workflow definitions error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to list workflows' };
    }
  }

  // ============================================================================
  // WORKFLOW EXECUTION
  // ============================================================================

  /**
   * Start workflow execution
   */
  async startWorkflow(
    workflowId: string,
    input: Record<string, unknown>,
    metadata: Partial<WorkflowMetadata>
  ): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          workflow_id: workflowId,
          input,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, executionId: result.execution_id };
    } catch (error) {
      console.error('Start workflow error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to start workflow' };
    }
  }

  /**
   * Get workflow execution state
   */
  async getWorkflowState(
    executionId: string
  ): Promise<{ success: boolean; state?: WorkflowState; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/execute/${executionId}/state`, {
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
      return { success: true, state: result.state };
    } catch (error) {
      console.error('Get workflow state error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get workflow state' };
    }
  }

  /**
   * Pause workflow execution
   */
  async pauseWorkflow(
    executionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/execute/${executionId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Pause workflow error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to pause workflow' };
    }
  }

  /**
   * Resume workflow execution
   */
  async resumeWorkflow(
    executionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/execute/${executionId}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Resume workflow error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to resume workflow' };
    }
  }

  /**
   * Cancel workflow execution
   */
  async cancelWorkflow(
    executionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/execute/${executionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Cancel workflow error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to cancel workflow' };
    }
  }

  // ============================================================================
  // WORKFLOW RESULTS
  // ============================================================================

  /**
   * Get workflow execution result
   */
  async getWorkflowResult(
    executionId: string
  ): Promise<{ success: boolean; result?: WorkflowExecutionResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/execute/${executionId}/result`, {
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
      return { success: true, result: result.result };
    } catch (error) {
      console.error('Get workflow result error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get workflow result' };
    }
  }

  /**
   * Get workflow execution history
   */
  async getWorkflowHistory(
    executionId: string
  ): Promise<{ success: boolean; history?: WorkflowStep[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/execute/${executionId}/history`, {
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
      return { success: true, history: result.history };
    } catch (error) {
      console.error('Get workflow history error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get workflow history' };
    }
  }

  // ============================================================================
  // DOCUMENT WORKFLOW TEMPLATES
  // ============================================================================

  /**
   * Create document processing workflow
   */
  async createDocumentProcessingWorkflow(
    documentId: string,
    workflowType: 'signature' | 'compliance' | 'kyc' | 'analysis' = 'signature'
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/workflows/document-processing`, {
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
      return { success: true, workflowId: result.workflow_id };
    } catch (error) {
      console.error('Create document workflow error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create document workflow' };
    }
  }

  /**
   * Create KYC workflow
   */
  async createKYCWorkflow(
    userId: string,
    documentId: string,
    kycType: 'individual' | 'business' | 'enhanced' = 'individual'
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/langgraph/workflows/kyc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          user_id: userId,
          document_id: documentId,
          kyc_type: kycType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, workflowId: result.workflow_id };
    } catch (error) {
      console.error('Create KYC workflow error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create KYC workflow' };
    }
  }

  // ============================================================================
  // WORKFLOW MONITORING
  // ============================================================================

  /**
   * Get workflow metrics
   */
  async getWorkflowMetrics(
    workflowId?: string,
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<{ success: boolean; metrics?: unknown; error?: string }> {
    try {
      const url = workflowId 
        ? `${this.apiBaseUrl}/langgraph/metrics/${workflowId}?time_range=${timeRange}`
        : `${this.apiBaseUrl}/langgraph/metrics?time_range=${timeRange}`;

      const response = await fetch(url, {
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
      return { success: true, metrics: result.metrics };
    } catch (error) {
      console.error('Get workflow metrics error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get workflow metrics' };
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to workflow updates
   */
  subscribeToWorkflowUpdates(
    executionId: string,
    callback: (update: WorkflowState) => void
  ): () => void {
    // Implementation would use WebSocket or Server-Sent Events
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      const result = await this.getWorkflowState(executionId);
      if (result.success && result.state) {
        callback(result.state);
      }
    }, 2000);

    return () => clearInterval(interval);
  }
}

// ============================================================================
// REACT HOOKS FOR LANGGRAPH WORKFLOWS
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useWorkflowExecution(executionId: string) {
  const [state, setState] = useState<WorkflowState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const langGraph = useMemo(() => new LangGraphWorkflowOrchestrator(), []);

  const fetchState = useCallback(async () => {
    if (!executionId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await langGraph.getWorkflowState(executionId);
      if (result.success && result.state) {
        setState(result.state);
      } else {
        setError(result.error || 'Failed to fetch workflow state');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow state');
    } finally {
      setLoading(false);
    }
  }, [executionId, langGraph]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return {
    state,
    loading,
    error,
    refetch: fetchState
  };
}

export function useWorkflowDefinition(workflowId: string) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const langGraph = useMemo(() => new LangGraphWorkflowOrchestrator(), []);

  const fetchWorkflow = useCallback(async () => {
    if (!workflowId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await langGraph.getWorkflowDefinition(workflowId);
      if (result.success && result.workflow) {
        setWorkflow(result.workflow);
      } else {
        setError(result.error || 'Failed to fetch workflow definition');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow definition');
    } finally {
      setLoading(false);
    }
  }, [workflowId, langGraph]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  return {
    workflow,
    loading,
    error,
    refetch: fetchWorkflow
  };
}

export function useWorkflowHistory(executionId: string) {
  const [history, setHistory] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const langGraph = useMemo(() => new LangGraphWorkflowOrchestrator(), []);

  const fetchHistory = useCallback(async () => {
    if (!executionId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await langGraph.getWorkflowHistory(executionId);
      if (result.success && result.history) {
        setHistory(result.history);
      } else {
        setError(result.error || 'Failed to fetch workflow history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow history');
    } finally {
      setLoading(false);
    }
  }, [executionId, langGraph]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const langGraphWorkflows = new LangGraphWorkflowOrchestrator();
export default langGraphWorkflows;
