
import React from 'react';
import { Question, QuestionStatus } from '../types';
import { CheckCircle, XCircle, BarChart2, Activity } from 'lucide-react';

interface QuestionReviewProps {
  questions: Question[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onClose: () => void;
}

const QuestionReview: React.FC<QuestionReviewProps> = ({ questions, onApprove, onReject, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="text-indigo-600" /> Quality Control & Review
            </h1>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-lg">#{idx + 1}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                                    q.status === QuestionStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-200' :
                                    q.status === QuestionStatus.DRAFT ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                    {q.status || 'DRAFT'}
                                </span>
                            </div>
                            {q.itemAnalysis && (
                                <div className="flex gap-4 text-xs font-medium text-gray-500">
                                    <div className="flex items-center gap-1" title="Difficulty Index (p-value)">
                                        <BarChart2 size={14} /> P: {q.itemAnalysis.difficultyIndex}
                                    </div>
                                    <div className="flex items-center gap-1" title="Discrimination Index (d-value)">
                                        <Activity size={14} /> D: {q.itemAnalysis.discriminationIndex}
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="font-medium text-gray-900 mb-4">{q.text}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {q.options.map((opt, i) => (
                                <div key={i} className={`p-3 rounded border text-sm ${
                                    i === q.correctAnswerIndex ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-white border-gray-200 text-gray-600'
                                }`}>
                                    {String.fromCharCode(65 + i)}. {opt}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button 
                                onClick={() => onReject(q.id, 'Needs revision')}
                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2"
                            >
                                <XCircle size={16} /> Reject / Revise
                            </button>
                            <button 
                                onClick={() => onApprove(q.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                            >
                                <CheckCircle size={16} /> Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default QuestionReview;
