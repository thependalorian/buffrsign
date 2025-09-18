'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table' // Assuming table components exist
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Profile = {
  id: string
  full_name: string
  email: string // Assuming email is on profiles table for easy access
  role: 'Individual' | 'SME' | 'Admin' | 'Super Admin'
  created_at: string
}

export default function AdminPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAdminData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to view this page.')
      setLoading(false)
      return
    }
    setUser(user)

    // 1. Fetch current user's profile to check role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`*`)
      .eq('id', user.id)
      .single()

    if (profileError || !profileData) {
      setError('Could not load your profile. Access denied.')
      setLoading(false)
      return
    }

    setProfile(profileData as Profile)

    // 2. Check if user is an admin
    if (profileData.role !== 'Admin' && profileData.role !== 'Super Admin') {
      setError('You do not have permission to view this page.')
      setLoading(false)
      return
    }

    // 3. Fetch all user profiles
    const { data: allProfilesData, error: allProfilesError } = await supabase
      .from('profiles')
      .select(`*`)
      .order('created_at', { ascending: false })

    if (allProfilesError) {
      setError('Failed to load user data.')
    } else {
      setAllProfiles(allProfilesData as Profile[])
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  if (loading) {
    return <p>Loading admin dashboard...</p>
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage all users in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allProfiles.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.full_name || 'N/A'}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>
                  <Badge variant={p.role === 'Admin' || p.role === 'Super Admin' ? 'destructive' : 'outline'}>
                    {p.role}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
