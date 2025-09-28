# BuffrSign Unified Authentication System

## Overview
This document outlines the unified authentication system implemented for BuffrSign, part of the Buffr ecosystem. The system provides secure, scalable authentication with role-based access control, admin management, and social authentication capabilities, specifically tailored for document signing and management.

## Architecture

### Core Components

#### 1. Authentication Library (`/lib/auth/`)
- **`types.ts`** - TypeScript definitions for all authentication-related types
- **`config.ts`** - BuffrSign-specific configuration with document management permissions
- **`admin-auth.ts`** - Admin-specific authentication utilities and validation
- **`service.ts`** - Core authentication service handling Supabase interactions
- **`utils.ts`** - General utility functions for validation and formatting

#### 2. Authentication Context (`/lib/contexts/auth-context.tsx`)
- **Unified Context** - Single source of truth for authentication state
- **Admin Integration** - Built-in admin user management
- **Real-time Updates** - Automatic state synchronization
- **Error Handling** - Comprehensive error management

#### 3. UI Components (`/components/auth/`)
- **`LoginForm.tsx`** - BuffrSign-branded email/password and Google OAuth authentication
- **`SignUpForm.tsx`** - User registration with document signing focus
- **`AdminPanel.tsx`** - Admin user management interface for BuffrSign

#### 4. OAuth Callback (`/app/auth/callback/`)
- **`page.tsx`** - Handles OAuth callback from Google and other providers
- **Session Processing** - Processes authentication response and redirects users
- **Error Handling** - Comprehensive error management for OAuth flows

## Configuration

### Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Security Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### BuffrSign-Specific Settings
```typescript
// /lib/auth/config.ts
export const authConfig = () => ({
  appName: 'BuffrSign',
  adminDomain: 'buffr.ai',
  superAdminEmails: ['julius@buffr.ai', 'george@buffr.ai'],
  permissions: {
    can_manage_users: true,
    can_manage_super_admins: true,
    can_access_admin_panel: true,
    can_manage_documents: true,        // BuffrSign-specific
    can_manage_signatures: true,       // BuffrSign-specific
    can_manage_templates: true,        // Document templates
    can_manage_workflows: true,        // Signing workflows
    can_view_audit_logs: true,         // Document audit trails
    can_manage_integrations: true      // Third-party integrations
  }
});
```

## User Roles & Permissions

### Role Hierarchy
1. **User** - Basic access to document signing and management
2. **Admin** - User management and system configuration
3. **Super Admin** - Full system access including super admin management

### Permission Matrix
| Permission | User | Admin | Super Admin |
|------------|------|-------|-------------|
| Manage Users | ❌ | ✅ | ✅ |
| Manage Super Admins | ❌ | ❌ | ✅ |
| Access Admin Panel | ❌ | ✅ | ✅ |
| Manage Documents | ✅ | ✅ | ✅ |
| Manage Signatures | ✅ | ✅ | ✅ |
| Manage Templates | ❌ | ✅ | ✅ |
| Manage Workflows | ❌ | ✅ | ✅ |
| View Audit Logs | ❌ | ✅ | ✅ |
| Manage Integrations | ❌ | ❌ | ✅ |

## Authentication Methods

> **Note**: WhatsApp authentication has been removed as of version 1.1.0. The system now supports email/password and Google OAuth only for a cleaner, more focused authentication experience.

### 1. Email/Password Authentication
```typescript
const { signIn } = useAuth();
const result = await signIn({
  email: 'user@example.com',
  password: 'securepassword',
  remember_me: true
});
```

### 2. Google OAuth
```typescript
const { signInWithGoogle } = useAuth();
const result = await signInWithGoogle();
// Redirects to Google OAuth, then to /auth/callback
// Callback page handles session processing and redirects to dashboard
```

