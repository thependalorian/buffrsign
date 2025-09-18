import { EmailSystemDashboard } from '@/components/email/EmailSystemDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Management - BuffrSign Admin',
  description: 'Manage email system, templates, and analytics',
};

export default function AdminEmailPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">Email Management</h1>
        <p className="text-base-content/70 mt-2">
          Manage email system, templates, analytics, and queue
        </p>
      </div>

      <EmailSystemDashboard 
        showUserPreferences={false}
        showAdminControls={true}
        showSystemHealth={true}
        showQueueManagement={true}
        showBlacklistManagement={true}
        showTemplateManagement={true}
      />
    </div>
  );
}
