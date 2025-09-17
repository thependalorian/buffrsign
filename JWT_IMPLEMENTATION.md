# JWT Implementation Guide for BuffrSign

This document provides a comprehensive guide to the JWT (JSON Web Token) implementation in the BuffrSign application, with specialized features for document and signature management.

## Overview

The JWT implementation provides secure authentication and authorization for the BuffrSign application, with specialized token types for document access and signature sessions. It includes:

- **Token Creation & Verification**: Secure JWT token generation and validation
- **Access & Refresh Tokens**: Short-lived access tokens with long-lived refresh tokens
- **Document Tokens**: Specialized tokens for document access control
- **Signature Tokens**: Time-limited tokens for signature sessions
- **Token Blacklisting**: Ability to revoke tokens for security
- **Role-Based Access Control**: Fine-grained permissions system
- **Document Access Control**: Granular document and signature permissions
- **Rate Limiting**: Protection against abuse
- **Audit Logging**: Comprehensive security monitoring

## Architecture

### Core Components

1. **JWT Service** (`lib/services/jwt-service.ts`)
   - Token creation and verification
   - Token pair management
   - Document and signature token management
   - Token blacklisting and cleanup

2. **JWT Middleware** (`lib/middleware/jwt-middleware.ts`)
   - Request authentication
   - Authorization checks
   - Document access validation
   - Signature access validation
   - Rate limiting
   - Security headers

3. **Database Tables**
   - `refresh_tokens`: Stores refresh tokens
   - `blacklisted_tokens`: Tracks revoked tokens
   - `token_audit_log`: Security audit trail
   - `documents`: Document metadata and access control
   - `signatures`: Signature session data

## Installation & Setup

### 1. Dependencies

The following packages are required:

```bash
npm install jsonwebtoken @types/jsonwebtoken jose
```

### 2. Environment Variables

Add these environment variables to your `.env.local`:

```env
# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here_make_it_long_and_secure
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_make_it_long_and_secure
JWT_DOCUMENT_SECRET=your_jwt_document_secret_key_here_make_it_long_and_secure
JWT_SIGNATURE_SECRET=your_jwt_signature_secret_key_here_make_it_long_and_secure
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_DOCUMENT_EXPIRY=1h
JWT_SIGNATURE_EXPIRY=30m
```

### 3. Database Migration

Run the JWT tables migration:

```sql
-- Run the migration file: lib/supabase/jwt-migration.sql
```

## Token Types

### 1. Access Tokens
- **Purpose**: General API access
- **Expiry**: 15 minutes
- **Usage**: Standard API authentication

### 2. Refresh Tokens
- **Purpose**: Token renewal
- **Expiry**: 7 days
- **Usage**: Obtain new access tokens

### 3. Document Tokens
- **Purpose**: Document-specific access
- **Expiry**: 1 hour
- **Usage**: Access specific documents
- **Claims**: `documentId`, `permissions`

### 4. Signature Tokens
- **Purpose**: Signature session access
- **Expiry**: 30 minutes
- **Usage**: Sign specific documents
- **Claims**: `documentId`, `signatureId`, `workflowId`

## Usage Examples

### Basic Authentication

```typescript
import { jwtService } from '@/lib/services/jwt-service';

// Create token pair for user
const tokenPair = await jwtService.createTokenPair({
  id: 'user-id',
  email: 'user@example.com',
  role: 'user',
  permissions: ['read', 'write']
});

// Verify token
const payload = await jwtService.verifyToken(tokenPair.accessToken, 'access');
```

### Document Access

```typescript
// Create document access token
const documentToken = await jwtService.createDocumentToken(
  'user-id',
  'document-id',
  ['read', 'write']
);

// Validate document access
const hasAccess = await jwtService.validateDocumentAccess(
  documentToken,
  'document-id',
  'read'
);
```

### Signature Sessions

```typescript
// Create signature session token
const signatureToken = await jwtService.createSignatureToken(
  'user-id',
  'document-id',
  'signature-id',
  'workflow-id'
);

// Validate signature access
const canSign = await jwtService.validateSignatureAccess(
  signatureToken,
  'signature-id',
  'document-id'
);
```

### API Route Protection

