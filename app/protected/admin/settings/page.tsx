"use client";

import { Bot } from "lucide-react";

/**
 * Admin Settings Page
 * 
 * Purpose: Platform configuration and system settings for BuffrSign administrators
 * Location: /app/protected/admin/settings/page.tsx
 * Features: System configuration, security settings, compliance parameters, integrations
 */

export default function ProtectedAdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600">Configure platform settings, security, and system parameters</p>
        </div>

        {/* Settings Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Configuration Categories</h2>
              <p className="text-sm text-gray-600">Select a category to configure settings</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled>
                Save All Changes
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg" disabled>
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">System Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Platform Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value="BuffrSign"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Language
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>English</option>
                    <option>Afrikaans</option>
                    <option>German</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>Africa/Windhoek (UTC+2)</option>
                    <option>UTC</option>
                    <option>UTC+1</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Performance Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value="120"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value="25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Retention (days)
                  </label>
                  <input
                    type="number"
                    value="2555"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Security Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Authentication Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                    <p className="text-xs text-gray-500">Require 2FA for all users</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-in-out" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Password Complexity</label>
                    <p className="text-xs text-gray-500">Enforce strong passwords</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Session Management</label>
                    <p className="text-xs text-gray-500">Allow multiple active sessions</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Encryption & Keys</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Encryption Algorithm
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>AES-256</option>
                    <option>AES-192</option>
                    <option>AES-128</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Rotation (days)
                  </label>
                  <input
                    type="number"
                    value="90"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hardware Security Module</label>
                    <p className="text-xs text-gray-500">Use HSM for key storage</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audit Log Retention (days)
                  </label>
                  <input
                    type="number"
                    value="2555"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Compliance Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">ETA 2019 Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ETA 2019 Compliance</label>
                    <p className="text-xs text-gray-500">Enable ETA 2019 requirements</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digital Signature Standard
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>PKI with X.509 certificates</option>
                    <option>RSA with SHA-256</option>
                    <option>ECDSA with SHA-256</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timestamp Authority
                  </label>
                  <input
                    type="text"
                    value="https://timestamp.buffrsign.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compliance Report Frequency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Annually</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">KYC & AML Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">KYC Verification Required</label>
                    <p className="text-xs text-gray-500">Require KYC for all users</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KYC Verification Timeout (days)
                  </label>
                  <input
                    type="number"
                    value="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">AML Monitoring</label>
                    <p className="text-xs text-gray-500">Enable anti-money laundering checks</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Assessment Threshold
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>Low (0-25)</option>
                    <option>Medium (26-50)</option>
                    <option>High (51-75)</option>
                    <option>Critical (76-100)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">Integration Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Email Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Server
                  </label>
                  <input
                    type="text"
                    value="smtp.buffrsign.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value="587"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    value="noreply@buffrsign.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Email Notifications</label>
                    <p className="text-xs text-gray-500">Send email alerts to users</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Base URL
                  </label>
                  <input
                    type="text"
                    value="https://api.buffrsign.com/v1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limit (requests/min)
                  </label>
                  <input
                    type="number"
                    value="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">API Documentation</label>
                    <p className="text-xs text-gray-500">Enable Swagger UI</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="text"
                    value="https://webhooks.buffrsign.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6"><Bot className="w-5 h-5 inline-block mr-2" /> AI Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">AI Service Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">AI Document Processing</label>
                    <p className="text-xs text-gray-500">Enable AI-powered features</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model Version
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>LlamaIndex v0.9.0</option>
                    <option>LlamaIndex v0.8.0</option>
                    <option>LlamaIndex v0.7.0</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Response Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">AI Learning Mode</label>
                    <p className="text-xs text-gray-500">Allow AI to learn from usage</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">AI Analytics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Predictive Analytics</label>
                    <p className="text-xs text-gray-500">Enable AI predictions</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Insight Frequency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>Real-time</option>
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Automated Workflows</label>
                    <p className="text-xs text-gray-500">Enable AI workflow automation</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 bg-gray-400 rounded-full shadow-inner transform transition-transform duration-200 ease-inout" disabled />
                    <label className="toggle-label block overflow-hidden h-6 bg-gray-300 rounded-full cursor-pointer"></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Confidence Threshold
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                    <option>High (90%+)</option>
                    <option>Medium (75%+)</option>
                    <option>Low (60%+)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is a placeholder page for the admin settings system. 
            The actual implementation will include comprehensive platform configuration, 
            security settings, compliance parameters, and AI configuration options.
          </p>
        </div>
      </div>
    </div>
  );
}