### 3. OAuth Callback Handling
```typescript
// Automatic handling via /app/auth/callback/page.tsx
// Users are redirected here after OAuth authentication
// The callback page processes the session and redirects appropriately

// OAuth Callback Page Features:
// - Session validation and processing
// - Error handling for failed authentications
// - Automatic redirect to dashboard or intended page
// - Loading states and user feedback
// - Support for redirect_to parameter
```

## Admin Management

### Creating Admin Users
```typescript
const { createAdminUser } = useAuth();
const result = await createAdminUser({
  email: 'admin@buffr.ai',
  password: 'temporarypassword',
  first_name: 'Admin',
  last_name: 'User',
  role: 'admin'
});
```

### Promoting Users
```typescript
const { promoteToAdmin } = useAuth();
const result = await promoteToAdmin(userId);
```

### Demoting Users
```typescript
const { demoteFromAdmin } = useAuth();
const result = await demoteFromAdmin(userId);
```

## Security Features

### 1. Password Validation
- Minimum 8 characters
- Uppercase and lowercase letters
- Numbers and special characters
- Real-time validation feedback

### 2. Admin Domain Validation
- Admin users must have `@buffr.ai` email addresses
- Automatic role assignment based on email domain
- Super admin email whitelist

### 3. Document Security
- Digital signature validation
- Document integrity checks
- Audit trail maintenance
- Access control for sensitive documents

### 4. Session Management
- Automatic session timeout
- Secure token storage
- Biometric authentication support

### 5. Rate Limiting
- Login attempt limiting
- API endpoint protection
- Document upload limiting
- Signature request limiting

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Document-Specific Tables
```sql
-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signatures table
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  user_id UUID REFERENCES profiles(id),
  signature_data TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage Examples

### 1. Basic Authentication Check
```typescript
import { useAuth } from '@/lib/contexts/auth-context';

function ProtectedComponent() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome to BuffrSign, {user?.first_name}!</div>;
}
```

### 2. Admin-Only Component
```typescript
import { useAuth } from '@/lib/contexts/auth-context';

function AdminOnlyComponent() {
  const { isAdmin, canAccessAdminPanel } = useAuth();
  
  if (!isAdmin || !canAccessAdminPanel) {
    return <div>Admin access required</div>;
  }
  
  return <AdminPanel />;
}
```

### 3. Document Management Access
```typescript
import { useAuth } from '@/lib/contexts/auth-context';

function DocumentManagementComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      {user?.permissions.can_manage_documents && (
        <DocumentUploadPanel />
      )}
      {user?.permissions.can_manage_signatures && (
        <SignatureManagementPanel />
      )}
      {user?.permissions.can_view_audit_logs && (
        <AuditLogPanel />
      )}
    </div>
  );
}
```

## Integration Guide

### 1. Wrap Your App
```typescript
// app/layout.tsx
import { AuthProvider } from '@/lib/contexts/auth-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Create Login Page
```typescript
// app/auth/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm 
        onSuccess={() => router.push('/dashboard')}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

### 3. OAuth Callback Page (Already Implemented)
```typescript
// app/auth/callback/page.tsx - Already implemented
// This page automatically handles OAuth callbacks from Google
// Features:
// - Session processing and validation
// - Error handling for failed authentications
// - Loading states with visual feedback
// - Automatic redirect to dashboard or intended page
// - Support for redirect_to parameter
```

### 4. Create Admin Dashboard
```typescript
// app/admin/page.tsx
import { AdminPanel } from '@/components/auth/AdminPanel';

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <AdminPanel />
    </div>
  );
}
```

## BuffrSign-Specific Features

### 1. Document Signing Workflow
```typescript
// Document signing with authentication
const { user } = useAuth();

const signDocument = async (documentId: string) => {
  if (!user?.permissions.can_manage_signatures) {
    throw new Error('Insufficient permissions');
  }
  
  // Proceed with document signing
  const signature = await createSignature(documentId, user.id);
  return signature;
};
```

### 2. Template Management
```typescript
// Template management for admins
const { user } = useAuth();

