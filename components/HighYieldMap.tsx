
import React from 'react';
import { HighYieldTopic } from '../types';
import { TrendingUp, TrendingDown, Minus, Map } from 'lucide-react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

const MOCK_TOPICS: HighYieldTopic[] = [
    { topic: 'Acute Coronary Syndrome', frequency: 95, avgScore: 65, trend: 'UP' },
    { topic: 'Sepsis Management', frequency: 88, avgScore: 72, trend: 'STABLE' },
    { topic: 'Stroke Protocol', frequency: 80, avgScore: 58, trend: 'UP' },
    { topic: 'Hypertensive Crisis', frequency: 75, avgScore: 82, trend: 'DOWN' },
    { topic: 'DKA / HHS', frequency: 70, avgScore: 68, trend: 'STABLE' },
    { topic: 'Acute Kidney Injury', frequency: 65, avgScore: 55, trend: 'UP' },
    { topic: 'Pneumonia (CAP/HAP)', frequency: 60, avgScore: 75, trend: 'DOWN' },
    { topic: 'Gastrointestinal Bleeding', frequency: 55, avgScore: 70, trend: 'STABLE' },
    { topic: 'Thyroid Storm', frequency: 40, avgScore: 60, trend: 'STABLE' },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

const CustomContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(width / 8, 14)}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
      {width > 50 && height > 50 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 16}
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={10}
        >
          {payload.value} Occurrences
        </text>
      )}
    </g>
  );
};

const HighYieldMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const data = MOCK_TOPICS.map(t => ({ name: t.topic, value: t.frequency, ...t }));

  return (
    <div className="bg-white h-full flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Map className="text-indigo-600" /> High-Yield Topic Map
                </h1>
                <p className="text-gray-500 text-sm">Dynamic heatmap of most frequently tested topics and student performance.</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Back</button>
        </div>

        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            {/* Heatmap Visualization */}
            <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-inner flex flex-col">
                <h3 className="font-bold text-gray-700 mb-4 ml-2">Exam Frequency Heatmap</h3>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={data}
                            dataKey="value"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            content={<CustomContent />}
                        >
                            <Tooltip content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 text-sm">
                                            <p className="font-bold text-gray-900">{d.name}</p>
                                            <p>Frequency: {d.value}</p>
                                            <p>Avg Score: {d.avgScore}%</p>
                                        </div>
                                    );
                                }
                                return null;
                            }} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* List & Trends */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Trending Topics</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 uppercase text-xs sticky top-0">
                            <tr>
                                <th className="px-4 py-2">Topic</th>
                                <th className="px-4 py-2 text-center">Score</th>
                                <th className="px-4 py-2 text-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_TOPICS.map((topic, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{topic.topic}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold
                                            ${topic.avgScore < 60 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                                        `}>
                                            {topic.avgScore}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {topic.trend === 'UP' ? <TrendingUp size={16} className="text-red-500" /> :
                                             topic.trend === 'DOWN' ? <TrendingDown size={16} className="text-green-500" /> :
                                             <Minus size={16} className="text-gray-400" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default HighYieldMap;
