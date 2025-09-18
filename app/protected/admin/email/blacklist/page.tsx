import { EmailBlacklistManager } from '@/components/email/EmailBlacklistManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Blacklist Management - BuffrSign Admin',
  description: 'Manage email blacklist and bounced email addresses',
};

export default function AdminEmailBlacklistPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">Email Blacklist Management</h1>
        <p className="text-base-content/70 mt-2">
          Manage bounced emails and maintain sender reputation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-error">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
              </svg>
            </div>
            <div className="stat-title">Total Blacklisted</div>
            <div className="stat-value text-error">156</div>
            <div className="stat-desc">Email addresses</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div className="stat-title">Bounced Emails</div>
            <div className="stat-value text-warning">89</div>
            <div className="stat-desc">Automatically added</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div className="stat-title">Manual Additions</div>
            <div className="stat-value text-info">45</div>
            <div className="stat-desc">Manually added</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Spam Complaints</div>
            <div className="stat-value text-success">22</div>
            <div className="stat-desc">This month</div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <EmailBlacklistManager 
            showUserSpecific={false}
            limit={100}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Blacklist Health</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Bounce Rate</span>
                <span className="badge badge-success">1.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Spam Rate</span>
                <span className="badge badge-success">0.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sender Reputation</span>
                <span className="badge badge-success">Excellent</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Auto-cleanup</span>
                <span className="badge badge-info">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Additions</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="badge badge-error">Bounced</div>
                <div className="text-sm">
                  <p className="font-medium">invalid@example.com</p>
                  <p className="text-base-content/70">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="badge badge-warning">Spam</div>
                <div className="text-sm">
                  <p className="font-medium">spam@example.com</p>
                  <p className="text-base-content/70">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="badge badge-info">Manual</div>
                <div className="text-sm">
                  <p className="font-medium">blocked@example.com</p>
                  <p className="text-base-content/70">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-8">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">Blacklist Management Tips</h3>
          <div className="text-xs">
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Bounced emails are automatically added to prevent future delivery attempts</li>
              <li>Spam complaints are tracked to maintain sender reputation</li>
              <li>Manual additions allow you to block specific problematic addresses</li>
              <li>Regular cleanup helps maintain a healthy email list</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
