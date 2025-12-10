


import React, { useEffect, useState, useMemo } from 'react';
import { Exam, ExamResult } from '../types';
import { generatePerformanceFeedback, IncorrectSample } from '../services/geminiService';
import { Check, X, Award, BarChart2, ArrowRight, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Watermark from './Watermark';

interface ResultsViewProps {
  exam: Exam;
  result: ExamResult;
  onClose: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ exam, result, onClose }) => {
  const [feedback, setFeedback] = useState<string>('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Calculate maximum possible score (weighted)
  const maxScore = useMemo(() => {
      return exam.questions.reduce((acc, q) => acc + (q.points || 1), 0);
  }, [exam]);

  // Calculate count of correct answers
  const correctCount = useMemo(() => {
      return result.answers.reduce((acc, ans, idx) => {
          return ans === exam.questions[idx].correctAnswerIndex ? acc + 1 : acc;
      }, 0);
  }, [result, exam]);

  // Calculate stats by topic/category
  const topicPerformance = useMemo(() => {
    const stats: Record<string, { totalPoints: number; earnedPoints: number }> = {};
    exam.questions.forEach((q, idx) => {
      const cat = q.category || 'General';
      if (!stats[cat]) stats[cat] = { totalPoints: 0, earnedPoints: 0 };
      const qPoints = q.points || 1;
      stats[cat].totalPoints += qPoints;
      if (result.answers[idx] === q.correctAnswerIndex) {
          stats[cat].earnedPoints += qPoints;
      }
    });
    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      percentage: Math.round((data.earnedPoints / data.totalPoints) * 100)
    })).sort((a,b) => b.percentage - a.percentage);
  }, [exam, result]);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoadingFeedback(true);
      
      // Identify specific incorrect questions (Limit to 5 to keep prompt concise but detailed)
      const incorrectSamples: IncorrectSample[] = exam.questions
        .map((q, idx) => ({ q, idx, userAnswer: result.answers[idx] }))
        .filter(item => item.userAnswer !== item.q.correctAnswerIndex)
        .slice(0, 5)
        .map(item => ({
          index: item.idx + 1,
          text: item.q.text.length > 100 ? item.q.text.substring(0, 100) + '...' : item.q.text,
          category: item.q.category || 'General'
        }));

      const text = await generatePerformanceFeedback(
        exam.title, 
        result.score, 
        maxScore, // Use max score points, not question count
        exam.topic,
        incorrectSamples
      );
      setFeedback(text);
      setLoadingFeedback(false);
    };
    fetchFeedback();
  }, [exam, result, maxScore]);

  const percentage = Math.round((result.score / maxScore) * 100);
  
  // Pie chart shows Question Counts (Correct vs Incorrect), as points are hard to visualize in a pie
  const chartData = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: result.totalQuestions - correctCount },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12 relative">
      <Watermark user={{ id: 'u1', name: 'Student', role: 'STUDENT' } as any} />
      
      {/* Summary Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <Award className="mx-auto w-16 h-16 text-yellow-400 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Exam Completed!</h2>
        <p className="text-gray-500 mb-6">Here is how you performed on {exam.title}</p>
        
        <div className="flex justify-center items-center gap-12 mb-8">
          <div className="text-center">
            <div className="text-4xl font-black text-gray-900">{percentage}%</div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Final Grade</div>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-4xl font-black text-indigo-600">{result.score}<span className="text-2xl text-gray-400">/{maxScore}</span></div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Points</div>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-4xl font-black text-green-600">{correctCount}<span className="text-2xl text-gray-400">/{result.totalQuestions}</span></div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Correct Answers</div>
          </div>
        </div>

        {/* AI Feedback Section */}
        <div className="bg-indigo-50 rounded-xl p-6 text-left max-w-3xl mx-auto border border-indigo-100 relative">
          <div className="flex items-center gap-2 mb-3 text-indigo-800 font-bold border-b border-indigo-200 pb-2">
            <BookOpen size={20} />
            AI Study Recommendations
          </div>
          {loadingFeedback ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
              <div className="h-4 bg-indigo-200 rounded w-full"></div>
              <div className="h-4 bg-indigo-200 rounded w-5/6"></div>
            </div>
          ) : (
            <div className="prose prose-sm prose-indigo text-indigo-900 leading-relaxed max-w-none">
              <p className="whitespace-pre-line">{feedback}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Column: Visual Breakdown & Topic Stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Overall Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
            <h3 className="font-semibold text-gray-700 mb-4 self-start">Accuracy Breakdown</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div> Correct
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div> Incorrect
              </div>
            </div>
          </div>

          {/* Topic Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h3 className="font-semibold text-gray-700 mb-4">Topic Analysis (Points)</h3>
             <div className="space-y-4">
               {topicPerformance.map((topic) => (
                 <div key={topic.name}>
                   <div className="flex justify-between text-sm mb-1">
                     <span className="font-medium text-gray-700">{topic.name}</span>
                     <span className="text-gray-500">{topic.earnedPoints}/{topic.totalPoints} ({topic.percentage}%)</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                     <div 
                       className={`h-2.5 rounded-full transition-all duration-500 ${
                         topic.percentage >= 80 ? 'bg-green-500' : 
                         topic.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                       }`} 
                       style={{ width: `${topic.percentage}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
               {topicPerformance.length === 0 && (
                 <div className="text-center text-gray-400 text-sm py-4">
                   No topic data available.
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Question Review</h3>
          </div>
          <div className="overflow-y-auto p-6 space-y-6 flex-1 max-h-[800px]">
            {exam.questions.map((q, idx) => {
              const isCorrect = result.answers[idx] === q.correctAnswerIndex;
              const points = q.points || 1;
              
              return (
                <div key={q.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex gap-3">
                    <div className={`mt-1 min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {isCorrect ? <Check size={14} /> : <X size={14} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded">
                          {q.category || 'General'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {isCorrect ? `+${points} Points` : '0 Points'}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium text-sm mb-3 mt-1">{idx + 1}. {q.text}</p>
                      
                      {/* Only show selected wrong answer if it was wrong */}
                      {!isCorrect && result.answers[idx] !== -1 && (
                        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm mb-2 border border-red-100">
                          <span className="font-bold mr-2">Your Answer:</span>
                          {q.options[result.answers[idx]]}
                        </div>
                      )}

                      <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm border border-green-100">
                        <span className="font-bold mr-2">Correct Answer:</span>
                        {q.options[q.correctAnswerIndex]}
                      </div>

                      {q.explanation && (
                        <p className="mt-2 text-xs text-gray-500 italic">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 relative z-10">
        <button 
          onClick={onClose}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2 shadow-lg"
        >
          Return to Dashboard
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ResultsView;