```typescript
import { withAuth, withDocumentAccess, withSignatureAccess } from '@/lib/middleware/jwt-middleware';

// Basic authentication
export const GET = withAuth(async (request) => {
  // Your protected route logic
});

// Document access protection
export const GET = withDocumentAccess(async (request) => {
  // Document-specific route logic
});

// Signature access protection
export const POST = withSignatureAccess(async (request) => {
  // Signature-specific route logic
});
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/token`
Create new token pair after login.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  },
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "user",
    "permissions": ["read", "write"]
  }
}
```

### Document Token Endpoints

#### POST `/api/documents/[id]/token`
Create document access or signature token.

**Request:**
```json
{
  "permissions": ["read", "write"],
  "signatureId": "signature-id", // Optional for signature tokens
  "workflowId": "workflow-id"    // Optional for signature tokens
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  },
  "document": {
    "id": "document-id",
    "status": "draft"
  }
}
```

#### GET `/api/documents/[id]/token`
Validate document access.

**Headers:**
```
Authorization: Bearer <document_token>
```

#### DELETE `/api/documents/[id]/token`
Revoke document token.

**Headers:**
```
Authorization: Bearer <document_token>
```

### Protected Endpoints

#### GET `/api/protected/documents`
Get user's documents (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by document status
- `type`: Filter by document type

## Security Features

### Token Security

1. **Short-lived Access Tokens**: 15 minutes expiry
2. **Long-lived Refresh Tokens**: 7 days expiry
3. **Document Tokens**: 1 hour expiry
4. **Signature Tokens**: 30 minutes expiry
5. **Token Blacklisting**: Immediate revocation capability
6. **Secure Secrets**: Separate secrets for different token types

### Document Access Control

1. **Ownership Validation**: Users can access their own documents
2. **Sharing Permissions**: Controlled document sharing
3. **Permission Granularity**: Read, write, sign permissions
4. **Session Isolation**: Signature sessions are isolated

### Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per window
- **Headers**: Includes rate limit information in responses

### Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Audit Logging

All token operations are logged:
- Login/logout events
- Token refresh attempts
- Document access events
- Signature session events
- Failed authentication attempts
- Token revocation events

## Best Practices

### 1. Token Storage

**Client-side:**
- Store access tokens in memory (not localStorage)
- Store refresh tokens in httpOnly cookies
- Store document tokens temporarily for specific operations
- Implement automatic token refresh

**Server-side:**
- Never log tokens in plain text
- Use secure random secrets
- Implement token rotation
- Regular cleanup of expired tokens

### 2. Document Security

```typescript
// Always validate document access
const hasAccess = await jwtService.validateDocumentAccess(
  token,
  documentId,
  'read'
);

if (!hasAccess) {
  throw new Error('Access denied');
}
```

### 3. Signature Security

```typescript
// Validate signature session
const canSign = await jwtService.validateSignatureAccess(
  token,
  signatureId,
  documentId
);

if (!canSign) {
  throw new Error('Signature access denied');
}
```

### 4. Error Handling

```typescript
try {
  const payload = await jwtService.verifyToken(token);
  // Process authenticated request
} catch (error) {
  if (error.message === 'Token has been revoked') {
    // Handle revoked token
  } else if (error.message === 'Invalid or expired token') {
    // Handle invalid/expired token
  } else if (error.message === 'Document access denied') {
    // Handle document access denial
  }
}
```

## Testing

### Unit Tests

Run the JWT service tests:

```bash
npm test __tests__/services/jwt-service.test.ts
```

### Integration Tests

Run the middleware tests:

```bash
npm test __tests__/middleware/jwt-middleware.test.ts
```

### Manual Testing

Use the provided API endpoints to test:

1. **Login**: POST `/api/auth/token`
2. **Access Protected Route**: GET `/api/protected/documents`
3. **Create Document Token**: POST `/api/documents/[id]/token`
4. **Access Document**: GET `/api/documents/[id]`
5. **Refresh Token**: PUT `/api/auth/token`
6. **Logout**: DELETE `/api/auth/token`

## Troubleshooting

### Common Issues

1. **"Invalid token" errors**
   - Check token format (Bearer prefix)
   - Verify token hasn't expired
   - Ensure correct secret is used

2. **"Document access denied" errors**
   - Check document ownership
   - Verify sharing permissions
   - Ensure correct document ID

3. **"Signature access denied" errors**
   - Check signature session validity
   - Verify user is designated signer
   - Ensure signature hasn't expired

4. **"Token has been revoked" errors**
   - Token was blacklisted
   - User logged out or tokens were revoked

5. **Rate limit exceeded**
   - Too many requests in time window
   - Check rate limit headers for retry time

### Debug Mode

Enable debug logging:

```env
DEBUG=true
LOG_LEVEL=debug
```

## Migration from Supabase Auth

The JWT implementation works alongside Supabase Auth:

1. **Initial Authentication**: Use Supabase Auth for login
2. **Token Generation**: Create JWT tokens after successful Supabase auth
3. **API Protection**: Use JWT middleware for API routes
4. **Document Access**: Use specialized document tokens
5. **Session Management**: JWT tokens provide stateless sessions

## Performance Considerations

1. **Token Size**: Keep payload minimal
2. **Database Queries**: Minimize token validation queries
3. **Caching**: Consider caching user permissions and document access
4. **Cleanup**: Regular cleanup of expired tokens
5. **Document Tokens**: Use short expiry for document tokens

## Security Considerations

1. **Secret Management**: Use strong, unique secrets for each token type
2. **Token Transmission**: Always use HTTPS
3. **Token Storage**: Secure client-side storage
4. **Document Access**: Validate access on every request
5. **Signature Sessions**: Time-limited and isolated
6. **Audit Trail**: Monitor all token and document operations
7. **Regular Rotation**: Consider secret rotation

## Future Enhancements

1. **Multi-factor Authentication**: Add MFA support
2. **Device Management**: Track and manage devices
3. **Advanced Permissions**: Dynamic permission system
4. **Document Versioning**: Token-based version access
5. **Workflow Integration**: Advanced workflow token management
6. **Federation**: Support for external identity providers
7. **Real-time Updates**: WebSocket token validation

## Support

For issues or questions regarding the JWT implementation:

1. Check the test files for usage examples
2. Review the JWT Handbook documentation
3. Check the audit logs for security events
4. Contact the development team

---

*This implementation follows JWT Handbook best practices and industry standards for secure token-based authentication with specialized document and signature management capabilities.*
