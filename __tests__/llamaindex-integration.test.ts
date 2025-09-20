/**
 * Tests for LlamaIndex Integration
 * Tests _document intelligence and computer vision capabilities
 */

import { LlamaIndexDocumentIntelligence } from '../lib/ai/llamaindex-integration';
import { createClient } from '@supabase/supabase-js';
import { getDocument } from '../lib/database/db-utils';

// Mock Supabase client
jest.mock('@supabase/supabase-js');
jest.mock('../lib/database/db-utils', () => ({
  getDocument: jest.fn(),
  getUser: jest.fn(),
  createDocument: jest.fn()
}));

describe('LlamaIndexIntegration', () => {
  let llamaindexIntegration: LlamaIndexDocumentIntelligence;
  let mockSupabase: unknown;
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
    llamaindexIntegration = new LlamaIndexDocumentIntelligence();
  });

  describe('Document Processing', () => {
    test('should process _document with OCR', async () => {
      const mockDocument = {
        id: 'doc123',
        file_path: '/path/to/_document.pdf',
        mime_type: 'application/pdf'
      };

      mockSupabase.single.mockResolvedValue({ data: mockDocument, error: null });

      // Mock the OCR processing result
      const mockResult = {
        text: 'Extracted text content',
        confidence: 0.95,
        method: 'gpt4_vision'
      };

      // Mock the API call to the OCR service
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await llamaindexIntegration.processDocumentWithOCR('doc123', 'base64data');

      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123', base64Data: 'base64data' })
      });
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

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await llamaindexIntegration.extractDocumentFields('doc123');

      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/extract-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });

    test('should perform semantic _document query', async () => {
      const mockResult = {
        answer: 'Document contains information about...',
        sources: ['page1', 'page2'],
        confidence: 0.88
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await llamaindexIntegration.semanticDocumentQuery('doc123', 'What is the main topic?');

      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/semantic-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123', query: 'What is the main topic?' })
      });
    });

    test('should analyze _document compliance', async () => {
      const mockResult = {
        complianceScore: 0.85,
        violations: [],
        recommendations: ['Add signature field']
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await llamaindexIntegration.analyzeDocumentCompliance('doc123');

      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/compliance-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });
  });

  describe('Computer Vision', () => {
    test('should perform computer vision analysis', async () => {
      const mockResult = {
        objects: ['signature', 'text', 'logo'],
        confidence: 0.91
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await llamaindexIntegration.performComputerVisionAnalysis('doc123');

      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/computer-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });
  });

  describe('Document Insights', () => {
    test('should generate _document insights', async () => {
      const mockResult = {
        insights: ['High compliance score', 'Missing signature field'],
        recommendations: ['Add signature field', 'Update template']
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await llamaindexIntegration.generateDocumentInsights('doc123');

      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/_document-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc123' })
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(llamaindexIntegration.processDocumentWithOCR('doc123', 'base64data'))
        .rejects.toThrow('API request failed: 500 Internal Server Error');
    });

    test('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(llamaindexIntegration.processDocumentWithOCR('doc123', 'base64data'))
        .rejects.toThrow('Network error');
    });
  });

  describe('Database Integration', () => {
    test('should save analysis results to database', async () => {
      const mockAnalysis = {
        document_id: 'doc123',
        analysis_type: 'ocr',
        confidence_scores: { overall: 0.95 },
        extracted_fields: { name: 'John Doe' }
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await llamaindexIntegration.saveAnalysisResults('doc123', mockAnalysis);

      expect(consoleSpy).toHaveBeenCalledWith('Saving analysis results for _document:', 'doc123', mockAnalysis);
      
      consoleSpy.mockRestore();
    });

    test('should retrieve _document from database', async () => {
      const mockDocument = {
        id: 'doc123',
        title: 'Test Document',
        file_path: '/path/to/_document.pdf'
      };

      const expectedResult = {
        id: 'doc123',
        text: '',
        metadata: {
          title: 'Test Document',
          document_type: undefined,
          file_path: '/path/to/_document.pdf',
          file_size: undefined,
          mime_type: undefined,
          status: undefined,
          category: undefined,
          risk_level: undefined,
          compliance_score: undefined,
          eta_compliant: undefined,
          cran_accredited: undefined,
          analysis_status: undefined,
          ai_analysis: undefined,
          description: undefined,
          created_at: undefined,
          updated_at: undefined
        }
      };

      mockGetDocument.mockResolvedValue(mockDocument);

      const result = await llamaindexIntegration.getDocument('doc123');

      expect(result).toEqual(expectedResult);
      expect(mockGetDocument).toHaveBeenCalledWith('doc123');
    });
  });
});
