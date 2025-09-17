/**
 * Team Management Page
 * 
 * Purpose: Team management for SMEs with role-based access control
 * Location: /app/protected/team/page.tsx
 * Features: Team member management, role assignment, permissions, collaboration
 */

"use client";

import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Search,
  Download,
  Upload,
  Settings,
  Crown,
  UserCheck,
  Clock
} from 'lucide-react';

export default function TeamManagementPage() {
  const [activeTab, setActiveTab] = useState('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'Owner',
      status: 'active',
      joined: '2024-01-15',
      lastActive: '2025-01-15T14:30:00Z',
      permissions: ['all'],
      documents: 45,
      signatures: 23
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'Admin',
      status: 'active',
      joined: '2024-03-20',
      lastActive: '2025-01-15T13:45:00Z',
      permissions: ['manage_documents', 'manage_team', 'view_analytics'],
      documents: 32,
      signatures: 18
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'Manager',
      status: 'active',
      joined: '2024-06-10',
      lastActive: '2025-01-15T12:00:00Z',
      permissions: ['manage_documents', 'view_analytics'],
      documents: 28,
      signatures: 15
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      role: 'Member',
      status: 'pending',
      joined: '2025-01-10',
      lastActive: null,
      permissions: ['view_documents'],
      documents: 0,
      signatures: 0
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@company.com',
      role: 'Member',
      status: 'inactive',
      joined: '2024-09-15',
      lastActive: '2024-12-20T10:30:00Z',
      permissions: ['view_documents'],
      documents: 12,
      signatures: 8
    }
  ]);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'Member',
    message: ''
  });

  const roles = [
    { id: 'owner', name: 'Owner', description: 'Full access to all features and settings', color: 'text-purple-600' },
    { id: 'admin', name: 'Admin', description: 'Manage team, documents, and analytics', color: 'text-blue-600' },
    { id: 'manager', name: 'Manager', description: 'Manage documents and view analytics', color: 'text-green-600' },
    { id: 'member', name: 'Member', description: 'Basic access to documents and signing', color: 'text-gray-600' }
  ];

  const permissions = {
    owner: ['all'],
    admin: ['manage_documents', 'manage_team', 'view_analytics', 'manage_templates'],
    manager: ['manage_documents', 'view_analytics', 'create_templates'],
    member: ['view_documents', 'sign_documents', 'view_templates']
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'badge-primary';
      case 'admin': return 'badge-secondary';
      case 'manager': return 'badge-accent';
      case 'member': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'inactive': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'inactive': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const formatLastActive = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const handleInvite = () => {
    if (!inviteForm.email || !inviteForm.role) return;
    
    // Simulate sending invite
    const newMember = {
      id: teamMembers.length + 1,
      name: 'Invited User',
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'pending',
      joined: new Date().toISOString().split('T')[0],
      lastActive: null,
      permissions: permissions[inviteForm.role.toLowerCase() as keyof typeof permissions] || [],
      documents: 0,
      signatures: 0
    };
    
    setTeamMembers([...teamMembers, newMember]);
    setInviteForm({ email: '', role: 'Member', message: '' });
    setShowInviteModal(false);
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role.toLowerCase() === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const renderTab = (id: string, label: string, icon: React.ReactNode) => (
    <button
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
      }`}
      onClick={() => setActiveTab(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage your team members, roles, and permissions</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn btn-outline btn-sm">
              <Download className="w-4 h-4 mr-2" />
              Export Team
            </button>
            <button className="btn btn-outline btn-sm">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </button>
          </div>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Invites</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter(m => m.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter(m => ['Owner', 'Admin'].includes(m.role)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex space-x-2">
            {renderTab('members', 'Team Members', <Users className="w-4 h-4" />)}
            {renderTab('roles', 'Roles & Permissions', <Shield className="w-4 h-4" />)}
            {renderTab('activity', 'Activity Log', <Clock className="w-4 h-4" />)}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Team Members Tab */}
          {activeTab === 'members' && (
            <div className="p-6">
              {/* Filters and Search */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search team members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                  </div>
                  
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="btn btn-outline btn-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Team Settings
                  </button>
                </div>
              </div>

              {/* Team Members Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${getRoleColor(member.role)}`}>
                            {member.role === 'Owner' && <Crown className="w-3 h-3 mr-1" />}
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${getStatusColor(member.status)}`}>
                            {getStatusIcon(member.status)}
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatLastActive(member.lastActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="text-center">
                            <div className="font-medium">{member.documents}</div>
                            <div className="text-xs text-gray-400">docs</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="btn btn-ghost btn-xs">
                              <Eye className="w-3 h-3" />
                            </button>
                            <button className="btn btn-ghost btn-xs">
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {member.role !== 'Owner' && (
                              <button className="btn btn-ghost btn-xs text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Roles & Permissions Tab */}
          {activeTab === 'roles' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Roles & Permissions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-lg font-medium ${role.color}`}>{role.name}</h4>
                      <span className={`badge ${getRoleColor(role.name)}`}>
                        {role.name === 'Owner' && <Crown className="w-3 h-3 mr-1" />}
                        {role.name}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Permissions:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {permissions[role.id as keyof typeof permissions]?.map((permission) => (
                          <li key={permission} className="flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-600 mr-2" />
                            {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500">
                        Members with this role: {teamMembers.filter(m => m.role === role.name).length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Team Activity Log</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sarah Wilson joined the team</p>
                    <p className="text-xs text-gray-500">January 10, 2025 at 2:30 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mike Johnson signed 3 documents</p>
                    <p className="text-xs text-gray-500">January 15, 2025 at 1:45 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Jane Smith&apos;s role changed to Admin</p>
                    <p className="text-xs text-gray-500">January 14, 2025 at 3:20 PM</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="colleague@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.filter(role => role.id !== 'owner').map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hi! I'd like to invite you to join our team on BuffrSign..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="btn btn-outline"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleInvite}
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
