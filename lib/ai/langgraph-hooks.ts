"use client";

// BuffrSign Platform - LangGraph Workflow React Hooks
// Client-side hooks for LangGraph workflow orchestration

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LangGraphWorkflowOrchestrator } from './langgraph-workflows';
import type { WorkflowState, WorkflowDefinition, WorkflowStep } from './langgraph-workflows';

// ============================================================================
// REACT HOOKS FOR LANGGRAPH WORKFLOWS
// ============================================================================

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
