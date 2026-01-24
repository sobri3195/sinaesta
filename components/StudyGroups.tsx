import React, { useMemo, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Calendar,
  Link,
  Plus,
  Search,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  Sparkles,
  Trophy,
  Target,
  CheckCircle,
  Share2
} from 'lucide-react';

type GroupResource = {
  label: string;
  count: number;
  accent: string;
};

type GroupMember = {
  id: string;
  name: string;
  role: 'Mentor' | 'Leader' | 'Member';
  status: 'online' | 'offline' | 'busy';
};

type StudyGroup = {
  id: string;
  name: string;
  focus: string;
  privacy: 'Public' | 'Private';
  joinCode: string;
  mentor: string;
  members: GroupMember[];
  progress: number;
  nextSession: string;
  schedule: string[];
  resources: GroupResource[];
  goals: string[];
  achievements: string[];
  competitions: string[];
};

const INITIAL_GROUPS: StudyGroup[] = [
  {
    id: 'group-1',
    name: 'Cardio Mastery Squad',
    focus: 'Cardiology board review + OSCE station practice',
    privacy: 'Private',
    joinCode: 'CARDIO-8892',
    mentor: 'dr. Arini, Sp.JP',
    members: [
      { id: 'm1', name: 'dr. Arini', role: 'Mentor', status: 'online' },
      { id: 'm2', name: 'Raka', role: 'Leader', status: 'busy' },
      { id: 'm3', name: 'Tia', role: 'Member', status: 'online' }
    ],
    progress: 72,
    nextSession: 'Thu · 19.30 WIB · Case conference',
    schedule: ['Mon · Flashcard sprint', 'Wed · Group exam', 'Thu · Case conference'],
    resources: [
      { label: 'Group Exams', count: 5, accent: 'bg-indigo-100 text-indigo-700' },
      { label: 'Shared Flashcards', count: 210, accent: 'bg-emerald-100 text-emerald-700' },
      { label: 'OSCE Scenarios', count: 12, accent: 'bg-amber-100 text-amber-700' }
    ],
    goals: ['Finish ACS mock exam pack', 'Review echo interpretation checklist', 'Submit joint case solution'],
    achievements: ['Top group on ECG sprint', '100% attendance streak'],
    competitions: ['Inter-cohort Cardio Bowl', 'Weekly ECG Challenge']
  },
  {
    id: 'group-2',
    name: 'Neuro Night Owls',
    focus: 'Neuroanatomy recall + neurology case solving',
    privacy: 'Public',
    joinCode: 'NEURO-2255',
    mentor: 'dr. Fajar, Sp.S',
    members: [
      { id: 'm4', name: 'dr. Fajar', role: 'Mentor', status: 'online' },
      { id: 'm5', name: 'Mira', role: 'Leader', status: 'online' },
      { id: 'm6', name: 'Seno', role: 'Member', status: 'offline' }
    ],
    progress: 54,
    nextSession: 'Sat · 20.00 WIB · Whiteboard mapping',
    schedule: ['Tue · EEG review', 'Thu · Group quiz', 'Sat · Whiteboard mapping'],
    resources: [
      { label: 'Group Exams', count: 3, accent: 'bg-indigo-100 text-indigo-700' },
      { label: 'Shared Flashcards', count: 145, accent: 'bg-emerald-100 text-emerald-700' },
      { label: 'OSCE Scenarios', count: 8, accent: 'bg-amber-100 text-amber-700' }
    ],
    goals: ['Build seizure semiology deck', 'Draft case solution for neuroinfection'],
    achievements: ['Mentor-picked best explanation'],
    competitions: ['Neuro Rapid Fire League']
  },
  {
    id: 'group-3',
    name: 'Community Study Lounge',
    focus: 'Open peer help & co-working for all specialties',
    privacy: 'Public',
    joinCode: 'SINA-0001',
    mentor: 'Mentor rotation',
    members: [
      { id: 'm7', name: 'Mentor Pool', role: 'Mentor', status: 'busy' },
      { id: 'm8', name: 'Alya', role: 'Leader', status: 'online' },
      { id: 'm9', name: 'Dito', role: 'Member', status: 'offline' }
    ],
    progress: 38,
    nextSession: 'Daily · 21.00 WIB · Co-study room',
    schedule: ['Daily · Co-study room', 'Fri · Group case review'],
    resources: [
      { label: 'Group Exams', count: 8, accent: 'bg-indigo-100 text-indigo-700' },
      { label: 'Shared Flashcards', count: 410, accent: 'bg-emerald-100 text-emerald-700' },
      { label: 'OSCE Scenarios', count: 20, accent: 'bg-amber-100 text-amber-700' }
    ],
    goals: ['Recruit study buddies', 'Publish group OSCE checklist'],
    achievements: ['Most helpful group (monthly)'],
    competitions: ['Sinaesta Grand Tournament']
  }
];

