/**
 * Real System Integration Tests
 * Tests actual functionality with minimal mocking to ensure everything works together
 */

import { DocumentService } from '../../lib/services/_document-service';
import { DocumentAnalyzer } from '../../lib/services/_document-analyzer';
import { WorkflowEngine } from '../../lib/services/workflow-engine';
import { WorkflowOrchestrator, WorkflowStepType, WorkflowStatus } from '../../lib/ai/workflow-orchestrator';
import { WorkflowNodeType, WorkflowActionType } from '../../lib/ai-types';

// Only mock external services (Supabase, OpenAI) but test real business logic
jest.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        remove: jest.fn().mockResolvedValue({ error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ 
          data: { signedUrl: 'https://test.com/file.pdf' }, 
          error: null 
        })
      })
    },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'doc-123',
              title: 'Test Document',
              file_path: 'documents/test.pdf',
              status: 'uploaded',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: '_user-123'
            },
            error: null
          })
        })
      }),
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'doc-123',
              title: 'Test Document',
              status: 'uploaded'
            },
            error: null
          }),
          order: () => ({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        }),
        order: () => ({
          limit: jest.fn().mockResolvedValue({
            data: [
              { status: 'completed', created_at: new Date().toISOString(), ai_analysis_id: 'analysis-1' },
              { status: 'pending', created_at: new Date().toISOString(), ai_analysis_id: null }
            ],
            error: null
          })
        })
      }),
      update: () => ({
        eq: jest.fn().mockResolvedValue({ error: null })
      }),
      delete: () => ({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    })
  }
}));

// Mock crypto for file hashing
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32))
    }
  }
});

