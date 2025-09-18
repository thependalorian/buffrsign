'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import DocumentList from '@/components/DocumentList'
import DocumentUpload from '@/components/DocumentUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DocumentsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
      setLoading(false)
    }
    initialize()
  }, [supabase])

  const handleUploadSuccess = async (documentId: string) => {
    if (!user) {
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
            Select a document to upload for analysis and signing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUpload 
            userId={user?.id || ''} 
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
          ) : user ? (
            <DocumentList userId={user.id} />
          ) : (
            <p>Please log in to view your documents.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
