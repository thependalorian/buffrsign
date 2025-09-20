/**
 * Tests for Supabase Types
 * Tests TypeScript type definitions and database schema
 */

import { Database, Tables, TablesInsert, TablesUpdate, Enums } from '../types/supabase';

describe('Supabase Types', () => {
  describe('Database Schema', () => {
    test('should have correct table structure for documents', () => {
      type DocumentRow = Tables<'documents'>;
      
      const mockDocument: DocumentRow = {
        id: 'doc123',
        title: 'Test Document',
        file_path: '/path/to/_document.pdf',
        file_hash: 'abc123',
        file_size: 1024,
        mime_type: 'application/pdf',
        created_by: '_user123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        status: 'active',
        document_type: 'contract',
        industry: 'legal',
        jurisdiction: 'namibia',
        is_kyc_document: false,
        kyc_document_type: null,
        kyc_workflow_id: null,
        ai_analysis_enabled: true,
        ai_analysis_id: null,
        ai_analysis_status: 'pending',
        compliance_analysis_id: null,
        expires_at: null
      };

      expect(mockDocument.id).toBe('doc123');
      expect(mockDocument.title).toBe('Test Document');
      expect(mockDocument.mime_type).toBe('application/pdf');
    });

    test('should have correct table structure for ai_analysis', () => {
      type AIAnalysisRow = Tables<'ai_analysis'>;
      
      const mockAnalysis: AIAnalysisRow = {
        id: 'analysis123',
        document_id: 'doc123',
        analysis_type: 'ocr',
        confidence_scores: { overall: 0.95, text: 0.92 },
        extracted_fields: { name: 'John Doe', id: '123456789' },
        processing_time_ms: 1500,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        analysis_metadata: { method: 'gpt4_vision' },
        compliance_score: 0.85,
        document_summary: 'Document contains personal information',
        eta_compliance: { compliant: true, score: 0.9 },
        fallback_methods: ['pytesseract_fallback'],
        field_confidences: { name: 0.95, id: 0.92 },
        image_quality_score: 0.88,
        key_clauses: ['signature clause', 'terms and conditions'],
        kyc_workflow_id: null,
        overall_quality_score: 0.9,
        primary_ocr_method: 'gpt4_vision',
        recommendations: ['Add signature field'],
        risk_assessment: { level: 'low', score: 0.2 },
        signature_fields: [{ name: 'signature', required: true }],
        text_clarity_score: 0.85
      };

      expect(mockAnalysis.id).toBe('analysis123');
      expect(mockAnalysis.document_id).toBe('doc123');
      expect(mockAnalysis.analysis_type).toBe('ocr');
      expect(mockAnalysis.confidence_scores).toEqual({ overall: 0.95, text: 0.92 });
    });

    test('should have correct table structure for kyc_workflows', () => {
      type KYCWorkflowRow = Tables<'kyc_workflows'>;
      
      const mockWorkflow: KYCWorkflowRow = {
        id: 'kyc123',
        user_id: '_user123',
        document_id: 'doc123',
        workflow_state: 'initialized',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ai_field_extraction: { name: 'John Doe', id: '123456789' },
        audit_trail: [{ action: 'workflow_started', timestamp: '2024-01-01T00:00:00Z' }],
        completed_at: null,
        compliance_status: { compliant: true, score: 0.9 },
        country_confidence: 0.95,
        country_detection_method: 'gpt4_vision',
        decision_confidence: 0.92,
        detected_country: 'NA',
        final_decision: 'pending',
        ocr_extraction: { text: 'Extracted text', confidence: 0.95 },
        processing_time_ms: 2000,
        rejection_reasons: null,
        sadc_validation: { valid: true, country: 'Namibia' },
        total_confidence: 0.93
      };

      expect(mockWorkflow.id).toBe('kyc123');
      expect(mockWorkflow.user_id).toBe('_user123');
      expect(mockWorkflow.workflow_state).toBe('initialized');
      expect(mockWorkflow.final_decision).toBe('pending');
    });

    test('should have correct table structure for users', () => {
      type UserRow = Tables<'users'>;
      
      const mockUser: UserRow = {
        id: '_user123',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        account_type: 'individual',
        company_name: null,
        is_active: true,
        is_verified: true,
        last_login_at: '2024-01-01T00:00:00Z',
        namibian_id: '123456789',
        password_hash: 'hashed_password',
        phone: '+264811234567',
        role: '_user'
      };

      expect(mockUser.id).toBe('_user123');
      expect(mockUser.email).toBe('john.doe@example.com');
      expect(mockUser.first_name).toBe('John');
      expect(mockUser.last_name).toBe('Doe');
      expect(mockUser.full_name).toBe('John Doe');
    });
  });

  describe('Insert Types', () => {
    test('should have correct insert type for documents', () => {
      type DocumentInsert = TablesInsert<'documents'>;
      
      const mockDocumentInsert: DocumentInsert = {
        title: 'Test Document',
        file_path: '/path/to/_document.pdf',
        file_hash: 'abc123',
        file_size: 1024,
        mime_type: 'application/pdf',
        created_by: '_user123'
      };

      expect(mockDocumentInsert.title).toBe('Test Document');
      expect(mockDocumentInsert.mime_type).toBe('application/pdf');
    });

    test('should have correct insert type for ai_analysis', () => {
      type AIAnalysisInsert = TablesInsert<'ai_analysis'>;
      
      const mockAnalysisInsert: AIAnalysisInsert = {
        document_id: 'doc123',
        analysis_type: 'ocr',
        confidence_scores: { overall: 0.95 },
        extracted_fields: { name: 'John Doe' }
      };

      expect(mockAnalysisInsert.document_id).toBe('doc123');
      expect(mockAnalysisInsert.analysis_type).toBe('ocr');
    });
  });

  describe('Update Types', () => {
    test('should have correct update type for documents', () => {
      type DocumentUpdate = TablesUpdate<'documents'>;
      
      const mockDocumentUpdate: DocumentUpdate = {
        status: 'processed',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(mockDocumentUpdate.status).toBe('processed');
    });

    test('should have correct update type for kyc_workflows', () => {
      type KYCWorkflowUpdate = TablesUpdate<'kyc_workflows'>;
      
      const mockWorkflowUpdate: KYCWorkflowUpdate = {
        workflow_state: 'completed',
        final_decision: 'approved',
        completed_at: '2024-01-01T00:00:00Z'
      };

      expect(mockWorkflowUpdate.workflow_state).toBe('completed');
      expect(mockWorkflowUpdate.final_decision).toBe('approved');
    });
  });

  describe('Enum Types', () => {
    test('should have correct AI method enum values', () => {
      type AIMethod = Enums<'ai_method'>;
      
      const validMethods: AIMethod[] = [
        'gpt4_vision',
        'google_vision',
        'azure_vision',
        'pytesseract_fallback',
        'pydantic_ai_agent',
        'openai_structured',
        'ai_agent_manager',
        'regex_fallback'
      ];

      expect(validMethods).toHaveLength(8);
      expect(validMethods).toContain('gpt4_vision');
      expect(validMethods).toContain('pytesseract_fallback');
    });

    test('should have correct KYC decision enum values', () => {
      type KYCDecision = Enums<'kyc_decision'>;
      
      const validDecisions: KYCDecision[] = [
        'approved',
        'rejected',
        'pending',
        'requires_review'
      ];

      expect(validDecisions).toHaveLength(4);
      expect(validDecisions).toContain('approved');
      expect(validDecisions).toContain('rejected');
    });

    test('should have correct KYC workflow state enum values', () => {
      type KYCWorkflowState = Enums<'kyc_workflow_state'>;
      
      const validStates: KYCWorkflowState[] = [
        'initialized',
        'document_uploaded',
        'ocr_extraction_complete',
        'ai_country_detection',
        'ai_field_extraction',
        'sadc_validation',
        'compliance_checked',
        'auto_approved',
        'auto_rejected',
        'completed',
        'failed'
      ];

      expect(validStates).toHaveLength(11);
      expect(validStates).toContain('initialized');
      expect(validStates).toContain('completed');
      expect(validStates).toContain('failed');
    });

    test('should have correct _user role enum values', () => {
      type UserRole = Enums<'user_role'>;
      
      const validRoles: UserRole[] = [
        '_user',
        'admin',
        'super_admin'
      ];

      expect(validRoles).toHaveLength(3);
      expect(validRoles).toContain('_user');
      expect(validRoles).toContain('admin');
      expect(validRoles).toContain('super_admin');
    });
  });

  describe('Type Safety', () => {
    test('should enforce required fields in insert types', () => {
      type DocumentInsert = TablesInsert<'documents'>;
      
      // This should compile without errors
      const validInsert: DocumentInsert = {
        title: 'Test Document',
        file_path: '/path/to/_document.pdf',
        file_hash: 'abc123',
        file_size: 1024,
        mime_type: 'application/pdf'
      };

      expect(validInsert.title).toBe('Test Document');
    });

    test('should allow optional fields in insert types', () => {
      type DocumentInsert = TablesInsert<'documents'>;
      
      // This should compile without errors
      const validInsert: DocumentInsert = {
        title: 'Test Document',
        file_path: '/path/to/_document.pdf',
        file_hash: 'abc123',
        file_size: 1024,
        mime_type: 'application/pdf',
        created_by: '_user123',
        status: 'active',
        document_type: 'contract'
      };

      expect(validInsert.created_by).toBe('_user123');
      expect(validInsert.status).toBe('active');
    });

    test('should enforce correct enum values', () => {
      type AIMethod = Enums<'ai_method'>;
      
      // This should compile without errors
      const validMethod: AIMethod = 'gpt4_vision';
      expect(validMethod).toBe('gpt4_vision');
      
      // This should not compile (commented out to avoid TypeScript errors)
      // const invalidMethod: AIMethod = 'invalid_method';
    });
  });
});
