import React from 'react';
import { useNavigate } from 'react-router-dom';
import VignetteBuilder from '../components/VignetteBuilder';
import { CaseVignette } from '../types';

const VignetteBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden p-8">
      <VignetteBuilder onSave={(_: CaseVignette) => navigate('/admin')} onCancel={() => navigate('/admin')} />
    </div>
  );
};

export default VignetteBuilderPage;
