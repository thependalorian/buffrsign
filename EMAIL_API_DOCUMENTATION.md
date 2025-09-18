# BuffrSign Email System API Documentation

## Overview

This document provides comprehensive API documentation for the BuffrSign Email Notification System. All endpoints are RESTful and return JSON responses.

## Base URL

```
https://sign.buffr.ai/api/email
```

## Authentication

All API endpoints require authentication via Supabase JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Default**: 1000 requests per hour per user
- **Email sending**: 100 emails per hour per user
- **Analytics**: 100 requests per hour per user

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Endpoints

### Send Email

**POST** `/api/email/send`

Send an email notification.

#### Request Body

```json
{
  "type": "document_invitation" | "signature_reminder" | "document_completed",
  "documentId": "string",
  "recipientEmail": "string",
  "recipientName": "string",
  "templateData": {
    "document_title": "string",
    "sender_name": "string",
    "expires_at": "string",
    "custom_message": "string",
    "days_remaining": "number",
    "completed_at": "string"
  },
  "priority": "low" | "normal" | "high",
  "scheduledAt": "string (ISO 8601)"
}
```

#### Response

```json
{
  "success": true,
  "messageId": "msg-123",
  "status": "queued" | "sent" | "failed",
  "queuedAt": "2024-01-01T00:00:00Z"
}
```

#### Example

```bash
curl -X POST https://sign.buffr.aiapi/email/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "document_invitation",
    "documentId": "doc-123",
    "recipientEmail": "user@example.com",
    "recipientName": "John Doe",
    "templateData": {
      "document_title": "Contract Agreement",
      "sender_name": "Jane Smith",
      "expires_at": "2024-12-31",
      "custom_message": "Please review and sign"
    }
  }'
```

### Get Email Analytics

**GET** `/api/email/analytics`

Get email analytics data.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Start date in YYYY-MM-DD format |
| `endDate` | string | No | End date in YYYY-MM-DD format |
| `documentId` | string | No | Filter by document ID |
| `userId` | string | No | Filter by user ID |
| `templateType` | string | No | Filter by template type |

#### Response

```json
{
  "totalSent": 150,
  "delivered": 145,
  "bounced": 3,
  "opened": 120,
  "clicked": 45,
  "openRate": 80.0,
  "clickRate": 30.0,
  "bounceRate": 2.0,
  "deliveryRate": 96.7,
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "breakdown": {
    "byTemplate": {
      "document_invitation": {
        "sent": 100,
        "delivered": 98,
        "opened": 80,
        "clicked": 30
      },
      "signature_reminder": {
        "sent": 50,
        "delivered": 47,
        "opened": 40,
        "clicked": 15
      }
    },
    "byDay": [
      {
        "date": "2024-01-01",
        "sent": 10,
        "delivered": 9,
        "opened": 8,
        "clicked": 3
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://sign.buffr.ai/api/email/analytics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

### Get User Email Preferences

**GET** `/api/email/preferences`

Get current user's email preferences.

#### Response

```json
{
  "receive_invitations": true,
  "receive_reminders": true,
  "receive_status_updates": true,
  "receive_marketing": false,
  "reminder_frequency": 2,
  "preferred_language": "en-US",
  "email_format": "html",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Example

```bash
curl -X GET https://sign.buffr.ai/api/email/preferences \
  -H "Authorization: Bearer <token>"
```

### Update User Email Preferences

**PUT** `/api/email/preferences`

Update current user's email preferences.

#### Request Body

```json
{
  "receive_invitations": true,
  "receive_reminders": false,
  "receive_status_updates": true,
  "receive_marketing": false,
  "reminder_frequency": 3,
  "preferred_language": "en-US",
  "email_format": "html"
}
```

#### Response

```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": {
    "receive_invitations": true,
    "receive_reminders": false,
    "receive_status_updates": true,
    "receive_marketing": false,
    "reminder_frequency": 3,
    "preferred_language": "en-US",
    "email_format": "html"
  }
}
```

#### Example

```bash
curl -X PUT https://sign.buffr.ai/api/email/preferences \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "receive_reminders": false,
    "reminder_frequency": 3
  }'
```

### Retry Failed Email

**POST** `/api/email/retry/[id]`

Retry a failed email from the queue.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Email queue item ID |

#### Response

```json
{
  "success": true,
  "message": "Email queued for retry",
  "queueId": "queue-123",
  "retryCount": 2
}
```

#### Example

```bash
curl -X POST https://sign.buffr.ai/api/email/retry/queue-123 \
  -H "Authorization: Bearer <token>"
```

### Cancel Scheduled Email

**DELETE** `/api/email/cancel/[id]`

Cancel a scheduled email.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Email queue item ID |

#### Response

```json
{
  "success": true,
  "message": "Email cancelled successfully"
}
```

#### Example

```bash
curl -X DELETE https://sign.buffr.ai/api/email/cancel/queue-123 \
  -H "Authorization: Bearer <token>"
```

### Get Email Templates

**GET** `/api/email/templates`

Get available email templates.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by template type |
| `locale` | string | No | Filter by locale |
| `active` | boolean | No | Filter by active status |

#### Response

```json
{
  "templates": [
    {
      "id": "template-123",
      "name": "Default Document Invitation",
      "type": "document_invitation",
      "subject": "You have been invited to sign: {{document_title}}",
      "variables": ["recipient_name", "document_title", "sender_name"],
      "locale": "en-US",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://sign.buffr.ai/api/email/templates?type=document_invitation&active=true" \
  -H "Authorization: Bearer <token>"
```

### Create Email Template

**POST** `/api/email/templates`

Create a new email template.

#### Request Body

```json
{
  "name": "Custom Welcome Email",
  "type": "document_invitation",
  "subject": "Welcome to {{document_title}}",
  "html_content": "<h1>Hello {{recipient_name}}!</h1>",
  "text_content": "Hello {{recipient_name}}!",
  "variables": ["recipient_name", "document_title"],
  "locale": "en-US",
  "is_active": true
}
```

#### Response

```json
{
  "success": true,
  "template": {
    "id": "template-456",
    "name": "Custom Welcome Email",
    "type": "document_invitation",
    "subject": "Welcome to {{document_title}}",
    "variables": ["recipient_name", "document_title"],
    "locale": "en-US",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Example

```bash
curl -X POST https://sign.buffr.ai/api/email/templates \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Welcome Email",
    "type": "document_invitation",
    "subject": "Welcome to {{document_title}}",
    "html_content": "<h1>Hello {{recipient_name}}!</h1>",
    "text_content": "Hello {{recipient_name}}!",
    "variables": ["recipient_name", "document_title"],
    "locale": "en-US"
  }'
