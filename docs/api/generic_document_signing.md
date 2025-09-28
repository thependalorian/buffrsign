# BuffrSign API: Generic Document Signing

## Overview
This API endpoint allows external systems, such as BuffrHost, to initiate a multi-party signing workflow for any generic document. The system will process the provided document, identify signature fields, and manage the signing process according to ETA 2019 compliance.

## Endpoint
`POST /documents/generic-signing`

## Authentication
This endpoint requires API Key authentication. Include your BuffrSign API Key in the `Authorization` header as a Bearer token.

`Authorization: Bearer YOUR_BUFFRSIGN_API_KEY`

## Request Body
The request body should be a JSON object conforming to the `DocumentCreate` schema.

### `DocumentCreate` Schema
| Field             | Type      | Required | Description                                                              |
|-------------------|-----------|----------|--------------------------------------------------------------------------|
| `title`           | `string`  | Yes      | Title of the document.                                                   |
| `content`         | `string`  | Yes      | Base64 encoded PDF content of the document.                              |
| `initiator`       | `string`  | Yes      | Email of the system or agent initiating the signing process.             |
| `parties`         | `array`   | Yes      | List of parties involved in signing, each conforming to the `Party` schema. |
| `signature_fields`| `array`   | Yes      | List of dictionaries defining the expected signature fields on the document. |

### `Party` Schema
| Field         | Type      | Required | Description                                                              |
|---------------|-----------|----------|--------------------------------------------------------------------------|
| `email`       | `string`  | Yes      | Email address of the party.                                              |
| `name`        | `string`  | Yes      | Full name of the party.                                                  |
| `role`        | `string`  | Yes      | Role of the party (e.g., "Customer", "Manager", "Supplier").             |
| `signing_order`| `integer` | No       | Optional order in which this party should sign. Lower numbers sign first. |

## Response

### Success Response (HTTP 200 OK)
```json
{
  "message": "Generic document signing endpoint placeholder",
  "data": {
    "title": "Service Agreement",
    "content": "JVBERi0xLjQKJcOkw...",
    "initiator": "buffrhost@example.com",
    "parties": [
      {
        "email": "customer@example.com",
        "name": "Jane Doe",
        "role": "Customer",
        "signing_order": 1
      },
      {
        "email": "manager@buffrhost.com",
        "name": "BuffrHost Manager",
        "role": "Manager",
        "signing_order": 2
      }
    ],
    "signature_fields": [
      { "page": 1, "type": "signature", "party_role": "Customer", "x": 100, "y": 200 },
      { "page": 1, "type": "date", "party_role": "Customer", "x": 100, "y": 250 }
    ]
  }
}
```

### Error Response (HTTP 4xx/5xx)
```json
{
  "detail": "Error message describing the issue."
}
```

## Example Request
```bash
curl -X POST \
  https://sign.buffr.ai/documents/generic-signing \
  -H "Authorization: Bearer YOUR_BUFFRSIGN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ 
    "title": "Hotel Booking Confirmation",
    "content": "JVBERi0xLjQKJcOkw...", 
    "initiator": "buffrhost@example.com",
    "parties": [
      { "email": "guest@example.com", "name": "Alice Smith", "role": "Guest", "signing_order": 1 },
      { "email": "reception@buffrhost.com", "name": "Hotel Reception", "role": "Hotel Representative", "signing_order": 2 }
    ],
    "signature_fields": [
      { "page": 1, "type": "signature", "party_role": "Guest", "x": 100, "y": 200, "width": 150, "height": 50, "required": true }
    ]
  }'
```
