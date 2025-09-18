import { EmailTemplateEditor } from '@/components/email/EmailTemplateEditor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Templates - BuffrSign Admin',
  description: 'Manage email templates and content',
};

export default function AdminEmailTemplatesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">Email Templates</h1>
        <p className="text-base-content/70 mt-2">
          Create, edit, and manage email templates for all workflows
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Document Invitation Template</h2>
            <p>Template for document signature invitations</p>
            <div className="card-actions justify-end">
              <EmailTemplateEditor 
                templateType="document_invitation"
                onSave={(template) => console.log('Template saved:', template)}
                onDelete={(templateId) => console.log('Template deleted:', templateId)}
              />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Signature Reminder Template</h2>
            <p>Template for signature reminder emails</p>
            <div className="card-actions justify-end">
              <EmailTemplateEditor 
                templateType="signature_reminder"
                onSave={(template) => console.log('Template saved:', template)}
                onDelete={(templateId) => console.log('Template deleted:', templateId)}
              />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Document Completed Template</h2>
            <p>Template for document completion notifications</p>
            <div className="card-actions justify-end">
              <EmailTemplateEditor 
                templateType="document_completed"
                onSave={(template) => console.log('Template saved:', template)}
                onDelete={(templateId) => console.log('Template deleted:', templateId)}
              />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Document Expired Template</h2>
            <p>Template for document expiration notifications</p>
            <div className="card-actions justify-end">
              <EmailTemplateEditor 
                templateType="document_expired"
                onSave={(template) => console.log('Template saved:', template)}
                onDelete={(templateId) => console.log('Template deleted:', templateId)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