```

### Update Email Template

**PUT** `/api/email/templates/[id]`

Update an existing email template.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Template ID |

#### Request Body

Same as create template.

#### Response

```json
{
  "success": true,
  "template": {
    "id": "template-456",
    "name": "Updated Welcome Email",
    "type": "document_invitation",
    "subject": "Updated: Welcome to {{document_title}}",
    "variables": ["recipient_name", "document_title"],
    "locale": "en-US",
    "is_active": true,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Delete Email Template

**DELETE** `/api/email/templates/[id]`

Delete an email template.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Template ID |

#### Response

```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Preview Email Template

**POST** `/api/email/templates/[id]/preview`

Preview an email template with sample data.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Template ID |

#### Request Body

```json
{
  "recipient_name": "John Doe",
  "document_title": "Sample Contract",
  "sender_name": "Jane Smith"
}
```

#### Response

```json
{
  "subject": "You have been invited to sign: Sample Contract",
  "html_content": "<h1>Hello John Doe!</h1><p>You have been invited to sign: Sample Contract</p>",
  "text_content": "Hello John Doe!\n\nYou have been invited to sign: Sample Contract"
}
```

## Webhook Endpoints

### SendGrid Webhook

**POST** `/api/email/webhook/sendgrid`

Handle SendGrid webhook events.

#### Request Body

SendGrid webhook payload (see SendGrid documentation).

#### Response

```json
{
  "success": true,
  "processed": 5,
  "errors": []
}
```

### Resend Webhook

**POST** `/api/email/webhook/resend`

Handle Resend webhook events.

#### Request Body

Resend webhook payload (see Resend documentation).

#### Response

```json
{
  "success": true,
  "processed": 3,
  "errors": []
}
```

### AWS SES Webhook

**POST** `/api/email/webhook/ses`

Handle AWS SES webhook events.

#### Request Body

AWS SES SNS notification payload.

#### Response

```json
{
  "success": true,
  "processed": 2,
  "errors": []
}
```

## Data Models

### Email Notification

```typescript
interface EmailNotification {
  id: string;
  document_id: string;
  recipient_email: string;
  recipient_name?: string;
  template_id: string;
  subject: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}
```

### Email Template

```typescript
interface EmailTemplate {
  id: string;
  name: string;
  type: 'document_invitation' | 'signature_reminder' | 'document_completed';
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  locale: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### User Email Preferences

```typescript
interface UserEmailPreferences {
  id: string;
  user_id: string;
  receive_invitations: boolean;
  receive_reminders: boolean;
  receive_status_updates: boolean;
  receive_marketing: boolean;
  reminder_frequency: number;
  preferred_language: string;
  email_format: 'html' | 'text';
  created_at: string;
  updated_at: string;
}
```

### Email Analytics

```typescript
interface EmailAnalytics {
  totalSent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  deliveryRate: number;
  period: {
    startDate: string;
    endDate: string;
  };
  breakdown: {
    byTemplate: Record<string, {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    }>;
    byDay: Array<{
      date: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    }>;
  };
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request body is invalid or missing required fields |
| `UNAUTHORIZED` | Authentication token is missing or invalid |
| `FORBIDDEN` | User doesn't have permission to perform this action |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Rate limit exceeded |
| `EMAIL_PROVIDER_ERROR` | Error from email provider |
| `TEMPLATE_ERROR` | Template rendering error |
| `DATABASE_ERROR` | Database operation failed |
| `VALIDATION_ERROR` | Input validation failed |

## SDK Examples

### JavaScript/TypeScript

```typescript
class EmailAPI {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async sendEmail(data: SendEmailRequest): Promise<SendEmailResponse> {
    const response = await fetch(`${this.baseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAnalytics(params?: AnalyticsParams): Promise<EmailAnalytics> {
    const url = new URL(`${this.baseUrl}/api/email/analytics`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Usage
const emailAPI = new EmailAPI('https://sign.buffr.ai', 'your-jwt-token');

// Send email
await emailAPI.sendEmail({
  type: 'document_invitation',
  documentId: 'doc-123',
  recipientEmail: 'user@example.com',
  recipientName: 'John Doe',
  templateData: {
    document_title: 'Contract Agreement',
    sender_name: 'Jane Smith'
  }
});

// Get analytics
const analytics = await emailAPI.getAnalytics({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Python

```python
import requests
from typing import Dict, Any, Optional

class EmailAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def send_email(self, data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{self.base_url}/api/email/send',
            json=data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_analytics(self, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        response = requests.get(
            f'{self.base_url}/api/email/analytics',
            params=params or {},
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage
email_api = EmailAPI('https://sign.buffr.ai', 'your-jwt-token')

# Send email
result = email_api.send_email({
    'type': 'document_invitation',
    'documentId': 'doc-123',
    'recipientEmail': 'user@example.com',
    'recipientName': 'John Doe',
    'templateData': {
        'document_title': 'Contract Agreement',
        'sender_name': 'Jane Smith'
    }
})

# Get analytics
analytics = email_api.get_analytics({
    'startDate': '2024-01-01',
    'endDate': '2024-01-31'
})
```

## Testing

### Postman Collection

Import the following Postman collection for testing:

```json
{
  "info": {
    "name": "BuffrSign Email API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Send Email",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"type\": \"document_invitation\",\n  \"documentId\": \"doc-123\",\n  \"recipientEmail\": \"user@example.com\",\n  \"recipientName\": \"John Doe\",\n  \"templateData\": {\n    \"document_title\": \"Contract Agreement\",\n    \"sender_name\": \"Jane Smith\"\n  }\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/email/send",
          "host": ["{{baseUrl}}"],
          "path": ["api", "email", "send"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://sign.buffr.ai"
    },
    {
      "key": "token",
      "value": "your-jwt-token"
    }
  ]
}
```

### Unit Tests

```typescript
import { EmailAPI } from './email-api';

describe('EmailAPI', () => {
  let emailAPI: EmailAPI;

  beforeEach(() => {
    emailAPI = new EmailAPI('https://test.com', 'test-token');
  });

  it('should send email successfully', async () => {
    const mockResponse = {
      success: true,
      messageId: 'msg-123',
      status: 'queued'
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await emailAPI.sendEmail({
      type: 'document_invitation',
      documentId: 'doc-123',
      recipientEmail: 'user@example.com',
      recipientName: 'John Doe',
      templateData: {
        document_title: 'Test Document',
        sender_name: 'Test Sender'
      }
    });

    expect(result).toEqual(mockResponse);
  });
});
```

## Changelog

### Version 1.0.0
- Initial release
- Basic email sending functionality
- Multi-provider support (SendGrid, Resend, SES)
- Template system with variable substitution
- User preferences management
- Analytics and reporting
- Webhook integration
- Queue system with retry logic
