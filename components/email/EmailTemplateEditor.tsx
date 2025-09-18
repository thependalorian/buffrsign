/**
 * Email Template Editor Component
 * 
 * A component for editing email templates with variable substitution.
 * Uses DaisyUI components for consistent styling.
 */

'use client';

import { useState, useEffect } from 'react';
import { EmailTemplateEditorProps, EmailTemplate, EmailType } from '@/lib/types/email';

export default function EmailTemplateEditor({
  template,
  onSave,
  onCancel,
}: EmailTemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    template_type: 'document_invitation' as EmailType,
    subject_template: '',
    html_template: '',
    text_template: '',
    variables: [] as string[],
    branding_options: {} as Record<string, any>,
    locale: 'en-NA',
    is_active: true,
    is_default: false,
  });

  const [previewData, setPreviewData] = useState({
    document_title: 'Sample Document',
    recipient_name: 'John Doe',
    sender_name: 'Jane Smith',
    company_name: 'BuffrSign',
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available template types
  const templateTypes: { value: EmailType; label: string }[] = [
    { value: 'document_invitation', label: 'Document Invitation' },
    { value: 'signature_reminder', label: 'Signature Reminder' },
    { value: 'document_signed', label: 'Document Signed' },
    { value: 'document_completed', label: 'Document Completed' },
    { value: 'document_expired', label: 'Document Expired' },
    { value: 'document_rejected', label: 'Document Rejected' },
    { value: 'document_viewed', label: 'Document Viewed' },
    { value: 'welcome_email', label: 'Welcome Email' },
    { value: 'password_reset', label: 'Password Reset' },
  ];

  // Available variables for substitution
  const availableVariables = [
    { name: 'document.title', description: 'Document title' },
    { name: 'document.id', description: 'Document ID' },
    { name: 'document.status', description: 'Document status' },
    { name: 'document.created_at', description: 'Document creation date' },
    { name: 'document.expires_at', description: 'Document expiration date' },
    { name: 'document.sender_name', description: 'Document sender name' },
    { name: 'document.sender_email', description: 'Document sender email' },
    { name: 'recipient.name', description: 'Recipient name' },
    { name: 'recipient.email', description: 'Recipient email' },
    { name: 'recipient.role', description: 'Recipient role' },
    { name: 'user.name', description: 'User name' },
    { name: 'user.email', description: 'User email' },
    { name: 'company.name', description: 'Company name' },
    { name: 'company.logo_url', description: 'Company logo URL' },
    { name: 'company.website', description: 'Company website' },
    { name: 'company.support_email', description: 'Company support email' },
  ];

  // Initialize form data when template prop changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        template_type: template.template_type,
        subject_template: template.subject_template,
        html_template: template.html_template,
        text_template: template.text_template,
        variables: template.variables,
        branding_options: template.branding_options,
        locale: template.locale,
        is_active: template.is_active,
        is_default: template.is_default,
      });
    }
  }, [template]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handlePreviewDataChange = (field: string, value: string) => {
    setPreviewData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const insertVariable = (variable: string, target: 'subject' | 'html' | 'text') => {
    const placeholder = `{{${variable}}}`;
    const field = target === 'subject' ? 'subject_template' : 
                  target === 'html' ? 'html_template' : 'text_template';
    
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] + placeholder,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.subject_template.trim()) {
      newErrors.subject_template = 'Subject template is required';
    }

    if (!formData.html_template.trim()) {
      newErrors.html_template = 'HTML template is required';
    }

    if (!formData.text_template.trim()) {
      newErrors.text_template = 'Text template is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSave) {
      onSave(formData as EmailTemplate);
    }
  };

  const processTemplate = (template: string): string => {
    let processed = template;

    // Replace variables with preview data
    Object.entries(previewData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    });

    return processed;
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-6">
          {template ? 'Edit Email Template' : 'Create Email Template'}
        </h2>

        {/* Tab Navigation */}
        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === 'edit' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            Edit Template
          </button>
          <button
            className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>

        {activeTab === 'edit' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Template Name</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter template name"
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Template Type</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.template_type}
                  onChange={(e) => handleInputChange('template_type', e.target.value)}
                >
                  {templateTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Locale</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.locale}
                  onChange={(e) => handleInputChange('locale', e.target.value)}
                >
                  <option value="en-NA">English (Namibia)</option>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="af">Afrikaans</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    />
                    <span className="label-text ml-2">Active</span>
                  </label>
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      className="toggle toggle-secondary"
                      checked={formData.is_default}
                      onChange={(e) => handleInputChange('is_default', e.target.checked)}
                    />
                    <span className="label-text ml-2">Default</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Subject Template */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Subject Template</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={`input input-bordered flex-1 ${errors.subject_template ? 'input-error' : ''}`}
                  value={formData.subject_template}
                  onChange={(e) => handleInputChange('subject_template', e.target.value)}
                  placeholder="Enter email subject template"
                />
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline">Variables</label>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {availableVariables.map(variable => (
                      <li key={variable.name}>
                        <button
                          type="button"
                          onClick={() => insertVariable(variable.name, 'subject')}
                          title={variable.description}
                        >
                          {variable.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {errors.subject_template && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.subject_template}</span>
                </label>
              )}
            </div>

            {/* HTML Template */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">HTML Template</span>
              </label>
              <div className="flex gap-2">
                <textarea
                  className={`textarea textarea-bordered flex-1 h-32 ${errors.html_template ? 'textarea-error' : ''}`}
                  value={formData.html_template}
                  onChange={(e) => handleInputChange('html_template', e.target.value)}
                  placeholder="Enter HTML email template"
                />
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline">Variables</label>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {availableVariables.map(variable => (
                      <li key={variable.name}>
                        <button
                          type="button"
                          onClick={() => insertVariable(variable.name, 'html')}
                          title={variable.description}
                        >
                          {variable.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {errors.html_template && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.html_template}</span>
                </label>
              )}
            </div>

            {/* Text Template */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Text Template</span>
              </label>
              <div className="flex gap-2">
                <textarea
                  className={`textarea textarea-bordered flex-1 h-32 ${errors.text_template ? 'textarea-error' : ''}`}
                  value={formData.text_template}
                  onChange={(e) => handleInputChange('text_template', e.target.value)}
                  placeholder="Enter text email template"
                />
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline">Variables</label>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {availableVariables.map(variable => (
                      <li key={variable.name}>
                        <button
                          type="button"
                          onClick={() => insertVariable(variable.name, 'text')}
                          title={variable.description}
                        >
                          {variable.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {errors.text_template && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.text_template}</span>
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="card-actions justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {template ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Preview Data */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">Preview Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(previewData).map(([key, value]) => (
                    <div key={key} className="form-control">
                      <label className="label">
                        <span className="label-text">{key.replace('_', ' ')}</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={value}
                        onChange={(e) => handlePreviewDataChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title">Subject Preview</h3>
                  <div className="p-4 bg-base-100 rounded-lg">
                    {processTemplate(formData.subject_template)}
                  </div>
                </div>
              </div>

              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title">HTML Preview</h3>
                  <div className="p-4 bg-base-100 rounded-lg">
                    <div dangerouslySetInnerHTML={{ __html: processTemplate(formData.html_template) }} />
                  </div>
                </div>
              </div>

              <div className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title">Text Preview</h3>
                  <div className="p-4 bg-base-100 rounded-lg">
                    <pre className="whitespace-pre-wrap">{processTemplate(formData.text_template)}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
