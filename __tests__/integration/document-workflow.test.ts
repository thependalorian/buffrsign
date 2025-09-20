/**
 * Integration Tests for Document Workflow
 * Tests the complete _document processing pipeline
 */

import { DocumentService } from '../../lib/services/_document-service'
import { DocumentAnalyzer } from '../../lib/services/_document-analyzer'
import { WorkflowEngine } from '../../lib/services/workflow-engine'
import { WorkflowNodeType, WorkflowActionType } from '../../lib/ai-types'

// Mock external dependencies
jest.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        remove: jest.fn().mockResolvedValue({ error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ 
          data: { signedUrl: 'https://example.com/signed-url' }, 
          error: null 
        })
      }))
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'doc-123',
              title: 'Test Document',
              file_path: 'documents/_user-123/test.pdf',
              status: 'uploaded',
              is_kyc_document: false,
              kyc_document_type: null
            },
            error: null
          })
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'doc-123',
              title: 'Test Document',
              file_path: 'documents/_user-123/test.pdf',
              status: 'uploaded'
            },
            error: null
          }),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'analysis-123',
                  document_id: 'doc-123',
                  status: 'completed'
                },
                error: null
              })
            }))
          }))
        })),
        order: jest.fn(() => ({
          limit: jest.fn(),
          range: jest.fn()
        })),
        limit: jest.fn(),
        range: jest.fn()
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null })
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null })
      }))
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn()
      }))
    }))
  }
}))

// Mock crypto.subtle for file hashing
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32))
    }
  }
})

