
import React from 'react';
import { Question } from '../types';
import { Star, AlertTriangle, MessageSquare, ArrowUpRight, ShieldCheck, Search } from 'lucide-react';

const MOCK_QUESTIONS: Question[] = [
    {
        id: 'q1',
        text: '55M with refractory hyponatremia. What is the most appropriate initial management?',
        options: [], correctAnswerIndex: 0, 
        qualityMetrics: { qualityScore: 92, ambiguityReports: 0, expertRating: 4.8, discriminationIndex: 0.45, lastUpdated: Date.now() },
        category: 'Nephrology'
    },
    {
        id: 'q2',
        text: 'Which drug is contraindicated in acute heart failure with shock?',
        options: [], correctAnswerIndex: 0,
        qualityMetrics: { qualityScore: 85, ambiguityReports: 1, expertRating: 4.2, discriminationIndex: 0.38, lastUpdated: Date.now() },
        category: 'Cardiology'
    },
    {
        id: 'q3',
        text: 'Diagnosis of SLE requires how many criteria?',
        options: [], correctAnswerIndex: 0,
        qualityMetrics: { qualityScore: 45, ambiguityReports: 12, expertRating: 2.5, discriminationIndex: 0.15, lastUpdated: Date.now() },
        category: 'Rheumatology'
    }
];

const QuestionQualityDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="bg-gray-50 h-full flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="text-indigo-600" /> Question Quality Score (Q-QS)
                </h1>
                <p className="text-gray-500 text-sm">Automated quality audit based on student performance and feedback.</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Back</button>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Star className="text-yellow-500" />
                        <h3 className="font-bold text-gray-700">Avg Quality Score</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900">78.5</p>
                    <p className="text-green-600 text-sm font-medium">Top Tier Question Bank</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="text-red-500" />
                        <h3 className="font-bold text-gray-700">Flagged Items</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900">3</p>
                    <p className="text-red-600 text-sm font-medium">Requires Immediate Review</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="text-blue-500" />
                        <h3 className="font-bold text-gray-700">Feedback Reports</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900">24</p>
                    <p className="text-gray-500 text-sm font-medium">In the last 30 days</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" placeholder="Search questions..." />
                    </div>
                    <div className="flex gap-2">
                        <select className="border rounded-lg text-sm p-2">
                            <option>All Categories</option>
                            <option>Nephrology</option>
                            <option>Cardiology</option>
                        </select>
                        <select className="border rounded-lg text-sm p-2">
                            <option>Sort by Score (Low to High)</option>
                            <option>Sort by Reports</option>
                        </select>
                    </div>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Question</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3 text-center">Discrimination</th>
                            <th className="px-6 py-3 text-center">Ambiguity</th>
                            <th className="px-6 py-3 text-center">Q-QS Score</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MOCK_QUESTIONS.map(q => (
                            <tr key={q.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 max-w-md truncate">{q.text}</td>
                                <td className="px-6 py-4 text-gray-500">{q.category}</td>
                                <td className="px-6 py-4 text-center">{q.qualityMetrics?.discriminationIndex}</td>
                                <td className="px-6 py-4 text-center">
                                    {q.qualityMetrics?.ambiguityReports > 0 ? (
                                        <span className="text-red-600 font-bold flex items-center justify-center gap-1">
                                            <AlertTriangle size={14}/> {q.qualityMetrics?.ambiguityReports}
                                        </span>
                                    ) : <span className="text-gray-400">-</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${q.qualityMetrics?.qualityScore < 60 ? 'bg-red-500' : q.qualityMetrics?.qualityScore < 80 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                                style={{ width: `${q.qualityMetrics?.qualityScore}%` }}
                                            ></div>
                                        </div>
                                        <span className="font-bold">{q.qualityMetrics?.qualityScore}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 font-bold hover:underline flex items-center justify-end gap-1">
                                        Review <ArrowUpRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default QuestionQualityDashboard;