const StudyGroups: React.FC = () => {
  const [groups, setGroups] = useState<StudyGroup[]>(INITIAL_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState(INITIAL_GROUPS[0]?.id ?? '');
  const [searchValue, setSearchValue] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    focus: '',
    privacy: 'Private' as StudyGroup['privacy'],
    mentor: '',
    schedule: ''
  });

  const filteredGroups = useMemo(
    () =>
      groups.filter(group =>
        group.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        group.focus.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [groups, searchValue]
  );

  const selectedGroup = groups.find(group => group.id === selectedGroupId) ?? groups[0];

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) return;

    const created: StudyGroup = {
      id: `group-${Date.now()}`,
      name: newGroup.name,
      focus: newGroup.focus || 'Collaborative study sprint',
      privacy: newGroup.privacy,
      joinCode: `${newGroup.name.slice(0, 4).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      mentor: newGroup.mentor || 'Awaiting mentor assignment',
      members: [
        { id: 'me', name: 'You', role: 'Leader', status: 'online' }
      ],
      progress: 0,
      nextSession: newGroup.schedule || 'Set your first shared session',
      schedule: newGroup.schedule ? [newGroup.schedule] : ['Add recurring sessions'],
      resources: [
        { label: 'Group Exams', count: 0, accent: 'bg-indigo-100 text-indigo-700' },
        { label: 'Shared Flashcards', count: 0, accent: 'bg-emerald-100 text-emerald-700' },
        { label: 'OSCE Scenarios', count: 0, accent: 'bg-amber-100 text-amber-700' }
      ],
      goals: ['Define shared objectives'],
      achievements: [],
      competitions: []
    };

    setGroups([created, ...groups]);
    setSelectedGroupId(created.id);
    setNewGroup({ name: '', focus: '', privacy: 'Private', mentor: '', schedule: '' });
    setShowCreate(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Collaborative Learning</p>
            <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
            <p className="text-gray-500 max-w-2xl">
              Build mentor-guided study circles, share resources, and track collective progress with real-time updates,
              schedules, and group competitions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus size={16} /> Create Group
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-indigo-200">
              <Share2 size={16} /> Invite by Link
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Active Groups', value: groups.length, icon: <Users size={20} className="text-indigo-600" /> },
            { label: 'Shared Sessions This Week', value: 6, icon: <Calendar size={20} className="text-emerald-600" /> },
            { label: 'Collaboration Points', value: 1820, icon: <Sparkles size={20} className="text-amber-500" /> }
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

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Search size={16} className="text-gray-400" />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search groups or focus"
                  className="w-full border-0 text-sm text-gray-700 focus:outline-none"
                />
              </div>
              <div className="space-y-3">
                {filteredGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                      group.id === selectedGroup?.id
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.focus}</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase text-gray-400">{group.privacy}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <Users size={12} /> {group.members.length} members
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Link size={16} className="text-indigo-600" /> Join with Code
              </h3>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Enter group code"
                />
                <button className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white">Join</button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {selectedGroup && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ShieldCheck size={16} className="text-emerald-600" /> {selectedGroup.privacy} group
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mt-2">{selectedGroup.name}</h2>
                    <p className="text-gray-500 mt-1">{selectedGroup.focus}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedGroup.resources.map(resource => (
                        <span
                          key={resource.label}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${resource.accent}`}
                        >
                          {resource.label}: {resource.count}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-900">Mentor</p>
                    <p>{selectedGroup.mentor}</p>
                    <p className="mt-2 font-semibold text-gray-900">Invite code</p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                      <span>{selectedGroup.joinCode}</span>
                      <button className="rounded-full bg-white px-2 py-1 text-[10px] text-gray-600">Copy</button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Target size={16} className="text-indigo-600" /> Group Goals
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        {selectedGroup.goals.map(goal => (
                          <li key={goal} className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-emerald-500 mt-0.5" /> {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar size={16} className="text-amber-500" /> Shared Study Schedule
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Next: {selectedGroup.nextSession}</p>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        {selectedGroup.schedule.map(item => (
                          <li key={item} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" /> Group Progress Tracking
                      </h3>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Weekly target</span>
                          <span>{selectedGroup.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                            style={{ width: `${selectedGroup.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2"><BookOpen size={12} /> Group exams completed</span>
                          <span className="font-semibold">{Math.round(selectedGroup.progress / 10)} / 10</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2"><ClipboardCheck size={12} /> OSCE checklists shared</span>
                          <span className="font-semibold">{Math.round(selectedGroup.progress / 12)} / 6</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2"><MessageSquare size={12} /> Active discussions</span>
                          <span className="font-semibold">{Math.round(selectedGroup.progress / 8)} / 8</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Trophy size={16} className="text-indigo-600" /> Competitions & Badges
                      </h3>
                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        {selectedGroup.competitions.map(item => (
                          <p key={item} className="flex items-center gap-2">
                            <Trophy size={14} className="text-amber-500" /> {item}
                          </p>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedGroup.achievements.map(item => (
                          <span key={item} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Users size={16} className="text-indigo-600" /> Members & Presence
                  </h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {selectedGroup.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                            member.status === 'online'
                              ? 'bg-emerald-100 text-emerald-600'
                              : member.status === 'busy'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {showCreate && (
          <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Create a new study group</h2>
            <p className="text-sm text-gray-500 mb-4">Set privacy, invite a mentor, and schedule your first session.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Group name"
                value={newGroup.name}
                onChange={event => setNewGroup({ ...newGroup, name: event.target.value })}
              />
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Focus area"
                value={newGroup.focus}
                onChange={event => setNewGroup({ ...newGroup, focus: event.target.value })}
              />
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Mentor (optional)"
                value={newGroup.mentor}
                onChange={event => setNewGroup({ ...newGroup, mentor: event.target.value })}
              />
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="First shared session"
                value={newGroup.schedule}
                onChange={event => setNewGroup({ ...newGroup, schedule: event.target.value })}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setNewGroup({ ...newGroup, privacy: newGroup.privacy === 'Private' ? 'Public' : 'Private' })}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600"
              >
                Privacy: {newGroup.privacy}
              </button>
              <button
                onClick={handleCreateGroup}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Create group
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGroups;
