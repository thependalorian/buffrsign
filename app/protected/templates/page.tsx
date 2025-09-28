'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';

// Assuming a template type based on the database schema
type Template = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export default function TemplatesPage() {
  const _supabase = createClient()
  
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async (userId: string) => {
    const { data, error } = await _supabase
      .from('templates')
      .select('id, name, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      if (error.code === '42P01') { // undefined_table
        setError('Templates feature is not fully set up yet.')
        setTemplates([])
      } else {
        setError('Failed to fetch templates.')
      }
    } else {
      setTemplates(data as Template[])
    }
    setLoading(false)
  }, [_supabase])

  useEffect(() => {
    const initialize = async () => {
      const { data: { _user } } = await _supabase.auth.getUser()
      if (_user) {
        await fetchTemplates(_user.id)
      } else {
        setLoading(false)
        setError('You must be logged in to view templates.')
      }
    }
    initialize()
  }, [_supabase, fetchTemplates])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable templates for your frequently used documents.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Template
        </Button>
      </div>

      {loading ? (
        <p>Loading templates...</p>
      ) : error ? (
        <p className="text-yellow-500">{error}</p>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {template.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground h-20 overflow-hidden">
                  {template.description || 'No description available.'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Edit</Button>
                <Button>Use Template</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No templates created yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first _document template.
          </p>
          <Button className="mt-6">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>
      )}
    </div>
  )
}
