import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Award,
  BrainCircuit,
  Calendar,
  ClipboardList,
  Download,
  LineChart as LineChartIcon,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { analyticsService, AnalyticsBundle, ExportFormat, TimeRangeOption } from '../services/analyticsService';
import { Specialty, UserRole } from '../types';

interface AdvancedAnalyticsProps {
  userRole?: UserRole;
  specialty?: Specialty;
  studentId?: string;
  studentName?: string;
}

const TIME_RANGE_OPTIONS: Array<{ label: string; value: TimeRangeOption }> = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '180D', value: '180d' },
  { label: '1Y', value: '1y' },
];

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  userRole,
  specialty,
  studentId = 'current-student',
  studentName = 'Sinaesta Learner',
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30d');
  const [bundle, setBundle] = useState<AnalyticsBundle | null>(null);
  const [favoriteMetrics, setFavoriteMetrics] = useState<string[]>(['learningEfficiency', 'examReadiness']);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const showMentorPanel = userRole === UserRole.TEACHER || userRole === UserRole.PROGRAM_ADMIN || userRole === UserRole.SUPER_ADMIN;

  useEffect(() => {
    analyticsService
      .getAdvancedAnalyticsBundle({ studentId, specialty, role: userRole, timeRange })
      .then((data) => setBundle(data));
  }, [studentId, specialty, timeRange, userRole]);

  const toggleFavorite = (metric: string) => {
    setFavoriteMetrics((prev) =>
      prev.includes(metric) ? prev.filter((item) => item !== metric) : [...prev, metric]
    );
  };

  const handleExport = async (format: ExportFormat) => {
    if (!bundle) return;
    const { blob, filename } = await analyticsService.exportAnalyticsReport({ bundle, format, studentId });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCertificate = async () => {
    const { blob, filename } = await analyticsService.generatePerformanceCertificate(studentName);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const heatmapDetail = useMemo(() => {
    if (!bundle) return null;
    const selected = bundle.visualization.topicHeatmap.find((topic) => topic.topic === selectedTopic);
    return selected || bundle.visualization.topicHeatmap[0];
  }, [bundle, selectedTopic]);

  if (!bundle) {
    return <div className="p-8 text-gray-600">Loading advanced analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics & ML Insights</h1>
          <p className="text-gray-500">
            Predictive performance, personalized learning paths, and mentor intelligence for {specialty || 'all specialties'}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-2">
            <Calendar className="text-blue-600" size={16} />
            <span className="text-xs font-semibold text-gray-600">Range</span>
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value as TimeRangeOption)}
              className="text-sm bg-transparent focus:outline-none"
            >
              {TIME_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleExport('pdf')}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 font-medium"
          >
            <Download size={18} /> Export PDF
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 font-medium"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 font-medium"
          >
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="text-green-600" size={18} />
            <span className="font-semibold">Predicted Score</span>
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">{bundle.predictive.predictedExamScore}%</p>
          <p className="text-sm text-gray-500">Exam completion probability {Math.round(bundle.predictive.examCompletionProbability * 100)}%</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <AlertTriangle className="text-amber-500" size={18} />
            <span className="font-semibold">At-risk Level</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">{bundle.predictive.atRiskLevel}</p>
          <p className="text-sm text-gray-500">Knowledge gaps flagged: {bundle.predictive.knowledgeGapAlerts.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <ShieldCheck className="text-indigo-600" size={18} />
            <span className="font-semibold">Readiness Date</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-2">{bundle.forecast.examReadinessDate}</p>
          <p className="text-sm text-gray-500">Goal ETA {bundle.forecast.goalProjection.etaWeeks} weeks</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Target className="text-emerald-600" size={18} />
            <span className="font-semibold">Specialty Success</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{Math.round(bundle.predictive.specialtySuccessProbability * 100)}%</p>
          <p className="text-sm text-gray-500">Qualification probability forecast</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LineChartIcon size={18} /> Growth Projections & Predictive Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bundle.visualization.progressTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" name="Actual" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold">Improvement Velocity</p>
              <p>{bundle.forecast.improvementVelocity.toFixed(1)} pts/month</p>
            </div>
            <div>
              <p className="font-semibold">Peer Benchmark Gap</p>
              <p>{bundle.forecast.peerBenchmarkGap}% vs cohort median</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={18} /> Learning Path Recommendations
          </h3>
          <div className="space-y-4">
            {bundle.recommendations.nextTopics.map((topic) => (
              <div key={topic.topic} className="border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-gray-800">{topic.topic}</p>
                <p className="text-xs text-gray-500">{topic.rationale}</p>
                <span className="text-xs font-semibold text-indigo-600">{topic.difficulty}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
            Adaptive difficulty: <strong>{bundle.recommendations.adaptiveDifficulty.currentLevel}</strong>
            <ul className="mt-2 list-disc list-inside">
              {bundle.recommendations.adaptiveDifficulty.suggestedAdjustments.map((adjustment) => (
                <li key={adjustment}>{adjustment}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BrainCircuit size={18} /> Topic Mastery Heatmap
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {bundle.visualization.topicHeatmap.map((topic) => (
              <button
                key={topic.topic}
                onClick={() => setSelectedTopic(topic.topic)}
                className={`rounded-lg p-3 text-left border transition-colors ${
                  selectedTopic === topic.topic ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'
                }`}
              >
                <p className="text-xs font-semibold text-gray-600">{topic.topic}</p>
                <p className="text-lg font-bold text-gray-900">{topic.mastery}%</p>
                <p className="text-[10px] text-gray-400">Trend: {topic.trend}</p>
              </button>
            ))}
          </div>
          {heatmapDetail && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
              <p className="font-semibold text-gray-800">{heatmapDetail.topic} drill-down</p>
              <p>Mastery score: {heatmapDetail.mastery}%</p>
              <p>Trend: {heatmapDetail.trend}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={18} /> Skill Radar Assessment
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={bundle.visualization.skillRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Skill Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-gray-500">Drill into low-score skills for targeted coaching.</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} /> Peer Comparison Panel
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bundle.comparative.peerComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="metric" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="self" name="You" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="peers" name="Peers" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Cohort rank <strong>#{bundle.comparative.cohortRank}</strong> of {bundle.comparative.cohortSize} ({bundle.comparative.percentile}th percentile)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList size={18} /> Knowledge Gap Alerts
          </h3>
          <div className="space-y-3">
            {bundle.predictive.knowledgeGapAlerts.map((gap) => (
              <div key={gap.topic} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">{gap.topic}</p>
                  <span className="text-xs font-semibold uppercase text-amber-600">{gap.severity}</span>
                </div>
                <p className="text-xs text-gray-500">{gap.impact}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Study Efficiency Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Learning Efficiency</span>
                <span>{Math.round(bundle.metrics.learningEfficiency * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${bundle.metrics.learningEfficiency * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Study ↔ Performance</span>
                <span>{Math.round(bundle.metrics.studyPerformanceCorrelation * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${bundle.metrics.studyPerformanceCorrelation * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Retention (week 5)</span>
                <span>{bundle.metrics.knowledgeRetention[bundle.metrics.knowledgeRetention.length - 1]?.retention}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-amber-500 rounded-full"
                  style={{ width: `${bundle.metrics.knowledgeRetention[bundle.metrics.knowledgeRetention.length - 1]?.retention}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={18} /> Mastery Timeline Forecast
          </h3>
          <div className="space-y-3">
            {bundle.predictive.masteryTimeline.map((item) => (
              <div key={item.topic} className="flex items-center justify-between text-sm text-gray-600">
                <span>{item.topic}</span>
                <span className="font-semibold text-gray-800">{item.estimatedWeeks} weeks</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">Based on historical mastery velocity.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Learning Path Schedule</h3>
          <div className="space-y-3">
            {bundle.recommendations.personalizedSchedule.map((schedule) => (
              <div key={schedule.day} className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{schedule.day}</span>
                <span>{schedule.focus}</span>
                <span className="text-gray-400">{schedule.duration}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Recommended exam order: <strong>{bundle.recommendations.recommendedExamOrder.join(', ')}</strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">OSCE Scenario Focus</h3>
          <div className="space-y-3">
            {bundle.recommendations.osceScenarios.map((scenario) => (
              <div key={scenario.scenario} className="border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-gray-800">{scenario.scenario}</p>
                <p className="text-xs text-gray-500">{scenario.objective}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Personalization</h3>
          <p className="text-sm text-gray-500 mb-4">Choose favorite metrics to pin on your dashboard.</p>
          <div className="space-y-2">
            {[
              { id: 'learningEfficiency', label: 'Learning Efficiency' },
              { id: 'examReadiness', label: 'Exam Readiness' },
              { id: 'peerBenchmark', label: 'Peer Benchmark' },
              { id: 'knowledgeRetention', label: 'Knowledge Retention' },
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => toggleFavorite(metric.id)}
                className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm ${
                  favoriteMetrics.includes(metric.id)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {metric.label}
                <span className="text-xs">{favoriteMetrics.includes(metric.id) ? 'Pinned' : 'Pin'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">ML Ops & Retraining</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Model Version</span>
              <span className="font-semibold text-gray-900">{bundle.mlOps.modelStatus.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Validation Accuracy</span>
              <span>{Math.round(bundle.mlOps.modelStatus.validationAccuracy * 100)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Drift Score</span>
              <span>{bundle.mlOps.modelStatus.driftScore}</span>
            </div>
            <div className="text-xs text-gray-500">Last trained {bundle.mlOps.modelStatus.lastTrained}</div>
          </div>
          <div className="mt-4 space-y-2">
            {bundle.mlOps.retrainingPipeline.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between text-xs text-gray-600">
                <span>{stage.stage}</span>
                <span className="font-semibold text-gray-800">{stage.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">A/B tests: {bundle.mlOps.abTesting.map((test) => test.experiment).join(', ')}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Reporting & Sharing</h3>
          <div className="space-y-3">
            <button
              onClick={handleCertificate}
              className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <Award size={16} /> Generate Certificate
              </span>
              <span className="text-xs">TXT</span>
            </button>
            <a
              href={`mailto:mentor@sinaesta.ai?subject=Analytics%20Share&body=Sharing%20analytics%20summary%20for%20${studentName}`}
              className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <Share2 size={16} /> Share with Mentor
              </span>
              <span className="text-xs">Email</span>
            </a>
          </div>
        </div>
      </div>

      {showMentorPanel && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={18} /> Mentor Analytics Overview
            </h3>
            <span className="text-xs text-gray-500">Class performance dashboard</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500">Class Avg</p>
              <p className="text-xl font-bold text-gray-900">{bundle.mentor.cohortOverview.averageScore}%</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500">At-risk Students</p>
              <p className="text-xl font-bold text-gray-900">{bundle.mentor.cohortOverview.atRiskCount}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500">Active Learners</p>
              <p className="text-xl font-bold text-gray-900">{bundle.mentor.cohortOverview.activeLearners}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500">Retention Rate</p>
              <p className="text-xl font-bold text-gray-900">{Math.round(bundle.mentor.cohortOverview.retentionRate * 100)}%</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">Students Needing Attention</p>
              <div className="space-y-2">
                {bundle.mentor.studentsNeedingAttention.map((student) => (
                  <div key={student.name} className="flex items-center justify-between text-sm text-gray-600">
                    <span>{student.name}</span>
                    <span className="text-xs text-amber-600">{student.riskLevel} risk</span>
                    <span className="text-xs text-gray-400">{student.gap}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">Teaching Effectiveness</p>
              <div className="space-y-2">
                {bundle.mentor.teachingEffectiveness.map((module) => (
                  <div key={module.module} className="flex items-center justify-between text-sm text-gray-600">
                    <span>{module.module}</span>
                    <span className="font-semibold text-emerald-600">{Math.round(module.impactScore * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
