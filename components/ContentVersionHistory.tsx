import React, { useMemo, useState } from 'react';
import { Clock, User, MessageSquareText, RotateCcw, Eye } from 'lucide-react';

export interface ContentVersion {
  id: string;
  title: string;
  content: string;
  author: string;
  note: string;
  timestamp: string;
  status: 'draft' | 'review' | 'published';
}

interface ContentVersionHistoryProps {
  compact?: boolean;
}

const MOCK_VERSIONS: ContentVersion[] = [
  {
    id: 'v5',
    title: 'STEMI Question v5',
    content: 'Updated to include aspirin dose and new ECG image.',
    author: 'Dr. Alicia',
    note: 'Add aspirin guideline 2024',
    timestamp: '2024-05-04 14:32',
    status: 'published'
  },
  {
    id: 'v4',
    title: 'STEMI Question v4',
    content: 'Added troponin values and clarified patient history.',
    author: 'Dr. Bryan',
    note: 'Clarify symptom onset',
    timestamp: '2024-05-02 10:15',
    status: 'review'
  },
  {
    id: 'v3',
    title: 'STEMI Question v3',
    content: 'Draft with initial stem, options, and explanation.',
    author: 'Dr. Alicia',
    note: 'Initial draft',
    timestamp: '2024-05-01 08:21',
    status: 'draft'
  }
];

const statusStyles: Record<ContentVersion['status'], string> = {
  draft: 'bg-amber-100 text-amber-700',
  review: 'bg-blue-100 text-blue-700',
  published: 'bg-emerald-100 text-emerald-700'
};

const ContentVersionHistory: React.FC<ContentVersionHistoryProps> = ({ compact }) => {
  const [leftVersion, setLeftVersion] = useState(MOCK_VERSIONS[0]);
  const [rightVersion, setRightVersion] = useState(MOCK_VERSIONS[1]);

  const compareSummary = useMemo(() => {
    const leftWords = leftVersion.content.split(' ').length;
    const rightWords = rightVersion.content.split(' ').length;
    return {
      delta: leftWords - rightWords,
      newer: leftVersion.timestamp
    };
  }, [leftVersion, rightVersion]);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Version history</h3>
          <p className="text-sm text-gray-500">Track every edit, note, and approval stage.</p>
        </div>
        <button className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
          <RotateCcw size={16} /> Revert selected
        </button>
      </div>

      <div className={`mt-4 grid ${compact ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        <div className={compact ? '' : 'col-span-1'}>
          <div className="space-y-3">
            {MOCK_VERSIONS.map(version => (
              <button
                key={version.id}
                onClick={() => setLeftVersion(version)}
                className={`w-full text-left border rounded-lg p-3 hover:border-indigo-200 ${
                  leftVersion.id === version.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{version.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyles[version.status]}`}>
                    {version.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <User size={12} /> {version.author}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Clock size={12} /> {version.timestamp}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <MessageSquareText size={12} /> {version.note}
                </div>
              </button>
            ))}
          </div>
        </div>

        {!compact && (
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Comparing</div>
                <div className="text-base font-semibold text-gray-900">{leftVersion.title} vs {rightVersion.title}</div>
              </div>
              <div className="text-xs text-gray-500">Word delta: {compareSummary.delta >= 0 ? '+' : ''}{compareSummary.delta}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[leftVersion, rightVersion].map(version => (
                <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{version.title}</span>
                    <button className="text-xs text-indigo-600 flex items-center gap-1">
                      <Eye size={12} /> Preview
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{version.content}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={rightVersion.id}
                onChange={event => {
                  const target = MOCK_VERSIONS.find(v => v.id === event.target.value);
                  if (target) setRightVersion(target);
                }}
              >
                {MOCK_VERSIONS.map(version => (
                  <option key={version.id} value={version.id}>{version.title}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">Select version to compare</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentVersionHistory;
