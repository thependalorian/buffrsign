/**
 * Compliance Center Page
 * 
 * Purpose: Legal compliance management for individuals and SMEs
 * Location: /app/protected/compliance/page.tsx
 * Features: ETA 2019 compliance, CRAN accreditation, audit trails
 */

export default function ProtectedCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Compliance Center</h1>
          <p className="text-gray-600">Ensure your digital signatures meet legal and regulatory requirements</p>
        </div>

        {/* Compliance Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">ETA 2019</h3>
                <p className="text-sm text-green-600">Compliant</p>
                <p className="text-xs text-gray-500">Electronic Transactions Act</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">CRAN</h3>
                <p className="text-sm text-blue-600">Accredited</p>
                <p className="text-xs text-gray-500">Communications Authority</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">KYC Status</h3>
                <p className="text-sm text-yellow-600">Pending Review</p>
                <p className="text-xs text-gray-500">Identity verification</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Compliance Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">98%</span>
              </div>
              <h3 className="font-medium text-gray-900">Overall Compliance</h3>
              <p className="text-sm text-gray-600">All requirements met</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">156</span>
              </div>
              <h3 className="font-medium text-gray-900">Documents Signed</h3>
              <p className="text-sm text-gray-600">This month</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-600">0</span>
              </div>
              <h3 className="font-medium text-gray-900">Compliance Issues</h3>
              <p className="text-sm text-gray-600">No violations</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-yellow-600">7</span>
              </div>
              <h3 className="font-medium text-gray-900">Days Until Review</h3>
              <p className="text-sm text-gray-600">Next audit cycle</p>
            </div>
          </div>
        </div>

        {/* ETA 2019 Compliance Details */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">ETA 2019 Compliance</h2>
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Digital Signature Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Unique identification of signer</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Non-repudiation of signature</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Integrity of signed document</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Timestamp verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Audit trail maintenance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Secure key management</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Compliance Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-blue-900">PKI Infrastructure</h4>
                  <p className="text-xs text-blue-700">Public Key Infrastructure</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-green-900">Audit Logging</h4>
                  <p className="text-xs text-green-700">Complete activity trail</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-purple-900">Encryption</h4>
                  <p className="text-xs text-purple-700">AES-256 encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CRAN Accreditation */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">CRAN Accreditation</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-green-900">Accreditation Status: Active</h3>
                  <p className="text-sm text-green-700">Certificate Number: CRAN-2024-001</p>
                  <p className="text-xs text-green-600">Issued: January 15, 2024 • Expires: January 15, 2026</p>
                </div>
              </div>
              <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                View Certificate
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Accreditation Requirements</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Technical infrastructure compliance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Security audit completion</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Staff certification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Regular compliance reporting</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Annual security review (Dec 2024)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Staff training renewal (Mar 2025)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Infrastructure upgrade (Jun 2025)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Renewal application (Oct 2025)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Workflows */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">SADC-Adaptive KYC Workflows</h2>
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-medium text-yellow-900 mb-3">Current KYC Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-yellow-600">1</span>
                  </div>
                  <p className="text-sm font-medium text-yellow-900">Basic Verification</p>
                  <p className="text-xs text-yellow-700">Completed</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-yellow-600">2</span>
                  </div>
                  <p className="text-sm font-medium text-yellow-900">Document Verification</p>
                  <p className="text-xs text-yellow-700">In Progress</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-gray-600">3</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Final Approval</p>
                  <p className="text-xs text-gray-700">Pending</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Required Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">National ID / Passport</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Uploaded</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Proof of Address</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Business Registration</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Not Required</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Tax Clearance</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Not Required</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Verification Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Document Review</span>
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Identity Verification</span>
                      <span className="text-sm text-gray-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Risk Assessment</span>
                      <span className="text-sm text-gray-600">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{width: '0%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Compliance Audit Trail</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Document signed: Employment Contract</p>
                <p className="text-xs text-gray-600">User: john.doe@example.com • Timestamp: 2024-01-15 14:30:25 UTC</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">KYC document uploaded: Proof of Address</p>
                <p className="text-xs text-gray-600">User: jane.smith@example.com • Timestamp: 2024-01-15 13:15:10 UTC</p>
              </div>
              <span className="text-xs text-gray-500">3 hours ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Compliance check: ETA 2019 validation</p>
                <p className="text-xs text-gray-600">System: Automated • Timestamp: 2024-01-15 12:00:00 UTC</p>
              </div>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Security alert: Multiple login attempts</p>
                <p className="text-xs text-gray-600">User: admin@example.com • Timestamp: 2024-01-15 11:45:30 UTC</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">CRAN compliance report generated</p>
                <p className="text-xs text-gray-600">System: Automated • Timestamp: 2024-01-15 00:00:00 UTC</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
              View Full Audit Trail
            </button>
          </div>
        </div>

        {/* AI Compliance Assistant */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">🤖 AI Compliance Assistant</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Smart Compliance Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Your documents meet 98% of ETA 2019 requirements</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">KYC verification will complete in 2-3 business days</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Next CRAN review scheduled for December 2024</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Compliance Monitoring</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI continuously monitors your compliance status and alerts you to any issues.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                  View Report
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Risk Assessment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get AI-powered risk analysis and recommendations for compliance improvements.
                </p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                  Assess Risk
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a placeholder page for the compliance center. 
            The actual implementation will include real-time compliance monitoring, 
            automated reporting, and AI-powered compliance assistance for individual and SME users.
          </p>
        </div>
      </div>
    </div>
  );
}
