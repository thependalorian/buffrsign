'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  team_id: string
}

export default function TeamPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const fetchTeamMembers = useCallback(async (userId: string) => {
    // 1. Get current user's team_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.team_id) {
      setError('You are not part of a team.')
      setLoading(false)
      return
    }

    // 2. Fetch all members with that team_id
    const { data: members, error: membersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('team_id', profile.team_id)

    if (membersError) {
      setError('Failed to load team members.')
    } else {
      setTeamMembers(members as Profile[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await fetchTeamMembers(user.id)
      } else {
        setLoading(false)
        setError('You must be logged in to manage a team.')
      }
    }
    initialize()
  }, [supabase, fetchTeamMembers])

  const handleInvite = async () => {
    if (!inviteEmail) {
      setFeedback('Please enter an email to invite.')
      return
    }
    setLoading(true)
    setFeedback(`Sending invite to ${inviteEmail}...`)

    // In a real app, this would call supabase.auth.admin.inviteUserByEmail()
    // or insert into a custom 'invitations' table.
    // For this demo, we'll just simulate the action.
    await new Promise(resolve => setTimeout(resolve, 1500))

    setFeedback(`Successfully sent invite to ${inviteEmail}.`)
    setInviteEmail('')
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
          <CardDescription>Invite a new member to join your team. They will receive an email with instructions.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="w-full space-y-2">
            <Label htmlFor="inviteEmail" className="sr-only">Email</Label>
            <Input
              id="inviteEmail"
              type="email"
              placeholder="member@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={handleInvite} disabled={loading} className="whitespace-nowrap">
            {loading ? 'Sending...' : 'Send Invite'}
          </Button>
        </CardContent>
        {feedback && <CardFooter><p className="text-sm text-muted-foreground">{feedback}</p></CardFooter>}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage your current team members.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !teamMembers.length ? (
            <p>Loading team members...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.full_name || 'N/A'}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell><Badge variant="outline">{member.role || 'Member'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Remove</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Your team has no other members yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
