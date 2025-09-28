/**
 * Create Workflow Page
 * Location: /app/protected/workflows/create/page.tsx
 * Purpose: Create new _document signing workflows
 * Features:
 * - Workflow template selection
 * - Step-by-step workflow builder
 * - Participant management
 * - Document assignment
 * - Workflow configuration
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, FileText, Settings, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CreateWorkflowPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowData, setWorkflowData] = useState({
    name: '',
    description: '',
    template: '',
    participants: [],
    documents: [],
    settings: {}
  });

  const workflowTemplates = [
    {
      id: 'contract-approval',
      name: 'Contract Approval',
      description: 'Multi-step contract review and approval process',
      icon: <FileText className="w-6 h-6" />,
      steps: 4,
      estimatedTime: '2-3 days'
    },
    {
      id: 'nda-process',
      name: 'NDA Process',
      description: 'Standard NDA review and signature workflow',
      icon: <CheckCircle2 className="w-6 h-6" />,
      steps: 2,
      estimatedTime: '1 day'
    },
    {
      id: 'onboarding',
      name: 'Employee Onboarding',
      description: 'Complete employee onboarding _document workflow',
      icon: <Users className="w-6 h-6" />,
      steps: 6,
      estimatedTime: '3-5 days'
    },
    {
      id: 'custom',
      name: 'Custom Workflow',
      description: 'Create your own custom workflow from scratch',
      icon: <Settings className="w-6 h-6" />,
      steps: 'Variable',
      estimatedTime: 'Variable'
    }
  ];

  const steps = [
    { id: 1, title: 'Template', description: 'Choose a workflow template' },
    { id: 2, title: 'Details', description: 'Configure workflow details' },
    { id: 3, title: 'Participants', description: 'Add participants and roles' },
    { id: 4, title: 'Documents', description: 'Assign documents to workflow' },
    { id: 5, title: 'Settings', description: 'Configure workflow settings' },
    { id: 6, title: 'Review', description: 'Review and create workflow' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setWorkflowData({ ...workflowData, template: templateId });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Workflow
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Set up a new _document signing workflow
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, _index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {_index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <FileText className="w-5 h-5" />}
            {currentStep === 2 && <Settings className="w-5 h-5" />}
            {currentStep === 3 && <Users className="w-5 h-5" />}
            {currentStep === 4 && <FileText className="w-5 h-5" />}
            {currentStep === 5 && <Settings className="w-5 h-5" />}
            {currentStep === 6 && <CheckCircle2 className="w-5 h-5" />}
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Choose a workflow template to get started quickly, or create a custom workflow.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {workflowTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      workflowData.template === template.id 
                        ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{template.steps} steps</span>
                            <span>{template.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  placeholder="Enter workflow name"
                  value={workflowData.name}
                  onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Input
                  id="workflow-description"
                  placeholder="Enter workflow description"
                  value={workflowData.description}
                  onChange={(e) => setWorkflowData({ ...workflowData, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Add participants to your workflow. You can add more later.
              </p>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Participant
              </Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Assign documents to your workflow.
              </p>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Configure workflow settings and notifications.
              </p>
              <div className="space-y-2">
                <Label>Notification Settings</Label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Email notifications
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    SMS notifications
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Review your workflow configuration before creating it.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Workflow Summary
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Name:</strong> {workflowData.name || 'Untitled Workflow'}</p>
                  <p><strong>Template:</strong> {workflowData.template || 'None selected'}</p>
                  <p><strong>Participants:</strong> {workflowData.participants.length}</p>
                  <p><strong>Documents:</strong> {workflowData.documents.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              disabled={currentStep === steps.length}
            >
              {currentStep === steps.length ? 'Create Workflow' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
