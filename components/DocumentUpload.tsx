// BuffrSign Platform - Document Upload Component
// Handles document upload with AI analysis and KYC workflow integration

'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2, Brain } from 'lucide-react';
import { documentService, DocumentUploadData } from '@/lib/services/document-service';
import { kycService } from '@/lib/services/kyc';
// import { useDocumentProcessing, createDocumentProcessingOptions } from '@/lib/ai/ai-integration';

// ============================================================================
// TYPES
// ============================================================================

interface DocumentUploadProps {
  userId: string;
  onUploadSuccess?: (documentId: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  documentId: string | null;
  aiProcessing: boolean;
  aiResults: Record<string, unknown> | null;
}

// ============================================================================
// DOCUMENT UPLOAD COMPONENT
// ============================================================================

export default function DocumentUpload({
  userId,
  onUploadSuccess,
  onUploadError,
  className = ''
}: DocumentUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
    documentId: null,
    aiProcessing: false,
    aiResults: null
  });

  const [uploadData, setUploadData] = useState<DocumentUploadData>({
    file: null,
    title: '',
    documentType: 'other',
    industry: '',
    jurisdiction: '',
    isKycDocument: false,
    kycDocumentType: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // FILE HANDLING
  // ============================================================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please select a valid document file (PDF, JPG, PNG, TIFF, DOC, DOCX)'
      }));
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        error: 'File size must be less than 10MB'
      }));
      return;
    }

    setUploadData(prev => ({
      ...prev,
      file,
      title: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
    }));

    setUploadState(prev => ({
      ...prev,
      error: null,
      success: false
    }));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(syntheticEvent);
    }
  };

  // ============================================================================
  // UPLOAD PROCESSING
  // ============================================================================

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.title.trim()) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please select a file and enter a title'
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      success: false
    }));

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      // Upload document
      const result = await documentService.uploadDocument(userId, uploadData);

      clearInterval(progressInterval);

      if (result.success && result.document) {
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 100,
          success: true,
          documentId: result.document!.id
        }));

        // Start AI processing
        setUploadState(prev => ({
          ...prev,
          aiProcessing: true
        }));

        // Start KYC workflow if it's a KYC document
        if (uploadData.isKycDocument && result.document.id) {
          await kycService.startKYCWorkflow({
            userId,
            documentId: result.document.id,
            documentType: uploadData.kycDocumentType || 'identity',
            country: uploadData.jurisdiction
          });
        }

        onUploadSuccess?.(result.document.id);
      } else {
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          error: result.error || 'Upload failed'
        }));
        onUploadError?.(result.error || 'Upload failed');
      }
    } catch {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: 'Upload failed'
      }));
      onUploadError?.('Upload failed');
    }
  };

  const resetUpload = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      success: false,
      documentId: null,
      aiProcessing: false,
      aiResults: null
    });
    setUploadData({
      file: null,
      title: '',
      documentType: 'other',
      industry: '',
      jurisdiction: '',
      isKycDocument: false,
      kycDocumentType: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            uploadState.isUploading
              ? 'border-blue-300 bg-blue-50'
              : uploadState.error
              ? 'border-red-300 bg-red-50'
              : uploadState.success
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx"
            className="hidden"
            disabled={uploadState.isUploading}
          />

          {uploadState.isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <div>
                <p className="text-lg font-medium text-blue-900">Uploading...</p>
                <p className="text-sm text-blue-700">Processing your document</p>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-600">{uploadState.progress}%</p>
            </div>
          ) : uploadState.success ? (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <div>
                <p className="text-lg font-medium text-green-900">Upload Successful!</p>
                <p className="text-sm text-green-700">
                  {uploadState.aiProcessing 
                    ? 'AI analysis in progress...' 
                    : 'Document uploaded and processed'}
                </p>
              </div>
              
              {uploadState.aiProcessing && (
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Brain className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">AI Analysis</span>
                </div>
              )}
              
              <button
                onClick={resetUpload}
                className="btn btn-outline btn-sm"
              >
                Upload Another Document
              </button>
            </div>
          ) : uploadState.error ? (
            <div className="space-y-4">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
              <div>
                <p className="text-lg font-medium text-red-900">Upload Failed</p>
                <p className="text-sm text-red-700">{uploadState.error}</p>
              </div>
              <button
                onClick={resetUpload}
                className="btn btn-outline btn-sm"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploadData.file ? 'File Selected' : 'Drop your document here'}
                </p>
                <p className="text-sm text-gray-600">
                  {uploadData.file
                    ? uploadData.file.name
                    : 'or click to browse files'}
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary btn-sm"
                disabled={uploadState.isUploading}
              >
                {uploadData.file ? 'Change File' : 'Select File'}
              </button>
            </div>
          )}
        </div>

        {/* Document Details Form */}
        {uploadData.file && !uploadState.isUploading && !uploadState.success && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                className="input input-bordered w-full"
                placeholder="Enter document title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={uploadData.documentType}
                  onChange={(e) => setUploadData(prev => ({ ...prev, documentType: e.target.value }))}
                  className="select select-bordered w-full"
                >
                  <option value="other">Other</option>
                  <option value="identity">Identity Document</option>
                  <option value="financial">Financial Document</option>
                  <option value="legal">Legal Document</option>
                  <option value="contract">Contract</option>
                  <option value="agreement">Agreement</option>
                  <option value="invoice">Invoice</option>
                  <option value="receipt">Receipt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={uploadData.industry}
                  onChange={(e) => setUploadData(prev => ({ ...prev, industry: e.target.value }))}
                  className="input input-bordered w-full"
                  placeholder="e.g., Banking, Healthcare"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jurisdiction
              </label>
              <input
                type="text"
                value={uploadData.jurisdiction}
                onChange={(e) => setUploadData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                className="input input-bordered w-full"
                placeholder="e.g., Namibia, South Africa"
              />
            </div>

            {/* KYC Document Options */}
            <div className="border-t pt-4">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">This is a KYC document</span>
                  <input
                    type="checkbox"
                    checked={uploadData.isKycDocument}
                    onChange={(e) => setUploadData(prev => ({ ...prev, isKycDocument: e.target.checked }))}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>

              {uploadData.isKycDocument && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KYC Document Type
                  </label>
                  <select
                    value={uploadData.kycDocumentType}
                    onChange={(e) => setUploadData(prev => ({ ...prev, kycDocumentType: e.target.value }))}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select KYC document type</option>
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver&apos;s License</option>
                    <option value="birth_certificate">Birth Certificate</option>
                    <option value="proof_of_address">Proof of Address</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="utility_bill">Utility Bill</option>
                  </select>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={resetUpload}
                className="btn btn-outline"
                disabled={uploadState.isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="btn btn-primary"
                disabled={uploadState.isUploading || !uploadData.title.trim()}
              >
                {uploadState.isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
