import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionQualityDashboard from '../components/QuestionQualityDashboard';

const QuestionQualityPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden">
      <QuestionQualityDashboard onClose={() => navigate('/admin')} />
    </div>
  );
};

export default QuestionQualityPage;
