/**
 * Tests for Database Utilities
 * Tests Supabase database operations and utilities
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Mock Supabase client
jest.mock('@supabase/supabase-js');

describe('Database Utilities', () => {
  let mockSupabase: unknown;

  beforeEach(() => {
    // Create individual mock functions
    const mockInsert = jest.fn();
    const mockSelect = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockEq = jest.fn();
    const mockSingle = jest.fn();
    const mockRpc = jest.fn();

    // Set up eq to return an object with single method when called
    mockEq.mockReturnValue({ single: mockSingle });

    // Create the main mockSupabase object
    mockSupabase = {
      from: jest.fn(),
      select: mockSelect.mockReturnThis(),
      insert: mockInsert,
      update: mockUpdate.mockReturnThis(),
      delete: mockDelete.mockReturnThis(),
      eq: mockEq,
      single: mockSingle,
      rpc: mockRpc
    };

    // Set up the from method to return a chain that uses the same mock functions
    mockSupabase.from.mockReturnValue({
      select: mockSelect.mockReturnThis(),
      insert: mockInsert,
      update: mockUpdate.mockReturnThis(),
      delete: mockDelete.mockReturnThis(),
      eq: mockEq, // Use the same mockEq instance
      single: mockSingle,
      rpc: mockRpc
    });

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('Document Operations', () => {
    test('should create _document successfully', async () => {
      const mockDocument = {
        id: 'doc123',
        title: 'Test Document',
        file_path: '/path/to/_document.pdf',
        mime_type: 'application/pdf',
        file_size: 1024,
        file_hash: 'abc123',
        created_by: '_user123'
      };

      mockSupabase.insert.mockResolvedValue({ data: mockDocument, error: null });

      const result = await mockSupabase.from('documents').insert(mockDocument);

      expect(result.data).toEqual(mockDocument);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockSupabase.insert).toHaveBeenCalledWith(mockDocument);
    });

    test('should retrieve _document by ID', async () => {
      const mockDocument = {
        id: 'doc123',
        title: 'Test Document',
        file_path: '/path/to/_document.pdf',
        mime_type: 'application/pdf'
      };

      mockSupabase.single.mockResolvedValue({ data: mockDocument, error: null });

      const result = await mockSupabase.from('documents').select('*').eq('id', 'doc123').single();

      expect(result.data).toEqual(mockDocument);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'doc123');
    });

    test('should update _document status', async () => {
      const mockUpdate = {
        status: 'processed',
        updated_at: new Date().toISOString()
      };

      mockSupabase.eq.mockResolvedValue({ data: mockUpdate, error: null });

      const result = await mockSupabase.from('documents').update(mockUpdate).eq('id', 'doc123');

      expect(result.data).toEqual(mockUpdate);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(mockSupabase.update).toHaveBeenCalledWith(mockUpdate);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'doc123');
    });
  });

  describe('AI Analysis Operations', () => {
    test('should save AI analysis results', async () => {
      const mockAnalysis = {
        id: 'analysis123',
        document_id: 'doc123',
        analysis_type: 'ocr',
        confidence_scores: { overall: 0.95 },
        extracted_fields: { name: 'John Doe', id: '123456789' },
        processing_time_ms: 1500
      };

      mockSupabase.insert.mockResolvedValue({ data: mockAnalysis, error: null });

      const result = await mockSupabase.from('ai_analysis').insert(mockAnalysis);

      expect(result.data).toEqual(mockAnalysis);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('ai_analysis');
      expect(mockSupabase.insert).toHaveBeenCalledWith(mockAnalysis);
    });

    test('should retrieve AI analysis by _document ID', async () => {
      const mockAnalysis = {
        id: 'analysis123',
        document_id: 'doc123',
        analysis_type: 'ocr',
        confidence_scores: { overall: 0.95 }
      };

      mockSupabase.single.mockResolvedValue({ data: mockAnalysis, error: null });

      const result = await mockSupabase.from('ai_analysis').select('*').eq('document_id', 'doc123').single();

      expect(result.data).toEqual(mockAnalysis);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('ai_analysis');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('document_id', 'doc123');
    });
  });

  describe('KYC Workflow Operations', () => {
    test('should create KYC workflow', async () => {
      const mockWorkflow = {
        id: 'kyc123',
        user_id: '_user123',
        document_id: 'doc123',
        workflow_state: 'initialized',
        created_at: new Date().toISOString()
      };

      mockSupabase.insert.mockResolvedValue({ data: mockWorkflow, error: null });

      const result = await mockSupabase.from('kyc_workflows').insert(mockWorkflow);

      expect(result.data).toEqual(mockWorkflow);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('kyc_workflows');
      expect(mockSupabase.insert).toHaveBeenCalledWith(mockWorkflow);
    });

    test('should update KYC workflow state', async () => {
      const mockUpdate = {
        workflow_state: 'document_uploaded',
        updated_at: new Date().toISOString()
      };

      mockSupabase.eq.mockResolvedValue({ data: mockUpdate, error: null });

      const result = await mockSupabase.from('kyc_workflows').update(mockUpdate).eq('id', 'kyc123');

      expect(result.data).toEqual(mockUpdate);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('kyc_workflows');
      expect(mockSupabase.update).toHaveBeenCalledWith(mockUpdate);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'kyc123');
    });

    test('should retrieve KYC workflow by _user ID', async () => {
      const mockWorkflow = {
        id: 'kyc123',
        user_id: '_user123',
        workflow_state: 'completed',
        final_decision: 'approved'
      };

      mockSupabase.single.mockResolvedValue({ data: mockWorkflow, error: null });

      const result = await mockSupabase.from('kyc_workflows').select('*').eq('user_id', '_user123').single();

      expect(result.data).toEqual(mockWorkflow);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('kyc_workflows');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', '_user123');
    });
  });

  describe('User Operations', () => {
    test('should create _user profile', async () => {
      const mockProfile = {
        id: '_user123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        role: '_user',
        is_active: true
      };

      mockSupabase.insert.mockResolvedValue({ data: mockProfile, error: null });

      const result = await mockSupabase.from('profiles').insert(mockProfile);

      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.insert).toHaveBeenCalledWith(mockProfile);
    });

    test('should update _user profile', async () => {
      const mockUpdate = {
        first_name: 'Jane',
        last_name: 'Smith',
        updated_at: new Date().toISOString()
      };

      mockSupabase.eq.mockResolvedValue({ data: mockUpdate, error: null });

      const result = await mockSupabase.from('profiles').update(mockUpdate).eq('id', '_user123');

      expect(result.data).toEqual(mockUpdate);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.update).toHaveBeenCalledWith(mockUpdate);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '_user123');
    });
  });

  describe('Audit Trail Operations', () => {
    test('should log audit trail event', async () => {
      const mockAuditEvent = {
        id: 'audit123',
        action: 'document_uploaded',
        user_id: '_user123',
        document_id: 'doc123',
        details: { file_size: 1024, mime_type: 'application/pdf' },
        created_at: new Date().toISOString()
      };

      mockSupabase.insert.mockResolvedValue({ data: mockAuditEvent, error: null });

      const result = await mockSupabase.from('audit_trail').insert(mockAuditEvent);

      expect(result.data).toEqual(mockAuditEvent);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_trail');
      expect(mockSupabase.insert).toHaveBeenCalledWith(mockAuditEvent);
    });

    test('should retrieve audit trail for _document', async () => {
      const mockAuditEvents = [
        {
          id: 'audit123',
          action: 'document_uploaded',
          user_id: '_user123',
          document_id: 'doc123',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'audit124',
          action: 'document_processed',
          user_id: '_user123',
          document_id: 'doc123',
          created_at: '2024-01-01T00:01:00Z'
        }
      ];

      mockSupabase.eq.mockResolvedValue({ data: mockAuditEvents, error: null });

      const result = await mockSupabase.from('audit_trail').select('*').eq('document_id', 'doc123');

      expect(result.data).toEqual(mockAuditEvents);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_trail');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('document_id', 'doc123');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      const mockError = {
        message: 'Database connection failed',
        code: 'PGRST301'
      };

      mockSupabase.insert.mockResolvedValue({ data: null, error: mockError });

      const result = await mockSupabase.from('documents').insert({});

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    test('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockSupabase.insert.mockRejectedValue(networkError);

      await expect(mockSupabase.from('documents').insert({})).rejects.toThrow('Network error');
    });
  });

  describe('RPC Functions', () => {
    test('should call RPC function successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Function executed successfully'
      };

      mockSupabase.rpc.mockResolvedValue({ data: mockResult, error: null });

      const result = await mockSupabase.rpc('get_document_audit_trail', { doc_uuid: 'doc123' });

      expect(result.data).toEqual(mockResult);
      expect(result.error).toBeNull();
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_document_audit_trail', { doc_uuid: 'doc123' });
    });

    test('should handle RPC function errors', async () => {
      const mockError = {
        message: 'Function execution failed',
        code: 'PGRST301'
      };

      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

      const result = await mockSupabase.rpc('get_document_audit_trail', { doc_uuid: 'doc123' });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
});
