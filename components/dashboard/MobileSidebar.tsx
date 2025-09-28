"use client";

// BuffrSign Platform - Mobile Sidebar Component
// Provides mobile-responsive sidebar navigation

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserProfile } from '@/lib/auth/types';

// ============================================================================
// MOBILE SIDEBAR PROPS
// ============================================================================

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  _user: UserProfile;
}

// ============================================================================
// MOBILE SIDEBAR COMPONENT
// ============================================================================

export default function MobileSidebar({ isOpen, onClose, _user }: MobileSidebarProps) {
  const pathname = usePathname();

  // ============================================================================
  // NAVIGATION ITEMS (Simplified for mobile)
  // ============================================================================

  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      label: 'Documents',
      href: '/documents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      label: 'Signatures',
      href: '/signatures',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      label: 'Workflows',
      href: '/workflows',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    // Admin section for admin users
    ...(_user.role === 'admin' || _user.role === 'super_admin' ? [{
      label: 'Admin',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }] : [])
  ];

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleNavClick = () => {
    onClose();
  };

  // ============================================================================
  // RENDER MOBILE SIDEBAR
  // ============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-base-200 border-r border-base-300 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-base-300">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-content font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-base-content">BuffrSign</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close mobile menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12">
                <span className="text-sm font-medium">
                  {_user.first_name?.[0]}{_user.last_name?.[0]}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-base-content truncate">
                {_user.first_name} {_user.last_name}
              </p>
              <p className="text-xs text-base-content/70 truncate">
                {_user.email}
              </p>
              <div className="flex items-center mt-1">
                <span className="badge badge-sm badge-outline">
                  {_user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? 'bg-primary text-primary-content'
                    : 'text-base-content hover:bg-base-300'
                }`}
                onClick={handleNavClick}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-base-300">
          <div className="text-xs text-base-content/50 text-center mb-4">
            BuffrSign v1.0.0
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <button className="btn btn-primary btn-sm w-full">
              Upload Document
            </button>
            <button className="btn btn-outline btn-sm w-full">
              Create Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
