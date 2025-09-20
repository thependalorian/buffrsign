import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DocumentList from '../../components/DocumentList'

// Mock the _document service
jest.mock('../../lib/services/_document-service', () => ({
  documentService: {
    getUserDocuments: jest.fn(),
    getDocumentStats: jest.fn(),
    deleteDocument: jest.fn(),
    getDocumentDownloadUrl: jest.fn(),
  }
}))

const mockDocuments = [
  {
    id: '1',
    title: 'Contract Agreement',
    file_path: '/documents/contract.pdf',
    file_size: 1024000,
    mime_type: 'application/pdf',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: '_user-1'
  },
  {
    id: '2',
    title: 'Invoice Document',
    file_path: '/documents/invoice.pdf',
    file_size: 512000,
    mime_type: 'application/pdf',
    status: 'pending',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    created_by: '_user-1'
  }
]

describe('DocumentList Component', () => {
  // Get the mocked service
  const { documentService } = require('../../lib/services/_document-service')

  beforeEach(() => {
    jest.clearAllMocks()
    documentService.getUserDocuments.mockResolvedValue({
      success: true,
      documents: mockDocuments
    })
    documentService.getDocumentStats.mockResolvedValue({
      success: true,
      stats: {
        total: 2,
        pending: 1,
        completed: 1,
        thisMonth: 2,
        aiInsights: 1
      }
    })
  })

  it('should render component without crashing', async () => {
    render(
      <DocumentList userId="_user-123" />
    )

    // Should show loading initially
    expect(screen.getByText(/loading documents/i)).toBeInTheDocument()
    
    // Wait for documents to load
    await waitFor(() => {
      expect(documentService.getUserDocuments).toHaveBeenCalledWith('_user-123', expect.any(Object))
    })
  })

  it('should handle service errors gracefully', async () => {
    documentService.getUserDocuments.mockRejectedValue(new Error('Network error'))

    render(
      <DocumentList userId="_user-123" />
    )

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch documents/i)).toBeInTheDocument()
    })
  })

  it('should call _document service on mount', async () => {
    render(
      <DocumentList userId="_user-123" />
    )

    await waitFor(() => {
      expect(documentService.getUserDocuments).toHaveBeenCalledWith('_user-123', expect.any(Object))
      expect(documentService.getDocumentStats).toHaveBeenCalledWith('_user-123')
    })
  })
})