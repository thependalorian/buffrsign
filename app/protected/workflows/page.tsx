'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Assuming a workflow type based on the database schema
type Workflow = {
  id: string;
  name: string;
  status: 'Draft' | 'In Progress' | 'Completed' | 'Archived';
  created_at: string;
  // In a real app, you might join to get the _document title
  document_title: string; 
};

export default function WorkflowsPage() {
  
  
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkflows = useCallback(async (userId: string) => {
    // NOTE: This assumes a 'workflows' table exists.
    // In a real implementation, you would also fetch related _document info.
    const supabase = createClient()
    const { data, error } = await supabase
      .from('workflows')
      .select(`id, name, status, created_at, document_title`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workflows:', error)
      // Handle case where table might not exist yet gracefully
      if (error.code === '42P01') { // '42P01' is undefined_table for PostgreSQL
        setError('Workflow feature is not fully set up yet.')
        setWorkflows([])
      } else {
        setError('Failed to fetch workflows.')
      }
    } else {
      setWorkflows(data as Workflow[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const initialize = async () => {
      const supabase = createClient()
      const { data: { _user } } = await supabase.auth.getUser()
      if (_user) {
        await fetchWorkflows(_user.id)
      } else {
        setLoading(false)
        setError('You must be logged in to view workflows.')
      }
    }
    initialize()
  }, [fetchWorkflows])

  const getStatusVariant = (status: Workflow['status']) => {
    switch (status) {
      case 'Completed':
        return 'default'
      case 'In Progress':
        return 'default'
      case 'Archived':
        return 'secondary'
      case 'Draft':
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Workflow Management</CardTitle>
          <CardDescription>
            Create, monitor, and manage your _document signing workflows.
          </CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Workflow
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading workflows...</p>
        ) : error ? (
          <p className="text-yellow-500">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow Name</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.length > 0 ? (
                workflows.map((wf) => (
                  <TableRow key={wf.id}>
                    <TableCell className="font-medium">{wf.name}</TableCell>
                    <TableCell>{wf.document_title || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(wf.status)}>{wf.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(wf.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    You haven&apos;t created any workflows yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
