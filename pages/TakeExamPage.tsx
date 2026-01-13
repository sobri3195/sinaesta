import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExamTaker from '../components/ExamTaker';
import { useExamData } from '../providers/ExamDataProvider';
import { useExamSession } from '../providers/ExamSessionProvider';
import { useUser } from '../providers/UserProvider';
import { calculateExamScore } from '../utils/examScoring';

const TakeExamPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { exams } = useExamData();
  const { recordResult } = useExamSession();
  const { user } = useUser();

  const exam = exams.find((item) => item.id === examId);

  if (!exam) {
    return (
      <div className="p-6 text-gray-600">
        Exam tidak ditemukan. <button onClick={() => navigate('/dashboard')}>Kembali ke dashboard.</button>
      </div>
    );
  }

  return (
    <ExamTaker
      exam={exam}
      onSubmit={(answers) => {
        const score = calculateExamScore(exam, answers);
        recordResult({
          examId: exam.id,
          studentId: user.id,
          score,
          totalQuestions: exam.questions.length,
          answers,
          completedAt: Date.now()
        });
        navigate(`/results/${exam.id}`);
      }}
      onExit={() => navigate('/dashboard')}
    />
  );
};

export default TakeExamPage;
