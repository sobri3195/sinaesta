import React from 'react';
import ClinicalReasoningSimulator from '../components/ClinicalReasoningSimulator';
import { CLINICAL_REASONING_QUESTION } from '../mockData';
import { useNavigate } from 'react-router-dom';

const ClinicalReasoningPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full p-4 md:p-8 bg-gray-100 overflow-y-auto">
      <ClinicalReasoningSimulator
        question={CLINICAL_REASONING_QUESTION}
        onComplete={() => navigate('/dashboard')}
        onExit={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default ClinicalReasoningPage;
