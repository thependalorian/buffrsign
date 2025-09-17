/**
 * Settings Page
 * 
 * Purpose: Account settings and preferences for individuals and SMEs
 * Location: /app/protected/settings/page.tsx
 * Features: Profile management, security settings, preferences
 */

export default function ProtectedSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your profile, security, and preferences</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                  Change Photo
                </button>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>
            
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value="john.doe@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value="+264 61 123 4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
                <input
                  type="text"
                  value="Individual User"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg" disabled>
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
          <div className="space-y-6">
            {/* Password Change */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-lg mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled>
                  Update Password
                </button>
              </div>
            </div>
            
            {/* Two-Factor Authentication */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Enabled
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
                    Manage
                  </button>
                </div>
              </div>
            </div>
            
            {/* Login Sessions */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-lg mb-4">Active Login Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Chrome on Windows</p>
                    <p className="text-sm text-gray-600">Windhoek, Namibia • 2 hours ago</p>
                  </div>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium" disabled>
                    Revoke
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Safari on iPhone</p>
                    <p className="text-sm text-gray-600">Windhoek, Namibia • 1 day ago</p>
                  </div>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium" disabled>
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" disabled />
                  <span className="text-sm text-gray-600">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" disabled />
                  <span className="text-sm text-gray-600">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" disabled />
                  <span className="text-sm text-gray-600">Enabled</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium mb-4">Notification Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Document ready for signature</span>
                  <input type="checkbox" className="rounded" disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Signature completed</span>
                  <input type="checkbox" className="rounded" disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">New template available</span>
                  <input type="checkbox" className="rounded" disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Security alerts</span>
                  <input type="checkbox" className="rounded" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Document Preferences</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                  <option>English</option>
                  <option>Afrikaans</option>
                  <option>Oshiwambo</option>
                  <option>Otjiherero</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                  <option>Namibian Dollar (NAD)</option>
                  <option>South African Rand (ZAR)</option>
                  <option>US Dollar (USD)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                  <option>Africa/Windhoek (UTC+2)</option>
                  <option>UTC</option>
                  <option>UTC+1</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium mb-4">AI Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable AI document analysis</span>
                  <input type="checkbox" className="rounded" disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-generate templates</span>
                  <input type="checkbox" className="rounded" disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Smart field detection</span>
                  <input type="checkbox" className="rounded" disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance checking</span>
                  <input type="checkbox" className="rounded" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Account Management</h2>
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-lg mb-4">Export Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download a copy of your data including documents, templates, and activity history.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                Export My Data
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-lg mb-4">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg" disabled>
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a placeholder page for the account settings system. 
            The actual implementation will include real-time profile updates, security management, 
            and comprehensive preference controls for individual and SME users.
          </p>
        </div>
      </div>
    </div>
  );
}
