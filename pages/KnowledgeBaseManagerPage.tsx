import React from 'react';
import { useNavigate } from 'react-router-dom';
import KnowledgeBaseManager from '../components/KnowledgeBaseManager';

const KnowledgeBaseManagerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden">
      <KnowledgeBaseManager onClose={() => navigate('/admin')} />
    </div>
  );
};

export default KnowledgeBaseManagerPage;
