import React, { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, User, Clock, Mail } from 'lucide-react';

interface ApprovalItem {
  id: string;
  title: string;
  author: string;
  submittedAt: string;
  stage: 'review' | 'approval' | 'publish';
  notes: string;
}

const MOCK_QUEUE: ApprovalItem[] = [
  {
    id: 'q-1',
    title: 'Cardiology STEMI Question Set',
    author: 'Dr. Alicia',
    submittedAt: '2024-05-05 09:12',
    stage: 'review',
    notes: 'Needs mentor review for guidelines.'
  },
  {
    id: 'q-2',
    title: 'OSCE Station: Chest Pain',
    author: 'Dr. Bryan',
    submittedAt: '2024-05-04 15:44',
    stage: 'approval',
    notes: 'Awaiting admin approval.'
  },
  {
    id: 'q-3',
    title: 'Flashcard Deck: Antibiotics',
    author: 'Dr. Clara',
    submittedAt: '2024-05-03 11:20',
    stage: 'publish',
    notes: 'Ready for publishing.'
  }
];

const stageColor: Record<ApprovalItem['stage'], string> = {
  review: 'bg-amber-100 text-amber-700',
  approval: 'bg-blue-100 text-blue-700',
  publish: 'bg-emerald-100 text-emerald-700'
};

const ContentApprovalQueue: React.FC = () => {
  const [queue] = useState(MOCK_QUEUE);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Content approval queue</h3>
          <p className="text-sm text-gray-500">Review → Approve → Publish workflow.</p>
        </div>
        <button className="text-sm text-indigo-600 flex items-center gap-2">
          <Mail size={16} /> Notify reviewers
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {queue.map(item => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-semibold text-gray-900">{item.title}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><User size={12} /> {item.author}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {item.submittedAt}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${stageColor[item.stage]}`}>{item.stage}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageSquare size={14} /> Request changes
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50">
                <CheckCircle size={14} /> Approve
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-700 rounded-lg hover:bg-red-50">
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentApprovalQueue;
