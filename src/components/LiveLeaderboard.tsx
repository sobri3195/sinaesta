import React, { useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, RefreshCw, ChevronDown } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuthStore } from '../../stores/authStore';

export function LiveLeaderboard() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');
  const [specialty, setSpecialty] = useState<string | undefined>(undefined);
  const { user } = useAuthStore();

  const { entries, userRank, isLoading, lastUpdated, refresh } = useLeaderboard(period, specialty);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
    return 'bg-white border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={refresh}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="appearance-none pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="all_time">All Time</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={specialty || ''}
            onChange={(e) => setSpecialty(e.target.value || undefined)}
            className="appearance-none pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pulmonology">Pulmonology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Internal Medicine">Internal Medicine</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* User's rank (if not in top entries) */}
      {userRank && !entries.find((e) => e.user_id === user?.id) && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-blue-600">#{userRank.rank}</span>
              <div className="flex items-center gap-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">You</p>
                  <p className="text-sm text-gray-600">{user?.targetSpecialty}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{userRank.total_score} pts</p>
              <p className="text-sm text-gray-600">
                {userRank.exams_completed} exams · {userRank.average_score.toFixed(1)}% avg
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard entries */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No entries yet. Be the first!</p>
          </div>
        ) : (
          entries.map((entry, index) => {
            const isCurrentUser = entry.user_id === user?.id;
            return (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                  getRankColor(entry.rank)
                } ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  {entry.user_avatar ? (
                    <img
                      src={entry.user_avatar}
                      alt={entry.user_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                      {entry.user_name[0].toUpperCase()}
                    </div>
                  )}

                  {/* Name and specialty */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      {entry.user_name}
                      {isCurrentUser && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{entry.specialty || 'No specialty'}</p>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{entry.total_score}</p>
                    <p className="text-sm text-gray-600">
                      {entry.exams_completed} exams · {entry.average_score.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
