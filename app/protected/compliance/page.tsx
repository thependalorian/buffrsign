'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

// Mock data for the compliance dashboard
const complianceStatus = [
  {
    name: 'ETA 2019 (Namibia)',
    status: 'Compliant',
    description: 'Fully compliant with the Electronic Transactions Act No. 4 of 2019.',
  },
  {
    name: 'CRAN Audit Trail Requirements',
    status: 'Compliant',
    description: 'Audit trail logging meets all CRAN specifications.',
  },
  {
    name: 'ISO 27001/14533 Standards',
    status: 'Implemented',
    description: 'Security and signature procedures based on ISO best practices.',
  },
  {
    name: 'Consumer Protection',
    status: 'Compliant',
    description: 'Adheres to consumer rights as outlined in ETA 2019, Chapter 4.',
  },
]

const mockAuditEvents = [
  {
    id: 'evt_1JqL2m..._A',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    _user: 'admin@buffrsign.ai',
    action: 'Viewed Admin Dashboard',
    details: 'Accessed the _user management page.',
    status: 'Success',
  },
  {
    id: 'evt_1JqL2m..._B',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    _user: '_user@example.com',
    action: 'Document Signed',
    details: 'Signed _document: Employment_Contract_2024.pdf',
    status: 'Success',
  },
  {
    id: 'evt_1JqL2m..._C',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    _user: '_user@example.com',
    action: 'Password Changed',
    details: 'User updated their password successfully.',
    status: 'Success',
  },
  {
    id: 'evt_1JqL2m..._D',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    _user: 'guest@example.com',
    action: 'Login Failed',
    details: 'Attempted login with incorrect password.',
    status: 'Failure',
  },
  {
    id: 'evt_1JqL2m..._E',
    timestamp: new Date(Date.now() - 62 * 60 * 1000).toISOString(),
    _user: '_user@example.com',
    action: 'Document Uploaded',
    details: 'Uploaded file: NDA_Vendor.pdf',
    status: 'Success',
  },
  {
    id: 'evt_1JqL2m..._F',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    _user: '_user@example.com',
    action: 'User Login',
    details: 'Successfully authenticated via email/password.',
    status: 'Success',
  },
]

export default function CompliancePage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'default'
      case 'Implemented':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {complianceStatus.map((item) => (
          <Card key={item.name}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{item.name}</CardTitle>
              <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              A real-time log of all significant events occurring in the system.
            </CardDescription>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAuditEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{event._user}</TableCell>
                  <TableCell className="font-medium">{event.action}</TableCell>
                  <TableCell className="text-muted-foreground">{event.details}</TableCell>
                  <TableCell>
                    <Badge variant={event.status === 'Success' ? 'default' : 'destructive'}>
                      {event.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
