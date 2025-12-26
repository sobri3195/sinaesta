import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExamCreator from '../components/ExamCreator';
import { Exam } from '../types';
import { useExamData } from '../providers/ExamDataProvider';

const ExamCreatorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setExams } = useExamData();

  const state = location.state as { exam?: Exam } | null;
  const initialExam = state?.exam ?? null;

  return (
    <div className="p-8 h-full overflow-hidden">
      <ExamCreator
        initialExam={initialExam}
        onSave={(exam) => {
          setExams((prev) => {
            const exists = prev.some((item) => item.id === exam.id);
            if (exists) {
              return prev.map((item) => (item.id === exam.id ? exam : item));
            }
            return [...prev, exam];
          });
          navigate('/admin');
        }}
        onCancel={() => navigate('/admin')}
      />
    </div>
  );
};

export default ExamCreatorPage;
