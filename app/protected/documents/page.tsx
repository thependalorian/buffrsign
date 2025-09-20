'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import DocumentList from '@/components/DocumentList'
import DocumentUpload from '@/components/DocumentUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DocumentsPage() {
  const _supabase = createClient()
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      const { data: { _user } } = await supabase.auth.getUser()
      if (_user) {
        setUser(_user)
      }
      setLoading(false)
    }
    initialize()
  }, [supabase])

  const handleUploadSuccess = async (documentId: string) => {
    if (!_user) {
      throw new Error('User not authenticated for upload.')
    }

    // DocumentList component will automatically refresh when it detects changes
    console.log('Document uploaded successfully:', documentId)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
          <CardDescription>
            Select a _document to upload for analysis and signing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUpload 
            userId={_user?.id || ''} 
            onUploadSuccess={handleUploadSuccess} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Documents</CardTitle>
          <CardDescription>
            View and manage your uploaded documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : _user ? (
            <DocumentList userId={_user.id} />
          ) : (
            <p>Please log in to view your documents.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
