/**
 * Admin Support Management Page
 * 
 * Purpose: Support ticket management and customer service oversight for BuffrSign
 * Location: /app/protected/admin/support/page.tsx
 * Features: Ticket management, agent assignment, response tracking, analytics
 */

export default function ProtectedAdminSupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Support Management</h1>
          <p className="text-gray-600">Manage support tickets and customer service operations</p>
        </div>

        {/* Support Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
            <p className="text-2xl font-bold text-blue-600">156</p>
            <p className="text-xs text-gray-500">This month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Open Tickets</h3>
            <p className="text-2xl font-bold text-yellow-600">23</p>
            <p className="text-xs text-gray-500">Awaiting response</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Resolved Today</h3>
            <p className="text-2xl font-bold text-green-600">12</p>
            <p className="text-xs text-gray-500">Successfully closed</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
            <p className="text-2xl font-bold text-purple-600">2.4h</p>
            <p className="text-xs text-gray-500">Target: &lt; 4 hours</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <p className="text-sm text-gray-600">Common support management tasks</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                Create Ticket
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                Assign Tickets
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg" disabled>
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Management */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Support Tickets</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All Statuses</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Pending</option>
                <option>Resolved</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All Categories</option>
                <option>Technical</option>
                <option>Billing</option>
                <option>Account</option>
                <option>Compliance</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All Agents</option>
                <option>Unassigned</option>
                <option>John Admin</option>
                <option>Sarah Support</option>
              </select>
            </div>
            <div>
              <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200" disabled>
                Apply Filters
              </button>
            </div>
          </div>

          {/* Ticket List */}
          <div className="space-y-4">
            {/* Ticket 1 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h3 className="text-lg font-medium">#TKT-2024-001 - Login Issues</h3>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    High Priority
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Technical
                  </span>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  In Progress
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">User</p>
                  <p className="text-sm text-gray-600">john.smith@example.com</p>
                  <p className="text-xs text-gray-500">Individual User</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned To</p>
                  <p className="text-sm text-gray-600">Sarah Support</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                  <p className="text-xs text-gray-500">15:30 UTC</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Response Time</p>
                  <p className="text-sm text-gray-600">45 minutes</p>
                  <p className="text-xs text-green-600">Within SLA</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Description:</p>
                <p className="text-sm text-gray-600">
                  Unable to log into my account. Getting &quot;Invalid credentials&quot; error even though I&apos;m sure my password is correct. 
                  I&apos;ve tried resetting my password but the reset email never arrives.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Last Updated: 1 hour ago</span>
                  <span className="text-sm text-gray-600">Category: Authentication</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                    Assign
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 text-sm font-medium" disabled>
                    Escalate
                  </button>
                </div>
              </div>
            </div>
            
            {/* Ticket 2 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h3 className="text-lg font-medium">#TKT-2024-002 - KYC Verification</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Medium Priority
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Compliance
                  </span>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Open
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">User</p>
                  <p className="text-sm text-gray-600">admin@abccorp.com</p>
                  <p className="text-xs text-gray-500">SME User</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned To</p>
                  <p className="text-sm text-gray-600">Unassigned</p>
                  <p className="text-xs text-gray-500">-</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">4 hours ago</p>
                  <p className="text-xs text-gray-500">13:15 UTC</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Response Time</p>
                  <p className="text-sm text-gray-600">4 hours</p>
                  <p className="text-xs text-yellow-600">Approaching SLA</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Description:</p>
                <p className="text-sm text-gray-600">
                  Our KYC verification has been pending for 5 days. We&apos;ve uploaded all required documents 
                  but haven&apos;t received any updates. Need this resolved urgently for business operations.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Last Updated: 4 hours ago</span>
                  <span className="text-sm text-gray-600">Category: KYC</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                    Assign
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 text-sm font-medium" disabled>
                    Escalate
                  </button>
                </div>
              </div>
            </div>
            
            {/* Ticket 3 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-medium">#TKT-2024-003 - Billing Question</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Low Priority
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Billing
                  </span>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Resolved
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">User</p>
                  <p className="text-sm text-gray-600">jane.doe@example.com</p>
                  <p className="text-xs text-gray-500">Individual User</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned To</p>
                  <p className="text-sm text-gray-600">John Admin</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">1 day ago</p>
                  <p className="text-xs text-gray-500">09:45 UTC</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Resolution Time</p>
                  <p className="text-sm text-gray-600">3 hours</p>
                  <p className="text-xs text-green-600">Excellent</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Description:</p>
                <p className="text-sm text-gray-600">
                  I noticed an unexpected charge on my monthly bill. Can you explain what this fee is for? 
                  I want to make sure I&apos;m not being charged for services I didn&apos;t use.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Resolved: 1 day ago</span>
                  <span className="text-sm text-gray-600">Category: Billing</span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium" disabled>
                    Reopen
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">23</span> open tickets
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

        {/* Support Team Management */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Support Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Agent 1 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-blue-600">SA</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sarah Support</h3>
                  <p className="text-sm text-blue-600">Senior Support Agent</p>
                  <p className="text-xs text-gray-500">Online • 2 hours ago</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Tickets</span>
                  <span className="text-gray-900">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Resolved Today</span>
                  <span className="text-gray-900">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Response</span>
                  <span className="text-gray-900">1.2h</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  View Details
                </button>
                <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  Assign Ticket
                </button>
              </div>
            </div>
            
            {/* Agent 2 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-green-600">JA</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">John Admin</h3>
                  <p className="text-sm text-green-600">Support Agent</p>
                  <p className="text-xs text-gray-500">Online • 30 minutes ago</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Tickets</span>
                  <span className="text-gray-900">6</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Resolved Today</span>
                  <span className="text-gray-900">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Response</span>
                  <span className="text-gray-900">2.1h</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  View Details
                </button>
                <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                  Assign Ticket
                </button>
              </div>
            </div>
            
            {/* Agent 3 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">+</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Agent</h3>
                  <p className="text-sm text-gray-600">Expand support team</p>
                  <p className="text-xs text-gray-500">Click to add new agent</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="text-sm text-gray-500">
                  Add new support agents to handle increasing ticket volume and improve response times.
                </div>
              </div>
              
              <button className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg text-sm" disabled>
                Add Agent
              </button>
            </div>
          </div>
        </div>

        {/* Support Analytics */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Support Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Response Time Trends</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">High Priority</span>
                    <span className="text-sm text-gray-600">1.2h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Medium Priority</span>
                    <span className="text-sm text-gray-600">2.4h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Low Priority</span>
                    <span className="text-sm text-gray-600">4.1h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Ticket Categories</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Technical Issues</span>
                  <span className="text-sm text-blue-700">45%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">KYC & Compliance</span>
                  <span className="text-sm text-green-700">28%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm font-medium text-yellow-900">Account & Billing</span>
                  <span className="text-sm text-yellow-700">18%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Other</span>
                  <span className="text-sm text-purple-700">9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Support Assistant */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">🤖 AI Support Assistant</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Smart Support Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">5 tickets are approaching SLA breach (4+ hours old)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Technical issues are 3x more common than last week</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Sarah Support has highest resolution rate (94%)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Auto-Ticket Routing</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI automatically routes tickets to the most appropriate agent based on expertise and workload.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                  Configure Routing
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Predictive Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Predict ticket volume and identify potential issues before they become problems.
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
            <strong>Note:</strong> This is a placeholder page for the admin support management system. 
            The actual implementation will include comprehensive ticket management, 
            agent assignment, response tracking, and AI-powered support analytics.
          </p>
        </div>
      </div>
    </div>
  );
}
