'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data for the dashboard
const kpiData = {
  totalDocuments: 152,
  completed: 124,
  inProgress: 18,
  avgSigningTime: '2.3 hours',
}

const activityData = [
  { date: 'Mon', count: 12 },
  { date: 'Tue', count: 18 },
  { date: 'Wed', count: 15 },
  { date: 'Thu', count: 22 },
  { date: 'Fri', count: 19 },
  { date: 'Sat', count: 25 },
  { date: 'Sun', count: 11 },
]

const statusData = [
  { status: 'Draft', count: 10 },
  { status: 'In Progress', count: 18 },
  { status: 'Completed', count: 124 },
]

export default function AnalyticsPage() {
  const completedRate = ((kpiData.completed / kpiData.totalDocuments) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kpiData.totalDocuments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{completedRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kpiData.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Signing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kpiData.avgSigningTime}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity This Week</CardTitle>
            <CardDescription>Documents created per day.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Documents by Status</CardTitle>
            <CardDescription>Current status of all documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