describe('Real System Integration Tests', () => {
  let documentService: DocumentService;
  let documentAnalyzer: DocumentAnalyzer;
  let workflowEngine: WorkflowEngine;
  let workflowOrchestrator: WorkflowOrchestrator;

  beforeEach(() => {
    documentService = new DocumentService();
    documentAnalyzer = new DocumentAnalyzer();
    workflowEngine = new WorkflowEngine();
    workflowOrchestrator = new WorkflowOrchestrator();
  });

  describe('Document Processing Pipeline', () => {
    it('should handle complete _document lifecycle', async () => {
      // 1. File Validation (Real Logic)
      const testFile = new File(['test content'], 'contract.pdf', { type: 'application/pdf' });
      Object.defineProperty(testFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      const validation = documentService.validateFile(testFile);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // 2. Document Upload (Real Service Logic)
      const uploadResult = await documentService.uploadDocument('_user-123', {
        file: testFile,
        title: 'Integration Test Contract',
        documentType: 'contract',
        industry: 'finance'
      });

      expect(uploadResult.success).toBe(true);
      expect(uploadResult._document).toBeDefined();
      expect(uploadResult._document?.title).toBe('Test Document');

      // 3. Document Analysis (Real Business Logic)
      const analysisResult = await documentAnalyzer.analyzeDocument(
        'This is a test contract with signature requirements and compliance clauses.',
        uploadResult._document!.id,
        { documentType: 'contract', industry: 'finance' }
      );

      expect(analysisResult).toBeDefined();
      expect(analysisResult.document_id).toBe(uploadResult._document!.id);
      expect(analysisResult.document_type).toBeDefined();
      expect(analysisResult.compliance_status).toBeDefined();
      expect(analysisResult.signature_locations).toBeDefined();

      // 4. Document Statistics (Real Calculation Logic)
      const statsResult = await documentService.getDocumentStats('_user-123');
      expect(statsResult.success).toBe(true);
      expect(statsResult.stats).toBeDefined();
      expect(typeof statsResult.stats?.total).toBe('number');
    });

    it('should handle file validation edge cases', async () => {
      // Test oversized file
      const largeFile = new File(['x'.repeat(1000)], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(largeFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB
      
      const validation = documentService.validateFile(largeFile);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('File size must be less than 10MB');

      // Test unsupported file type
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-executable' });
      const validation2 = documentService.validateFile(invalidFile);
      expect(validation2.isValid).toBe(false);
      expect(validation2.errors).toContain('File type not supported. Please upload PDF, Word, or image files.');
    });
  });

  describe('Workflow Engine Integration', () => {
    it('should create and execute workflows with real business logic', async () => {
      // Create a real workflow with actual nodes
      const workflowNodes = [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Document Processing Start',
          description: 'Initialize _document processing workflow',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'processing' },
            async: false
          },
          conditions: [],
          next_nodes: ['validate']
        },
        {
          id: 'validate',
          type: WorkflowNodeType.VALIDATION,
          name: 'Document Validation',
          description: 'Validate _document format and content',
          action: {
            type: WorkflowActionType.VALIDATE_DOCUMENT,
            parameters: { 
              required_fields: ['title', 'content'],
              max_size: 10485760 // 10MB
            },
            async: false
          },
          conditions: [],
          next_nodes: ['analyze']
        },
        {
          id: 'analyze',
          type: WorkflowNodeType.DOCUMENT_ANALYSIS,
          name: 'AI Analysis',
          description: 'Perform AI-powered _document analysis',
          action: {
            type: WorkflowActionType.ANALYZE_DOCUMENT,
            parameters: { 
              analysis_types: ['compliance_check', 'signature_detection'],
              confidence_threshold: 0.8
            },
            async: true
          },
          conditions: [],
          next_nodes: ['complete']
        },
        {
          id: 'complete',
          type: WorkflowNodeType.COMPLETION,
          name: 'Processing Complete',
          description: 'Finalize _document processing',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'completed' },
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ];

      // Test workflow creation (Real Logic)
      const workflowId = workflowEngine.createWorkflowFromNodes(workflowNodes, 'start');
      expect(workflowId).toBeDefined();
      expect(typeof workflowId).toBe('string');

      // Test workflow validation (Real Logic)
      const isValid = workflowEngine.validateWorkflow(workflowNodes);
      expect(isValid.isValid).toBe(true);

      // Test workflow status retrieval (Real Logic)
      const status = workflowEngine.getWorkflowStatus(workflowId);
      expect(status).toBeDefined();
      expect(status?.workflow_id).toBe(workflowId);
      expect(status?.status).toBe('draft');

      // Test workflow activation and execution (Real Logic)
      await workflowEngine.startWorkflow(workflowId);
      const activeStatus = workflowEngine.getWorkflowStatus(workflowId);
      expect(activeStatus?.status).toBe('active');

      // Execute workflow (Real Logic)
      const executionResult = await workflowEngine.executeWorkflow(workflowId);
      expect(executionResult).toBeDefined();
      expect(executionResult.workflow_id).toBe(workflowId);
    });

    it('should handle workflow validation errors', () => {
      // Test invalid workflow (missing start node)
      const invalidNodes = [
        {
          id: 'middle',
          type: WorkflowNodeType.VALIDATION,
          name: 'Middle Node',
          description: 'A middle node',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'processing' },
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ];

      expect(() => {
        workflowEngine.createWorkflowFromNodes(invalidNodes, 'nonexistent');
      }).toThrow('Starting node not found');

      // Test duplicate node IDs
      const duplicateNodes = [
        {
          id: 'duplicate',
          type: WorkflowNodeType.START,
          name: 'Start',
          description: 'Start',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'active' },
            async: false
          },
          conditions: [],
          next_nodes: []
        },
        {
          id: 'duplicate', // Same ID
          type: WorkflowNodeType.COMPLETION,
          name: 'End',
          description: 'End',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'completed' },
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ];

      const isValid = workflowEngine.validateWorkflow(duplicateNodes);
      expect(isValid.isValid).toBe(false);
    });
  });

  describe('Workflow Orchestrator Integration', () => {
    it('should orchestrate complex workflows with real logic', async () => {
      // Create workflow using orchestrator (Real Logic)
      const workflowId = await workflowOrchestrator.createWorkflow({
        name: 'Document Analysis Workflow',
        description: 'Complex _document analysis workflow',
        steps: [
          {
            id: 'start',
            type: WorkflowStepType.DOCUMENT_ANALYSIS,
            name: 'Document Analysis Start',
            config: {}
          },
          {
            id: 'process',
            type: WorkflowStepType.AI_EXTRACTION,
            name: 'Process Document',
            config: { priority: 'high' }
          }
        ]
      });

      expect(workflowId).toBeDefined();
      expect(typeof workflowId).toBe('string');

      // Start workflow (Real Logic) - returns void
      await workflowOrchestrator.startWorkflow(workflowId);

      // Get workflow status (Real Logic)
      const workflow = workflowOrchestrator.getWorkflow(workflowId);
      expect(workflow).toBeDefined();
      expect([WorkflowStatus.RUNNING, WorkflowStatus.COMPLETED]).toContain(workflow?.status);

      // Pause and resume workflow (Real Logic)
      await workflowOrchestrator.pauseWorkflow(workflowId);
      const pausedWorkflow = workflowOrchestrator.getWorkflow(workflowId);
      expect(pausedWorkflow?.status).toBe(WorkflowStatus.PAUSED);

      await workflowOrchestrator.resumeWorkflow(workflowId);
      
      const resumedWorkflow = workflowOrchestrator.getWorkflow(workflowId);
      expect(resumedWorkflow?.status).toBe(WorkflowStatus.RUNNING);
    });

    it('should handle workflow step validation', () => {
      // Test valid workflow step
      const validStep = {
        id: 'test-step',
        type: WorkflowStepType.DOCUMENT_ANALYSIS,
        name: 'Test Step',
        config: { test: true }
      };

      const isValid = workflowOrchestrator.validateWorkflowStep(validStep);
      expect(isValid.isValid).toBe(true);

      // Test invalid workflow step (missing required fields)
      const invalidStep = {
        id: '', // Empty ID
        type: 'unknown_type' as any,
        name: '',
        config: {}
      };

      const isInvalid = workflowOrchestrator.validateWorkflowStep(invalidStep);
      expect(isInvalid.isValid).toBe(false);
    });
  });

  describe('Document Analysis Integration', () => {
    it('should perform real _document analysis with business logic', async () => {
      const contractText = `
        EMPLOYMENT CONTRACT
        
        This agreement is between Company ABC and John Doe.
        
        TERMS AND CONDITIONS:
        1. Position: Software Developer
        2. Salary: $75,000 per year
        3. Start Date: January 1, 2024
        
        SIGNATURE REQUIRED:
        Employee: _________________ Date: _______
        Employer: _________________ Date: _______
        
        This contract complies with ETA 2019 regulations.
      `;

      const analysis = await documentAnalyzer.analyzeDocument(
        contractText,
        'contract-123',
        { documentType: 'employment_contract' }
      );

      // Test real analysis results
      expect(analysis.document_id).toBe('contract-123');
      expect(analysis.document_type).toBeDefined();
      expect(analysis.confidence_score).toBeGreaterThan(0);
      expect(analysis.compliance_status).toBeDefined();
      expect(analysis.signature_locations).toBeDefined();
      expect(Array.isArray(analysis.signature_locations)).toBe(true);
      expect(analysis.processing_time).toBeGreaterThanOrEqual(0);

      // Test signature field extraction
      const signatureFields = await documentAnalyzer.extractSignatureFields(contractText);
      expect(Array.isArray(signatureFields)).toBe(true);
      expect(signatureFields.length).toBeGreaterThan(0);

      // Test compliance checking
      const complianceResult = documentAnalyzer.checkCompliance({ document_type: 'employment_contract', has_electronic_signature: true }, ['eta_2019']);
      expect(complianceResult).toBeDefined();
      expect(complianceResult.eta_2019_compliant).toBeDefined();
      expect(typeof complianceResult.compliance_score).toBe('number');
      expect(Array.isArray(complianceResult.compliance_details)).toBe(true);

      // Test risk assessment
      const riskAssessment = documentAnalyzer.assessRisk({ confidence_score: 0.8, document_type: 'employment_contract' });
      expect(riskAssessment).toBeDefined();
      expect(['low', 'medium', 'high', 'critical'].includes(riskAssessment.overall_risk)).toBe(true);
      expect(Array.isArray(riskAssessment.risk_factors)).toBe(true);
    });

    it('should handle different _document types', async () => {
      const invoiceText = `
        INVOICE #INV-2024-001
        
        Bill To: Customer XYZ
        Amount: $1,500.00
        Due Date: February 15, 2024
        
        Items:
        - Consulting Services: $1,200.00
        - Travel Expenses: $300.00
        
        Total: $1,500.00
      `;

      const analysis = await documentAnalyzer.analyzeDocument(
        invoiceText,
        'invoice-123',
        { documentType: 'invoice' }
      );

      expect(analysis.document_type).toBeDefined();
      expect(analysis.extracted_fields).toBeDefined();
      
      // Test metadata extraction
      const metadata = documentAnalyzer.extractDocumentMetadata(invoiceText);
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(Array.isArray(metadata.parties)).toBe(true);
      expect(Array.isArray(metadata.dates)).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle service errors gracefully', async () => {
      // Test _document service error handling
      const result = await documentService.uploadDocument('_user-123', {
        file: null, // Invalid file
        title: 'Test'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('No file provided');

      // Test workflow engine error handling
      expect(() => {
        workflowEngine.createWorkflowFromNodes([], 'nonexistent');
      }).toThrow();

      // Test _document analyzer error handling
      try {
        await documentAnalyzer.analyzeDocument('', '', {});
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should maintain data consistency during failures', async () => {
      // Test that partial failures don't leave system in inconsistent state
      const workflowId = workflowEngine.createWorkflowFromNodes([
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Start',
          description: 'Start',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'active' },
            async: false
          },
          conditions: [],
          next_nodes: ['invalid_node'] // This will cause an error
        }
      ], 'start');

      await workflowEngine.startWorkflow(workflowId);

      try {
        await workflowEngine.executeWorkflow(workflowId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Verify workflow state is properly updated even after failure
        const status = workflowEngine.getWorkflowStatus(workflowId);
        expect(status).toBeDefined();
        expect(status?.status).toBe('failed');
      }
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent operations', async () => {
      const promises = [];

      // Create multiple workflows concurrently
      for (let i = 0; i < 5; i++) {
        const promise = workflowOrchestrator.createWorkflow({
          name: `Workflow ${i}`,
          description: `Concurrent workflow ${i}`,
          steps: [
            {
              id: 'start',
              type: WorkflowStepType.DOCUMENT_ANALYSIS,
              name: `Workflow ${i}`,
              config: { _index: i }
            }
          ]
        });
        promises.push(promise);
      }

      const workflowIds = await Promise.all(promises);
      expect(workflowIds).toHaveLength(5);
      workflowIds.forEach(id => {
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });

      // Start all workflows to make them active
      await Promise.all(workflowIds.map(id => workflowOrchestrator.startWorkflow(id)));

      // Verify all workflows are tracked
      const activeWorkflows = workflowOrchestrator.getActiveWorkflows();
      expect(activeWorkflows.length).toBeGreaterThanOrEqual(5);
    });

    it('should handle large _document analysis efficiently', async () => {
      // Create a large _document text
      const largeText = 'This is a test _document. '.repeat(1000); // ~25KB of text
      
      const startTime = Date.now();
      const analysis = await documentAnalyzer.analyzeDocument(
        largeText,
        'large-doc-123',
        { documentType: 'contract' }
      );
      const endTime = Date.now();

      expect(analysis).toBeDefined();
      expect(analysis.processing_time).toBeGreaterThanOrEqual(0);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});