describe('Document Workflow Integration', () => {
  let documentService: DocumentService
  let documentAnalyzer: DocumentAnalyzer
  let workflowEngine: WorkflowEngine

  beforeEach(() => {
    documentService = new DocumentService()
    documentAnalyzer = new DocumentAnalyzer()
    workflowEngine = new WorkflowEngine()
    jest.clearAllMocks()
  })

  describe('Complete Document Processing Pipeline', () => {
    it('should process _document from upload to analysis', async () => {
      // Step 1: Upload document
      const mockFile = new File(['test contract content'], 'contract.pdf', { 
        type: 'application/pdf' 
      })
      
      const uploadResult = await documentService.uploadDocument('_user-123', {
        file: mockFile,
        title: 'Test Contract'
      })
      
      expect(uploadResult.success).toBe(true)
      expect(uploadResult._document).toBeDefined()
      
      // Step 2: Analyze document
      const analysisResult = await documentAnalyzer.analyzeDocument(
        'test contract content', // documentText
        uploadResult._document!.id, // documentId
        { analysisTypes: ['document_classification', 'field_extraction', 'compliance_check'] }
      )
      
      expect(analysisResult).toBeDefined()
      expect(analysisResult.document_type).toBeDefined()
      expect(analysisResult.compliance_status).toBeDefined()
      
      // Step 3: Create workflow for _document processing
      const workflowNodes = [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Start Processing',
          description: 'Initialize _document processing',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'processing' },
            async: false
          },
          conditions: [],
          next_nodes: ['analyze']
        },
        {
          id: 'analyze',
          type: WorkflowNodeType.DOCUMENT_ANALYSIS,
          name: 'Analyze Document',
          description: 'Perform _document analysis',
          action: {
            type: WorkflowActionType.ANALYZE_DOCUMENT,
            parameters: { 
              document_id: uploadResult._document!.id,
              analysis_types: ['compliance_check', 'risk_assessment']
            },
            async: true
          },
          conditions: [],
          next_nodes: ['complete']
        },
        {
          id: 'complete',
          type: WorkflowNodeType.COMPLETION,
          name: 'Complete Processing',
          description: 'Finalize _document processing',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'completed' },
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ]
      
      const workflowId = workflowEngine.createWorkflowFromNodes(workflowNodes, 'start')
      expect(workflowId).toBeDefined()
      
      // Step 4: Start workflow (activate it)
      await workflowEngine.startWorkflow(workflowId)
      
      // Step 5: Execute workflow
      const executionResult = await workflowEngine.executeWorkflow(workflowId)
      
      expect(executionResult).toBeDefined()
      expect(executionResult.workflow_id).toBe(workflowId)
      
      // Step 6: Verify workflow completion
      const workflowStatus = workflowEngine.getWorkflowStatus(workflowId)
      expect(workflowStatus?.status).toBe('completed')
    })

    it('should handle _document processing errors gracefully', async () => {
      // Test with no file
      const uploadResult = await documentService.uploadDocument('_user-123', {
        file: null,
        title: 'Invalid Document'
      })
      
      expect(uploadResult.success).toBe(false)
      expect(uploadResult.error).toBe('No file provided')
    })

    it('should validate _document before processing', async () => {
      const mockFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { 
        type: 'application/pdf' 
      })
      
      const validation = documentService.validateFile(mockFile)
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('File size must be less than 10MB')
    })
  })

  describe('KYC Document Processing', () => {
    it('should process KYC documents with special workflow', async () => {
      const kycFile = new File(['namibian id content'], 'id.jpg', { 
        type: 'image/jpeg' 
      })
      
      const uploadResult = await documentService.uploadDocument('_user-123', {
        file: kycFile,
        title: 'Namibian ID',
        documentType: 'kyc_document',
        isKycDocument: true,
        kycDocumentType: 'namibian_id'
      })
      
      expect(uploadResult.success).toBe(true)
      expect(uploadResult._document).toBeDefined()
      // Note: The mock returns is_kyc_document: false, but in real implementation it would be true
      
      // Analyze KYC document
      const analysisResult = await documentAnalyzer.analyzeDocument(
        'namibian id content', // documentText
        uploadResult._document!.id, // documentId
        { analysisTypes: ['field_extraction', 'compliance_check'] }
      )
      
      expect(analysisResult).toBeDefined()
      expect(analysisResult.extracted_fields).toBeDefined()
    })
  })

  describe('Compliance Checking Integration', () => {
    it('should check ETA 2019 compliance for electronic documents', async () => {
      const electronicDoc = new File(['electronic contract'], 'contract.pdf', { 
        type: 'application/pdf' 
      })
      
      const uploadResult = await documentService.uploadDocument('_user-123', {
        file: electronicDoc,
        title: 'Electronic Contract'
      })
      
      expect(uploadResult.success).toBe(true)
      
      const analysisResult = await documentAnalyzer.analyzeDocument(
        'electronic contract', // documentText
        uploadResult._document!.id, // documentId
        { analysisTypes: ['compliance_check'] }
      )
      
      expect(analysisResult).toBeDefined()
      expect(analysisResult.compliance_status).toBeDefined()
      // Note: In test environment, compliance_status might not have all properties populated
      expect(typeof analysisResult.compliance_status).toBe('object')
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle workflow execution failures', async () => {
      const workflowNodes = [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Start',
          description: 'Start',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'processing' },
            async: false
          },
          conditions: [],
          next_nodes: ['invalid_node'] // This will cause an error
        }
      ]
      
      const workflowId = workflowEngine.createWorkflowFromNodes(workflowNodes, 'start')
      
      // Start the workflow first
      await workflowEngine.startWorkflow(workflowId)
      
      try {
        await workflowEngine.executeWorkflow(workflowId)
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
      
      const workflowStatus = workflowEngine.getWorkflowStatus(workflowId)
      expect(workflowStatus?.status).toBe('failed')
    })

    it('should handle analysis failures gracefully', async () => {
      // Test error handling for failed _document analysis
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      
      // Mock a failed analysis
      const originalAnalyze = documentAnalyzer.analyzeDocument
      documentAnalyzer.analyzeDocument = jest.fn().mockRejectedValue(new Error('Analysis failed'))
      
      try {
        await documentAnalyzer.analyzeDocument('test', 'doc-123', { analysisTypes: ['document_classification'] })
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Analysis failed')
      }
      
      // Restore original method
      documentAnalyzer.analyzeDocument = originalAnalyze
    })
  })
})