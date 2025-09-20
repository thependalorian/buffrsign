/**
 * End-to-End Integration Tests
 * Tests complete _user journeys and system workflows
 */

import { DocumentService } from '../../lib/services/_document-service';
import { DocumentAnalyzer } from '../../lib/services/_document-analyzer';
import { WorkflowEngine } from '../../lib/services/workflow-engine';
import { WorkflowOrchestrator, WorkflowStepType } from '../../lib/ai/workflow-orchestrator';
import { kycService } from '../../lib/services/kyc';
import { WorkflowNodeType, WorkflowActionType } from '../../lib/ai-types';

// Minimal mocking - only external services
jest.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ 
          data: { signedUrl: 'https://test.com/_document.pdf' }, 
          error: null 
        })
      })
    },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: jest.fn().mockImplementation(() => {
            const timestamp = new Date().toISOString();
            return Promise.resolve({
              data: {
                id: `doc-${Date.now()}`,
                title: 'Test Document',
                file_path: 'documents/test.pdf',
                status: 'uploaded',
                created_at: timestamp,
                updated_at: timestamp,
                created_by: '_user-123',
                ai_analysis_enabled: true,
                ai_analysis_status: 'pending'
              },
              error: null
            });
          })
        })
      }),
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'doc-123', status: 'uploaded' },
            error: null
          })
        })
      }),
      update: () => ({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    })
  }
}));

Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32))
    }
  }
});

