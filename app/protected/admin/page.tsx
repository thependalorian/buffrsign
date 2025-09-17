/**
 * Admin Dashboard Page
 * 
 * Purpose: Administrative dashboard for managing individual and SME users
 * Location: /app/protected/admin/page.tsx
 * Features: User management, platform monitoring, compliance oversight
 */

export default function ProtectedAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage BuffrSign platform operations and user accounts</p>
        </div>

        {/* Admin Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-blue-600">1,247</p>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
            <p className="text-2xl font-bold text-green-600">89</p>
            <p className="text-xs text-gray-500">Currently online</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Documents Today</h3>
            <p className="text-2xl font-bold text-purple-600">156</p>
            <p className="text-xs text-gray-500">Processed today</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Support Tickets</h3>
            <p className="text-2xl font-bold text-yellow-600">23</p>
            <p className="text-xs text-gray-500">Open tickets</p>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <p className="text-sm text-gray-600">Common administrative tasks</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                Add User
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                Generate Report
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg" disabled>
                System Health
              </button>
            </div>
          </div>
        </div>

        {/* User Management Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">User Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Individual Users</h3>
                  <p className="text-2xl font-bold text-blue-600">892</p>
                  <p className="text-sm text-gray-600">Personal accounts</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active</span>
                  <span className="text-green-600">856</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="text-yellow-600">23</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Suspended</span>
                  <span className="text-red-600">13</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">SME Users</h3>
                  <p className="text-2xl font-bold text-green-600">355</p>
                  <p className="text-sm text-gray-600">Business accounts</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active</span>
                  <span className="text-green-600">342</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="text-yellow-600">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Suspended</span>
                  <span className="text-red-600">5</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Admin Users</h3>
                  <p className="text-2xl font-bold text-purple-600">12</p>
                  <p className="text-sm text-gray-600">Platform administrators</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Super Admin</span>
                  <span className="text-purple-600">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Admin</span>
                  <span className="text-blue-600">9</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="text-gray-900">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Health Monitoring */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Platform Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-green-900">API Status</h3>
              <p className="text-sm text-green-700">Operational</p>
              <p className="text-xs text-green-600">99.9% uptime</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="font-medium text-blue-900">Database</h3>
              <p className="text-sm text-blue-700">Healthy</p>
              <p className="text-xs text-blue-600">Response: 45ms</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-medium text-yellow-900">AI Services</h3>
              <p className="text-sm text-yellow-700">Good</p>
              <p className="text-xs text-yellow-600">Response: 2.1s</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-medium text-purple-900">Storage</h3>
              <p className="text-sm text-purple-700">Optimal</p>
              <p className="text-xs text-purple-600">67% used</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New user registration: jane.smith@example.com</p>
                <p className="text-xs text-gray-600">User Type: Individual • Timestamp: 2024-01-15 15:30:25 UTC</p>
              </div>
              <span className="text-xs text-gray-500">5 minutes ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">KYC verification completed: ABC Corp</p>
                <p className="text-xs text-gray-600">User Type: SME • Timestamp: 2024-01-15 15:15:10 UTC</p>
              </div>
              <span className="text-xs text-gray-500">20 minutes ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Support ticket created: #TKT-2024-001</p>
                <p className="text-xs text-gray-600">Priority: Medium • Category: Technical • Timestamp: 2024-01-15 14:45:30 UTC</p>
              </div>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">System backup completed successfully</p>
                <p className="text-xs text-gray-600">Type: Daily backup • Size: 2.3 GB • Timestamp: 2024-01-15 02:00:00 UTC</p>
              </div>
              <span className="text-xs text-gray-500">13 hours ago</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Compliance report generated: ETA 2019</p>
                <p className="text-xs text-gray-600">Period: January 2024 • Status: Compliant • Timestamp: 2024-01-15 00:00:00 UTC</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
              View All Activity
            </button>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Compliance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">ETA 2019 Compliance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Compliance</span>
                    <span className="text-sm text-gray-600">98.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '98.5%'}}></div>
                  </div>
                </div>
                
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
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">KYC Verification Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Verified Users</span>
                  <span className="text-sm text-green-700">1,156</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm font-medium text-yellow-900">Pending Verification</span>
                  <span className="text-sm text-yellow-700">31</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm font-medium text-red-900">Failed Verification</span>
                  <span className="text-sm text-red-700">18</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Not Started</span>
                  <span className="text-sm text-gray-700">42</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Admin Assistant */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">🤖 AI Admin Assistant</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Administrative Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">User growth rate is 12% month-over-month</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">KYC verification backlog: 31 users need attention</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">System performance is optimal with 99.9% uptime</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Predictive Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI analyzes platform usage patterns to predict future needs and potential issues.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                  View Predictions
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Automated Monitoring</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI continuously monitors system health and alerts administrators to issues.
                </p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                  Configure Alerts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a placeholder page for the admin dashboard. 
            The actual implementation will include comprehensive user management, 
            system monitoring, and AI-powered administrative tools for managing individual and SME users.
          </p>
        </div>
      </div>
    </div>
  );
}
