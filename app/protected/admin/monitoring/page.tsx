/**
 * Admin Monitoring Page
 * 
 * Comprehensive monitoring dashboard for BuffrSign AI services,
 * system health, and performance metrics.
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LangfuseDashboard from '@/components/admin/LangfuseDashboard';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  Shield, 
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    supabase: 'healthy' | 'degraded' | 'unhealthy';
    storage: 'healthy' | 'degraded' | 'unhealthy';
    ai_services: 'healthy' | 'degraded' | 'unhealthy';
    langfuse: 'healthy' | 'degraded' | 'unhealthy';
  };
  uptime: number;
  lastCheck: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminMonitoringPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'system' | 'performance'>('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock system health data
  const mockSystemHealth: SystemHealth = {
    status: 'healthy',
    services: {
      database: 'healthy',
      supabase: 'healthy',
      storage: 'healthy',
      ai_services: 'healthy',
      langfuse: 'healthy',
    },
    uptime: 99.9,
    lastCheck: new Date().toISOString(),
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'ai', label: 'AI Monitoring', icon: Zap },
    { id: 'system', label: 'System Health', icon: Server },
    { id: 'performance', label: 'Performance', icon: Activity },
  ];

  const refreshSystemHealth = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSystemHealth(mockSystemHealth);
    } catch (error) {
      console.error('Failed to refresh system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✓';
      case 'degraded': return '⚠';
      case 'unhealthy': return '✗';
      default: return '?';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">99.9% uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Services</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All services running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Connected</div>
            <p className="text-xs text-muted-foreground">Supabase + Neon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">All checks passed</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(mockSystemHealth.services).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </span>
                  <span className="font-medium capitalize">{service.replace('_', ' ')}</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={refreshSystemHealth} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Security Report
            </Button>
            <Button variant="outline" size="sm">
              <Database className="w-4 h-4 mr-2" />
              Database Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Infrastructure</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>CPU Usage</span>
                  <span className="text-green-600">45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage</span>
                  <span className="text-green-600">62%</span>
                </div>
                <div className="flex justify-between">
                  <span>Disk Usage</span>
                  <span className="text-yellow-600">78%</span>
                </div>
                <div className="flex justify-between">
                  <span>Network I/O</span>
                  <span className="text-green-600">Normal</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Services</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>API Gateway</span>
                  <span className="text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span>Database</span>
                  <span className="text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage</span>
                  <span className="text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Services</span>
                  <span className="text-green-600">Healthy</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12ms</div>
              <p className="text-sm text-muted-foreground">Avg Query Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,247</div>
              <p className="text-sm text-muted-foreground">Queries/min</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">245ms</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,247</div>
              <p className="text-sm text-muted-foreground">Requests/min</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.2%</div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0.8%</div>
              <p className="text-sm text-muted-foreground">Error Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI Service Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Groq (Llama 3.1 8B)</p>
                <p className="text-sm text-muted-foreground">Document Analysis</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">1.2s avg</p>
                <p className="text-sm text-muted-foreground">456 requests</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">OpenAI (GPT-4o Mini)</p>
                <p className="text-sm text-muted-foreground">Compliance Checking</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">0.8s avg</p>
                <p className="text-sm text-muted-foreground">234 requests</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">DeepSeek (Chat)</p>
                <p className="text-sm text-muted-foreground">Legal Analysis</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">1.5s avg</p>
                <p className="text-sm text-muted-foreground">89 requests</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor system health, AI services, and performance metrics
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'ai' && <LangfuseDashboard />}
        {activeTab === 'system' && renderSystemHealth()}
        {activeTab === 'performance' && renderPerformance()}
      </div>
    </div>
  );
}