/**
 * Tests for LangGraph Workflows
 * Tests workflow orchestration, state management, and error handling
 */

import { LangGraphWorkflowOrchestrator } from '../lib/ai/langgraph-workflows';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js');
jest.mock('../lib/database/db-utils');

describe('LangGraphWorkflows', () => {
  let langGraphWorkflows: LangGraphWorkflowOrchestrator;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      rpc: jest.fn()
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    langGraphWorkflows = new LangGraphWorkflowOrchestrator();
  });

  describe('Document Processing Workflow', () => {
    test('should execute document processing workflow successfully', async () => {
      const mockResult = {
        workflowId: 'wf123',
        status: 'completed',
        result: { steps: ['ocr', 'validation', 'compliance'], executionTime: 1500 }
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.executeDocumentProcessingWorkflow('doc123');

      expect(result).toEqual(mockResult);
      expect(result.status).toBe('completed');
      expect(result.workflowId).toBe('wf123');
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/execute-document-processing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });

    test('should handle workflow execution failure', async () => {
      const mockResult = {
        workflowId: 'wf123',
        status: 'failed',
        error: 'OCR service unavailable',
        steps: ['ocr']
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.executeDocumentProcessingWorkflow('doc123');

      expect(result.status).toBe('failed');
      expect(result.error).toBe('OCR service unavailable');
    });
  });

  describe('KYC Workflow', () => {
    test('should execute KYC workflow with approval', async () => {
      const mockResult = {
        workflowId: 'kyc123',
        status: 'approved',
        result: { confidence: 0.94, steps: ['document_upload', 'ocr_extraction', 'country_detection', 'validation'], decision: 'approved' }
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.executeKYCWorkflow('user123', 'doc123');

      expect(result).toEqual(mockResult);
      expect(result.status).toBe('approved');
      expect(result.workflowId).toBe('kyc123');
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/execute-kyc-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user123', documentId: 'doc123' })
      });
    });

    test('should execute KYC workflow with rejection', async () => {
      const mockResult = {
        workflowId: 'kyc123',
        status: 'rejected',
        confidence: 0.45,
        steps: ['document_upload', 'ocr_extraction', 'country_detection'],
        decision: 'rejected',
        reasons: ['Invalid document format', 'Low confidence score']
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.executeKYCWorkflow('user123', 'doc123');

      expect(result.status).toBe('rejected');
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.reasons).toHaveLength(2);
    });

    test('should execute KYC workflow with pending status', async () => {
      const mockResult = {
        workflowId: 'kyc123',
        status: 'pending',
        confidence: 0.75,
        steps: ['document_upload', 'ocr_extraction'],
        decision: 'pending',
        nextSteps: ['Manual review required']
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.executeKYCWorkflow('user123', 'doc123');

      expect(result.status).toBe('pending');
      expect(result.nextSteps).toContain('Manual review required');
    });
  });

  describe('Workflow State Management', () => {
    test('should manage workflow state successfully', async () => {
      const mockResult = {
        state: { currentState: 'processing', nextSteps: ['validation', 'approval'], progress: 0.6, estimatedTimeRemaining: 300 },
        status: 'processing'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.manageWorkflowState('wf123');

      expect(result).toEqual(mockResult);
      expect(result.status).toBe('processing');
      expect(result.state).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/manage-workflow-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: 'wf123' })
      });
    });

    test('should handle workflow state transitions', async () => {
      const mockResult = {
        currentState: 'completed',
        nextSteps: [],
        progress: 1.0,
        finalResult: 'Document processed successfully'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.manageWorkflowState('wf123');

      expect(result.currentState).toBe('completed');
      expect(result.progress).toBe(1.0);
      expect(result.nextSteps).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle workflow errors gracefully', async () => {
      const mockResult = {
        handled: true,
        recoveryAction: 'retry',
        status: 'retrying'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.handleWorkflowError('wf123', 'OCR service timeout');

      expect(result).toEqual(mockResult);
      expect(result.handled).toBe(true);
      expect(result.recoveryAction).toBe('retry');
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/handle-workflow-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: 'wf123', error: 'OCR service timeout' })
      });
    });

    test('should handle non-recoverable errors', async () => {
      const mockResult = {
        errorHandled: false,
        retryCount: 3,
        nextAction: 'abort',
        errorDetails: 'Critical system failure'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.handleWorkflowError('wf123', 'Critical system failure');

      expect(result.errorHandled).toBe(false);
      expect(result.nextAction).toBe('abort');
      expect(result.retryCount).toBe(3);
    });
  });

  describe('Performance Optimization', () => {
    test('should optimize document processing', async () => {
      const mockResult = {
        optimizations: ['Use GPT-4 Vision', 'Enable caching', 'Parallel processing'],
        performanceGains: 0.25,
        recommendations: ['Switch to faster OCR model', 'Implement result caching']
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.optimizeDocumentProcessing('doc123');

      expect(result).toEqual(mockResult);
      expect(result.performanceGains).toBe(0.25);
      expect(result.optimizations).toHaveLength(3);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/optimize-document-processing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });

    test('should provide optimization recommendations', async () => {
      const mockResult = {
        optimizations: ['Switch to faster OCR model', 'Implement result caching'],
        performanceGain: 0.15,
        estimatedTimeReduction: 180
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await langGraphWorkflows.optimizeDocumentProcessing('doc123');

      expect(result.optimizations).toContain('Switch to faster OCR model');
      expect(result.performanceGain).toBeGreaterThan(0.1);
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(langGraphWorkflows.executeDocumentProcessingWorkflow('doc123'))
        .rejects.toThrow('API request failed: 500 Internal Server Error');
    });

    test('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(langGraphWorkflows.executeDocumentProcessingWorkflow('doc123'))
        .rejects.toThrow('Network error');
    });

    test('should handle invalid response format', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      const result = await langGraphWorkflows.executeDocumentProcessingWorkflow('doc123');
      expect(result).toEqual({ invalid: 'response' });
    });
  });

  describe('Database Integration', () => {
    test('should save workflow results to database', async () => {
      const mockWorkflow = {
        document_id: 'doc123',
        workflow_type: 'document_processing',
        status: 'completed',
        execution_log: { steps: ['ocr', 'validation'] }
      };

      // Mock console.log to verify the method is called
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await langGraphWorkflows.saveWorkflowResults('doc123', mockWorkflow);

      expect(consoleSpy).toHaveBeenCalledWith('Saving workflow results for document:', 'doc123', mockWorkflow);
      
      consoleSpy.mockRestore();
    });

    test('should retrieve workflow status from database', async () => {
      const mockWorkflow = {
        id: 'wf123',
        status: 'processing',
        workflow_type: 'document_processing'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWorkflow)
      });

      const result = await langGraphWorkflows.getWorkflowStatus('wf123');

      expect(result).toEqual(mockWorkflow);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/workflow-status/wf123', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });
});
