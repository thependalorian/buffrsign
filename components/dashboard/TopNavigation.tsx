// BuffrSign Platform - Top Navigation Component
// Provides top navigation bar with _user menu, notifications, and mobile controls

import { useState } from 'react';
import { useAuth } from '../../lib/contexts/auth-context';
import { UserProfile } from '@/lib/auth/types';

// ============================================================================
// TOP NAVIGATION PROPS
// ============================================================================

interface TopNavigationProps {
  _user: UserProfile;
  onMenuClick: () => void;
  showMobileMenu: boolean;
}

// ============================================================================
// TOP NAVIGATION COMPONENT
// ============================================================================

export default function TopNavigation({ _user, onMenuClick, showMobileMenu }: TopNavigationProps) {
  const { signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // ============================================================================
  // RENDER TOP NAVIGATION
  // ============================================================================

  return (
    <div className="bg-base-100 border-b border-base-300 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Mobile Menu & Search */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {showMobileMenu && (
            <button
              onClick={onMenuClick}
              className="lg:hidden btn btn-ghost btn-sm"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents, workflows..."
                className="input input-bordered input-sm w-64 pl-10"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Section - Notifications & User Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="btn btn-ghost btn-sm relative"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.83 2.83A4 4 0 004 6v6a4 4 0 004 4h6a4 4 0 004-4V6a4 4 0 00-4-4H8a4 4 0 00-2.83 1.17z" />
              </svg>
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 badge badge-primary badge-xs">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-lg shadow-lg border border-base-300 z-50">
                <div className="p-4 border-b border-base-300">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {/* Notification Items */}
                  <div className="p-4 border-b border-base-200 hover:bg-base-200 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Document signed</p>
                        <p className="text-xs text-base-content/70">Contract #1234 has been signed by all parties</p>
                        <p className="text-xs text-base-content/50 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-b border-base-200 hover:bg-base-200 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">KYC verification required</p>
                        <p className="text-xs text-base-content/70">Please complete your identity verification</p>
                        <p className="text-xs text-base-content/50 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-base-200 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Workflow completed</p>
                        <p className="text-xs text-base-content/70">Agreement workflow #5678 has been completed</p>
                        <p className="text-xs text-base-content/50 mt-1">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-base-300">
                  <button className="btn btn-primary btn-sm w-full">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 btn btn-ghost btn-sm"
              aria-label="User menu"
            >
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span className="text-sm font-medium">
                    {_user.first_name?.[0]}{_user.last_name?.[0]}
                  </span>
                </div>
              </div>
              <span className="hidden md:block text-sm font-medium">
                {_user.first_name} {_user.last_name}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-base-100 rounded-lg shadow-lg border border-base-300 z-50">
                <div className="p-4 border-b border-base-300">
                  <div className="flex items-center space-x-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-10">
                        <span className="text-sm font-medium">
                          {_user.first_name?.[0]}{_user.last_name?.[0]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {_user.first_name} {_user.last_name}
                      </p>
                      <p className="text-xs text-base-content/70">{_user.email}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="badge badge-sm badge-outline">
                          {_user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </a>
                  <a
                    href="/help"
                    className="flex items-center px-4 py-2 text-sm text-base-content hover:bg-base-200"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Support
                  </a>
                </div>
                <div className="p-4 border-t border-base-300">
                  <button
                    onClick={handleSignOut}
                    className="btn btn-outline btn-sm w-full"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
}
