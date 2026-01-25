import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Download,
  TrendingUp,
  Users,
} from 'lucide-react';

const ACTIVE_USERS_DATA = [
  { time: '08:00', active: 84 },
  { time: '10:00', active: 120 },
  { time: '12:00', active: 160 },
  { time: '14:00', active: 220 },
  { time: '16:00', active: 180 },
  { time: '18:00', active: 210 },
  { time: '20:00', active: 140 },
];

const USER_GROWTH_DATA = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1450 },
  { month: 'Mar', users: 1680 },
  { month: 'Apr', users: 1890 },
  { month: 'May', users: 2100 },
  { month: 'Jun', users: 2450 },
];

const EXAM_COMPLETION_DATA = [
  { exam: 'SIMAK UI', completionRate: 78 },
  { exam: 'PPDS Int', completionRate: 64 },
  { exam: 'PPDS Obgyn', completionRate: 70 },
  { exam: 'PPDS Pedi', completionRate: 72 },
];

const POPULAR_EXAMS_DATA = [
  { name: 'Internal Medicine', value: 34 },
  { name: 'Surgery', value: 22 },
  { name: 'Pediatrics', value: 18 },
  { name: 'Obgyn', value: 14 },
  { name: 'Neurology', value: 12 },
];

const ENGAGEMENT_DATA = [
  { week: 'W1', sessionMinutes: 34, featureClicks: 210 },
  { week: 'W2', sessionMinutes: 38, featureClicks: 260 },
  { week: 'W3', sessionMinutes: 41, featureClicks: 310 },
  { week: 'W4', sessionMinutes: 46, featureClicks: 355 },
];

const FEATURE_USAGE_DATA = [
  { feature: 'Exam Simulator', usage: 420 },
  { feature: 'Flashcards', usage: 360 },
  { feature: 'OSCE Mode', usage: 280 },
  { feature: 'Clinical Reasoning', usage: 240 },
  { feature: 'Mentor Hub', usage: 160 },
];

const REVENUE_DATA = [
  { month: 'Jan', mrr: 12000 },
  { month: 'Feb', mrr: 14400 },
  { month: 'Mar', mrr: 15600 },
  { month: 'Apr', mrr: 17800 },
  { month: 'May', mrr: 19200 },
  { month: 'Jun', mrr: 22400 },
];

const FATIGUE_DATA = [
  { timeSegment: '0-15m', accuracy: 85, avgTime: 45 },
  { timeSegment: '15-30m', accuracy: 82, avgTime: 50 },
  { timeSegment: '30-45m', accuracy: 75, avgTime: 55 },
  { timeSegment: '45-60m', accuracy: 65, avgTime: 65 },
  { timeSegment: '60-75m', accuracy: 60, avgTime: 70 },
  { timeSegment: '75-90m', accuracy: 55, avgTime: 80 },
];

const COHORT_TREND_DATA = [
  { month: 'Jan', avgScore: 65 },
  { month: 'Feb', avgScore: 68 },
  { month: 'Mar', avgScore: 72 },
  { month: 'Apr', avgScore: 70 },
  { month: 'May', avgScore: 75 },
  { month: 'Jun', avgScore: 78 },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f97316', '#f43f5e', '#0ea5e9'];

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Analytics & Monitoring</h1>
          <p className="text-gray-500">
            Real-time engagement, performance, and business health monitoring.
          </p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 font-medium">
          <Download size={18} /> Export Reports (CSV/Excel)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-indigo-600" />
            <h3 className="font-bold text-gray-700">DAU / MAU</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">3,240 / 18,900</p>
          <p className="text-green-600 text-sm font-medium flex items-center gap-1">
            <TrendingUp size={14} /> +8.4% this month
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-blue-500" />
            <h3 className="font-bold text-gray-700">Retention (30D)</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">62.5%</p>
          <p className="text-gray-500 text-sm">Churn: 4.1%</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpRight className="text-emerald-500" />
            <h3 className="font-bold text-gray-700">Conversion</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">41.8%</p>
          <p className="text-gray-500 text-sm">Registration → Exam Completion</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-amber-500" />
            <h3 className="font-bold text-gray-700">Error Rate</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">1.9%</p>
          <p className="text-gray-500 text-sm">Below alert threshold</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity size={18} /> Real-time Active Users
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ACTIVE_USERS_DATA}>
                <defs>
                  <linearGradient id="activeUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="active" stroke="#0ea5e9" fill="url(#activeUsers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={18} /> User Growth Over Time
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={USER_GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users size={18} /> Popular Exams & Specialties
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={POPULAR_EXAMS_DATA} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                  {POPULAR_EXAMS_DATA.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity size={18} /> Exam Completion Rates
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EXAM_COMPLETION_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="exam" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="completionRate" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock size={18} /> User Engagement Metrics
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENGAGEMENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sessionMinutes" name="Session Minutes" stroke="#6366f1" strokeWidth={2} />
                <Line type="monotone" dataKey="featureClicks" name="Feature Clicks" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity size={18} /> Feature Usage Statistics
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FEATURE_USAGE_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} width={120} />
                <Tooltip />
                <Bar dataKey="usage" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={18} /> Revenue Tracking (MRR)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="mrr" stroke="#16a34a" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity size={18} /> Cohort Progression Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={COHORT_TREND_DATA}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock size={18} /> Fatigue Curve Analysis (Exam &gt; 90m)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FATIGUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="timeSegment" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="avgTime" name="Avg Time/Q (sec)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
            <strong>Insight:</strong> Students consistently lose focus after the 45-minute mark. Consider inserting a scheduled break or placing easier modules in the 3rd quarter.
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle size={18} /> System Health & Alerts Snapshot
          </h3>
          <ul className="space-y-4 text-sm text-gray-600">
            <li className="flex items-center justify-between">
              <span>Avg API Response Time</span>
              <span className="font-semibold text-gray-900">820ms</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Largest Contentful Paint</span>
              <span className="font-semibold text-gray-900">2.2s</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Queue Throughput</span>
              <span className="font-semibold text-gray-900">320 jobs/hr</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Database Connection Pool</span>
              <span className="font-semibold text-gray-900">14/20 used</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Critical Alerts (24h)</span>
              <span className="font-semibold text-amber-600">2 open</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
