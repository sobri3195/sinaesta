
import React from 'react';
import { LabTrend } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LabTrendViewerProps {
  trends: LabTrend[];
}

const LabTrendViewer: React.FC<LabTrendViewerProps> = ({ trends }) => {
  if (!trends || trends.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-700 text-sm">
        Serial Lab Trends
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
              <th className="px-4 py-2">Parameter</th>
              {trends[0].dataPoints.map((dp, idx) => (
                <th key={idx} className="px-4 py-2">{dp.timeLabel}</th>
              ))}
              <th className="px-4 py-2">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trends.map((trend, idx) => {
               // Determine simple trend logic (last vs first)
               const first = trend.dataPoints[0].value;
               const last = trend.dataPoints[trend.dataPoints.length - 1].value;
               let TrendIcon = Minus;
               let trendColor = 'text-gray-400';
               
               if (last > first * 1.05) { TrendIcon = TrendingUp; trendColor = 'text-red-500'; } // Simplistic assumption: rising is red? Context matters.
               else if (last < first * 0.95) { TrendIcon = TrendingDown; trendColor = 'text-blue-500'; }

               return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {trend.parameter} <span className="text-gray-400 font-normal text-xs">({trend.unit})</span>
                  </td>
                  {trend.dataPoints.map((dp, i) => (
                    <td key={i} className="px-4 py-2 font-mono">
                      <span className={`
                        ${dp.flag === 'H' ? 'text-red-600 font-bold' : dp.flag === 'L' ? 'text-blue-600 font-bold' : 'text-gray-700'}
                      `}>
                        {dp.value}
                        {dp.flag && <span className="text-[10px] ml-1 align-super">{dp.flag}</span>}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <TrendIcon size={16} className={trendColor} />
                  </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabTrendViewer;
