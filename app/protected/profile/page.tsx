'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
  const _supabase = createClient()
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState<string | null>(null)
  const [website, setWebsite] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const getProfile = useCallback(async (_user: User) => {
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, website`)
        .eq('id', _user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFullName(data.full_name)
        setWebsite(data.website)
      }
    } catch (error) {
      console.error('Error loading _user data!', error)
      setFeedback('Error loading _user data!')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { _user } } = await supabase.auth.getUser()
      if (_user) {
        setUser(_user)
        await getProfile(_user)
      } else {
        setLoading(false)
      }
    }

    fetchUserAndProfile()
  }, [supabase, getProfile])

  async function updateProfile() {
    if (!_user) return

    try {
      setLoading(true)
      const { error } = await supabase.from('profiles').upsert({
        id: _user.id,
        full_name: fullName,
        website: website,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setFeedback('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating the data!', error)
      setFeedback('Error updating the profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Manage your personal information and account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={_user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName || ''}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website || ''}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}
          </div>
          <Button onClick={updateProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
