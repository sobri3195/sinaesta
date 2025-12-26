import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpotDxDrill from '../components/SpotDxDrill';

const SpotDxPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-gray-100 overflow-y-auto">
      <SpotDxDrill onExit={() => navigate('/dashboard')} />
    </div>
  );
};

export default SpotDxPage;
