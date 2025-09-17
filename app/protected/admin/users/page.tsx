/**
 * Admin User Management Page
 * 
 * Purpose: Comprehensive user management for BuffrSign administrators
 * Location: /app/protected/admin/users/page.tsx
 * Features: User CRUD, role management, KYC oversight, bulk operations
 */

export default function ProtectedAdminUsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage BuffrSign user accounts, roles, and verification status</p>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-blue-600">1,247</p>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">New This Month</h3>
            <p className="text-2xl font-bold text-green-600">134</p>
            <p className="text-xs text-gray-500">Active registrations</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending KYC</h3>
            <p className="text-2xl font-bold text-yellow-600">31</p>
            <p className="text-xs text-gray-500">Awaiting verification</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Suspended</h3>
            <p className="text-2xl font-bold text-red-600">18</p>
            <p className="text-xs text-gray-500">Account violations</p>
          </div>
        </div>

        {/* User Management Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">User Management</h2>
              <p className="text-sm text-gray-600">Add, edit, and manage user accounts</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                Add User
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                Bulk Import
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg" disabled>
                Export Data
              </button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <input
                type="text"
                placeholder="Search users..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All User Types</option>
                <option>Individual</option>
                <option>SME</option>
                <option>Admin</option>
              </select>
            </div>
            <div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option>All Statuses</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
                <option>Verified</option>
              </select>
            </div>
            <div>
              <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200" disabled>
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">User Accounts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* User Row 1 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">JS</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">John Smith</div>
                        <div className="text-sm text-gray-500">john.smith@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Individual
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 hours ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" disabled>Edit</button>
                      <button className="text-green-600 hover:text-green-900" disabled>View</button>
                      <button className="text-red-600 hover:text-red-900" disabled>Suspend</button>
                    </div>
                  </td>
                </tr>
                
                {/* User Row 2 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">AC</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">ABC Corp</div>
                        <div className="text-sm text-gray-500">admin@abccorp.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      SME
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 day ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" disabled>Edit</button>
                      <button className="text-green-600 hover:text-green-900" disabled>View</button>
                      <button className="text-red-600 hover:text-red-900" disabled>Suspend</button>
                    </div>
                  </td>
                </tr>
                
                {/* User Row 3 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-yellow-600">JD</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Jane Doe</div>
                        <div className="text-sm text-gray-500">jane.doe@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Individual
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3 days ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" disabled>Edit</button>
                      <button className="text-green-600 hover:text-green-900" disabled>View</button>
                      <button className="text-yellow-600 hover:text-yellow-900" disabled>Verify</button>
                    </div>
                  </td>
                </tr>
                
                {/* User Row 4 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-red-600">RS</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Robert Smith</div>
                        <div className="text-sm text-gray-500">robert.smith@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Individual
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Suspended
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Failed
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 week ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" disabled>Edit</button>
                      <button className="text-green-600 hover:text-green-900" disabled>View</button>
                      <button className="text-green-600 hover:text-green-900" disabled>Activate</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of <span className="font-medium">1,247</span> results
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

        {/* KYC Verification Queue */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">KYC Verification Queue</h2>
          <div className="space-y-4">
            {/* KYC Item 1 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Jane Doe - Individual</h3>
                  <p className="text-sm text-gray-600">jane.doe@example.com • Submitted 3 days ago</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Pending Review
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Documents</p>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">National ID</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Proof of Address</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Risk Score</p>
                  <p className="text-sm text-gray-600">Low (15/100)</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Priority</p>
                  <p className="text-sm text-gray-600">Medium</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">ETA: 2 business days</span>
                  <span className="text-sm text-gray-600">Assigned to: Admin Team</span>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Approve
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Reject
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Request More Info
                  </button>
                </div>
              </div>
            </div>
            
            {/* KYC Item 2 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">XYZ Ltd - SME</h3>
                  <p className="text-sm text-gray-600">admin@xyz.com • Submitted 1 day ago</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Under Review
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Documents</p>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Business Registration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Tax Clearance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Financial Statements</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Risk Score</p>
                  <p className="text-sm text-gray-600">Medium (45/100)</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Priority</p>
                  <p className="text-sm text-gray-600">High</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">ETA: 1 business day</span>
                  <span className="text-sm text-gray-600">Assigned to: Compliance Team</span>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Approve
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Reject
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Request More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Analytics */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">User Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">User Growth Trends</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Individual Users</span>
                    <span className="text-sm text-gray-600">+15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">SME Users</span>
                    <span className="text-sm text-gray-600">+8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Active Users</span>
                    <span className="text-sm text-gray-600">+22%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">User Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Individual Users</span>
                  <span className="text-sm text-blue-700">71.6%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">SME Users</span>
                  <span className="text-sm text-green-700">28.4%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Admin Users</span>
                  <span className="text-sm text-purple-700">1.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI User Management Assistant */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">🤖 AI User Management Assistant</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Smart User Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">31 users have been pending KYC for over 5 days</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">User engagement is highest among SME accounts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">Risk assessment suggests 5 users need immediate review</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Automated Risk Assessment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI analyzes user behavior and documents to identify potential risks and compliance issues.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                  Run Assessment
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">User Behavior Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get insights into user patterns, preferences, and potential fraud indicators.
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
            <strong>Note:</strong> This is a placeholder page for the admin user management system. 
            The actual implementation will include comprehensive user CRUD operations, 
            KYC verification workflows, and AI-powered user analytics for managing individual and SME users.
          </p>
        </div>
      </div>
    </div>
  );
}
