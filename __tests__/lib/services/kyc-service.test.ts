// Mock the supabase module
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}))

import { kycService } from '../../../lib/services/kyc'

describe('KYCService', () => {
  const { supabase } = require('../../../lib/supabase')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('startKYCWorkflow', () => {
    it('should start KYC workflow successfully', async () => {
      const mockKYCData = {
        id: 'kyc-123',
        user_id: 'user-123',
        verification_status: 'pending'
      }

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockKYCData,
        error: null
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      supabase.from.mockReturnValue({ insert: mockInsert })

      const workflowData = {
        userId: 'user-123',
        documentId: 'doc-123',
        documentType: 'national_id',
        country: 'Namibia'
      }

      const result = await kycService.startKYCWorkflow(workflowData)
      
      expect(result.success).toBe(true)
      expect(result.kycData).toEqual(mockKYCData)
      expect(supabase.from).toHaveBeenCalledWith('kyc_data')
    })

    it('should handle KYC workflow start errors', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      supabase.from.mockReturnValue({ insert: mockInsert })

      const workflowData = {
        userId: 'user-123',
        documentId: 'doc-123',
        documentType: 'national_id'
      }

      const result = await kycService.startKYCWorkflow(workflowData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('getUserKYCData', () => {
    it('should fetch user KYC data successfully', async () => {
      const mockKYCData = {
        id: 'kyc-123',
        user_id: 'user-123',
        verification_status: 'verified'
      }

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockKYCData,
        error: null
      })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await kycService.getUserKYCData('user-123')
      
      expect(result.success).toBe(true)
      expect(result.kycData).toEqual(mockKYCData)
    })

    it('should handle fetch errors', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'User not found' }
      })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await kycService.getUserKYCData('user-123')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })
  })
})