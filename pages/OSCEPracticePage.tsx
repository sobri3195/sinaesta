import React from 'react';
import OSCEMode from '../components/OSCEMode';
import { DEFAULT_OSCE_STATION } from '../mockData';
import { useNavigate } from 'react-router-dom';

const OSCEPracticePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full p-4 md:p-8 bg-gray-100 overflow-y-auto">
      <OSCEMode station={DEFAULT_OSCE_STATION} onComplete={() => navigate('/dashboard')} />
    </div>
  );
};

export default OSCEPracticePage;