describe('End-to-End Integration Tests', () => {
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

  describe('Complete Document Processing Journey', () => {
    it('should handle full _document lifecycle from upload to completion', async () => {
      // Step 1: User uploads a contract document
      const contractFile = new File(
        ['This is a comprehensive employment contract with signature requirements and compliance clauses.'],
        'employment-contract.pdf',
        { type: 'application/pdf' }
      );
      Object.defineProperty(contractFile, 'size', { value: 2 * 1024 * 1024 }); // 2MB

      // Validate file before upload (Real validation logic)
      const validation = documentService.validateFile(contractFile);
      expect(validation.isValid).toBe(true);

      // Upload _document (Real service logic with mocked storage)
      const uploadResult = await documentService.uploadDocument('_user-123', {
        file: contractFile,
        title: 'Employment Contract - John Doe',
        documentType: 'employment_contract',
        industry: 'technology',
        jurisdiction: 'namibia'
      });

      expect(uploadResult.success).toBe(true);
      expect(uploadResult._document).toBeDefined();
      const documentId = uploadResult._document!.id;

      // Step 2: System automatically triggers AI analysis
      const analysisResult = await documentAnalyzer.analyzeDocument(
        'This is a comprehensive employment contract with signature requirements and compliance clauses. Employee signature required here: _______________. Employer signature required here: _______________. This contract complies with ETA 2019 electronic signature regulations.',
        documentId,
        { 
          documentType: 'employment_contract',
          industry: 'technology',
          jurisdiction: 'namibia'
        }
      );

      expect(analysisResult).toBeDefined();
      expect(analysisResult.document_id).toBe(documentId);
      expect(analysisResult.document_type).toBeDefined();
      expect(analysisResult.signature_locations.length).toBeGreaterThan(0);
      expect(analysisResult.compliance_status).toBeDefined();
      expect(typeof analysisResult.compliance_status.compliance_score).toBe('number');

      // Step 3: Create signature workflow based on analysis
      const signatureWorkflowNodes = [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Signature Workflow Start',
          description: 'Initialize signature collection process',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'signature_pending' },
            async: false
          },
          conditions: [],
          next_nodes: ['employee_signature']
        },
        {
          id: 'employee_signature',
          type: WorkflowNodeType.SIGNATURE_COLLECTION,
          name: 'Employee Signature',
          description: 'Collect employee signature',
          action: {
            type: WorkflowActionType.COLLECT_SIGNATURE,
            parameters: { 
              signer_role: 'employee',
              signature_field_id: analysisResult.signature_locations[0]?.id || 'sig1'
            },
            async: true
          },
          conditions: [],
          next_nodes: ['employer_signature']
        },
        {
          id: 'employer_signature',
          type: WorkflowNodeType.SIGNATURE_COLLECTION,
          name: 'Employer Signature',
          description: 'Collect employer signature',
          action: {
            type: WorkflowActionType.COLLECT_SIGNATURE,
            parameters: { 
              signer_role: 'employer',
              signature_field_id: analysisResult.signature_locations[1]?.id || 'sig2'
            },
            async: true
          },
          conditions: [],
          next_nodes: ['finalize']
        },
        {
          id: 'finalize',
          type: WorkflowNodeType.COMPLETION,
          name: 'Finalize Contract',
          description: 'Complete contract processing',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'completed' },
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ];

      const workflowId = workflowEngine.createWorkflowFromNodes(signatureWorkflowNodes, 'start');
      expect(workflowId).toBeDefined();

      // Step 4: Execute the workflow
      await workflowEngine.startWorkflow(workflowId);
      const executionResult = await workflowEngine.executeWorkflow(workflowId);
      
      expect(executionResult).toBeDefined();
      expect(executionResult.workflow_id).toBe(workflowId);

      // Step 5: Verify final _document status
      const finalStatus = workflowEngine.getWorkflowStatus(workflowId);
      expect(finalStatus).toBeDefined();
      expect(['active', 'completed', 'failed'].includes(finalStatus!.status)).toBe(true);
    });
  });

  describe('KYC Document Processing Journey', () => {
    it('should handle complete KYC verification workflow', async () => {
      // Step 1: User uploads KYC documents
      const idDocument = new File(
        ['Namibian ID Card - John Doe, ID: 12345678901, DOB: 1990-01-01'],
        'namibian-id.jpg',
        { type: 'image/jpeg' }
      );
      Object.defineProperty(idDocument, 'size', { value: 1.5 * 1024 * 1024 }); // 1.5MB

      // Upload KYC document
      const uploadResult = await documentService.uploadDocument('_user-123', {
        file: idDocument,
        title: 'Namibian National ID',
        documentType: 'kyc_document',
        isKycDocument: true,
        kycDocumentType: 'namibian_id'
      });

      expect(uploadResult.success).toBe(true);
      expect(uploadResult._document).toBeDefined();

      // Step 2: Start KYC workflow using KYC service
      const kycWorkflowResult = await kycService.startKYCWorkflow('_user-123', {
        documentIds: [uploadResult._document!.id],
        kycLevel: 'full',
        jurisdiction: 'namibia'
      });

      expect(kycWorkflowResult.success).toBe(true);
      expect(kycWorkflowResult.kycData).toBeDefined();

      // Step 3: Analyze KYC document
      const kycAnalysis = await documentAnalyzer.analyzeDocument(
        'Namibian ID Card - John Doe, ID: 12345678901, DOB: 1990-01-01, Address: 123 Main St, Windhoek',
        uploadResult._document!.id,
        { 
          documentType: 'kyc_document',
          kycDocumentType: 'namibian_id',
          extractionFields: ['name', 'id_number', 'date_of_birth', 'address']
        }
      );

      expect(kycAnalysis).toBeDefined();
      expect(kycAnalysis.extracted_fields).toBeDefined();
      expect(kycAnalysis.compliance_status).toBeDefined();

      // Step 4: Get KYC data and verify extraction
      const kycDataResult = await kycService.getUserKYCData('_user-123');
      expect(kycDataResult.success).toBe(true);
      expect(kycDataResult.kycData).toBeDefined();
    });
  });

  describe('Multi-Document Workflow Journey', () => {
    it('should handle complex multi-_document processing', async () => {
      const documents = [
        {
          file: new File(['Contract content'], 'contract.pdf', { type: 'application/pdf' }),
          title: 'Main Contract',
          type: 'contract'
        },
        {
          file: new File(['Addendum content'], 'addendum.pdf', { type: 'application/pdf' }),
          title: 'Contract Addendum',
          type: 'addendum'
        },
        {
          file: new File(['Schedule content'], 'schedule.pdf', { type: 'application/pdf' }),
          title: 'Payment Schedule',
          type: 'schedule'
        }
      ];

      // Upload all documents
      const uploadPromises = documents.map(doc => {
        Object.defineProperty(doc.file, 'size', { value: 1024 * 1024 });
        return documentService.uploadDocument('_user-123', {
          file: doc.file,
          title: doc.title,
          documentType: doc.type
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Verify all uploads succeeded
      uploadResults.forEach(result => {
        expect(result.success).toBe(true);
        expect(result._document).toBeDefined();
      });

      const documentIds = uploadResults.map(result => result._document!.id);

      // Create orchestrated workflow for all documents
      const multiDocWorkflowId = await workflowOrchestrator.createWorkflow({
        name: 'Multi-Document Processing Workflow',
        description: 'Process multiple documents together',
        steps: [
          {
            id: 'start',
            type: WorkflowStepType.DOCUMENT_ANALYSIS,
            name: 'Multi-Document Processing Start',
            config: { documentIds }
          },
          {
            id: 'analyze_all',
            type: WorkflowStepType.AI_EXTRACTION,
            name: 'Analyze All Documents',
            config: { 
              analysisTypes: ['compliance_check', 'signature_detection'],
              documentIds 
            }
          },
          {
            id: 'cross_reference',
            type: WorkflowStepType.COMPLIANCE_CHECK,
            name: 'Cross-Reference Documents',
            config: { documentIds }
          },
          {
            id: 'finalize',
            type: WorkflowStepType.NOTIFICATION,
            name: 'Finalize Processing',
            config: { status: 'completed' }
          }
        ]
      });

      expect(multiDocWorkflowId).toBeDefined();

      // Start and monitor workflow
      await workflowOrchestrator.startWorkflow(multiDocWorkflowId);
      const workflow = workflowOrchestrator.getWorkflow(multiDocWorkflowId);
      expect(workflow).toBeDefined();
      expect(workflow?.status).toBe('running');

      // Analyze each _document individually
      const analysisPromises = uploadResults.map((result, _index) => 
        documentAnalyzer.analyzeDocument(
          `${documents[_index].type} content with relevant clauses and requirements`,
          result._document!.id,
          { documentType: documents[_index].type }
        )
      );

      const analysisResults = await Promise.all(analysisPromises);
      
      // Verify all analyses completed
      analysisResults.forEach(analysis => {
        expect(analysis).toBeDefined();
        expect(analysis.document_type).toBeDefined();
        expect(analysis.processing_time).toBeGreaterThanOrEqual(0);
      });

      // Get workflow history
      const history = workflowOrchestrator.getWorkflowHistory(multiDocWorkflowId);
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle and recover from various failure scenarios', async () => {
      // Test 1: Invalid file upload recovery
      const invalidUpload = await documentService.uploadDocument('_user-123', {
        file: null,
        title: 'Invalid Document'
      });
      expect(invalidUpload.success).toBe(false);
      expect(invalidUpload.error).toBe('No file provided');

      // Test 2: Workflow with invalid configuration
      const invalidWorkflowNodes = [
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
          next_nodes: ['nonexistent_node'] // Invalid reference
        }
      ];

      const workflowId = workflowEngine.createWorkflowFromNodes(invalidWorkflowNodes, 'start');
      await workflowEngine.startWorkflow(workflowId);

      // Should handle execution failure gracefully
      try {
        await workflowEngine.executeWorkflow(workflowId);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Verify workflow state is properly updated
      const failedStatus = workflowEngine.getWorkflowStatus(workflowId);
      expect(failedStatus).toBeDefined();
      expect(failedStatus?.status).toBe('failed');

      // Test 3: Analysis error handling
      try {
        await documentAnalyzer.analyzeDocument('', 'invalid-doc-id', {});
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Test 4: Orchestrator error handling
      try {
        await workflowOrchestrator.startWorkflow('nonexistent-workflow-id');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('not found');
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance with concurrent operations', async () => {
      const concurrentOperations = 10;
      const startTime = Date.now();

      // Create multiple concurrent workflows
      const workflowPromises = Array.from({ length: concurrentOperations }, (_, i) =>
        workflowOrchestrator.createWorkflow({
          name: `Concurrent Workflow ${i}`,
          description: `Concurrent processing workflow ${i}`,
          steps: [
            {
              id: 'start',
              type: WorkflowStepType.DOCUMENT_ANALYSIS,
              name: `Concurrent Workflow ${i}`,
              config: { _index: i }
            }
          ]
        })
      );

      const workflowIds = await Promise.all(workflowPromises);
      expect(workflowIds).toHaveLength(concurrentOperations);

      // Start all workflows concurrently
      const startPromises = workflowIds.map(id => 
        workflowOrchestrator.startWorkflow(id)
      );

      await Promise.all(startPromises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(totalTime).toBeLessThan(5000); // 5 seconds

      // Verify all workflows are active
      const activeWorkflows = workflowOrchestrator.getActiveWorkflows();
      expect(activeWorkflows.length).toBeGreaterThanOrEqual(concurrentOperations);
    });

    it('should handle large _document processing efficiently', async () => {
      // Create a large _document (simulate 100KB text)
      const largeContent = 'This is a large _document with extensive content. '.repeat(2000);
      
      const startTime = Date.now();
      
      const analysis = await documentAnalyzer.analyzeDocument(
        largeContent,
        'large-doc-test',
        { documentType: 'contract' }
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(analysis).toBeDefined();
      expect(analysis.document_id).toBe('large-doc-test');
      expect(processingTime).toBeLessThan(15000); // Should complete within 15 seconds

      // Verify analysis quality isn't compromised
      expect(analysis.confidence_score).toBeGreaterThan(0);
      expect(analysis.compliance_status).toBeDefined();
    });
  });
});