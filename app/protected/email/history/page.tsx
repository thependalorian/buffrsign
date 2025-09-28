import React from 'react';
import { EmailHistory } from '@/components/email/EmailHistory';

const UserEmailHistoryPage: React.FC = () => {
  return (
    <div className="user-email-history-page">
      <h1>User Email Overview</h1>
      <p>View a log of all emails sent to you.</p>
      <EmailHistory />
    </div>
  );
};

export default UserEmailHistoryPage;