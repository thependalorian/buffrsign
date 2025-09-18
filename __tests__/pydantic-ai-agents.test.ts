/**
 * Tests for Pydantic AI Agents
 * Tests structured data validation, entity extraction, and compliance checking
 */

import { PydanticAIAgents } from '../lib/ai/pydantic-ai-agents';
import { createClient } from '@supabase/supabase-js';
import { getDocument } from '../lib/database/db-utils';

// Mock Supabase client
jest.mock('@supabase/supabase-js');
jest.mock('../lib/database/db-utils', () => ({
  getDocument: jest.fn(),
  getUser: jest.fn(),
  createDocument: jest.fn()
}));

describe('PydanticAIAgents', () => {
  let pydanticAIAgents: PydanticAIAgents;
  let mockSupabase: any;
  let mockGetDocument: jest.MockedFunction<typeof getDocument>;

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

    mockGetDocument = getDocument as jest.MockedFunction<typeof getDocument>;
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    pydanticAIAgents = new PydanticAIAgents();
  });

  describe('Structured Data Validation', () => {
    test('should validate structured data successfully', async () => {
      const mockResult = {
        isValid: true,
        errors: [],
        validatedData: { name: 'John Doe', id: '123456789' }
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.validateStructuredData('doc123', { name: 'John Doe' });

      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/validate-structured-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123', data: { name: 'John Doe' } })
      });
    });

    test('should handle validation errors', async () => {
      const mockResult = {
        isValid: false,
        errors: ['Invalid ID format', 'Missing required field'],
        validatedData: null
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.validateStructuredData('doc123', { name: 'John Doe' });

      expect(result).toEqual(mockResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('Entity Extraction', () => {
    test('should extract entities from document', async () => {
      const mockResult = {
        entities: [
          { type: 'PERSON', value: 'John Doe', confidence: 0.95 },
          { type: 'ID_NUMBER', value: '123456789', confidence: 0.92 },
          { type: 'DATE', value: '2024-01-01', confidence: 0.88 }
        ]
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.extractEntities('doc123');

      expect(result).toEqual(mockResult);
      expect(result.entities).toHaveLength(3);
      expect(result.entities[0].type).toBe('PERSON');
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/extract-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });

    test('should handle empty entity extraction', async () => {
      const mockResult = {
        entities: []
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.extractEntities('doc123');

      expect(result).toEqual(mockResult);
      expect(result.entities).toHaveLength(0);
    });
  });

  describe('Sentiment Analysis', () => {
    test('should analyze document sentiment', async () => {
      const mockResult = {
        sentiment: 'positive',
        confidence: 0.87,
        scores: { positive: 0.87, negative: 0.13, neutral: 0.0 }
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.analyzeSentiment('doc123');

      expect(result).toEqual(mockResult);
      expect(result.sentiment).toBe('positive');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });

    test('should handle neutral sentiment', async () => {
      const mockResult = {
        sentiment: 'neutral',
        confidence: 0.65,
        scores: { positive: 0.3, negative: 0.2, neutral: 0.5 }
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.analyzeSentiment('doc123');

      expect(result.sentiment).toBe('neutral');
      expect(result.scores.neutral).toBe(0.5);
    });
  });

  describe('Compliance Checking', () => {
    test('should check compliance requirements', async () => {
      const mockResult = {
        isCompliant: true,
        requirements: ['ETA compliance', 'Digital signature', 'Audit trail'],
        score: 0.92,
        violations: []
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.checkComplianceRequirements('doc123');

      expect(result).toEqual(mockResult);
      expect(result.isCompliant).toBe(true);
      expect(result.score).toBeGreaterThan(0.9);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/check-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });

    test('should identify compliance violations', async () => {
      const mockResult = {
        isCompliant: false,
        requirements: ['ETA compliance', 'Digital signature'],
        score: 0.65,
        violations: ['Missing digital signature', 'Incomplete audit trail']
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.checkComplianceRequirements('doc123');

      expect(result.isCompliant).toBe(false);
      expect(result.violations).toHaveLength(2);
      expect(result.score).toBeLessThan(0.7);
    });
  });

  describe('Risk Assessment', () => {
    test('should perform risk assessment', async () => {
      const mockResult = {
        riskLevel: 'low',
        score: 0.15,
        factors: ['Valid signature', 'Complete document', 'Verified identity'],
        recommendations: ['Continue with standard processing']
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.performRiskAssessment('doc123');

      expect(result).toEqual(mockResult);
      expect(result.riskLevel).toBe('low');
      expect(result.score).toBeLessThan(0.3);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });

    test('should identify high-risk documents', async () => {
      const mockResult = {
        riskLevel: 'high',
        score: 0.85,
        factors: ['Suspicious signature', 'Incomplete information', 'Unverified identity'],
        recommendations: ['Manual review required', 'Additional verification needed']
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await pydanticAIAgents.performRiskAssessment('doc123');

      expect(result.riskLevel).toBe('high');
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.recommendations).toContain('Manual review required');
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(pydanticAIAgents.validateStructuredData('doc123', { name: 'John Doe' }))
        .rejects.toThrow('API request failed: 500 Internal Server Error');
    });

    test('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(pydanticAIAgents.validateStructuredData('doc123', { name: 'John Doe' }))
        .rejects.toThrow('Network error');
    });

    test('should handle invalid response format', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      const result = await pydanticAIAgents.validateStructuredData('doc123', { name: 'John Doe' });
      expect(result).toEqual({ invalid: 'response' });
    });
  });

  describe('Database Integration', () => {
    test('should save validation results to database', async () => {
      const mockValidation = {
        document_id: 'doc123',
        validation_type: 'structured_data',
        is_valid: true,
        errors: [],
        validated_data: { name: 'John Doe' }
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await pydanticAIAgents.saveValidationResults('doc123', mockValidation);

      expect(consoleSpy).toHaveBeenCalledWith('Saving validation results for document:', 'doc123', mockValidation);
      
      consoleSpy.mockRestore();
    });

    test('should retrieve document metadata', async () => {
      const mockDocument = {
        id: 'doc123',
        title: 'Test Document',
        document_type: 'contract'
      };

      mockGetDocument.mockResolvedValue(mockDocument);

      const result = await pydanticAIAgents.getDocumentMetadata('doc123');

      expect(result).toEqual(mockDocument);
      expect(mockGetDocument).toHaveBeenCalledWith('doc123');
    });
  });
});
