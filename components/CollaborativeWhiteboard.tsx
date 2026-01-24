import React, { useState } from 'react';
import {
  Pencil,
  Users,
  ShieldCheck,
  ClipboardCheck,
  Layers,
  Sparkles,
  CheckCircle2,
  Send,
  Settings2,
  FileText
} from 'lucide-react';

type Participant = {
  id: string;
  name: string;
  role: 'Mentor' | 'Moderator' | 'Writer' | 'Reviewer';
  cursor: string;
  status: 'active' | 'idle';
};

type Task = {
  id: string;
  title: string;
  assignee: string;
  status: 'in-progress' | 'review' | 'done';
};

type Review = {
  id: string;
  reviewer: string;
  note: string;
  score: number;
};

const PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'dr. Arini', role: 'Mentor', cursor: 'Section A', status: 'active' },
  { id: 'p2', name: 'Raka', role: 'Writer', cursor: 'Differential', status: 'active' },
  { id: 'p3', name: 'Tia', role: 'Reviewer', cursor: 'Plan', status: 'idle' },
  { id: 'p4', name: 'Mira', role: 'Moderator', cursor: 'Labs', status: 'active' }
];

const TASKS: Task[] = [
  { id: 't1', title: 'Draft case summary', assignee: 'Raka', status: 'in-progress' },
  { id: 't2', title: 'Confirm ECG interpretation', assignee: 'dr. Arini', status: 'review' },
  { id: 't3', title: 'Finalize management plan', assignee: 'Tia', status: 'done' }
];

const REVIEWS: Review[] = [
  { id: 'r1', reviewer: 'dr. Arini', note: 'Clear differential list, add more supportive labs.', score: 4 },
  { id: 'r2', reviewer: 'Mentor Dina', note: 'Consider adding hemodynamic goals in plan.', score: 5 }
];

const CollaborativeWhiteboard: React.FC = () => {
  const [solutionDraft, setSolutionDraft] = useState('Initial draft: working diagnosis + problem list.');

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Collaborative Case Solving</p>
            <h1 className="text-3xl font-bold text-gray-900">Shared Whiteboard Session</h1>
            <p className="text-gray-500">Real-time editing, role-based assignments, and conflict resolution for group cases.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            <Pencil size={16} /> Start new session
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Layers size={18} className="text-indigo-600" /> Case Document
                  </h2>
                  <p className="text-xs text-gray-500">Live cursors · versioned edits · auto-merge</p>
                </div>
                <button className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
                  <Settings2 size={12} className="inline-block mr-1" /> Conflict mode: Auto-resolve
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Case summary</p>
                  <p className="text-sm text-gray-700 mt-2">
                    55M with acute chest pain, diaphoresis, troponin rising. BP 90/60, HR 110. ST elevation in II, III, aVF.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Differential & red flags</p>
                  <ul className="mt-2 space-y-2 text-sm text-gray-700">
                    <li>Inferior STEMI with right ventricular involvement</li>
                    <li>Rule out aortic dissection</li>
                    <li>Assess for cardiogenic shock markers</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Management plan</p>
                  <textarea
                    value={solutionDraft}
                    onChange={event => setSolutionDraft(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[100px]"
                  />
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <Sparkles size={12} /> Live updates visible to all collaborators.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardCheck size={16} className="text-emerald-500" /> Submit group solution
              </h3>
              <p className="text-xs text-gray-500 mt-2">Once submitted, mentors can peer review and approve.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">
                  <Send size={16} /> Submit solution
                </button>
                <span className="text-xs text-gray-500">Status: Drafting · Version 3</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Users size={16} className="text-indigo-600" /> Live collaborators
              </h3>
              <div className="mt-3 space-y-3">
                {PARTICIPANTS.map(person => (
                  <div key={person.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-500">{person.role} · Cursor on {person.cursor}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                        person.status === 'active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {person.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-500" /> Role assignments
              </h3>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                {TASKS.map(task => (
                  <div key={task.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                    <div>
                      <p className="font-semibold text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">Assignee: {task.assignee}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                        task.status === 'done'
                          ? 'bg-emerald-100 text-emerald-600'
                          : task.status === 'review'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" /> Peer review panel
              </h3>
              <div className="mt-3 space-y-3">
                {REVIEWS.map(review => (
                  <div key={review.id} className="rounded-lg border border-gray-100 px-3 py-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{review.reviewer}</p>
                      <span className="text-xs text-gray-500">Score {review.score}/5</span>
                    </div>
                    <p className="mt-2">{review.note}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600">
                Request another review
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Live cursors', value: 4 },
            { label: 'Edits this session', value: 28 },
            { label: 'Auto-merge conflicts', value: 3 }
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default CollaborativeWhiteboard;
