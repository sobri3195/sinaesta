import React from 'react';
import { Trophy, Sparkles, Target, Medal, Award } from 'lucide-react';

type GroupScore = {
  id: string;
  name: string;
  score: number;
  change: string;
  badge: string;
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  progress: number;
};

const GROUP_SCORES: GroupScore[] = [
  { id: 'g1', name: 'Cardio Mastery Squad', score: 2480, change: '+120', badge: 'ECG Elite' },
  { id: 'g2', name: 'Neuro Night Owls', score: 2295, change: '+90', badge: 'Stroke Savvy' },
  { id: 'g3', name: 'Community Study Lounge', score: 2102, change: '+60', badge: 'Collab Heroes' },
  { id: 'g4', name: 'Endocrine Explorers', score: 1974, change: '+30', badge: 'Glycemic Guardians' }
];

const CHALLENGES: Challenge[] = [
  { id: 'c1', title: '48-hour Flashcard Sprint', description: 'Publish 50 new flashcards together.', progress: 78 },
  { id: 'c2', title: 'Group OSCE Relay', description: 'Complete 3 OSCE stations with live peer feedback.', progress: 52 },
  { id: 'c3', title: 'Case Review Tournament', description: 'Submit 5 group case solutions.', progress: 64 }
];

const Leaderboard: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Group Competitions</p>
            <h1 className="text-3xl font-bold text-gray-900">Collaboration Leaderboard</h1>
            <p className="text-gray-500">Track group achievements, tournament rankings, and collaborative goals.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            <Trophy size={16} /> Create Competition
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Active tournaments', value: 3, icon: <Trophy size={20} className="text-amber-500" /> },
            { label: 'Group badges earned', value: 18, icon: <Award size={20} className="text-indigo-600" /> },
            { label: 'Rewards pool', value: 'Rp 4.5M', icon: <Sparkles size={20} className="text-emerald-500" /> }
          ].map(card => (
            <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className="rounded-full bg-gray-50 p-2">{card.icon}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Medal size={18} className="text-amber-500" /> Top groups
          </h2>
          <div className="mt-4 space-y-3">
            {GROUP_SCORES.map((group, index) => (
              <div key={group.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-gray-900">#{index + 1}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{group.name}</p>
                    <p className="text-xs text-gray-500">Badge: {group.badge}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{group.score} pts</p>
                  <p className="text-xs text-emerald-600">{group.change} this week</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Target size={16} className="text-indigo-600" /> Collaborative goals
            </h3>
            <div className="mt-4 space-y-4">
              {CHALLENGES.map(challenge => (
                <div key={challenge.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                    <span>{challenge.title}</span>
                    <span>{challenge.progress}%</span>
                  </div>
                  <p className="text-xs text-gray-500">{challenge.description}</p>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" /> Rewards & recognition
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>Top 3 groups receive mentorship vouchers.</li>
              <li>Weekly MVPs highlighted in the social feed.</li>
              <li>Badge streaks unlock premium study packs.</li>
            </ul>
            <button className="mt-4 w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white">
              View prize details
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Leaderboard;
