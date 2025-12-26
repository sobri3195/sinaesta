import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionReview from '../components/QuestionReview';
import { useExamData } from '../providers/ExamDataProvider';

const QuestionReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { exams } = useExamData();
  const questions = exams.flatMap((exam) => exam.questions);

  return (
    <div className="h-full overflow-hidden p-8">
      <QuestionReview questions={questions} onApprove={() => {}} onReject={() => {}} onClose={() => navigate('/admin')} />
    </div>
  );
};

export default QuestionReviewPage;
