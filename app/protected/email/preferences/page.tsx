import { EmailPreferencesForm } from '@/components/email/EmailPreferencesForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Preferences - BuffrSign',
  description: 'Manage your email notification preferences',
};

export default function EmailPreferencesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">Email Preferences</h1>
        <p className="text-base-content/70 mt-2">
          Customize how and when you receive email notifications
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-6">Notification Settings</h2>
            <EmailPreferencesForm 
              onSave={(preferences) => {
                console.log('Preferences saved:', preferences);
                // Show success message
              }}
              onError={(error) => {
                console.error('Error saving preferences:', error);
                // Show error message
              }}
            />
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Email Types</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Document Invitations</h3>
                  <p className="text-sm text-base-content/70">
                    Receive emails when you're invited to sign documents
                  </p>
                </div>
                <div className="badge badge-primary">Always On</div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Signature Reminders</h3>
                  <p className="text-sm text-base-content/70">
                    Get reminded about pending signature requests
                  </p>
                </div>
                <div className="badge badge-secondary">Configurable</div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Status Updates</h3>
                  <p className="text-sm text-base-content/70">
                    Notifications when documents are completed or expired
                  </p>
                </div>
                <div className="badge badge-secondary">Configurable</div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Marketing Emails</h3>
                  <p className="text-sm text-base-content/70">
                    Product updates, tips, and promotional content
                  </p>
                </div>
                <div className="badge badge-ghost">Optional</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Email Format</h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">HTML Format</span>
                  <input type="radio" name="email-format" className="radio radio-primary" defaultChecked />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Plain Text Format</span>
                  <input type="radio" name="email-format" className="radio radio-primary" />
                </label>
              </div>
            </div>
            <div className="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>HTML format provides better visual experience with images and formatting.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
