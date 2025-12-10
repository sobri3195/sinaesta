import React from 'react';
import { ExamResult, Exam } from '../types';
import { Calendar, Clock, Trophy, BarChart2 } from 'lucide-react';

interface ExamHistoryProps {
  results: ExamResult[];
  exams: Exam[];
}

const ExamHistory: React.FC<ExamHistoryProps> = ({ results, exams }) => {
  const getExamTitle = (examId: string) => {
    return exams.find(e => e.id === examId)?.title || 'Unknown Exam';
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-200">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Trophy className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Exam History</h3>
        <p className="text-gray-500">You haven't completed any exams yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart2 className="text-indigo-600" />
        Performance History
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {results.sort((a,b) => b.completedAt - a.completedAt).map((result, idx) => {
          const percentage = Math.round((result.score / result.totalQuestions) * 100);
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{getExamTitle(result.examId)}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(result.completedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(result.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="text-center">
                   <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Score</div>
                   <div className="text-xl font-bold text-gray-900">{result.score} / {result.totalQuestions}</div>
                </div>
                
                <div className={`px-4 py-2 rounded-lg border font-bold text-xl min-w-[5rem] text-center ${getScoreColor(percentage)}`}>
                  {percentage}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default ExamHistory;