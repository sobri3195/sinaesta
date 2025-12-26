import React from 'react';
import CaseDiscussion from '../components/CaseDiscussion';
import { useUser } from '../providers/UserProvider';

const CaseDiscussionPage: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="h-full overflow-y-auto">
      <CaseDiscussion userRole={user.role} />
    </div>
  );
};

export default CaseDiscussionPage;
