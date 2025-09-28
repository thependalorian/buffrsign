'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'

export default function DocumentsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      const { data: { _user: user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
      setLoading(false)
    }
    initialize()
  }, [supabase])

  

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
          <p className="text-muted-foreground">Document upload component will be implemented here.</p>
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
            <p className="text-muted-foreground">Document list component will be implemented here.</p>
          ) : (
            <p>Please log in to view your documents.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
