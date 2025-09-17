/**
 * Notifications Page
 * 
 * Purpose: Display user notifications about documents, signatures, and platform updates
 * Location: /app/protected/notifications/page.tsx
 * Features: Notification management, filtering, real-time updates
 */

"use client";

import { useState } from 'react';
import { 
  Bell, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Filter,
  Search,
  Check,
  Settings
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'document',
      title: 'Document Ready for Signature',
      message: 'Employment Contract - John Doe is ready for your signature',
      timestamp: '2025-01-15T14:30:00Z',
      read: false,
      priority: 'high',
      action: 'sign',
      documentId: 'doc-123'
    },
    {
      id: 2,
      type: 'signature',
      title: 'Document Signed Successfully',
      message: 'John Doe has signed the Employment Contract',
      timestamp: '2025-01-15T13:45:00Z',
      read: true,
      priority: 'medium',
      action: 'view',
      documentId: 'doc-123'
    },
    {
      id: 3,
      type: 'system',
      title: 'KYC Verification Complete',
      message: 'Your identity verification has been completed successfully',
      timestamp: '2025-01-15T12:00:00Z',
      read: false,
      priority: 'medium',
      action: 'none'
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Document Deadline Approaching',
      message: 'Employment Contract expires in 2 days',
      timestamp: '2025-01-15T10:15:00Z',
      read: false,
      priority: 'high',
      action: 'sign',
      documentId: 'doc-123'
    },
    {
      id: 5,
      type: 'update',
      title: 'Platform Update Available',
      message: 'New features and improvements are now available',
      timestamp: '2025-01-15T09:00:00Z',
      read: true,
      priority: 'low',
      action: 'none'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'signature': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'system': return <Bell className="w-5 h-5 text-purple-600" />;
      case 'reminder': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'update': return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'badge-error';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with your document activities and platform updates</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            
            {unreadCount > 0 && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={markAllAsRead}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document updates</span>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Signature requests</span>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System updates</span>
                    <input type="checkbox" className="toggle toggle-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reminders</span>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">SMS Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Urgent signatures</span>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Deadline reminders</span>
                    <input type="checkbox" className="toggle toggle-primary" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiet Hours
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>10:00 PM - 8:00 AM</option>
                    <option>11:00 PM - 7:00 AM</option>
                    <option>12:00 AM - 6:00 AM</option>
                    <option>No quiet hours</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="btn btn-primary">Save Preferences</button>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'document' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('document')}
                >
                  Documents
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'signature' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('signature')}
                >
                  Signatures
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'system' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('system')}
                >
                  System
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'No notifications match your current filters.'
                  : 'You\'re all caught up! Check back later for updates.'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'ring-2 ring-blue-100' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <span className={`badge badge-sm ${getPriorityBadge(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          {notification.type === 'document' && (
                            <span>Document ID: {notification.documentId}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button
                          className="btn btn-ghost btn-xs text-red-600 hover:text-red-700"
                          onClick={() => deleteNotification(notification.id)}
                          title="Delete notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {notification.action !== 'none' && (
                      <div className="mt-4 flex space-x-3">
                        {notification.action === 'sign' && (
                          <button className="btn btn-primary btn-sm">
                            Sign Document
                          </button>
                        )}
                        {notification.action === 'view' && (
                          <button className="btn btn-outline btn-sm">
                            View Document
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm">
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredNotifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </p>
              
              <div className="flex items-center space-x-2">
                <button className="btn btn-outline btn-sm" disabled>
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">Page 1 of 1</span>
                <button className="btn btn-outline btn-sm" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
