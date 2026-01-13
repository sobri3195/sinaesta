import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResultsView from '../components/ExamResult';
import { useExamData } from '../providers/ExamDataProvider';
import { useExamSession } from '../providers/ExamSessionProvider';

const ResultsPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { exams } = useExamData();
  const { lastResult, clearLastResult } = useExamSession();

  const exam = exams.find((item) => item.id === examId);

  if (!exam || !lastResult || lastResult.examId !== examId) {
    return (
      <div className="p-6 text-gray-600">
        Hasil ujian tidak tersedia.{' '}
        <button className="text-indigo-600 font-medium" onClick={() => navigate('/dashboard')}>
          Kembali ke dashboard
        </button>
        .
      </div>
    );
  }

  return (
    <div className="p-8 overflow-y-auto h-full">
      <ResultsView
        exam={exam}
        result={lastResult}
        onClose={() => {
          clearLastResult();
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default ResultsPage;
