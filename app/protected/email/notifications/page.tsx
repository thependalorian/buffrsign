import React from 'react';
import EmailNotificationList from '@/components/email/EmailNotificationList';

const UserEmailNotificationsPage: React.FC = () => {
  return (
    <div className="user-email-notifications-page">
      <h1>User Email Overview</h1>
      <p>View a list of your recent email notifications.</p>
      <EmailNotificationList />
    </div>
  );
};

export default UserEmailNotificationsPage;