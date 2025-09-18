/**
 * BuffrSign Platform - Document Service Tests
 * Test suite for DocumentService class
 */

import { documentService } from '../../../lib/services/document-service';

// Mock Supabase client
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        createSignedUrl: jest.fn(),
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(),
          range: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
    })),
  },
}));

// Mock crypto for file hash calculation
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
});

describe('DocumentService', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = require('../../../lib/supabase').supabase;
    jest.clearAllMocks();
    
    // Reset all mocks to return proper chainable objects
    mockSupabase.storage.from.mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
      remove: jest.fn().mockResolvedValue({ error: null }),
      createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/signed-url' }, error: null }),
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
        range: jest.fn().mockResolvedValue({ data: [], error: null }),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    mockSupabase.channel.mockReturnValue({
      on: jest.fn().mockReturnValue({
        subscribe: jest.fn().mockReturnValue({}),
      }),
    });
  });

  // ============================================================================
  // FILE VALIDATION TESTS
  // ============================================================================

  describe('validateFile', () => {
    it('should validate a valid PDF file', () => {
      const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB

      const result = documentService.validateFile(validFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file that is too large', () => {
      const largeFile = new File(['test content'], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(largeFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB

      const result = documentService.validateFile(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size must be less than 10MB');
    });

    it('should reject unsupported file type', () => {
      const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(invalidFile, 'size', { value: 1024 });

      const result = documentService.validateFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File type not supported. Please upload PDF, Word, or image files.');
    });
  });

  // ============================================================================
  // DOCUMENT UPLOAD TESTS
  // ============================================================================

  describe('uploadDocument', () => {
    const mockUserId = 'user-123';
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });
    
    // Add arrayBuffer method to mock File
    mockFile.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));

    it('should handle missing file', async () => {
      const uploadData = {
        file: null,
        title: 'Test Document',
      };

      const result = await documentService.uploadDocument(mockUserId, uploadData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should successfully upload a document', async () => {
      const mockDocument = {
        id: 'doc-123',
        title: 'Test Document',
        file_path: 'documents/user-123/test.pdf',
        status: 'uploaded',
      };

      // Mock storage upload success
      mockSupabase.storage.from().upload.mockResolvedValue({ error: null });

      // Mock database insert success
      const mockInsertChain = {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockDocument,
            error: null,
          }),
        }),
      };
      mockSupabase.from().insert.mockReturnValue(mockInsertChain);

      const uploadData = {
        file: mockFile,
        title: 'Test Document',
      };

      const result = await documentService.uploadDocument(mockUserId, uploadData);

      expect(result.success).toBe(true);
      expect(result.document).toEqual(mockDocument);
    });

    it('should handle storage upload error', async () => {
      mockSupabase.storage.from().upload.mockResolvedValue({
        error: { message: 'Storage quota exceeded' },
      });

      const uploadData = {
        file: mockFile,
        title: 'Test Document',
      };

      const result = await documentService.uploadDocument(mockUserId, uploadData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Upload failed');
    });
  });

  // ============================================================================
  // DOCUMENT RETRIEVAL TESTS
  // ============================================================================

  describe('getUserDocuments', () => {
    const mockUserId = 'user-123';

    it('should retrieve user documents', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          title: 'Document 1',
          status: 'completed',
        },
      ];

      // Create a proper mock chain
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockDocuments,
          error: null,
        }),
      };

      mockSupabase.from().select.mockReturnValue(mockQuery);

      const result = await documentService.getUserDocuments(mockUserId);

      expect(result.success).toBe(true);
      expect(result.documents).toEqual(mockDocuments);
    });

    it('should handle database error', async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      mockSupabase.from().select.mockReturnValue(mockQuery);

      const result = await documentService.getUserDocuments(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getDocument', () => {
    it('should retrieve a single document', async () => {
      const mockDocument = {
        id: 'doc-123',
        title: 'Test Document',
        status: 'completed',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockDocument,
        error: null,
      });

      const result = await documentService.getDocument('doc-123');

      expect(result.success).toBe(true);
      expect(result.document).toEqual(mockDocument);
    });
  });

  describe('getDocumentStats', () => {
    it('should calculate document statistics', async () => {
      const mockDocuments = [
        {
          status: 'completed',
          created_at: new Date().toISOString(),
          ai_analysis_id: 'analysis-1',
        },
        {
          status: 'pending',
          created_at: new Date().toISOString(),
          ai_analysis_id: null,
        },
      ];

      mockSupabase.from().select().eq.mockResolvedValue({
        data: mockDocuments,
        error: null,
      });

      const result = await documentService.getDocumentStats('user-123');

      expect(result.success).toBe(true);
      expect(result.stats?.total).toBe(2);
      expect(result.stats?.completed).toBe(1);
      expect(result.stats?.pending).toBe(1);
      expect(result.stats?.aiInsights).toBe(1);
    });
  });

  // ============================================================================
  // DOCUMENT MANAGEMENT TESTS
  // ============================================================================

  describe('updateDocument', () => {
    it('should successfully update document', async () => {
      mockSupabase.from().update().eq.mockResolvedValue({ error: null });

      const result = await documentService.updateDocument('doc-123', { title: 'Updated' });

      expect(result.success).toBe(true);
    });
  });

  describe('deleteDocument', () => {
    it('should successfully delete document', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { file_path: 'documents/test.pdf' },
        error: null,
      });

      mockSupabase.storage.from().remove.mockResolvedValue({ error: null });
      mockSupabase.from().delete().eq.mockResolvedValue({ error: null });

      const result = await documentService.deleteDocument('doc-123');

      expect(result.success).toBe(true);
    });
  });

  describe('getDocumentDownloadUrl', () => {
    it('should generate download URL', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { file_path: 'documents/test.pdf' },
        error: null,
      });

      mockSupabase.storage.from().createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed-url' },
        error: null,
      });

      const result = await documentService.getDocumentDownloadUrl('doc-123');

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com/signed-url');
    });
  });

  // ============================================================================
  // AI ANALYSIS TESTS
  // ============================================================================

  describe('triggerAIAnalysis', () => {
    it('should trigger AI analysis', async () => {
      mockSupabase.from().update().eq.mockResolvedValue({ error: null });

      const result = await documentService.triggerAIAnalysis('doc-123');

      expect(result.success).toBe(true);
    });
  });

  describe('getAIAnalysis', () => {
    it('should retrieve AI analysis', async () => {
      const mockAnalysis = {
        id: 'analysis-123',
        document_id: 'doc-123',
        status: 'completed',
      };

      // Create proper mock chain for AI analysis query
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAnalysis,
          error: null,
        }),
      };

      mockSupabase.from().select.mockReturnValue(mockQuery);

      const result = await documentService.getAIAnalysis('doc-123');

      expect(result.success).toBe(true);
      expect(result.analysis).toEqual(mockAnalysis);
    });
  });

  describe('getAIInsights', () => {
    it('should retrieve AI insights', async () => {
      const mockInsights = [
        {
          id: 'analysis-1',
          document_id: 'doc-123',
          status: 'completed',
        },
      ];

      mockSupabase.from().select().eq.mockResolvedValue({
        data: mockInsights,
        error: null,
      });

      const result = await documentService.getAIInsights('doc-123');

      expect(result.success).toBe(true);
      expect(result.insights).toEqual(mockInsights);
    });
  });

  // ============================================================================
  // SUBSCRIPTION TESTS
  // ============================================================================

  describe('subscriptions', () => {
    it('should create document change subscription', () => {
      const mockCallback = jest.fn();
      const result = documentService.subscribeToDocumentChanges('user-123', mockCallback);

      expect(mockSupabase.channel).toHaveBeenCalledWith('documents:user-123');
      expect(result).toBeDefined();
    });

    it('should create AI analysis update subscription', () => {
      const mockCallback = jest.fn();
      const result = documentService.subscribeToAIAnalysisUpdates('doc-123', mockCallback);

      expect(mockSupabase.channel).toHaveBeenCalledWith('ai_analysis:doc-123');
      expect(result).toBeDefined();
    });
  });
});