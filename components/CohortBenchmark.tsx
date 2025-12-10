
import React from 'react';
import { CohortMetric } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Users, TrendingUp, Award, Target } from 'lucide-react';

const MOCK_METRICS: CohortMetric[] = [
    { category: 'Cardiology', userScore: 78, cohortAvg: 65, top10Avg: 85, percentile: 82 },
    { category: 'Pulmonology', userScore: 55, cohortAvg: 68, top10Avg: 88, percentile: 30 },
    { category: 'Gastroentero', userScore: 72, cohortAvg: 70, top10Avg: 90, percentile: 55 },
    { category: 'Nephrology', userScore: 60, cohortAvg: 62, top10Avg: 82, percentile: 45 },
    { category: 'Endocrine', userScore: 88, cohortAvg: 70, top10Avg: 92, percentile: 95 },
];

const CohortBenchmark: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="text-indigo-600" /> Cohort Benchmarking
                </h1>
                <p className="text-gray-500 text-sm">Anonymous comparison of your performance vs. your peer group.</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Back</button>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-green-500" />
                        <h3 className="font-bold text-gray-700">Your Rank</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900">Top 18%</p>
                    <p className="text-gray-500 text-sm">You are performing better than 82% of peers.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Target className="text-indigo-500" />
                        <h3 className="font-bold text-gray-700">Strongest Domain</h3>
                    </div>
                    <p className="text-xl font-black text-gray-900">Endocrinology</p>
                    <p className="text-green-600 text-sm font-medium">95th Percentile</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="text-amber-500" />
                        <h3 className="font-bold text-gray-700">PPDS Readiness</h3>
                    </div>
                    <p className="text-xl font-black text-gray-900">High</p>
                    <p className="text-gray-500 text-sm">Based on cutoff trends from previous years.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                <h3 className="font-bold text-gray-900 mb-6">Topic Performance Comparison</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={MOCK_METRICS}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="category" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                cursor={{fill: 'transparent'}}
                            />
                            <Legend />
                            <Bar dataKey="userScore" name="Your Score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="cohortAvg" name="Cohort Avg" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="top10Avg" name="Top 10% Avg" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h4 className="font-bold text-blue-900 mb-2">Performance Insight</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                    Your performance in <strong>Endocrinology</strong> is exceptional, placing you in the top tier of your cohort. However, <strong>Pulmonology</strong> falls below the cohort average. We recommend focusing your upcoming study sessions on obstructive and restrictive lung diseases to close this gap.
                </p>
            </div>
        </div>
    </div>
  );
};

export default CohortBenchmark;
