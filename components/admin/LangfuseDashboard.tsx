/**
 * Langfuse Monitoring Dashboard
 * 
 * Comprehensive monitoring dashboard for AI interactions, performance metrics,
 * and observability data from Langfuse.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  RefreshCw,
  Eye,
  Zap,
  Brain,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface LangfuseMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  topModels: Array<{ model: string; requests: number; tokens: number }>;
  costByProvider: Array<{ provider: string; cost: number }>;
  recentTraces: Array<{
    id: string;
    name: string;
    timestamp: string;
    status: 'success' | 'error';
    duration: number;
    tokens?: number;
  }>;
}

interface TimeRange {
  label: string;
  value: 'hour' | 'day' | 'week' | 'month';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LangfuseDashboard() {
  const [metrics, setMetrics] = useState<LangfuseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({ label: 'Today', value: 'day' });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const timeRanges: TimeRange[] = [
    { label: 'Last Hour', value: 'hour' },
    { label: 'Today', value: 'day' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/monitoring/langfuse-metrics?range=${selectedTimeRange.value}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      console.error('Error fetching Langfuse metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [selectedTimeRange]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    subtitle?: string,
    trend?: { value: number; isPositive: boolean }
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
            {Math.abs(trend.value)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderRecentTraces = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent AI Interactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics?.recentTraces?.slice(0, 10).map((trace) => (
            <div key={trace.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(trace.status)}
                <div>
                  <p className="font-medium text-sm">{trace.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trace.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatDuration(trace.duration)}</p>
                {trace.tokens && (
                  <p className="text-xs text-muted-foreground">{trace.tokens} tokens</p>
                )}
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              No recent interactions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTopModels = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Top AI Models
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics?.topModels?.slice(0, 5).map((model, index) => (
            <div key={model.model} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{model.model}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(model.tokens)} tokens</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{model.requests} requests</p>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              No model data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderCostBreakdown = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cost by Provider
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics?.costByProvider?.map((provider) => (
            <div key={provider.provider} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <p className="font-medium text-sm capitalize">{provider.provider}</p>
              </div>
              <p className="text-sm font-medium">{formatCurrency(provider.cost)}</p>
            </div>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              No cost data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Metrics</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchMetrics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time observability for BuffrSign AI services
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Time Range:</span>
            <select
              value={selectedTimeRange.value}
              onChange={(e) => {
                const range = timeRanges.find(r => r.value === e.target.value);
                if (range) setSelectedTimeRange(range);
              }}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Refresh Button */}
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard(
          'Total Requests',
          formatNumber(metrics?.totalRequests || 0),
          <Activity className="w-4 h-4 text-muted-foreground" />,
          `${selectedTimeRange.label.toLowerCase()}`
        )}
        
        {renderMetricCard(
          'Total Tokens',
          formatNumber(metrics?.totalTokens || 0),
          <Zap className="w-4 h-4 text-muted-foreground" />,
          'AI tokens consumed'
        )}
        
        {renderMetricCard(
          'Total Cost',
          formatCurrency(metrics?.totalCost || 0),
          <DollarSign className="w-4 h-4 text-muted-foreground" />,
          'AI service costs'
        )}
        
        {renderMetricCard(
          'Avg Response Time',
          formatDuration(metrics?.averageResponseTime || 0),
          <Clock className="w-4 h-4 text-muted-foreground" />,
          'Average processing time'
        )}
      </div>

      {/* Success/Error Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderMetricCard(
          'Success Rate',
          `${(metrics?.successRate || 0).toFixed(1)}%`,
          <CheckCircle className="w-4 h-4 text-green-600" />,
          'Successful AI interactions'
        )}
        
        {renderMetricCard(
          'Error Rate',
          `${(metrics?.errorRate || 0).toFixed(1)}%`,
          <AlertTriangle className="w-4 h-4 text-red-600" />,
          'Failed AI interactions'
        )}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderRecentTraces()}
        {renderTopModels()}
        {renderCostBreakdown()}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Full Dashboard
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Compliance Report
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LangfuseDashboard;