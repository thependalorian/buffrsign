import { DocumentAnalyzer } from '../../../lib/services/_document-analyzer'
import { RiskLevel } from '../../../lib/ai-types'

// Mock the supabase module
jest.mock('../../../lib/supabase')

describe('DocumentAnalyzer', () => {
  let documentAnalyzer: DocumentAnalyzer

  beforeEach(() => {
    documentAnalyzer = new DocumentAnalyzer()
    jest.clearAllMocks()
  })

  describe('analyzeDocument', () => {
    it('should analyze _document and return results', async () => {
      const documentText = 'test content for analysis'
      
      const result = await documentAnalyzer.analyzeDocument(documentText, 'doc-123', { confidence: 0.85 })
      
      expect(result).toBeDefined()
      expect(result.document_id).toBe('doc-123')
      expect(result.document_type).toBeDefined()
      expect(result.confidence_score).toBeGreaterThanOrEqual(0)
      expect(result.confidence_score).toBeLessThanOrEqual(1)
      expect(result.compliance_status).toBeDefined()
      expect(result.risk_assessment).toBeDefined()
    })

    it('should handle analysis errors gracefully', async () => {
      // Mock the classifyDocument method to throw an error
      jest.spyOn(documentAnalyzer as any, 'classifyDocument').mockRejectedValue(new Error('Analysis failed'))
      
      await expect(documentAnalyzer.analyzeDocument('', 'doc-123')).rejects.toThrow('Document analysis failed')
    })
  })

  describe('extractSignatureFields', () => {
    it('should extract signature fields from _document text', () => {
      const documentText = `
        Please sign here: ________________
        Date: ________________
        Name: John Doe
        Title: Manager
      `
      
      const fields = documentAnalyzer.extractSignatureFields(documentText)
      
      expect(fields).toBeInstanceOf(Array)
      expect(fields.length).toBeGreaterThan(0)
      
      fields.forEach(field => {
        expect(field).toHaveProperty('x')
        expect(field).toHaveProperty('y')
        expect(field).toHaveProperty('width')
        expect(field).toHaveProperty('height')
        expect(field).toHaveProperty('field_type')
        expect(field).toHaveProperty('confidence')
      })
    })

    it('should return empty array for text without signature fields', () => {
      const documentText = 'This is just regular text without any special fields.'
      
      const fields = documentAnalyzer.extractSignatureFields(documentText)
      
      expect(fields).toBeInstanceOf(Array)
      expect(fields.length).toBe(0)
    })
  })

  describe('assessRisk', () => {
    it('should assess risk based on _document content', () => {
      const documentData = {
        document_type: 'contract',
        confidence_score: 0.95,
        extracted_fields: {
          parties: ['Company A', 'Company B'],
          amount: '$100,000',
          date: '2024-01-01'
        }
      }
      
      const riskAssessment = documentAnalyzer.assessRisk(documentData)
      
      expect(riskAssessment).toHaveProperty('overall_risk')
      expect(riskAssessment).toHaveProperty('risk_score')
      expect(riskAssessment).toHaveProperty('risk_factors')
      expect(riskAssessment).toHaveProperty('mitigation_strategies')
      
      expect(Object.values(RiskLevel)).toContain(riskAssessment.overall_risk)
      expect(riskAssessment.risk_score).toBeGreaterThanOrEqual(0)
      expect(riskAssessment.risk_score).toBeLessThanOrEqual(1)
      expect(riskAssessment.risk_factors).toBeInstanceOf(Array)
      expect(riskAssessment.mitigation_strategies).toBeInstanceOf(Array)
    })

    it('should return higher risk for low confidence documents', () => {
      const lowConfidenceDoc = {
        document_type: 'unknown',
        confidence_score: 0.3,
        extracted_fields: {}
      }
      
      const highConfidenceDoc = {
        document_type: 'contract',
        confidence_score: 0.95,
        extracted_fields: {
          parties: ['Company A', 'Company B']
        }
      }
      
      const lowRisk = documentAnalyzer.assessRisk(lowConfidenceDoc)
      const highRisk = documentAnalyzer.assessRisk(highConfidenceDoc)
      
      expect(lowRisk.risk_score).toBeGreaterThan(highRisk.risk_score)
    })
  })

  describe('checkCompliance', () => {
    it('should check ETA 2019 compliance', () => {
      const documentData = {
        document_type: 'electronic_contract',
        has_electronic_signature: true,
        signature_method: 'digital_certificate',
        retention_policy: true
      }
      
      const compliance = documentAnalyzer.checkCompliance(documentData, ['eta_2019'])
      
      expect(compliance).toHaveProperty('eta_2019_compliant')
      expect(compliance).toHaveProperty('compliance_score')
      expect(compliance).toHaveProperty('compliance_details')
      expect(compliance).toHaveProperty('validation_errors')
      expect(compliance).toHaveProperty('recommendations')
      
      expect(typeof compliance.eta_2019_compliant).toBe('boolean')
      expect(compliance.compliance_score).toBeGreaterThanOrEqual(0)
      expect(compliance.compliance_score).toBeLessThanOrEqual(1)
      expect(compliance.compliance_details).toBeInstanceOf(Array)
      expect(compliance.validation_errors).toBeInstanceOf(Array)
      expect(compliance.recommendations).toBeInstanceOf(Array)
    })

    it('should identify non-compliant documents', () => {
      const nonCompliantDoc = {
        document_type: 'paper_contract',
        has_electronic_signature: false,
        signature_method: 'handwritten',
        retention_policy: false
      }
      
      const compliance = documentAnalyzer.checkCompliance(nonCompliantDoc, ['eta_2019'])
      
      expect(compliance.eta_2019_compliant).toBe(false)
      expect(compliance.compliance_score).toBeLessThan(0.8)
      expect(compliance.validation_errors.length).toBeGreaterThan(0)
      expect(compliance.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('extractDocumentMetadata', () => {
    it('should extract metadata from _document text', () => {
      const documentText = `
        Contract Agreement
        Date: January 1, 2024
        Parties: Company A and Company B
        Amount: $100,000
        Duration: 12 months
      `
      
      const metadata = documentAnalyzer.extractDocumentMetadata(documentText)
      
      expect(metadata).toHaveProperty('title')
      expect(metadata).toHaveProperty('parties')
      expect(metadata).toHaveProperty('dates')
      expect(metadata).toHaveProperty('amounts')
      expect(metadata).toHaveProperty('key_terms')
      
      expect(metadata.parties).toBeInstanceOf(Array)
      expect(metadata.dates).toBeInstanceOf(Array)
      expect(metadata.amounts).toBeInstanceOf(Array)
      expect(metadata.key_terms).toBeInstanceOf(Array)
    })

    it('should handle documents with minimal content', () => {
      const documentText = 'Simple _document with no structured content.'
      
      const metadata = documentAnalyzer.extractDocumentMetadata(documentText)
      
      expect(metadata).toHaveProperty('title')
      expect(metadata).toHaveProperty('parties')
      expect(metadata).toHaveProperty('dates')
      expect(metadata).toHaveProperty('amounts')
      expect(metadata.parties).toHaveLength(0)
      expect(metadata.dates).toHaveLength(0)
      expect(metadata.amounts).toHaveLength(0)
    })
  })
})