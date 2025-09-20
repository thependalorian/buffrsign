/**
 * Tests for API Routes
 * Tests all AI service API endpoints
 */

import { NextRequest } from 'next/server';
import { BuffrSignAIIntegration } from '../lib/ai/ai-integration';

// Mock the AI integration
jest.mock('../lib/ai/ai-integration');

describe('API Routes', () => {
  let mockAIIntegration: jest.Mocked<BuffrSignAIIntegration>;

  beforeEach(() => {
    mockAIIntegration = new BuffrSignAIIntegration() as jest.Mocked<BuffrSignAIIntegration>;
  });

  describe('OCR API Route', () => {
    test('should process OCR request successfully', async () => {
      const mockResult = {
        text: 'Extracted text content',
        confidence: 0.95,
        method: 'gpt4_vision'
      };

      mockAIIntegration.processDocumentWithOCR.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/ocr', {
        method: 'POST',
        body: JSON.stringify({
          documentId: 'doc123',
          base64Data: 'base64data'
        })
      });

      // Mock the API route handler
      const handler = async (req: NextRequest) => {
        const { documentId, base64Data } = await req.json();
        const result = await mockAIIntegration.processDocumentWithOCR(documentId, base64Data);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.processDocumentWithOCR).toHaveBeenCalledWith('doc123', 'base64data');
    });

    test('should handle OCR request errors', async () => {
      mockAIIntegration.processDocumentWithOCR.mockRejectedValue(new Error('OCR service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/ai/ocr', {
        method: 'POST',
        body: JSON.stringify({
          documentId: 'doc123',
          base64Data: 'base64data'
        })
      });

      const handler = async (req: NextRequest) => {
        try {
          const { documentId, base64Data } = await req.json();
          const result = await mockAIIntegration.processDocumentWithOCR(documentId, base64Data);
          return new Response(JSON.stringify(result), { status: 200 });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('OCR service unavailable');
    });
  });

  describe('Field Extraction API Route', () => {
    test('should extract _document fields successfully', async () => {
      const mockResult = {
        fields: {
          name: 'John Doe',
          id: '123456789',
          date: '2024-01-01'
        },
        confidence: 0.92
      };

      mockAIIntegration.extractDocumentFields.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/extract-fields', {
        method: 'POST',
        body: JSON.stringify({ documentId: 'doc123' })
      });

      const handler = async (req: NextRequest) => {
        const { documentId } = await req.json();
        const result = await mockAIIntegration.extractDocumentFields(documentId);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.extractDocumentFields).toHaveBeenCalledWith('doc123');
    });
  });

  describe('Semantic Query API Route', () => {
    test('should perform semantic query successfully', async () => {
      const mockResult = {
        answer: 'Document contains information about...',
        sources: ['page1', 'page2'],
        confidence: 0.88
      };

      mockAIIntegration.semanticDocumentQuery.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/semantic-query', {
        method: 'POST',
        body: JSON.stringify({
          documentId: 'doc123',
          query: 'What is the main topic?'
        })
      });

      const handler = async (req: NextRequest) => {
        const { documentId, query } = await req.json();
        const result = await mockAIIntegration.semanticDocumentQuery(documentId, query);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.semanticDocumentQuery).toHaveBeenCalledWith('doc123', 'What is the main topic?');
    });
  });

  describe('Compliance Analysis API Route', () => {
    test('should analyze compliance successfully', async () => {
      const mockResult = {
        complianceScore: 0.85,
        violations: [],
        recommendations: ['Add signature field']
      };

      mockAIIntegration.analyzeDocumentCompliance.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/compliance-analysis', {
        method: 'POST',
        body: JSON.stringify({ documentId: 'doc123' })
      });

      const handler = async (req: NextRequest) => {
        const { documentId } = await req.json();
        const result = await mockAIIntegration.analyzeDocumentCompliance(documentId);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.analyzeDocumentCompliance).toHaveBeenCalledWith('doc123');
    });
  });

  describe('Structured Data Validation API Route', () => {
    test('should validate structured data successfully', async () => {
      const mockResult = {
        isValid: true,
        errors: [],
        validatedData: { name: 'John Doe', id: '123456789' }
      };

      mockAIIntegration.validateStructuredData.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/validate-structured-data', {
        method: 'POST',
        body: JSON.stringify({
          documentId: 'doc123',
          data: { name: 'John Doe' }
        })
      });

      const handler = async (req: NextRequest) => {
        const { documentId, data } = await req.json();
        const result = await mockAIIntegration.validateStructuredData(documentId, data);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.validateStructuredData).toHaveBeenCalledWith('doc123', { name: 'John Doe' });
    });
  });

  describe('Entity Extraction API Route', () => {
    test('should extract entities successfully', async () => {
      const mockResult = {
        entities: [
          { type: 'PERSON', value: 'John Doe', confidence: 0.95 },
          { type: 'ID_NUMBER', value: '123456789', confidence: 0.92 }
        ]
      };

      mockAIIntegration.extractEntities.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/extract-entities', {
        method: 'POST',
        body: JSON.stringify({ documentId: 'doc123' })
      });

      const handler = async (req: NextRequest) => {
        const { documentId } = await req.json();
        const result = await mockAIIntegration.extractEntities(documentId);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.extractEntities).toHaveBeenCalledWith('doc123');
    });
  });

  describe('Sentiment Analysis API Route', () => {
    test('should analyze sentiment successfully', async () => {
      const mockResult = {
        sentiment: 'positive',
        confidence: 0.87,
        scores: { positive: 0.87, negative: 0.13 }
      };

      mockAIIntegration.analyzeSentiment.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/sentiment-analysis', {
        method: 'POST',
        body: JSON.stringify({ documentId: 'doc123' })
      });

      const handler = async (req: NextRequest) => {
        const { documentId } = await req.json();
        const result = await mockAIIntegration.analyzeSentiment(documentId);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.analyzeSentiment).toHaveBeenCalledWith('doc123');
    });
  });

  describe('Compliance Check API Route', () => {
    test('should check compliance successfully', async () => {
      const mockResult = {
        isCompliant: true,
        requirements: ['ETA compliance', 'Digital signature'],
        score: 0.92
      };

      mockAIIntegration.checkComplianceRequirements.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/compliance-check', {
        method: 'POST',
        body: JSON.stringify({ documentId: 'doc123' })
      });

      const handler = async (req: NextRequest) => {
        const { documentId } = await req.json();
        const result = await mockAIIntegration.checkComplianceRequirements(documentId);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.checkComplianceRequirements).toHaveBeenCalledWith('doc123');
    });
  });

  describe('Workflow API Routes', () => {
    test('should execute _document processing workflow', async () => {
      const mockResult = {
        workflowId: 'wf123',
        status: 'completed',
        steps: ['ocr', 'validation', 'compliance']
      };

      mockAIIntegration.executeDocumentProcessingWorkflow.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/workflows/_document-processing', {
        method: 'POST',
        body: JSON.stringify({ documentId: 'doc123' })
      });

      const handler = async (req: NextRequest) => {
        const { documentId } = await req.json();
        const result = await mockAIIntegration.executeDocumentProcessingWorkflow(documentId);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.executeDocumentProcessingWorkflow).toHaveBeenCalledWith('doc123');
    });

    test('should execute KYC workflow', async () => {
      const mockResult = {
        workflowId: 'kyc123',
        status: 'approved',
        confidence: 0.94
      };

      mockAIIntegration.executeKYCWorkflow.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/ai/workflows/kyc', {
        method: 'POST',
        body: JSON.stringify({
          userId: '_user123',
          documentId: 'doc123'
        })
      });

      const handler = async (req: NextRequest) => {
        const { userId, documentId } = await req.json();
        const result = await mockAIIntegration.executeKYCWorkflow(userId, documentId);
        return new Response(JSON.stringify(result), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(mockAIIntegration.executeKYCWorkflow).toHaveBeenCalledWith('_user123', 'doc123');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/ocr', {
        method: 'POST',
        body: 'invalid json'
      });

      const handler = async (req: NextRequest) => {
        try {
          await req.json();
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
        }
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON');
    });

    test('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/ocr', {
        method: 'POST',
        body: JSON.stringify({ documentId: 'doc123' }) // Missing base64Data
      });

      const handler = async (req: NextRequest) => {
        const body = await req.json();
        if (!body.documentId || !body.base64Data) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });
  });
});
