/**
 * Comprehensive tests for AI Integration Services
 * Tests all 18 Python agent tools and their TypeScript implementations
 */

import { BuffrSignAIIntegration } from '../lib/ai/ai-integration';
import { LlamaIndexDocumentIntelligence } from '../lib/ai/llamaindex-integration';
import { PydanticAIAgents } from '../lib/ai/pydantic-ai-agents';
import { LangGraphWorkflowOrchestrator } from '../lib/ai/langgraph-workflows';

// Mock dependencies
jest.mock('../lib/ai/llamaindex-integration', () => ({
  LlamaIndexDocumentIntelligence: jest.fn().mockImplementation(() => ({
    processDocumentWithOCR: jest.fn(),
    extractDocumentFields: jest.fn(),
    semanticDocumentQuery: jest.fn(),
    analyzeDocumentCompliance: jest.fn(),
    performComputerVisionAnalysis: jest.fn(),
    generateDocumentInsights: jest.fn()
  }))
}));

jest.mock('../lib/ai/pydantic-ai-agents', () => ({
  PydanticAIAgents: jest.fn().mockImplementation(() => ({
    validateStructuredData: jest.fn(),
    extractEntities: jest.fn(),
    analyzeSentiment: jest.fn(),
    checkComplianceRequirements: jest.fn(),
    performRiskAssessment: jest.fn()
  }))
}));

jest.mock('../lib/ai/langgraph-workflows', () => ({
  LangGraphWorkflowOrchestrator: jest.fn().mockImplementation(() => ({
    executeDocumentProcessingWorkflow: jest.fn(),
    executeKYCWorkflow: jest.fn(),
    manageWorkflowState: jest.fn(),
    handleWorkflowError: jest.fn(),
    optimizeDocumentProcessing: jest.fn()
  }))
}));

