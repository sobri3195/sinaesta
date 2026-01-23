import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  specialty?: string;
  total_score: number;
  exams_completed: number;
  average_score: number;
  rank: number;
  period: 'weekly' | 'monthly' | 'all_time';
}

export interface UserRank {
  rank: number;
  total_score: number;
  exams_completed: number;
  average_score: number;
}

export function useLeaderboard(period: 'weekly' | 'monthly' | 'all_time' = 'weekly', specialty?: string) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = useCallback(() => {
    if (socketService.isConnected()) {
      setIsLoading(true);
      socketService.requestLeaderboard(period, specialty, 50);
    }
  }, [period, specialty]);

  useEffect(() => {
    if (!socketService.isConnected()) {
      return;
    }

    // Request leaderboard data
    fetchLeaderboard();

    // Set up event listeners
    const handleLeaderboardData = (data: {
      period: string;
      specialty?: string;
      entries: LeaderboardEntry[];
      userRank: UserRank | null;
      timestamp: Date;
    }) => {
      if (data.period === period && (!specialty || data.specialty === specialty)) {
        setEntries(data.entries);
        setUserRank(data.userRank);
        setLastUpdated(new Date(data.timestamp));
        setIsLoading(false);
      }
    };

    const handleLeaderboardUpdated = (data: {
      period: string;
      entries: LeaderboardEntry[];
      timestamp: Date;
    }) => {
      if (data.period === period) {
        setEntries(data.entries);
        setLastUpdated(new Date(data.timestamp));
      }
    };

    socketService.on('leaderboard-data', handleLeaderboardData);
    socketService.on('leaderboard-updated', handleLeaderboardUpdated);

    // Cleanup
    return () => {
      socketService.off('leaderboard-data', handleLeaderboardData);
      socketService.off('leaderboard-updated', handleLeaderboardUpdated);
    };
  }, [period, specialty, fetchLeaderboard]);

  const refresh = useCallback(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    userRank,
    isLoading,
    lastUpdated,
    refresh,
  };
}
