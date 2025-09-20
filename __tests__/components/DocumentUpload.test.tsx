import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DocumentUpload from '../../components/DocumentUpload'

// Mock the _document service
jest.mock('../../lib/services/_document-service', () => ({
  documentService: {
    uploadDocument: jest.fn(),
    getDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
  }
}))

// Mock the KYC service
jest.mock('../../lib/services/kyc', () => ({
  kycService: {
    startKYCWorkflow: jest.fn(),
    getUserKYCData: jest.fn(),
  }
}))

describe('DocumentUpload Component', () => {
  const mockOnUploadSuccess = jest.fn()
  const mockOnUploadError = jest.fn()
  
  // Get the mocked service
  const { documentService } = require('../../lib/services/_document-service')

  beforeEach(() => {
    jest.clearAllMocks()
    documentService.uploadDocument.mockResolvedValue({
      success: true,
      _document: { id: 'doc-123', name: 'test.pdf' }
    })
  })

  it('should render upload component', () => {
    render(
      <DocumentUpload
        userId="_user-123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    )

    expect(screen.getByText(/drop your _document here/i)).toBeInTheDocument()
    expect(screen.getByText(/select file/i)).toBeInTheDocument()
  })

  it('should handle file selection', async () => {
    render(
      <DocumentUpload
        userId="_user-123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    )

    const fileInput = screen.getByRole('button', { name: /select file/i })
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.click(fileInput)
    
    // Simulate file input change
    const hiddenInput = _document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    })
    fireEvent.change(hiddenInput)

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
  })

  it('should show file validation errors', async () => {
    render(
      <DocumentUpload
        userId="_user-123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    )

    const fileInput = screen.getByRole('button', { name: /select file/i })
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })

    fireEvent.click(fileInput)
    
    const hiddenInput = _document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(hiddenInput, 'files', {
      value: [invalidFile],
      writable: false,
    })
    fireEvent.change(hiddenInput)

    await waitFor(() => {
      expect(screen.getByText(/please select a valid _document file/i)).toBeInTheDocument()
    })
  })

  it('should handle drag and drop', async () => {
    render(
      <DocumentUpload
        userId="_user-123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    )

    const dropZone = screen.getByText(/drop your _document here/i).closest('div')
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.dragOver(dropZone!)
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [file]
      }
    })

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
  })

  it('should show upload progress', async () => {
    render(
      <DocumentUpload
        userId="_user-123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    )

    const fileInput = screen.getByRole('button', { name: /select file/i })
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.click(fileInput)
    
    const hiddenInput = _document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    })
    fireEvent.change(hiddenInput)

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    // Fill in required title
    const titleInput = screen.getByPlaceholderText(/enter _document title/i)
    fireEvent.change(titleInput, { target: { value: 'Test Document' } })

    const uploadButton = screen.getByRole('button', { name: /upload _document/i })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument()
    })
  })

  it('should require _document title', async () => {
    render(
      <DocumentUpload
        userId="_user-123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    )

    const fileInput = screen.getByRole('button', { name: /select file/i })
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.click(fileInput)
    
    const hiddenInput = _document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    })
    fireEvent.change(hiddenInput)

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    // Clear the auto-populated title
    const titleInput = screen.getByPlaceholderText(/enter _document title/i)
    fireEvent.change(titleInput, { target: { value: '' } })

    // Now the upload button should be disabled
    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /upload _document/i })
      expect(uploadButton).toBeDisabled()
    })
  })

  it('should handle upload success', async () => {
    render(
      <DocumentUpload
        userId="_user-123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    )

    const fileInput = screen.getByRole('button', { name: /select file/i })
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.click(fileInput)
    
    const hiddenInput = _document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    })
    fireEvent.change(hiddenInput)

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    const titleInput = screen.getByPlaceholderText(/enter _document title/i)
    fireEvent.change(titleInput, { target: { value: 'Test Document' } })

    const uploadButton = screen.getByRole('button', { name: /upload _document/i })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText(/upload successful/i)).toBeInTheDocument()
      expect(mockOnUploadSuccess).toHaveBeenCalledWith('doc-123')
    })
  })
})