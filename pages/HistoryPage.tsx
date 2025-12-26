import React from 'react';
import ExamHistory from '../components/ExamHistory';
import { useExamData } from '../providers/ExamDataProvider';
import { useExamSession } from '../providers/ExamSessionProvider';

const HistoryPage: React.FC = () => {
  const { exams } = useExamData();
  const { examHistory } = useExamSession();

  return (
    <div className="p-8 overflow-y-auto h-full">
      <ExamHistory results={examHistory} exams={exams} />
    </div>
  );
};

export default HistoryPage;
