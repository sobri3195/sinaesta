import React, { useState } from 'react';
import { User, Sparkles, Users, Heart, MessageCircle, Trophy, Star } from 'lucide-react';

type Achievement = {
  id: string;
  title: string;
  description: string;
};

type FeedItem = {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
};

type BuddySuggestion = {
  id: string;
  name: string;
  focus: string;
  mutual: number;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Mentor Praise', description: 'Best answer in discussion forum.' },
  { id: 'a2', title: 'Collaboration Streak', description: '14-day group study streak.' },
  { id: 'a3', title: 'Flashcard Builder', description: 'Created 120 shared flashcards.' }
];

const FEED: FeedItem[] = [
  {
    id: 'f1',
    author: 'You',
    content: 'Completed Cardio Mastery group exam with 88% accuracy!',
    likes: 28,
    comments: 6
  },
  {
    id: 'f2',
    author: 'Neuro Night Owls',
    content: 'Shared a new case-solving whiteboard session.',
    likes: 18,
    comments: 4
  }
];

const BUDDIES: BuddySuggestion[] = [
  { id: 'b1', name: 'Mira', focus: 'Neuroanatomy', mutual: 3 },
  { id: 'b2', name: 'Rizal', focus: 'ICU cases', mutual: 5 },
  { id: 'b3', name: 'Dito', focus: 'OSCE practice', mutual: 2 }
];

const UserProfile: React.FC = () => {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">dr. Maya Putri</h1>
                <p className="text-sm text-gray-500">Cardiology resident · Jakarta</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><Trophy size={12} /> 1,240 reputation</span>
                  <span className="inline-flex items-center gap-1"><Sparkles size={12} /> 12 badges</span>
                  <span className="inline-flex items-center gap-1"><Users size={12} /> 98 followers</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                isFollowing ? 'bg-gray-100 text-gray-600' : 'bg-indigo-600 text-white'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {ACHIEVEMENTS.map(achievement => (
                  <div key={achievement.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <Star size={16} className="text-amber-500" /> {achievement.title}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
              <div className="mt-4 space-y-4">
                {FEED.map(item => (
                  <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">{item.author}</p>
                    <p className="text-sm text-gray-600 mt-2">{item.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1"><Heart size={12} /> {item.likes}</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle size={12} /> {item.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Study buddy suggestions</h2>
              <div className="mt-4 space-y-3">
                {BUDDIES.map(buddy => (
                  <div key={buddy.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{buddy.name}</p>
                      <p className="text-xs text-gray-500">Focus: {buddy.focus}</p>
                      <p className="text-[10px] text-gray-400">{buddy.mutual} mutual groups</p>
                    </div>
                    <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Share progress</h2>
              <p className="text-sm text-gray-500 mt-2">Post your milestones to the Sinaesta social feed.</p>
              <button className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                Share update
              </button>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
