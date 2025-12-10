
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Download, TrendingUp, AlertTriangle, Users, Clock, Activity } from 'lucide-react';

// Mock Data for Fatigue Analysis
const FATIGUE_DATA = [
    { timeSegment: '0-15m', accuracy: 85, avgTime: 45 },
    { timeSegment: '15-30m', accuracy: 82, avgTime: 50 },
    { timeSegment: '30-45m', accuracy: 75, avgTime: 55 },
    { timeSegment: '45-60m', accuracy: 65, avgTime: 65 }, // Fatigue drop
    { timeSegment: '60-75m', accuracy: 60, avgTime: 70 },
    { timeSegment: '75-90m', accuracy: 55, avgTime: 80 },
];

const COHORT_TREND_DATA = [
    { month: 'Jan', avgScore: 65 },
    { month: 'Feb', avgScore: 68 },
    { month: 'Mar', avgScore: 72 },
    { month: 'Apr', avgScore: 70 }, // Slight dip
    { month: 'May', avgScore: 75 },
    { month: 'Jun', avgScore: 78 },
];

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Program Analytics Dashboard</h1>
           <p className="text-gray-500">Cohort performance, fatigue analysis, and curriculum gaps.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 font-medium">
            <Download size={18} /> Export Reports (PDF/CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <Users className="text-indigo-600" />
                <h3 className="font-bold text-gray-700">Cohort Average</h3>
            </div>
            <p className="text-3xl font-black text-gray-900">72.4%</p>
            <p className="text-green-600 text-sm font-medium flex items-center gap-1"><TrendingUp size={14}/> +4.2% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="text-amber-500" />
                <h3 className="font-bold text-gray-700">Weakest Topic</h3>
            </div>
            <p className="text-xl font-black text-gray-900">Nephrology</p>
            <p className="text-gray-500 text-sm">Avg Score: 55% (National: 62%)</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <Clock className="text-blue-500" />
                <h3 className="font-bold text-gray-700">Exam Stamina</h3>
            </div>
            <p className="text-xl font-black text-gray-900">Drop after 45m</p>
            <p className="text-gray-500 text-sm">Accuracy falls by 15% in late sections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cohort Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Activity size={18}/> Cohort Progression Trend</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={COHORT_TREND_DATA}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="avgScore" stroke="#6366f1" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Fatigue Curve Analysis */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Clock size={18}/> Fatigue Curve Analysis (Exam &gt; 90m)</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={FATIGUE_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="timeSegment" axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} domain={[0, 100]} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={2} dot={{r: 4}} />
                        <Line yAxisId="right" type="monotone" dataKey="avgTime" name="Avg Time/Q (sec)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                <strong>Insight:</strong> Students consistently lose focus after the 45-minute mark. Consider inserting a scheduled break or placing easier modules in the 3rd quarter.
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
