/**
 * Email Analytics Chart Component
 * 
 * A chart component for displaying email analytics data.
 * Uses DaisyUI components for consistent styling.
 */

'use client';

import { useEffect, useRef } from 'react';
import { EmailAnalyticsChartProps } from '@/lib/types/email';

export default function EmailAnalyticsChart({ 
  data, 
  type, 
  groupBy 
}: EmailAnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart dimensions
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = canvas.offsetWidth - margin.left - margin.right;
    const height = canvas.offsetHeight - margin.top - margin.bottom;

    // Get data values based on type
    const getValue = (item: any) => {
      switch (type) {
        case 'delivery':
          return item.deliveryRate || 0;
        case 'open':
          return item.openRate || 0;
        case 'click':
          return item.clickRate || 0;
        case 'bounce':
          return item.bounceRate || 0;
        default:
          return 0;
      }
    };

    // Prepare data
    const chartData = data.map(item => ({
      date: new Date(item.date),
      value: getValue(item),
    }));

    if (chartData.length === 0) return;

    // Calculate scales
    const xScale = (width / (chartData.length - 1)) || 1;
    const maxValue = Math.max(...chartData.map(d => d.value));
    const yScale = height / (maxValue || 1);

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + height);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + height);
    ctx.lineTo(margin.left + width, margin.top + height);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + width, y);
      ctx.stroke();
    }

    // Draw line chart
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x = margin.left + index * xScale;
      const y = margin.top + height - (point.value * yScale);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#3b82f6';
    chartData.forEach((point, index) => {
      const x = margin.left + index * xScale;
      const y = margin.top + height - (point.value * yScale);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';

    // X-axis labels
    chartData.forEach((point, index) => {
      const x = margin.left + index * xScale;
      const label = groupBy === 'day' 
        ? point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : groupBy === 'week'
        ? `Week ${Math.ceil(point.date.getDate() / 7)}`
        : point.date.toLocaleDateString('en-US', { month: 'short' });

      ctx.fillText(label, x, margin.top + height + 20);
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i);
      const y = margin.top + (height / 5) * i;
      ctx.fillText(Math.round(value).toString(), margin.left - 10, y + 4);
    }

    // Chart title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Rate (%)`;
    ctx.fillText(title, margin.left + width / 2, 15);

  }, [data, type, groupBy]);

  if (!data.length) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Email Analytics</h3>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">
          {type.charAt(0).toUpperCase() + type.slice(1)} Rate
          <div className="badge badge-primary">{groupBy}</div>
        </h3>
        <div className="h-64">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ maxWidth: '100%', height: '100%' }}
          />
        </div>
        <div className="stats stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">Average</div>
            <div className="stat-value text-primary">
              {Math.round(data.reduce((sum, item) => {
                const value = type === 'delivery' ? item.deliveryRate :
                             type === 'open' ? item.openRate :
                             type === 'click' ? item.clickRate :
                             item.bounceRate;
                return sum + (value || 0);
              }, 0) / data.length)}%
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Peak</div>
            <div className="stat-value text-secondary">
              {Math.max(...data.map(item => {
                const value = type === 'delivery' ? item.deliveryRate :
                             type === 'open' ? item.openRate :
                             type === 'click' ? item.clickRate :
                             item.bounceRate;
                return value || 0;
              }))}%
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Lowest</div>
            <div className="stat-value text-accent">
              {Math.min(...data.map(item => {
                const value = type === 'delivery' ? item.deliveryRate :
                             type === 'open' ? item.openRate :
                             type === 'click' ? item.clickRate :
                             item.bounceRate;
                return value || 0;
              }))}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
