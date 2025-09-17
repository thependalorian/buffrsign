/**
 * Templates Page
 * 
 * Purpose: AI-generated document templates for individuals and SMEs
 * Location: /app/protected/templates/page.tsx
 * Features: Template library, AI generation, customization
 */

import { FileText, Search, Filter, Edit, Copy, Star } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI Template Library</h1>
          <p className="text-gray-600">Professional templates generated with AI intelligence</p>
        </div>

        {/* Template Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Templates</h3>
            <p className="text-2xl font-bold">18</p>
            <p className="text-xs text-gray-500">Available templates</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">AI Generated</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-xs text-gray-500">This month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Most Used</h3>
            <p className="text-2xl font-bold text-green-600">5</p>
            <p className="text-xs text-gray-500">Employment contracts</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Custom</h3>
            <p className="text-2xl font-bold text-purple-600">6</p>
            <p className="text-xs text-gray-500">Your templates</p>
          </div>
        </div>

        {/* AI Template Generator */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">AI Template Generator</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generator Form */}
            <div className="space-y-6">
              <h3 className="font-medium text-lg">Create New Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Describe your document</label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Employment contract for software developers in Namibia"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                      <option>Technology</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                      <option>Education</option>
                      <option>Real Estate</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                      <option>Employment Contract</option>
                      <option>Service Agreement</option>
                      <option>NDA</option>
                      <option>Lease Agreement</option>
                      <option>Purchase Agreement</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Compliance</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                      <option>ETA 2019</option>
                      <option>CRAN</option>
                      <option>Both</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                      <option>Namibia</option>
                      <option>SADC</option>
                      <option>International</option>
                    </select>
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg" disabled>
                  🤖 Generate AI Template
                </button>
              </div>
            </div>
            
            {/* Generated Template Preview */}
            <div className="space-y-6">
              <h3 className="font-medium text-lg">Template Preview</h3>
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">Employment Contract - Software Developer</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✅ ETA 2019 Compliant</p>
                    <p>✅ CRAN Accredited</p>
                    <p>✅ Namibian Labor Law Compliant</p>
                    <p>✅ Industry Best Practices</p>
                    <p>✅ LlamaIndex AI Generated</p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Fields:</strong> Employee Name, Position, Salary, Start Date, 
                      Employee Signature, Employer Signature, Date
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                      Use Template
                    </button>
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                      Edit Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  disabled
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg" disabled>
                <option>All Categories</option>
                <option>Employment</option>
                <option>Business</option>
                <option>Legal</option>
                <option>Real Estate</option>
                <option>Other</option>
              </select>
              
              <select className="px-4 py-2 border border-gray-300 rounded-lg" disabled>
                <option>All Types</option>
                <option>AI Generated</option>
                <option>Custom</option>
                <option>Premium</option>
              </select>
              
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2" disabled>
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Available Templates</h2>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                Create Custom
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                Import
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Employment Contract Template */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">Employment Contract</h3>
              <p className="text-sm text-gray-600 mb-4">
                Standard employment agreement with customizable terms and conditions
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">AI Generated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">5 signature fields</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  Use Template
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Edit className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* NDA Template */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-green-600" />
                <div className="flex space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">Non-Disclosure Agreement</h3>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive NDA template for business confidentiality
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">AI Generated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">3 signature fields</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  Use Template
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Edit className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Service Agreement Template */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
                <div className="flex space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">Service Agreement</h3>
              <p className="text-sm text-gray-600 mb-4">
                Professional service contract template for consultants and freelancers
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">AI Generated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">4 signature fields</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  Use Template
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Edit className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Lease Agreement Template */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-orange-600" />
                <div className="flex space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">Lease Agreement</h3>
              <p className="text-sm text-gray-600 mb-4">
                Property lease template for residential and commercial properties
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">AI Generated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">2 signature fields</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  Use Template
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Edit className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Vendor Agreement Template */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-indigo-600" />
                <div className="flex space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-gray-300" />
                  <Star className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">Vendor Agreement</h3>
              <p className="text-sm text-gray-600 mb-4">
                Supplier and vendor contract template for business relationships
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">AI Generated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">3 signature fields</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  Use Template
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Edit className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Custom Template */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-gray-600" />
                <div className="flex space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">Custom Template</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your personalized template for specific business needs
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">Custom Made</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-xs text-gray-600">6 signature fields</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  Use Template
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Edit className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 text-gray-600 hover:text-gray-800" disabled>
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a placeholder page for the AI template generator system. 
            The actual implementation will include LlamaIndex-powered template generation, 
            automated compliance checking, and intelligent field detection for all document types.
          </p>
        </div>
      </div>
    </div>
  );
}