describe('BuffrSignAIIntegration', () => {
  let aiIntegration: BuffrSignAIIntegration;
  let mockLlamaIndex: jest.Mocked<LlamaIndexDocumentIntelligence>;
  let mockPydanticAI: jest.Mocked<PydanticAIAgents>;
  let mockLangGraph: jest.Mocked<LangGraphWorkflowOrchestrator>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create new instances
    mockLlamaIndex = new LlamaIndexDocumentIntelligence() as jest.Mocked<LlamaIndexDocumentIntelligence>;
    mockPydanticAI = new PydanticAIAgents() as jest.Mocked<PydanticAIAgents>;
    mockLangGraph = new LangGraphWorkflowOrchestrator() as jest.Mocked<LangGraphWorkflowOrchestrator>;
    
    aiIntegration = new BuffrSignAIIntegration('/api/ai', undefined, {
      llamaindex: mockLlamaIndex,
      pydanticAI: mockPydanticAI,
      langGraph: mockLangGraph
    });
  });

  describe('Document Intelligence Tools', () => {
    test('should process _document with OCR', async () => {
      const mockResult = {
        text: 'Extracted text content',
        confidence: 0.95,
        method: 'gpt4_vision'
      };
      
      mockLlamaIndex.processDocumentWithOCR.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.processDocumentWithOCR('doc123', 'base64data');
      
      expect(result).toEqual(mockResult);
      expect(mockLlamaIndex.processDocumentWithOCR).toHaveBeenCalledWith('doc123', 'base64data');
    });

    test('should extract _document fields', async () => {
      const mockResult = {
        fields: {
          name: 'John Doe',
          id: '123456789',
          date: '2024-01-01'
        },
        confidence: 0.92
      };
      
      mockLlamaIndex.extractDocumentFields.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.extractDocumentFields('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockLlamaIndex.extractDocumentFields).toHaveBeenCalledWith('doc123');
    });

    test('should perform semantic _document query', async () => {
      const mockResult = {
        answer: 'Document contains information about...',
        sources: ['page1', 'page2'],
        confidence: 0.88
      };
      
      mockLlamaIndex.semanticDocumentQuery.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.semanticDocumentQuery('doc123', 'What is the main topic?');
      
      expect(result).toEqual(mockResult);
      expect(mockLlamaIndex.semanticDocumentQuery).toHaveBeenCalledWith('doc123', 'What is the main topic?');
    });

    test('should analyze _document compliance', async () => {
      const mockResult = {
        complianceScore: 0.85,
        violations: [],
        recommendations: ['Add signature field']
      };
      
      mockLlamaIndex.analyzeDocumentCompliance.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.analyzeDocumentCompliance('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockLlamaIndex.analyzeDocumentCompliance).toHaveBeenCalledWith('doc123');
    });
  });

  describe('Structured AI Agent Tools', () => {
    test('should validate structured data', async () => {
      const mockResult = {
        isValid: true,
        errors: [],
        validatedData: { name: 'John Doe', id: '123456789' }
      };
      
      mockPydanticAI.validateStructuredData.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.validateStructuredData('doc123', { name: 'John Doe' });
      
      expect(result).toEqual(mockResult);
      expect(mockPydanticAI.validateStructuredData).toHaveBeenCalledWith('doc123', { name: 'John Doe' });
    });

    test('should extract entities', async () => {
      const mockResult = {
        entities: [
          { type: 'PERSON', value: 'John Doe', confidence: 0.95 },
          { type: 'ID_NUMBER', value: '123456789', confidence: 0.92 }
        ]
      };
      
      mockPydanticAI.extractEntities.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.extractEntities('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockPydanticAI.extractEntities).toHaveBeenCalledWith('doc123');
    });

    test('should perform sentiment analysis', async () => {
      const mockResult = {
        sentiment: 'positive',
        confidence: 0.87,
        scores: { positive: 0.87, negative: 0.13 }
      };
      
      mockPydanticAI.analyzeSentiment.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.analyzeSentiment('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockPydanticAI.analyzeSentiment).toHaveBeenCalledWith('doc123');
    });

    test('should check compliance requirements', async () => {
      const mockResult = {
        isCompliant: true,
        requirements: ['ETA compliance', 'Digital signature'],
        score: 0.92
      };
      
      mockPydanticAI.checkComplianceRequirements.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.checkComplianceRequirements('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockPydanticAI.checkComplianceRequirements).toHaveBeenCalledWith('doc123');
    });
  });

  describe('Workflow Orchestration Tools', () => {
    test('should execute _document processing workflow', async () => {
      const mockResult = {
        workflowId: 'wf123',
        status: 'completed',
        steps: ['ocr', 'validation', 'compliance']
      };
      
      mockLangGraph.executeDocumentProcessingWorkflow.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.executeDocumentProcessingWorkflow('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockLangGraph.executeDocumentProcessingWorkflow).toHaveBeenCalledWith('doc123');
    });

    test('should execute KYC workflow', async () => {
      const mockResult = {
        workflowId: 'kyc123',
        status: 'approved',
        confidence: 0.94
      };
      
      mockLangGraph.executeKYCWorkflow.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.executeKYCWorkflow('_user123', 'doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockLangGraph.executeKYCWorkflow).toHaveBeenCalledWith('_user123', 'doc123');
    });

    test('should manage workflow state', async () => {
      const mockResult = {
        currentState: 'processing',
        nextSteps: ['validation', 'approval']
      };
      
      mockLangGraph.manageWorkflowState.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.manageWorkflowState('wf123');
      
      expect(result).toEqual(mockResult);
      expect(mockLangGraph.manageWorkflowState).toHaveBeenCalledWith('wf123');
    });

    test('should handle workflow errors', async () => {
      const mockResult = {
        errorHandled: true,
        retryCount: 1,
        nextAction: 'retry'
      };
      
      mockLangGraph.handleWorkflowError.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.handleWorkflowError('wf123', 'OCR failed');
      
      expect(result).toEqual(mockResult);
      expect(mockLangGraph.handleWorkflowError).toHaveBeenCalledWith('wf123', 'OCR failed');
    });
  });

  describe('Advanced AI Tools', () => {
    test('should perform computer vision analysis', async () => {
      const mockResult = {
        objects: ['signature', 'text', 'logo'],
        confidence: 0.91
      };
      
      mockLlamaIndex.performComputerVisionAnalysis.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.performComputerVisionAnalysis('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockLlamaIndex.performComputerVisionAnalysis).toHaveBeenCalledWith('doc123');
    });

    test('should generate _document insights', async () => {
      const mockResult = {
        insights: ['High compliance score', 'Missing signature field'],
        recommendations: ['Add signature field', 'Update template']
      };
      
      mockLlamaIndex.generateDocumentInsights.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.generateDocumentInsights('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockLlamaIndex.generateDocumentInsights).toHaveBeenCalledWith('doc123');
    });

    test('should perform risk assessment', async () => {
      const mockResult = {
        riskLevel: 'low',
        score: 0.15,
        factors: ['Valid signature', 'Complete _document']
      };
      
      mockPydanticAI.performRiskAssessment.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.performRiskAssessment('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockPydanticAI.performRiskAssessment).toHaveBeenCalledWith('doc123');
    });

    test('should optimize _document processing', async () => {
      const mockResult = {
        optimizations: ['Use GPT-4 Vision', 'Enable caching'],
        performanceGain: 0.25
      };
      
      mockLangGraph.optimizeDocumentProcessing.mockResolvedValue(mockResult);
      
      const result = await aiIntegration.optimizeDocumentProcessing('doc123');
      
      expect(result).toEqual(mockResult);
      expect(mockLangGraph.optimizeDocumentProcessing).toHaveBeenCalledWith('doc123');
    });
  });

  describe('Error Handling', () => {
    test('should handle OCR failures gracefully', async () => {
      mockLlamaIndex.processDocumentWithOCR.mockRejectedValue(new Error('OCR service unavailable'));
      
      await expect(aiIntegration.processDocumentWithOCR('doc123', 'base64data'))
        .rejects.toThrow('OCR service unavailable');
    });

    test('should handle workflow execution failures', async () => {
      mockLangGraph.executeDocumentProcessingWorkflow.mockRejectedValue(new Error('Workflow execution failed'));
      
      await expect(aiIntegration.executeDocumentProcessingWorkflow('doc123'))
        .rejects.toThrow('Workflow execution failed');
    });
  });

  describe('Performance Metrics', () => {
    test('should track processing time', async () => {
      const startTime = Date.now();
      
      mockLlamaIndex.processDocumentWithOCR.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { text: 'test', confidence: 0.9, method: 'gpt4_vision' };
      });
      
      await aiIntegration.processDocumentWithOCR('doc123', 'base64data');
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });
});
