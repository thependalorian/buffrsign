# BuffrSign API: Loan Agreement Signing

## Overview
This API endpoint allows external systems, such as BuffrLend, to initiate a multi-party signing workflow for loan agreements. The system will process the provided loan agreement document, identify signature fields, and manage the signing process according to ETA 2019 compliance.

## Endpoint
`POST /loan-agreements`

## Authentication
This endpoint requires API Key authentication. Include your BuffrSign API Key in the `Authorization` header as a Bearer token.

`Authorization: Bearer YOUR_BUFFRSIGN_API_KEY`

## Request Body
The request body should be a JSON object conforming to the `LoanAgreementCreate` schema.

### `LoanAgreementCreate` Schema
| Field             | Type      | Required | Description                                                              |
|-------------------|-----------|----------|--------------------------------------------------------------------------|
| `loan_id`         | `string`  | Yes      | Unique identifier for the loan from the originating system (e.g., BuffrLend). |
| `customer_id`     | `string`  | Yes      | Unique identifier for the customer associated with the loan.             |
| `loan_amount`     | `number`  | Yes      | The principal amount of the loan.                                        |
| `interest_rate`   | `number`  | Yes      | The annual interest rate of the loan.                                    |
| `term_months`     | `integer` | Yes      | The duration of the loan in months.                                      |
| `title`           | `string`  | No       | Title of the document. Defaults to "Loan Agreement".                   |
| `content`         | `string`  | Yes      | Base64 encoded PDF content of the loan agreement document.               |
| `initiator`       | `string`  | Yes      | Email of the system or agent initiating the signing process (e.g., BuffrLend system user). |
| `parties`         | `array`   | Yes      | List of parties involved in signing, each conforming to the `Party` schema. |
| `signature_fields`| `array`   | Yes      | List of dictionaries defining the expected signature fields on the document. |

### `Party` Schema
| Field         | Type      | Required | Description                                                              |
|---------------|-----------|----------|--------------------------------------------------------------------------|
| `email`       | `string`  | Yes      | Email address of the party.                                              |
| `name`        | `string`  | Yes      | Full name of the party.                                                  |
| `role`        | `string`  | Yes      | Role of the party (e.g., "Borrower", "Lender", "Witness").             |
| `signing_order`| `integer` | No       | Optional order in which this party should sign. Lower numbers sign first. |

## Response

### Success Response (HTTP 200 OK)
```json
{
  "message": "Loan agreement signing endpoint placeholder",
  "data": {
    "loan_id": "loan-12345",
    "customer_id": "cust-67890",
    "loan_amount": 10000.00,
    "interest_rate": 0.05,
    "term_months": 60,
    "title": "Loan Agreement",
    "content": "JVBERi0xLjQKJcOkw...",
    "initiator": "buffrlend@example.com",
    "parties": [
      {
        "email": "borrower@example.com",
        "name": "John Doe",
        "role": "Borrower",
        "signing_order": 1
      },
      {
        "email": "lender@buffrlend.com",
        "name": "BuffrLend Representative",
        "role": "Lender",
        "signing_order": 2
      }
    ],
    "signature_fields": [
      { "page": 1, "type": "signature", "party_role": "Borrower", "x": 100, "y": 200 },
      { "page": 1, "type": "date", "party_role": "Borrower", "x": 100, "y": 250 }
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
  https://sign.buffr.ai/loan-agreements \
  -H "Authorization: Bearer YOUR_BUFFRSIGN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ 
    "loan_id": "loan-12345",
    "customer_id": "cust-67890",
    "loan_amount": 10000.00,
    "interest_rate": 0.05,
    "term_months": 60,
    "content": "JVBERi0xLjQKJcOkw...", 
    "initiator": "buffrlend@example.com",
    "parties": [
      { "email": "borrower@example.com", "name": "John Doe", "role": "Borrower", "signing_order": 1 },
      { "email": "lender@buffrlend.com", "name": "BuffrLend Representative", "role": "Lender", "signing_order": 2 }
    ],
    "signature_fields": [
      { "page": 1, "type": "signature", "party_role": "Borrower", "x": 100, "y": 200, "width": 150, "height": 50, "required": true },
      { "page": 1, "type": "date", "party_role": "Borrower", "x": 100, "y": 250, "width": 100, "height": 30, "required": true }
    ]
  }'
```