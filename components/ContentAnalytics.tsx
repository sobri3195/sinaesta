import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, Star } from 'lucide-react';

const ContentAnalytics: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Content analytics</h3>
          <p className="text-sm text-gray-500">Measure engagement, performance, and review cadence.</p>
        </div>
        <button className="text-sm text-indigo-600">Export report</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <TrendingUp size={16} />
            <span className="text-sm font-semibold">Usage +18%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">1,240</div>
          <div className="text-xs text-gray-500">Exam attempts using your content</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <BarChart3 size={16} />
            <span className="text-sm font-semibold">Success rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">74%</div>
          <div className="text-xs text-gray-500">Average correct response</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <TrendingDown size={16} />
            <span className="text-sm font-semibold">Underperforming</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">23</div>
          <div className="text-xs text-gray-500">Questions flagged for review</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Star size={16} />
            <span className="text-sm font-semibold">Quality score</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">92</div>
          <div className="text-xs text-gray-500">Composite content quality</div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Activity size={16} /> Review frequency
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {['Cardiology', 'Neurology', 'Pulmonology', 'Obgyn'].map((spec, idx) => (
              <div key={spec}>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{spec}</span>
                  <span>{[82, 68, 54, 91][idx]}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-indigo-500 rounded-full"
                    style={{ width: `${[82, 68, 54, 91][idx]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <BarChart3 size={16} /> Engagement by content type
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>MCQ sets</span>
              <span className="font-semibold text-gray-900">48%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>OSCE stations</span>
              <span className="font-semibold text-gray-900">22%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Flashcards</span>
              <span className="font-semibold text-gray-900">18%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Case discussions</span>
              <span className="font-semibold text-gray-900">12%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalytics;
