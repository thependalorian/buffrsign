/**
 * Admin Compliance Monitoring Page
 * 
 * Purpose: Comprehensive compliance oversight and monitoring for BuffrSign administrators
 * Location: /app/protected/admin/compliance/page.tsx
 * Features: Compliance monitoring, audit trails, regulatory reporting, risk assessment
 */

export default function ProtectedAdminCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Compliance Monitoring</h1>
          <p className="text-gray-600">Monitor and manage compliance across the BuffrSign platform</p>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Overall Compliance</h3>
            <p className="text-2xl font-bold text-green-600">98.7%</p>
            <p className="text-xs text-gray-500">ETA 2019 compliant</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Violations</h3>
            <p className="text-2xl font-bold text-red-600">3</p>
            <p className="text-xs text-gray-500">Require attention</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Audit Trails</h3>
            <p className="text-2xl font-bold text-blue-600">100%</p>
            <p className="text-xs text-gray-500">Complete coverage</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Next Review</h3>
            <p className="text-2xl font-bold text-yellow-600">7 days</p>
            <p className="text-xs text-gray-500">Scheduled audit</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Compliance Actions</h2>
              <p className="text-sm text-gray-600">Common compliance management tasks</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                Run Compliance Check
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                Generate Report
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg" disabled>
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* ETA 2019 Compliance Dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">ETA 2019 Compliance Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Compliance Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Digital Signatures</span>
                    <span className="text-sm text-gray-600">99.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '99.2%'}}></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Compliant</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Audit Trails</span>
                    <span className="text-sm text-gray-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Compliant</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Timestamp Verification</span>
                    <span className="text-sm text-gray-600">98.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '98.7%'}}></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Compliant</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Key Management</span>
                    <span className="text-sm text-gray-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Compliant</p>
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

        {/* Compliance Violations */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Active Compliance Violations</h2>
          <div className="space-y-4">
            {/* Violation 1 */}
            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-red-900">Document Signature Verification Failed</h3>
                  <p className="text-sm text-red-700">Document ID: DOC-2024-001 • User: john.smith@example.com</p>
                </div>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  High Priority
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-red-900">Issue Type</p>
                  <p className="text-sm text-red-700">Digital signature validation failed</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-red-900">Detected</p>
                  <p className="text-sm text-red-700">2 hours ago</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-red-900">ETA 2019 Impact</p>
                  <p className="text-sm text-red-700">Signature non-compliance</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-red-900 mb-2">Description:</p>
                <p className="text-sm text-red-700">
                  The digital signature on document DOC-2024-001 failed cryptographic validation. 
                  This violates ETA 2019 requirements for signature integrity and non-repudiation.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-red-700">Status: Open</span>
                  <span className="text-sm text-red-700">Assigned to: Compliance Team</span>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Investigate
                  </button>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Escalate
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Resolve
                  </button>
                </div>
              </div>
            </div>
            
            {/* Violation 2 */}
            <div className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-yellow-900">KYC Verification Overdue</h3>
                  <p className="text-sm text-yellow-700">User: jane.doe@example.com • SME Account</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Medium Priority
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-yellow-900">Issue Type</p>
                  <p className="text-sm text-yellow-700">KYC verification timeout</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-yellow-900">Detected</p>
                  <p className="text-sm text-yellow-700">1 day ago</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-yellow-900">ETA 2019 Impact</p>
                  <p className="text-sm text-yellow-700">User verification required</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">Description:</p>
                <p className="text-sm text-yellow-700">
                  KYC verification for SME user jane.doe@example.com has exceeded the 30-day limit. 
                  This may impact compliance with anti-money laundering regulations.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-yellow-700">Status: In Progress</span>
                  <span className="text-sm text-yellow-700">Assigned to: Admin Team</span>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Contact User
                  </button>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Extend Deadline
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Complete KYC
                  </button>
                </div>
              </div>
            </div>
            
            {/* Violation 3 */}
            <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Audit Log Incomplete</h3>
                  <p className="text-sm text-blue-700">System: Document Processing Service</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Low Priority
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-blue-900">Issue Type</p>
                  <p className="text-sm text-blue-700">Audit trail gap</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-blue-900">Detected</p>
                  <p className="text-sm text-blue-700">3 days ago</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-blue-900">ETA 2019 Impact</p>
                  <p className="text-sm text-blue-700">Audit trail requirement</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Description:</p>
                <p className="text-sm text-blue-700">
                  A 2-hour gap was detected in the audit log for the document processing service. 
                  This may impact compliance with ETA 2019 audit trail requirements.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-blue-700">Status: Under Investigation</span>
                  <span className="text-sm text-blue-700">Assigned to: IT Team</span>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Investigate
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Restore Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Reports */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Compliance Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Recent Reports</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Monthly Compliance Report</h4>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Generated
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">January 2024 compliance overview</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Generated: 2 days ago</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">ETA 2019 Audit Report</h4>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Generated
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Q4 2023 ETA 2019 compliance audit</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Generated: 1 week ago</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">KYC Compliance Report</h4>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Annual KYC and AML compliance review</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Due: 2 weeks</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Report Generation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>Monthly Compliance Report</option>
                    <option>ETA 2019 Audit Report</option>
                    <option>KYC Compliance Report</option>
                    <option>Security Audit Report</option>
                    <option>Custom Report</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last 6 months</option>
                    <option>Last year</option>
                    <option>Custom range</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                    <option>JSON</option>
                  </select>
                </div>
                
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Risk Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Risk Categories</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Operational Risk</span>
                  <span className="text-sm text-green-700">Low (15/100)</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm font-medium text-yellow-900">Compliance Risk</span>
                  <span className="text-sm text-yellow-700">Medium (35/100)</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Security Risk</span>
                  <span className="text-sm text-blue-700">Low (20/100)</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Technology Risk</span>
                  <span className="text-sm text-green-700">Low (25/100)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Risk Trends</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Compliance Risk</span>
                    <span className="text-sm text-gray-600">+5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '35%'}}></div>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">Increasing trend</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Security Risk</span>
                    <span className="text-sm text-gray-600">-10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '20%'}}></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Decreasing trend</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Operational Risk</span>
                    <span className="text-sm text-gray-600">-5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Decreasing trend</p>
                </div>
              </div>
            </div>
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
                  <span className="text-sm text-blue-800">3 compliance violations detected in the last 24 hours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Compliance risk has increased by 5% this month</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">ETA 2019 compliance rate is above industry average</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Automated Compliance Monitoring</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI continuously monitors compliance status and alerts administrators to potential issues.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                  Configure Monitoring
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Predictive Risk Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI analyzes patterns to predict potential compliance risks before they occur.
                </p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                  View Predictions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a placeholder page for the admin compliance monitoring system. 
            The actual implementation will include comprehensive compliance oversight, 
            violation tracking, risk assessment, and AI-powered compliance assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
