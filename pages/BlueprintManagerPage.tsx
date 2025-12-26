import React from 'react';
import { useNavigate } from 'react-router-dom';
import BlueprintManager from '../components/BlueprintManager';

const BlueprintManagerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden">
      <BlueprintManager onClose={() => navigate('/admin')} />
    </div>
  );
};

export default BlueprintManagerPage;
