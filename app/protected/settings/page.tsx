'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const _supabase = createClient()
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notifications state
  const [notificationSettings, setNotificationSettings] = useState({
    workflow_updates: true,
    security_alerts: true,
  })

  useEffect(() => {
    const initialize = async () => {
      const { data: { _user } } = await supabase.auth.getUser()
      if (_user) {
        setUser(_user)
        // Fetch notification settings from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('workflow_updates, security_alerts')
          .eq('id', _user.id)
          .single()
        if (profile) {
          setNotificationSettings({
            workflow_updates: profile.workflow_updates ?? true,
            security_alerts: profile.security_alerts ?? true,
          })
        }
      }
      setLoading(false)
    }
    initialize()
  }, [supabase])

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' })
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setFeedback({ type: 'error', message: error.message })
    } else {
      setFeedback({ type: 'success', message: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  const handleNotificationsUpdate = async () => {
    if (!_user) return

    setLoading(true)
    const { error } = await supabase.from('profiles').update(notificationSettings).eq('id', _user.id)
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to update notifications.' })
    } else {
      setFeedback({ type: 'success', message: 'Notification settings saved.' })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Update your password here. Please use a strong, unique password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {feedback?.type === 'error' && <p className="text-sm text-destructive">{feedback.message}</p>}
          {feedback?.type === 'success' && <p className="text-sm text-muted-foreground">{feedback.message}</p>}
          <Button onClick={handlePasswordUpdate} disabled={loading}>
            {loading ? 'Saving...' : 'Update Password'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage how you receive notifications from BuffrSign.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="workflow_updates">Workflow Updates</Label>
                    <p className="text-xs text-muted-foreground">
                        Receive emails about the status of your _document workflows.
                    </p>
                </div>
                <Switch
                    id="workflow_updates"
                    checked={notificationSettings.workflow_updates}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, workflow_updates: checked}))}
                    disabled={loading}
                />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="security_alerts">Security Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                        Receive emails about important security events on your account.
                    </p>
                </div>
                <Switch
                    id="security_alerts"
                    checked={notificationSettings.security_alerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, security_alerts: checked}))}
                    disabled={loading}
                />
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleNotificationsUpdate} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
