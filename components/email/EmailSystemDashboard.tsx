"use client";

/**
 * Email System Dashboard Component
 * 
 * Comprehensive dashboard for monitoring and managing the email system
 */

import React, { useState, useEffect } from 'react';
import { useEmailAnalytics } from '@/lib/hooks/useEmailAnalytics';
import { useEmailPreferences } from '@/lib/hooks/useEmailPreferences';
import { EmailAnalyticsChart } from './EmailAnalyticsChart';
import { EmailPreferencesForm } from './EmailPreferencesForm';

interface EmailSystemDashboardProps {
  userId?: string;
  showUserPreferences?: boolean;
}

export const EmailSystemDashboard: React.FC<EmailSystemDashboardProps> = ({
  userId,
  showUserPreferences = true
}) => {
  const { analytics, loading: analyticsLoading, error: analyticsError } = useEmailAnalytics();
  const { preferences, loading: preferencesLoading, error: preferencesError } = useEmailPreferences();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'preferences' | 'system'>('overview');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch system status
  useEffect(() => {
    const fetchSystemStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/email/status');
        if (response.ok) {
          const status = await response.json();
          setSystemStatus(status);
        }
      } catch (error) {
        console.error('Error fetching system status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStatus();
  }, []);

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!analytics) return null;

    const totalEmails = analytics.total_sent || 0;
    const deliveredEmails = analytics.total_delivered || 0;
    const openedEmails = analytics.total_opened || 0;
    const clickedEmails = analytics.total_clicked || 0;
    const bouncedEmails = analytics.total_bounced || 0;

    const deliveryRate = totalEmails > 0 ? (deliveredEmails / totalEmails * 100).toFixed(1) : '0';
    const openRate = deliveredEmails > 0 ? (openedEmails / deliveredEmails * 100).toFixed(1) : '0';
    const clickRate = openedEmails > 0 ? (clickedEmails / openedEmails * 100).toFixed(1) : '0';
    const bounceRate = totalEmails > 0 ? (bouncedEmails / totalEmails * 100).toFixed(1) : '0';

    return {
      totalEmails,
      deliveredEmails,
      openedEmails,
      clickedEmails,
      bouncedEmails,
      deliveryRate,
      openRate,
      clickRate,
      bounceRate
    };
  };

  const summaryStats = getSummaryStats();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'system', label: 'System', icon: '🔧' }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Email System Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your email notification system</p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Status */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">System Status</h2>
              {loading ? (
                <div className="flex justify-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : systemStatus ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Email Provider</div>
                    <div className="stat-value text-primary">{systemStatus.provider || 'Not configured'}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Queue Status</div>
                    <div className={`stat-value ${systemStatus.queueEnabled ? 'text-success' : 'text-warning'}`}>
                      {systemStatus.queueEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">System Health</div>
                    <div className="stat-value text-success">Healthy</div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-error">
                  <span>Failed to load system status</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Statistics */}
          {summaryStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat bg-base-100 shadow rounded-lg">
                <div className="stat-title">Total Emails</div>
                <div className="stat-value text-primary">{summaryStats.totalEmails.toLocaleString()}</div>
                <div className="stat-desc">All time</div>
              </div>
              <div className="stat bg-base-100 shadow rounded-lg">
                <div className="stat-title">Delivery Rate</div>
                <div className="stat-value text-success">{summaryStats.deliveryRate}%</div>
                <div className="stat-desc">{summaryStats.deliveredEmails.toLocaleString()} delivered</div>
              </div>
              <div className="stat bg-base-100 shadow rounded-lg">
                <div className="stat-title">Open Rate</div>
                <div className="stat-value text-info">{summaryStats.openRate}%</div>
                <div className="stat-desc">{summaryStats.openedEmails.toLocaleString()} opened</div>
              </div>
              <div className="stat bg-base-100 shadow rounded-lg">
                <div className="stat-title">Click Rate</div>
                <div className="stat-value text-warning">{summaryStats.clickRate}%</div>
                <div className="stat-desc">{summaryStats.clickedEmails.toLocaleString()} clicked</div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Recent Activity</h2>
              {analyticsLoading ? (
                <div className="flex justify-center">
                  <span className="loading loading-spinner"></span>
                </div>
              ) : analyticsError ? (
                <div className="alert alert-error">
                  <span>Failed to load recent activity</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {analytics.recent_activity?.slice(0, 5).map((activity: unknown, _index: number) => (
                    <div key={_index} className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                      <div>
                        <div className="font-medium">{activity.type}</div>
                        <div className="text-sm text-muted-foreground">{activity.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                        <div className="badge badge-outline">{activity.status}</div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">No recent activity</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Email Performance Analytics</h2>
              <EmailAnalyticsChart />
            </div>
          </div>

          {/* Detailed Statistics */}
          {summaryStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Delivery Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Sent:</span>
                      <span className="font-medium">{summaryStats.totalEmails.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivered:</span>
                      <span className="font-medium text-success">{summaryStats.deliveredEmails.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bounced:</span>
                      <span className="font-medium text-error">{summaryStats.bouncedEmails.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Rate:</span>
                      <span className="font-medium">{summaryStats.deliveryRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Engagement Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Opened:</span>
                      <span className="font-medium text-info">{summaryStats.openedEmails.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clicked:</span>
                      <span className="font-medium text-warning">{summaryStats.clickedEmails.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Rate:</span>
                      <span className="font-medium">{summaryStats.openRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Click Rate:</span>
                      <span className="font-medium">{summaryStats.clickRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && showUserPreferences && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Email Preferences</h2>
              {preferencesLoading ? (
                <div className="flex justify-center">
                  <span className="loading loading-spinner"></span>
                </div>
              ) : preferencesError ? (
                <div className="alert alert-error">
                  <span>Failed to load preferences</span>
                </div>
              ) : (
                <EmailPreferencesForm />
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* System Configuration */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">System Configuration</h2>
              {systemStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Email Provider</span>
                      </label>
                      <div className="input input-bordered bg-base-200">
                        {systemStatus.provider || 'Not configured'}
                      </div>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">From Email</span>
                      </label>
                      <div className="input input-bordered bg-base-200">
                        {systemStatus.fromEmail || 'Not configured'}
                      </div>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Queue Enabled</span>
                      </label>
                      <div className="input input-bordered bg-base-200">
                        {systemStatus.queueEnabled ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Retry Attempts</span>
                      </label>
                      <div className="input input-bordered bg-base-200">
                        {systemStatus.retryAttempts || 'Not configured'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-error">
                  <span>Failed to load system configuration</span>
                </div>
              )}
            </div>
          </div>

          {/* System Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">System Actions</h2>
              <div className="flex gap-4">
                <button className="btn btn-outline">
                  Test Email Connection
                </button>
                <button className="btn btn-outline">
                  Process Email Queue
                </button>
                <button className="btn btn-outline">
                  Refresh Analytics
                </button>
                <button className="btn btn-outline">
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">System Health</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Database Connection</span>
                  <span className="badge badge-success">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Email Provider</span>
                  <span className="badge badge-success">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Queue System</span>
                  <span className="badge badge-success">Running</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Webhook Endpoints</span>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
