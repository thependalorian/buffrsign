import { EmailQueueManager } from '@/components/email/EmailQueueManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Queue Management - BuffrSign Admin',
  description: 'Manage email queue and monitor delivery status',
};

export default function AdminEmailQueuePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">Email Queue Management</h1>
        <p className="text-base-content/70 mt-2">
          Monitor and manage the email delivery queue
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Pending</div>
            <div className="stat-value text-warning">23</div>
            <div className="stat-desc">Waiting to be sent</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="stat-title">Processing</div>
            <div className="stat-value text-info">5</div>
            <div className="stat-desc">Currently being sent</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Completed</div>
            <div className="stat-value text-success">1,234</div>
            <div className="stat-desc">Successfully sent</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-error">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Failed</div>
            <div className="stat-value text-error">12</div>
            <div className="stat-desc">Need attention</div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <EmailQueueManager 
            showUserSpecific={false}
            limit={100}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Queue Health</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Processing Time</span>
                <span className="badge badge-success">2.3s</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Success Rate</span>
                <span className="badge badge-success">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Retry Rate</span>
                <span className="badge badge-warning">3.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Queue Depth</span>
                <span className="badge badge-info">28</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="badge badge-success">Completed</div>
                <div className="text-sm">
                  <p className="font-medium">Document invitation sent to _user@example.com</p>
                  <p className="text-base-content/70">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="badge badge-error">Failed</div>
                <div className="text-sm">
                  <p className="font-medium">Signature reminder failed for invalid@email.com</p>
                  <p className="text-base-content/70">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="badge badge-info">Processing</div>
                <div className="text-sm">
                  <p className="font-medium">Bulk invitation batch processing</p>
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
