// BuffrSign Platform - Dashboard Layout Component
// Provides the main dashboard layout with navigation, sidebar, and content area

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/contexts/auth-context';
// import { UserRole, KYCStatus } from '../../lib/types';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import MobileSidebar from './MobileSidebar';

// ============================================================================
// DASHBOARD LAYOUT PROPS
// ============================================================================

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBreadcrumbs?: boolean;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
}

// ============================================================================
// DASHBOARD LAYOUT COMPONENT
// ============================================================================

export default function DashboardLayout({
  children,
  title,
  subtitle,
  showBreadcrumbs = true,
  breadcrumbs = []
}: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ============================================================================
  // RESPONSIVE HANDLING
  // ============================================================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ============================================================================
  // SIDEBAR TOGGLE
  // ============================================================================

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // ============================================================================
  // USER NOT AUTHENTICATED
  // ============================================================================

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER DASHBOARD
  // ============================================================================

  return (
    <div className="min-h-screen bg-base-100">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          user={user}
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar user={user} />
      )}

      {/* Main Content Area */}
      <div className={`${!isMobile ? 'lg:ml-64' : ''} transition-all duration-300`}>
        {/* Top Navigation */}
        <TopNavigation
          user={user}
          onMenuClick={toggleSidebar}
          showMobileMenu={isMobile}
        />

        {/* Main Content */}
        <main className="p-6">
          {/* Page Header */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-3xl font-bold text-base-content mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-base-content/70 text-lg">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <div className="text-sm breadcrumbs mb-6">
              <ul>
                {breadcrumbs.map((crumb, index) => (
                  <li key={index}>
                    {crumb.href && !crumb.active ? (
                      <a href={crumb.href} className="text-primary hover:text-primary-focus">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className={crumb.active ? 'text-base-content font-medium' : 'text-base-content/70'}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Page Content */}
          <div className="bg-base-100 rounded-lg">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD SECTION COMPONENT
// ============================================================================

interface DashboardSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function DashboardSection({
  children,
  title,
  subtitle,
  className = '',
  actions
}: DashboardSectionProps) {
  return (
    <div className={`bg-base-200 rounded-lg p-6 ${className}`}>
      {/* Section Header */}
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-base-content mb-1">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base-content/70 text-sm">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Section Content */}
      <div>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD CARD COMPONENT
// ============================================================================

interface DashboardCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function DashboardCard({
  children,
  title,
  subtitle,
  className = '',
  onClick,
  hover = false
}: DashboardCardProps) {
  const baseClasses = 'bg-base-100 rounded-lg p-4 border border-base-300';
  const hoverClasses = hover ? 'hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickClasses} ${className}`}
      onClick={onClick}
    >
      {/* Card Header */}
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <h3 className="text-lg font-semibold text-base-content mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-base-content/70 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Card Content */}
      <div>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD STATS COMPONENT
// ============================================================================

interface DashboardStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    change?: {
      value: number;
      type: 'increase' | 'decrease';
    };
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export function DashboardStats({ stats, className = '' }: DashboardStatsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <DashboardCard key={index} className="text-center">
          {/* Icon */}
          {stat.icon && (
            <div className="flex justify-center mb-2">
              <div className="text-2xl text-primary">
                {stat.icon}
              </div>
            </div>
          )}

          {/* Value */}
          <div className="text-3xl font-bold text-base-content mb-1">
            {stat.value}
          </div>

          {/* Label */}
          <div className="text-base-content/70 text-sm mb-2">
            {stat.label}
          </div>

          {/* Change Indicator */}
          {stat.change && (
            <div className={`text-xs font-medium ${
              stat.change.type === 'increase' 
                ? 'text-success' 
                : 'text-error'
            }`}>
              {stat.change.type === 'increase' ? '↗' : '↘'} {Math.abs(stat.change.value)}%
            </div>
          )}
        </DashboardCard>
      ))}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  DashboardLayout,
};
