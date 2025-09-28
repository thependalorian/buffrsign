/**
 * Active Workflows Page
 * Location: /app/protected/workflows/active/page.tsx
 * Purpose: Display currently active workflows and their status
 * Features:
 * - List of active workflows
 * - Workflow progress tracking
 * - Workflow management actions
 * - Real-time status updates
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Clock, Users, FileText, CheckCircle2, AlertCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { WorkflowStatus } from '@/lib/types';

interface ActiveWorkflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  progress: number;
  participants: number;
  documents: number;
  startedDate: string;
  estimatedCompletion: string;
}

export default function ActiveWorkflowsPage() {
  const { user: _user } = useAuth();
  const [activeWorkflows, setActiveWorkflows] = useState<ActiveWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      
      const supabase = createClient();
      const { data: workflows, error: workflowsError } = await supabase
        .from('signature_workflows')
        .select(`
          id,
          status,
          current_step,
          created_at,
          updated_at,
          participants,
          steps
        `)
        .in('status', [WorkflowStatus.ACTIVE, WorkflowStatus.PAUSED])
        .order('created_at', { ascending: false });

      if (workflowsError) {
        throw workflowsError;
      }

      const workflowsData: ActiveWorkflow[] = workflows?.map(workflow => {
        const participantsData = (workflow.participants as unknown[]) || [];
        const stepsData = (workflow.steps as unknown[]) || [];
        
        return {
          id: workflow.id as string,
          name: `Workflow ${(workflow.id as string).slice(0, 8)}`, // Generate name from ID
          description: 'Document signing workflow',
          status: workflow.status as WorkflowStatus,
          progress: calculateProgress((workflow.current_step as number).toString(), stepsData.length),
          participants: participantsData.length,
          documents: 1, // Each workflow has one document
          startedDate: workflow.created_at ? new Date(workflow.created_at as string).toLocaleDateString() : 'Unknown',
          estimatedCompletion: 'Not set' // This field doesn't exist in the schema
        };
      }) || [];

      setActiveWorkflows(workflowsData);
    } catch (err) {
      console.error('Error fetching active workflows:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch active workflows');
    } finally {
      setLoading(false);
    }
  }, [_user]);

  useEffect(() => {
    if (_user) {
      fetchActiveWorkflows();
    }
  }, [_user, fetchActiveWorkflows]);


  const calculateProgress = (currentStep: string, totalSteps: number): number => {
    if (!currentStep || totalSteps === 0) return 0;
    // This is a simplified calculation - in reality you'd need to map step names to numbers
    return Math.min(Math.round((1 / totalSteps) * 100), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'outline';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading active workflows...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Workflows
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {error}
            </p>
            <Button onClick={fetchActiveWorkflows}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Active Workflows
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Currently running and paused workflows
        </p>
      </div>

      <div className="grid gap-6">
        {activeWorkflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Play className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Active Workflows
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No workflows are currently running. Create a new workflow to get started.
              </p>
              <Button className="mt-4">
                Create Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          activeWorkflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {workflow.name}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {workflow.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{workflow.participants} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{workflow.documents} documents</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Started: {workflow.startedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(workflow.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(workflow.status)}
                        {workflow.status}
                      </div>
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-gray-900 dark:text-white font-medium">{workflow.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${workflow.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Est. Completion:</span> {workflow.estimatedCompletion}
                    </div>
                    <div className="flex gap-2">
                      {workflow.status === 'active' && (
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {workflow.status === 'paused' && (
                        <Button variant="outline" size="sm">
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
