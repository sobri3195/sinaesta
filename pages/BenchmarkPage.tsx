import React from 'react';
import { useNavigate } from 'react-router-dom';
import CohortBenchmark from '../components/CohortBenchmark';

const BenchmarkPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto">
      <CohortBenchmark onClose={() => navigate('/dashboard')} />
    </div>
  );
};

export default BenchmarkPage;
