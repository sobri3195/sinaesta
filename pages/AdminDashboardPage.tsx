import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useExamData } from '../providers/ExamDataProvider';
import { useUser } from '../providers/UserProvider';
import { UserRole } from '../types';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { exams } = useExamData();
  const { user } = useUser();

  return (
    <div className="p-8 overflow-y-auto h-full">
      {user.role === UserRole.PROGRAM_ADMIN && <AnalyticsDashboard />}
      <div className="mt-8">
        <AdminDashboard
          exams={exams}
          onCreateExam={() => navigate('/admin/create-exam')}
          onEditExam={(exam) => navigate('/admin/create-exam', { state: { exam } })}
          onPreviewExam={(exam) => navigate(`/exam/${exam.id}`)}
          onDeleteExam={() => {}}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
