import React from 'react';
import { useNavigate } from 'react-router-dom';
import HighYieldMap from '../components/HighYieldMap';

const HighYieldMapPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden">
      <HighYieldMap onClose={() => navigate('/admin')} />
    </div>
  );
};

export default HighYieldMapPage;
