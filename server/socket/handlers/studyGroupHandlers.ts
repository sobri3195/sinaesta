import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import { query } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export async function handleStudyGroupCreate(
  io: Server, 
  socket: AuthenticatedSocket, 
  data: { 
    name: string; 
    description?: string; 
    specialty?: string; 
    maxMembers?: number; 
    isPublic?: boolean;
  }
) {
  try {
    const { name, description, specialty, maxMembers = 10, isPublic = true } = data;

    if (!name) {
      socket.emit('error', { message: 'Group name is required' });
      return;
    }

    const roomId = `study-group:${uuidv4()}`;

    // Create study group
    const groupResult = await query(
      `INSERT INTO study_groups (name, description, room_id, creator_id, members, max_members, specialty, is_public)
       VALUES ($1, $2, $3, $4, ARRAY[$4::uuid], $5, $6, $7)
       RETURNING *`,
      [name, description, roomId, socket.userId, maxMembers, specialty, isPublic]
    );

    const group = groupResult.rows[0];

    // Create corresponding chat room
    await query(
      `INSERT INTO chat_rooms (id, name, type, participants, metadata)
       VALUES ($1, $2, 'STUDY_GROUP', ARRAY[$3::uuid], $4)`,
      [roomId, name, socket.userId, JSON.stringify({ groupId: group.id })]
    );

    // Join the room
    socket.join(roomId);

    // Send confirmation to creator
    socket.emit('study-group-created', group);

    // Broadcast to all users if public
    if (isPublic) {
      io.emit('study-group-available', {
        id: group.id,
        name: group.name,
        description: group.description,
        specialty: group.specialty,
        currentMembers: 1,
        maxMembers: group.max_members,
      });
    }

    console.log(`Study group "${name}" created by ${socket.userName}`);
  } catch (error) {
    console.error('Error creating study group:', error);
    socket.emit('error', { message: 'Failed to create study group' });
  }
}

export async function handleStudyGroupJoin(
  io: Server, 
  socket: AuthenticatedSocket, 
  data: { groupId: string }
) {
  try {
    const { groupId } = data;

    if (!groupId) {
      socket.emit('error', { message: 'Group ID is required' });
      return;
    }

    // Get study group
    const groupResult = await query(
      'SELECT * FROM study_groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      socket.emit('error', { message: 'Study group not found' });
      return;
    }

    const group = groupResult.rows[0];

    // Check if already a member
    if (group.members.includes(socket.userId)) {
      socket.emit('error', { message: 'Already a member of this group' });
      return;
    }

    // Check if group is full
    if (group.members.length >= group.max_members) {
      socket.emit('error', { message: 'Study group is full' });
      return;
    }

    // Add user to group
    await query(
      'UPDATE study_groups SET members = array_append(members, $1::uuid) WHERE id = $2',
      [socket.userId, groupId]
    );

    // Add user to chat room
    await query(
      'UPDATE chat_rooms SET participants = array_append(participants, $1::uuid) WHERE id = $2',
      [socket.userId, group.room_id]
    );

    // Join the socket room
    socket.join(group.room_id);

    // Notify all members
    io.to(group.room_id).emit('study-group-member-joined', {
      groupId,
      userId: socket.userId,
      userName: socket.userName,
      memberCount: group.members.length + 1,
    });

    // Send confirmation to user
    socket.emit('study-group-joined', {
      group,
      roomId: group.room_id,
    });

    console.log(`User ${socket.userName} joined study group ${group.name}`);
  } catch (error) {
    console.error('Error joining study group:', error);
    socket.emit('error', { message: 'Failed to join study group' });
  }
}

export async function handleStudyGroupLeave(
  io: Server, 
  socket: AuthenticatedSocket, 
  data: { groupId: string }
) {
  try {
    const { groupId } = data;

    if (!groupId) {
      socket.emit('error', { message: 'Group ID is required' });
      return;
    }

    // Get study group
    const groupResult = await query(
      'SELECT * FROM study_groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      socket.emit('error', { message: 'Study group not found' });
      return;
    }

    const group = groupResult.rows[0];

    // Remove user from group
    await query(
      'UPDATE study_groups SET members = array_remove(members, $1::uuid) WHERE id = $2',
      [socket.userId, groupId]
    );

    // Remove user from chat room
    await query(
      'UPDATE chat_rooms SET participants = array_remove(participants, $1::uuid) WHERE id = $2',
      [socket.userId, group.room_id]
    );

    // Leave the socket room
    socket.leave(group.room_id);

    // Notify remaining members
    io.to(group.room_id).emit('study-group-member-left', {
      groupId,
      userId: socket.userId,
      userName: socket.userName,
      memberCount: group.members.length - 1,
    });

    // Send confirmation to user
    socket.emit('study-group-left', { groupId });

    // If creator left and group is empty, delete group
    if (group.creator_id === socket.userId && group.members.length === 1) {
      await query('DELETE FROM study_groups WHERE id = $1', [groupId]);
      await query('DELETE FROM chat_rooms WHERE id = $1', [group.room_id]);
      
      io.emit('study-group-deleted', { groupId });
    }

    console.log(`User ${socket.userName} left study group ${group.name}`);
  } catch (error) {
    console.error('Error leaving study group:', error);
    socket.emit('error', { message: 'Failed to leave study group' });
  }
}

export async function handleStudyGroupMessage(
  io: Server, 
  socket: AuthenticatedSocket, 
  data: { groupId: string; message: string }
) {
  try {
    const { groupId, message } = data;

    if (!groupId || !message) {
      socket.emit('error', { message: 'Group ID and message are required' });
      return;
    }

    // Get study group
    const groupResult = await query(
      'SELECT room_id, members FROM study_groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      socket.emit('error', { message: 'Study group not found' });
      return;
    }

    const group = groupResult.rows[0];

    // Verify user is a member
    if (!group.members.includes(socket.userId)) {
      socket.emit('error', { message: 'Not a member of this group' });
      return;
    }

    // Use the chat handler to send the message
    // This reuses the existing chat infrastructure
    const { handleSendMessage } = await import('./chatHandlers');
    await handleSendMessage(io, socket, {
      roomId: group.room_id,
      message,
      messageType: 'text',
    });
  } catch (error) {
    console.error('Error sending study group message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
}
