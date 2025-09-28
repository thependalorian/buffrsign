import { EmailAnalyticsChart } from '@/components/email/EmailAnalyticsChart';
import { Metadata } from 'next';
import { TrendingUp, BarChart3, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Email Analytics - BuffrSign Admin',
  description: 'View email performance analytics and metrics',
};

export default function AdminEmailAnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">Email Analytics</h1>
        <p className="text-base-content/70 mt-2">
          Monitor email performance, delivery rates, and _user engagement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Total Emails Sent</div>
            <div className="stat-value text-primary">25.6K</div>
            <div className="stat-desc">21% more than last month</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="stat-title">Delivery Rate</div>
            <div className="stat-value text-secondary">98.5%</div>
            <div className="stat-desc">Excellent delivery performance</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
            <div className="stat-title">Open Rate</div>
            <div className="stat-value text-accent">76.2%</div>
            <div className="stat-desc">Above industry average</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div className="stat-title">Click Rate</div>
            <div className="stat-value text-info">34.8%</div>
            <div className="stat-desc">Strong engagement</div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Email Performance Over Time</h2>
          <EmailAnalyticsChart 
            data={[]}
            type="delivery"
            groupBy="day"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Template Performance</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Sent</th>
                    <th>Delivered</th>
                    <th>Opened</th>
                    <th>Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Document Invitation</td>
                    <td>15,234</td>
                    <td>15,012</td>
                    <td>11,456</td>
                    <td>4,234</td>
                  </tr>
                  <tr>
                    <td>Signature Reminder</td>
                    <td>8,456</td>
                    <td>8,234</td>
                    <td>6,789</td>
                    <td>2,345</td>
                  </tr>
                  <tr>
                    <td>Document Completed</td>
                    <td>2,123</td>
                    <td>2,098</td>
                    <td>1,876</td>
                    <td>567</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="badge badge-success">Delivered</div>
                <div className="text-sm">
                  <p className="font-medium">Document invitation sent to john@example.com</p>
                  <p className="text-base-content/70">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="badge badge-info">Opened</div>
                <div className="text-sm">
                  <p className="font-medium">Signature reminder opened by jane@example.com</p>
                  <p className="text-base-content/70">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="badge badge-warning">Clicked</div>
                <div className="text-sm">
                  <p className="font-medium">Document link clicked by bob@example.com</p>
                  <p className="text-base-content/70">8 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