const manageTemplates = async () => {
  if (!user?.permissions.can_manage_templates) {
    throw new Error('Admin access required');
  }
  
  // Template management logic
};
```

### 3. Audit Trail Access
```typescript
// Audit log viewing for admins
const { user } = useAuth();

const viewAuditLogs = async () => {
  if (!user?.permissions.can_view_audit_logs) {
    throw new Error('Admin access required');
  }
  
  // Audit log retrieval
};
```

## Error Handling

### Common Error Types
- **Validation Errors** - Form input validation failures
- **Authentication Errors** - Login/signup failures
- **Permission Errors** - Insufficient access rights
- **Document Errors** - Document processing failures
- **Signature Errors** - Digital signature validation failures
- **Network Errors** - API communication failures

### Error Display
```typescript
const { signIn } = useAuth();
const [errors, setErrors] = useState<string[]>([]);

const handleLogin = async (credentials) => {
  const result = await signIn(credentials);
  if (result.error) {
    setErrors([result.error]);
  }
};
```

## Testing

### Unit Tests
```typescript
// __tests__/auth.test.ts
import { validateLoginCredentials } from '@/lib/auth/utils';

describe('Authentication Utils', () => {
  test('validates login credentials', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      remember_me: false
    };
    
    const errors = validateLoginCredentials(validCredentials);
    expect(errors).toHaveLength(0);
  });
});
```

### Integration Tests
```typescript
// __tests__/auth-integration.test.ts
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { LoginForm } from '@/components/auth/LoginForm';

describe('Authentication Integration', () => {
  test('renders BuffrSign login form', () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    
    expect(screen.getByText('Welcome to BuffrSign')).toBeInTheDocument();
  });
});
```

## Deployment

### Environment Setup
1. Configure Supabase project
2. Set environment variables
3. Run database migrations
4. Deploy to Vercel

### Production Checklist
- [ ] Environment variables configured
- [ ] Supabase project set up
- [ ] Database triggers created
- [ ] Admin users created
- [ ] SSL certificates configured
- [ ] Rate limiting enabled
- [ ] Document storage configured
- [ ] Digital signature certificates set up
- [ ] Error monitoring set up

## Troubleshooting

### Common Issues

#### 1. "Missing required Supabase configuration"
**Solution**: Ensure all environment variables are set correctly

#### 2. "Admin access required" error
**Solution**: Verify user has admin role and @buffr.ai email

#### 3. "Database error granting user"
**Solution**: Check database triggers and functions are properly installed

#### 4. Google OAuth not working
**Solution**: 
- Verify Google OAuth provider configuration in Supabase Dashboard
- Check redirect URL is set to: `https://yourdomain.com/auth/callback`
- Ensure Google OAuth credentials (Client ID & Secret) are configured
- Verify OAuth callback page is accessible

#### 5. Document upload failures
**Solution**: Check file size limits and storage configuration

#### 6. Signature validation errors
**Solution**: Verify digital certificate configuration

### Debug Mode
```typescript
// Enable debug logging
const { signIn } = useAuth();
const result = await signIn(credentials, { debug: true });
```

## Support

For technical support or questions about the BuffrSign authentication system:
- Check the troubleshooting section above
- Review Supabase documentation
- Contact the development team

## Changelog

### Version 1.1.0
- **WhatsApp Authentication Removed** - Simplified to email/password and Google OAuth only
- **Google OAuth Implementation** - Complete OAuth flow with callback handling
- **OAuth Callback Page** - Dedicated `/auth/callback` page for processing OAuth responses
- **Enhanced Error Handling** - Improved OAuth error management and user feedback
- **Simplified Authentication Flow** - Cleaner, more focused authentication options

### Version 1.0.0
- Initial unified authentication system for BuffrSign
- Document management permissions
- Signature management capabilities
- Admin management interface
- Social authentication support (deprecated WhatsApp)
- Role-based permissions
- Security best practices implementation

---

*This documentation is maintained alongside the authentication system. Please update it when making changes to the authentication implementation.*
