/**
 * Admin Panel Component for BuffrSign
 * 
 * This component provides admin functionality for user management,
 * role assignment, and system administration.
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserProfile, UserRole } from '@/lib/auth/types';
import { formatDisplayName, formatDateTime } from '@/lib/auth/utils';
import { Loader2, Users, Shield, Settings, Plus, Search, Mail, Phone, Building } from 'lucide-react';

interface AdminPanelProps {
  className?: string;
}

interface UserListProps {
  users: UserProfile[];
  onPromote: (userId: string) => void;
  onDemote: (userId: string) => void;
  loading: boolean;
}

function UserList({ users, onPromote, onDemote, loading }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{formatDisplayName(user)}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </div>
                  )}
                  {user.company_name && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {user.company_name}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={user.role === 'super_admin' ? 'destructive' : user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Joined {formatDateTime(user.created_at)}
                </div>
                {user.role === 'user' && (
                  <Button
                    size="sm"
                    onClick={() => onPromote(user.id)}
                    className="ml-2"
                  >
                    Promote to Admin
                  </Button>
                )}
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDemote(user.id)}
                    className="ml-2"
                  >
                    Demote
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching your criteria.
        </div>
      )}
    </div>
  );
}

export function AdminPanel({ className = "" }: AdminPanelProps) {
  const { 
    user, 
    isAdmin, 
    adminLevel, 
    canManageSuperAdmins, 
    canAccessAdminPanel,
    createAdminUser,
    promoteToAdmin,
    demoteFromAdmin
  } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'admin' as UserRole
  });
  const [isCreating, setIsCreating] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Check admin access
  if (!user || !isAdmin || !canAccessAdminPanel) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Access Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need admin privileges to access this panel.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const result = await createAdminUser(
        createFormData.email,
        createFormData.first_name,
        createFormData.last_name,
        createFormData.role
      );

      if (result.error) {
        console.error('Failed to create admin user:', result.error);
      } else {
        setShowCreateForm(false);
        setCreateFormData({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'admin'
        });
        // Refresh users list
        // fetchUsers();
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      const result = await promoteToAdmin(userId);
      if (result.error) {
        console.error('Failed to promote user:', result.error);
      } else {
        // Refresh users list
        // fetchUsers();
      }
    } catch (error) {
      console.error('Error promoting user:', error);
    }
  };

  const handleDemote = async (userId: string) => {
    try {
      const result = await demoteFromAdmin(userId);
      if (result.error) {
        console.error('Failed to demote user:', result.error);
      } else {
        // Refresh users list
        // fetchUsers();
      }
    } catch (error) {
      console.error('Error demoting user:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Admin Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            BuffrSign Admin Panel
          </CardTitle>
          <CardDescription>
            Manage users, roles, and system settings for BuffrSign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={adminLevel === 'super_admin' ? 'destructive' : 'default'}>
              {adminLevel?.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Logged in as {formatDisplayName(user)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Admin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserList
                users={users}
                onPromote={handlePromote}
                onDemote={handleDemote}
                loading={usersLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure BuffrSign system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                System settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Admin Modal */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Admin User</CardTitle>
            <CardDescription>
              Create a new admin user with @buffr.ai email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={createFormData.first_name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={createFormData.last_name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                    disabled={isCreating}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email (@buffr.ai)</Label>
                <Input
                  id="email"
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@buffr.ai"
                  required
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  disabled={isCreating}
                >
                  <option value="admin">Admin</option>
                  {canManageSuperAdmins && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Admin'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
