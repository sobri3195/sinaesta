import React from 'react';
import { useNavigate } from 'react-router-dom';
import OSCEManager from '../components/OSCEManager';

const OSCEManagerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden p-8">
      <OSCEManager onClose={() => navigate('/admin')} />
    </div>
  );
};

export default OSCEManagerPage;
