import React from 'react';
import { useNavigate } from 'react-router-dom';
import MentorMarketplace from '../components/MentorMarketplace';

const MentorMarketplacePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto">
      <MentorMarketplace onClose={() => navigate('/dashboard')} />
    </div>
  );
};

export default MentorMarketplacePage;
