/**
 * Workflows Page
 * 
 * Purpose: Signature workflow management for individuals and SMEs
 * Location: /app/protected/workflows/page.tsx
 * Features: Workflow creation, collaboration, progress tracking
 */

export default function ProtectedWorkflowsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Signature Workflows</h1>
          <p className="text-gray-600">Manage your document signing workflows and collaboration</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <p className="text-sm text-gray-600">Create new workflows or manage existing ones</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                New Workflow
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                Import Workflow
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Workflows</h3>
            <p className="text-2xl font-bold text-blue-600">8</p>
            <p className="text-xs text-gray-500">Currently in progress</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
            <p className="text-2xl font-bold text-green-600">12</p>
            <p className="text-xs text-gray-500">Workflows finished</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Signatures</h3>
            <p className="text-2xl font-bold text-yellow-600">23</p>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Collaborators</h3>
            <p className="text-2xl font-bold text-purple-600">15</p>
            <p className="text-xs text-gray-500">Active participants</p>
          </div>
        </div>

        {/* Active Workflows */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Active Workflows</h2>
          <div className="space-y-4">
            {/* Workflow Item 1 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Employment Contract - John Doe</h3>
                  <p className="text-sm text-gray-600">Employment Agreement • Created 2 hours ago</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Progress</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">60%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Signatures</p>
                  <p className="text-sm text-gray-600">2 of 3 completed</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Next Action</p>
                  <p className="text-sm text-gray-600">John Doe to sign</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">ETA: 2 days</span>
                  <span className="text-sm text-gray-600">Priority: Medium</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                    Send Reminder
                  </button>
                </div>
              </div>
            </div>
            
            {/* Workflow Item 2 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Service Agreement - ABC Corp</h3>
                  <p className="text-sm text-gray-600">Service Contract • Created 1 day ago</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Progress</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">25%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Signatures</p>
                  <p className="text-sm text-gray-600">1 of 4 completed</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Next Action</p>
                  <p className="text-sm text-gray-600">Legal review pending</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">ETA: 5 days</span>
                  <span className="text-sm text-gray-600">Priority: High</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                    Send Reminder
                  </button>
                </div>
              </div>
            </div>
            
            {/* Workflow Item 3 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">NDA Agreement - XYZ Ltd</h3>
                  <p className="text-sm text-gray-600">Non-Disclosure Agreement • Created 3 days ago</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Completed
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Progress</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">100%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Signatures</p>
                  <p className="text-sm text-gray-600">3 of 3 completed</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <p className="text-sm text-gray-600">All parties signed</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Completed: 1 day ago</span>
                  <span className="text-sm text-gray-600">Duration: 2 days</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Templates */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Workflow Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Template 1 */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="ml-3 font-medium">Employment Contract</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Standard employment agreement with multiple signature points</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">3 signatures • ETA 2019 compliant</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                  Use Template
                </button>
              </div>
            </div>
            
            {/* Template 2 */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="ml-3 font-medium">Service Agreement</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Professional service contract with approval workflow</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">4 signatures • Legal review</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                  Use Template
                </button>
              </div>
            </div>
            
            {/* Template 3 */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="ml-3 font-medium">NDA Agreement</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Non-disclosure agreement with confidentiality clauses</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">3 signatures • Confidential</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                  Use Template
                </button>
              </div>
            </div>
            
            {/* Template 4 */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="ml-3 font-medium">Lease Agreement</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Property lease agreement with tenant and landlord</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">2 signatures • Property</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                  Use Template
                </button>
              </div>
            </div>
            
            {/* Template 5 */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="ml-3 font-medium">Vendor Contract</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Vendor service contract with payment terms</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">2 signatures • Business</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                  Use Template
                </button>
              </div>
            </div>
            
            {/* Create Custom Template */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
              <div className="text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Create Custom Template</h3>
                <p className="text-sm text-gray-600 mt-1">Build your own workflow template</p>
                <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Workflow Assistant */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">🤖 AI Workflow Assistant</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Smart Workflow Suggestions</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Optimize signature order for faster completion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Add approval steps for compliance requirements</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Automate reminder notifications</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Workflow Optimization</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI analyzes your workflows and suggests improvements for efficiency and compliance.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                  Optimize Workflows
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Template Generation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate custom workflow templates based on your document types and requirements.
                </p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                  Generate Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a placeholder page for the workflow management system. 
            The actual implementation will include real-time collaboration, automated workflows, 
            and AI-powered optimization for individual and SME users.
          </p>
        </div>
      </div>
    </div>
  );
}
