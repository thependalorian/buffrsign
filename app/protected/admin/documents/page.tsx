/**
 * Admin Document Management Page
 * 
 * Purpose: Comprehensive document oversight and management for BuffrSign administrators
 * Location: /app/protected/admin/documents/page.tsx
 * Features: Document monitoring, signature verification, compliance oversight, analytics
 */

export default function ProtectedAdminDocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Monitor and manage all documents, signatures, and compliance across the platform</p>
        </div>

        {/* Document Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
            <p className="text-2xl font-bold text-blue-600">2,847</p>
            <p className="text-xs text-gray-500">+18% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Signatures</h3>
            <p className="text-2xl font-bold text-yellow-600">156</p>
            <p className="text-xs text-gray-500">Awaiting completion</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
            <p className="text-2xl font-bold text-green-600">89</p>
            <p className="text-xs text-gray-500">Successfully signed</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Compliance Rate</h3>
            <p className="text-2xl font-bold text-purple-600">98.7%</p>
            <p className="text-xs text-gray-500">ETA 2019 compliant</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <p className="text-sm text-gray-600">Common document management tasks</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                View All Documents
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                Compliance Report
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg" disabled>
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Document Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Document Overview</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All Document Types</option>
                <option>Contracts</option>
                <option>Agreements</option>
                <option>Forms</option>
                <option>Certificates</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All Statuses</option>
                <option>Draft</option>
                <option>Pending</option>
                <option>Signed</option>
                <option>Completed</option>
                <option>Expired</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All Users</option>
                <option>Individual</option>
                <option>SME</option>
                <option>Admin</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All Compliance</option>
                <option>ETA 2019 Compliant</option>
                <option>Pending Review</option>
                <option>Non-Compliant</option>
              </select>
            </div>
            <div>
              <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200" disabled>
                Apply Filters
              </button>
            </div>
          </div>

          {/* Document List */}
          <div className="space-y-4">
            {/* Document 1 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Employment Contract - John Smith</h3>
                    <p className="text-sm text-gray-600">Contract • Created 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    ETA 2019 Compliant
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    In Progress
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Owner</p>
                  <p className="text-sm text-gray-600">john.smith@example.com</p>
                  <p className="text-xs text-gray-500">Individual User</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Signatures</p>
                  <p className="text-sm text-gray-600">2 of 3 completed</p>
                  <p className="text-xs text-gray-500">66% complete</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Compliance</p>
                  <p className="text-sm text-gray-600">100% compliant</p>
                  <p className="text-xs text-green-600">All checks passed</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Activity</p>
                  <p className="text-sm text-gray-600">1 hour ago</p>
                  <p className="text-xs text-gray-500">Signature added</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">ETA: 1 day</span>
                  <span className="text-sm text-gray-600">Size: 2.3 MB</span>
                  <span className="text-sm text-gray-600">Pages: 8</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    View Document
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                    Audit Trail
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 text-sm font-medium" disabled>
                    Download
                  </button>
                </div>
              </div>
            </div>
            
            {/* Document 2 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Service Agreement - ABC Corp</h3>
                    <p className="text-sm text-gray-600">Agreement • Created 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Pending Review
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Draft
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Owner</p>
                  <p className="text-sm text-gray-600">admin@abccorp.com</p>
                  <p className="text-xs text-gray-500">SME User</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Signatures</p>
                  <p className="text-sm text-gray-600">0 of 4 completed</p>
                  <p className="text-xs text-gray-500">0% complete</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Compliance</p>
                  <p className="text-sm text-gray-600">Pending review</p>
                  <p className="text-xs text-yellow-600">Needs verification</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Activity</p>
                  <p className="text-sm text-gray-600">1 day ago</p>
                  <p className="text-xs text-gray-500">Document created</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">ETA: 5 days</span>
                  <span className="text-sm text-gray-600">Size: 1.8 MB</span>
                  <span className="text-sm text-gray-600">Pages: 12</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    View Document
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium" disabled>
                    Review Compliance
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                    Approve
                  </button>
                </div>
              </div>
            </div>
            
            {/* Document 3 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">NDA Agreement - XYZ Ltd</h3>
                    <p className="text-sm text-gray-600">Agreement • Completed 2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    ETA 2019 Compliant
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Owner</p>
                  <p className="text-sm text-gray-600">admin@xyz.com</p>
                  <p className="text-xs text-gray-500">SME User</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Signatures</p>
                  <p className="text-sm text-gray-600">3 of 3 completed</p>
                  <p className="text-xs text-green-600">100% complete</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Compliance</p>
                  <p className="text-sm text-gray-600">100% compliant</p>
                  <p className="text-xs text-green-600">All checks passed</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Completed</p>
                  <p className="text-sm text-gray-600">2 days ago</p>
                  <p className="text-xs text-gray-500">All parties signed</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Duration: 3 days</span>
                  <span className="text-sm text-gray-600">Size: 1.2 MB</span>
                  <span className="text-sm text-gray-600">Pages: 6</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    View Document
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                    Audit Trail
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 text-sm font-medium" disabled>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">2,847</span> documents
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50" disabled>
                Previous
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Compliance Monitoring */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Compliance Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">ETA 2019 Compliance Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Digital Signatures</span>
                    <span className="text-sm text-gray-600">99.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '99.2%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Audit Trails</span>
                    <span className="text-sm text-gray-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Timestamp Verification</span>
                    <span className="text-sm text-gray-600">98.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '98.7%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Key Management</span>
                    <span className="text-sm text-gray-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Compliance Issues</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm font-medium text-red-900">Critical Issues</span>
                  <span className="text-sm text-red-700">0</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm font-medium text-yellow-900">Warning Issues</span>
                  <span className="text-sm text-yellow-700">3</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Info Issues</span>
                  <span className="text-sm text-blue-700">12</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Resolved Issues</span>
                  <span className="text-sm text-green-700">156</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Analytics */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Document Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Document Volume Trends</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">This Week</span>
                    <span className="text-sm text-gray-600">+15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">This Month</span>
                    <span className="text-sm text-gray-600">+18%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">This Quarter</span>
                    <span className="text-sm text-gray-600">+22%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Document Types Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Employment Contracts</span>
                  <span className="text-sm text-blue-700">35%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Service Agreements</span>
                  <span className="text-sm text-green-700">28%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm font-medium text-yellow-900">NDA Agreements</span>
                  <span className="text-sm text-yellow-700">18%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Other Documents</span>
                  <span className="text-sm text-purple-700">19%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Document Assistant */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">🤖 AI Document Assistant</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Smart Document Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">3 documents have compliance warnings that need attention</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Document processing time has improved by 23% this month</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">SME users are 40% more likely to complete multi-party documents</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Automated Compliance Checking</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI automatically scans documents for compliance issues and flags potential problems.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                  Run Compliance Check
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Document Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get insights into document patterns, user behavior, and platform usage trends.
                </p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a placeholder page for the admin document management system. 
            The actual implementation will include comprehensive document oversight, 
            compliance monitoring, and AI-powered document analytics for managing all platform documents.
          </p>
        </div>
      </div>
    </div>
  );
}
