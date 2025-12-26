import React from 'react';
import Logbook from '../components/Logbook';
import { useUser } from '../providers/UserProvider';

const LogbookPage: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="h-full p-4 md:p-8 overflow-y-auto">
      <Logbook userRole={user.role} targetSpecialty={user.targetSpecialty} />
    </div>
  );
};

export default LogbookPage;
