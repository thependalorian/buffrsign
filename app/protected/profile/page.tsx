/**
 * Profile Management Page
 * 
 * Purpose: User profile management for individuals and SMEs
 * Location: /app/protected/profile/page.tsx
 * Features: Profile editing, KYC status, preferences, security settings
 */

"use client";

import { useState } from 'react';
import { User, Shield, Key, Bell, CreditCard, Building, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProtectedProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

  const renderTab = (id: string, label: string, icon: React.ReactNode) => (
    <button
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
      }`}
      onClick={() => setActiveTab(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">John Doe</h2>
              <p className="text-gray-600">john.doe@example.com</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="badge badge-success">Verified</span>
                <span className="badge badge-primary">Individual User</span>
              </div>
            </div>
            <button 
              className="btn btn-outline btn-primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {renderTab('personal', 'Personal Info', <User className="w-4 h-4" />)}
            {renderTab('kyc', 'KYC Status', <Shield className="w-4 h-4" />)}
            {renderTab('security', 'Security', <Key className="w-4 h-4" />)}
            {renderTab('preferences', 'Preferences', <Bell className="w-4 h-4" />)}
            {renderTab('billing', 'Billing', <CreditCard className="w-4 h-4" />)}
            {renderTab('team', 'Team', <Building className="w-4 h-4" />)}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Personal Information */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value="John"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value="Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value="john.doe@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value="+264 61 123 4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value="123 Main Street, Windhoek, Namibia"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="flex space-x-3">
                  <button className="btn btn-primary">Save Changes</button>
                  <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* KYC Status */}
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">KYC Verification Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">Identity Verification</h4>
                      <p className="text-sm text-green-600">Government ID verified successfully</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Completed</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">Address Verification</h4>
                      <p className="text-sm text-green-600">Address confirmed and verified</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Completed</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Employment Verification</h4>
                      <p className="text-sm text-yellow-600">Pending employer confirmation</p>
                    </div>
                  </div>
                  <span className="badge badge-warning">Pending</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-800">Bank Statement Analysis</h4>
                      <p className="text-sm text-blue-600">AI analysis completed</p>
                    </div>
                  </div>
                  <span className="badge badge-info">Completed</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Overall KYC Score</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-blue-800">85%</span>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  Your KYC verification is 85% complete. Complete the remaining steps to unlock full platform access.
                </p>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Security Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn btn-outline btn-sm">Enable</button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                  </div>
                  <button className="btn btn-outline btn-sm">Change</button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Login History</h4>
                    <p className="text-sm text-gray-600">View recent login activity</p>
                  </div>
                  <button className="btn btn-outline btn-sm">View</button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Active Sessions</h4>
                    <p className="text-sm text-gray-600">Manage active login sessions</p>
                  </div>
                  <button className="btn btn-outline btn-sm">Manage</button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>English</option>
                    <option>Afrikaans</option>
                    <option>German</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Africa/Windhoek (UTC+2)</option>
                    <option>UTC</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive email updates about your documents</p>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Receive SMS updates about your documents</p>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" />
                </div>
              </div>
              
              <button className="btn btn-primary">Save Preferences</button>
            </div>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Billing & Subscription</h3>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Current Plan</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-800">Individual Plan</p>
                    <p className="text-blue-600">Perfect for personal use and individual transactions</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-800">Free</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Documents This Month</h4>
                    <p className="text-sm text-gray-600">5 of 10 included in plan</p>
                  </div>
                  <span className="text-sm font-medium text-gray-600">5/10</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Storage Used</h4>
                    <p className="text-sm text-gray-600">250MB of 1GB included</p>
                  </div>
                  <span className="text-sm font-medium text-gray-600">250MB/1GB</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Upgrade to SME Plan</h4>
                  <p className="text-sm text-gray-600 mb-4">Perfect for small businesses and teams</p>
                  <p className="text-2xl font-bold text-green-600 mb-2">N$ 99/month</p>
                  <button className="btn btn-primary btn-sm w-full">Upgrade</button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Pay Per Use</h4>
                  <p className="text-sm text-gray-600 mb-4">Pay only for what you use</p>
                  <p className="text-2xl font-bold text-blue-600 mb-2">N$ 5/document</p>
                  <button className="btn btn-outline btn-sm w-full">Enable</button>
                </div>
              </div>
            </div>
          )}

          {/* Team Management */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Team Management</h3>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800">
                    Team management features are available with SME and higher plans. 
                    <button className="underline ml-1">Upgrade now</button>
                  </p>
                </div>
              </div>
              
              <div className="text-center py-8">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Team Management</h4>
                <p className="text-gray-600 mb-4">
                  Manage team members, assign roles, and collaborate on documents
                </p>
                <button className="btn btn-primary">Upgrade to SME Plan</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
