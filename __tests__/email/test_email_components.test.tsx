import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import components
import EmailBlacklistManager from '../../components/email/EmailBlacklistManager';
import EmailHealthMonitor from '../../components/email/EmailHealthMonitor';

// Import pages
import AdminEmailQueuePage from '../../app/protected/admin/email/queue/page';
import AdminEmailBlacklistPage from '../../app/protected/admin/email/blacklist/page';
import UserEmailNotificationsPage from '../../app/protected/email/notifications/page';
import UserEmailHistoryPage from '../../app/protected/email/history/page';

describe('BuffrSign Email Components and Pages', () => {
  // Components
  test('EmailBlacklistManager renders correctly', () => {
    render(<EmailBlacklistManager />);
    expect(screen.getByText(/Email Blacklist Management/i)).toBeInTheDocument();
  });

  test('EmailHealthMonitor renders correctly', () => {
    render(<EmailHealthMonitor />);
    expect(screen.getByText(/Email System Health Monitor/i)).toBeInTheDocument();
  });

  // Pages
  test('AdminEmailQueuePage renders correctly', () => {
    render(<AdminEmailQueuePage />);
    expect(screen.getByRole('heading', { name: /Admin Email Overview/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Email Queue Management/i, level: 2 })).toBeInTheDocument();
  });

  test('AdminEmailBlacklistPage renders correctly', () => {
    render(<AdminEmailBlacklistPage />);
    expect(screen.getByRole('heading', { name: /Admin Email Overview/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Email Blacklist Management/i, level: 2 })).toBeInTheDocument();
  });

  test('UserEmailNotificationsPage renders correctly', () => {
    render(<UserEmailNotificationsPage />);
    expect(screen.getByRole('heading', { name: /Your Notifications/i })).toBeInTheDocument();
  });

  test('UserEmailHistoryPage renders correctly', () => {
    render(<UserEmailHistoryPage />);
    expect(screen.getByRole('heading', { name: /Email History/i })).toBeInTheDocument();
  });
});
