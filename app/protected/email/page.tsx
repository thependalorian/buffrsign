import { EmailSystemDashboard } from '@/components/email/EmailSystemDashboard';
import { EmailNotificationList } from '@/components/email/EmailNotificationList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Dashboard - BuffrSign',
  description: 'Manage your email preferences and view notifications',
};

export default function EmailDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">Email Dashboard</h1>
        <p className="text-base-content/70 mt-2">
          Manage your email preferences and view notification history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Recent Email Notifications</h2>
              <EmailNotificationList 
                showUserSpecific={true}
                limit={10}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Email Preferences</h2>
              <EmailSystemDashboard 
                showUserPreferences={true}
                showAdminControls={false}
                showSystemHealth={false}
                showQueueManagement={false}
                showBlacklistManagement={false}
                showTemplateManagement={false}
              />
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Quick Stats</h2>
              <div className="stats stats-vertical shadow">
                <div className="stat">
                  <div className="stat-title">Emails Received</div>
                  <div className="stat-value">156</div>
                  <div className="stat-desc">This month</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Documents Signed</div>
                  <div className="stat-value">23</div>
                  <div className="stat-desc">Via email links</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Response Rate</div>
                  <div className="stat-value">89%</div>
                  <div className="stat-desc">Within 24 hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
