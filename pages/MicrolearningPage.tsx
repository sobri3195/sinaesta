import React from 'react';
import { useNavigate } from 'react-router-dom';
import MicrolearningHub from '../components/MicrolearningHub';

const MicrolearningPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto">
      <MicrolearningHub onClose={() => navigate('/dashboard')} />
    </div>
  );
};

export default MicrolearningPage;
