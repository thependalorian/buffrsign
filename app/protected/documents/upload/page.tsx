/**
 * Document Upload Page
 * 
 * Purpose: Upload and prepare documents for digital signatures
 * Location: /app/protected/documents/upload/page.tsx
 * Features: Drag & drop upload, AI analysis, compliance checking
 */

import { Upload, FileText, Shield, Zap, CheckCircle, AlertCircle, Users } from "lucide-react";

export default function DocumentUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
          <p className="text-gray-600">Upload your document for AI-powered analysis and digital signatures</p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Drag and drop files here</h3>
          <p className="text-gray-600 mb-6">or click to browse files</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium">
            Browse Files
          </button>
          
          <div className="mt-8 text-sm text-gray-500 space-y-2">
            <p>Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
            <p>Maximum file size: 100MB</p>
            <div className="flex items-center justify-center space-x-6 mt-4 text-blue-600">
              <span className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Encrypted Upload</span>
              </span>
              <span className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>AI Analysis</span>
              </span>
              <span className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>ETA 2019 Compliant</span>
              </span>
            </div>
          </div>
        </div>

        {/* Upload Progress (Hidden by default) */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hidden">
          <h3 className="font-medium text-gray-900 mb-4">Uploading Document...</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">45% complete • 2.4 MB of 5.3 MB</p>
        </div>

        {/* AI Analysis Results */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">🤖 AI Document Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Detected Fields</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Signature Fields</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">3 detected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Date Fields</span>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">2 detected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Form Fields</span>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">5 detected</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Compliance Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">ETA 2019</span>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Compliant</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">CRAN</span>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Accredited</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium">Legal Review</span>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Recommended</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Details Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Document Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                placeholder="e.g., Employment Contract - John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select Type</option>
                <option>Employment Contract</option>
                <option>Non-Disclosure Agreement</option>
                <option>Service Agreement</option>
                <option>Lease Agreement</option>
                <option>Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of the document..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Signers Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Signers</h2>
          <div className="space-y-4">
            {/* Primary Signer */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Primary Signer</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Required</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="email"
                  placeholder="Email address"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Full name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Signature Order</option>
                  <option>1st</option>
                  <option>2nd</option>
                  <option>3rd</option>
                </select>
              </div>
            </div>
            
            {/* Additional Signers */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Additional Signers</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Add Signer</span>
                </button>
              </div>
              <p className="text-sm text-gray-600">No additional signers added yet</p>
            </div>
          </div>
        </div>

        {/* AI Template Suggestions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">🤖 AI Template Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Employment Contract Template</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Standard employment agreement with ETA 2019 compliance</p>
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">ETA 2019</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">AI Generated</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 mb-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">NDA Template</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Non-disclosure agreement for business partnerships</p>
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">ETA 2019</span>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Legal Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Save as Draft
          </button>
          
          <div className="flex space-x-3">
            <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Continue to Signing
            </button>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a placeholder page for the document upload system. 
            The actual implementation will include real-time file processing, AI-powered field 
            detection, comprehensive compliance validation, and advanced signature workflow setup.
          </p>
        </div>
      </div>
    </div>
  );
}
