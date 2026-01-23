import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import { query } from '../../config/database';

export async function handleLeaderboardRequest(
  io: Server, 
  socket: AuthenticatedSocket, 
  data: { period?: string; specialty?: string; limit?: number }
) {
  try {
    const { period = 'weekly', specialty, limit = 50 } = data;

    // Build query based on filters
    let queryString = `
      SELECT user_id, user_name, user_avatar, specialty, total_score, 
             exams_completed, average_score, rank, period
      FROM leaderboard_entries 
      WHERE period = $1
    `;
    const queryParams: any[] = [period];
    let paramIndex = 2;

    if (specialty) {
      queryString += ` AND specialty = $${paramIndex}`;
      queryParams.push(specialty);
      paramIndex++;
    }

    queryString += ` ORDER BY rank ASC LIMIT $${paramIndex}`;
    queryParams.push(limit);

    // Execute query
    const result = await query(queryString, queryParams);

    // Find current user's rank
    let userRank = null;
    if (socket.userId) {
      const userResult = await query(
        `SELECT rank, total_score, exams_completed, average_score
         FROM leaderboard_entries 
         WHERE period = $1 AND user_id = $2`,
        [period, socket.userId]
      );

      if (userResult.rows.length > 0) {
        userRank = userResult.rows[0];
      }
    }

    // Send leaderboard data to user
    socket.emit('leaderboard-data', {
      period,
      specialty,
      entries: result.rows,
      userRank,
      timestamp: new Date(),
    });

    console.log(`Leaderboard data sent to ${socket.userName} for period ${period}`);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    socket.emit('error', { message: 'Failed to fetch leaderboard' });
  }
}

export async function handleLeaderboardUpdate(io: Server, socket: AuthenticatedSocket, data: any) {
  try {
    // Only admins can trigger manual leaderboard updates
    if (socket.userRole !== 'SUPER_ADMIN' && socket.userRole !== 'PROGRAM_ADMIN') {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    // Update leaderboard ranks
    await query('SELECT update_leaderboard_ranks()');

    // Fetch updated leaderboard
    const result = await query(
      `SELECT user_id, user_name, user_avatar, specialty, total_score, 
              exams_completed, average_score, rank, period
       FROM leaderboard_entries 
       WHERE period = 'weekly'
       ORDER BY rank ASC
       LIMIT 50`
    );

    // Broadcast to all connected clients
    io.emit('leaderboard-updated', {
      period: 'weekly',
      entries: result.rows,
      timestamp: new Date(),
    });

    console.log(`Leaderboard manually updated by ${socket.userName}`);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    socket.emit('error', { message: 'Failed to update leaderboard' });
  }
}
