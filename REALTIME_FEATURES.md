# Real-Time Features Documentation

This document describes the comprehensive real-time features implemented in Sinaesta using Socket.IO.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Features](#features)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Architecture Overview

### Technology Stack

- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: React + Socket.IO Client
- **Database**: PostgreSQL (for persistence)
- **Authentication**: JWT tokens

### Communication Flow

```
Client (React) <--WebSocket--> Server (Socket.IO) <--> Database (PostgreSQL)
```

### Key Components

#### Backend
- `server/socket/index.ts` - WebSocket server initialization
- `server/socket/handlers/` - Event handlers for different features
- `server/migrations/002_realtime_features.sql` - Database schema

#### Frontend
- `src/services/socketService.ts` - WebSocket client wrapper
- `src/hooks/` - React hooks for real-time features
- `src/components/` - UI components (Chat, LiveLeaderboard, etc.)

## Backend Implementation

### WebSocket Server

The Socket.IO server is initialized in `server/index.ts` and configured with:

- **CORS**: Configured for the frontend URL
- **Authentication**: JWT-based authentication middleware
- **Rate Limiting**: 60 messages per minute per socket
- **Heartbeat**: 30-second ping/pong for connection health

### Event Handlers

#### Chat Handlers (`chatHandlers.ts`)
- `join-room`: Join a chat room
- `leave-room`: Leave a chat room
- `send-message`: Send a message to a room
- `typing-indicator`: Broadcast typing status
- `mark-message-read`: Mark a message as read

#### Exam Handlers (`examHandlers.ts`)
- `join-exam`: Join an exam session
- `leave-exam`: Leave an exam session
- `exam-progress`: Auto-save exam progress
- `exam-answer`: Save individual answers
- `exam-complete`: Submit and grade exam

#### Leaderboard Handlers (`leaderboardHandlers.ts`)
- `leaderboard-request`: Request leaderboard data
- `leaderboard-update`: Trigger manual update (admin only)

#### Notification Handlers (`notificationHandlers.ts`)
- `notification-send`: Send a notification
- `notification-read`: Mark notification as read
- `notification-read-all`: Mark all as read

#### Study Group Handlers (`studyGroupHandlers.ts`)
- `study-group-create`: Create a study group
- `study-group-join`: Join a study group
- `study-group-leave`: Leave a study group
- `study-group-message`: Send message in study group

### Database Schema

New tables added for real-time features:

- **chat_messages**: Store all chat messages
- **chat_rooms**: Define chat rooms and participants
- **notifications**: User notifications
- **study_groups**: Study group metadata
- **leaderboard_entries**: Cached leaderboard rankings
- **online_users**: Track user presence
- **exam_sessions**: Active exam sessions
- **typing_indicators**: Temporary typing status

## Frontend Implementation

### Socket Service (`socketService.ts`)

Singleton service that manages the WebSocket connection:

```typescript
import { socketService } from './services/socketService';

// Connect (done automatically via useWebSocket hook)
socketService.connect(accessToken);

// Send message
socketService.sendMessage(roomId, message);

// Listen to events
socketService.on('receive-message', (message) => {
  console.log('New message:', message);
});
```

### React Hooks

#### `useWebSocket()`
Manages WebSocket connection and reconnection.

```typescript
const { isConnected, connectionError, reconnect } = useWebSocket();
```

#### `useChat(roomId)`
Provides chat functionality for a specific room.

```typescript
const {
  messages,
  typingUsers,
  onlineUsers,
  isJoined,
  sendMessage,
  sendTypingIndicator,
  markAsRead
} = useChat('room-123');
```

#### `useRealtimeExam(examId)`
Manages real-time exam sessions.

```typescript
const {
  session,
  participants,
  participantCount,
  isJoined,
  lastSaved,
  updateProgress,
  saveAnswer,
  completeExam
} = useRealtimeExam('exam-123');
```

#### `useLeaderboard(period, specialty)`
Fetches and subscribes to leaderboard updates.

```typescript
const {
  entries,
  userRank,
  isLoading,
  lastUpdated,
  refresh
} = useLeaderboard('weekly', 'Cardiology');
```

#### `useNotifications()`
Manages real-time notifications.

```typescript
const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  sendNotification
} = useNotifications();
```

### UI Components

#### `<Chat />`
Full-featured chat component with:
- Message bubbles
- Typing indicators
- Online status
- File attachments
- Read receipts

```tsx
<Chat 
  roomId="mentor-room-123" 
  roomName="Mentor Chat"
  onClose={() => setShowChat(false)}
/>
```

#### `<LiveLeaderboard />`
Animated leaderboard with:
- Real-time rank updates
- Period filtering (weekly/monthly/all-time)
- Specialty filtering
- User position highlighting

```tsx
<LiveLeaderboard />
```

#### `<NotificationBell />`
Notification center with:
- Badge counter
- Dropdown with recent notifications
- Priority indicators
- Mark as read functionality

```tsx
<NotificationBell />
```

#### `<ConnectionStatus />`
Displays connection errors and allows reconnection.

```tsx
<ConnectionStatus />
```

## Features

### 1. Live Chat with Mentors

**Use Cases:**
- Student-mentor communication
- Study group discussions
- Exam proctoring chat

**Features:**
- Real-time messaging
- Typing indicators
- Online/offline status
- Read receipts
- File sharing
- Message history persistence
- XSS protection (sanitized HTML)

**Example:**
```typescript
// Join a mentor room
socketService.joinRoom('mentor:user-123');

// Send message
socketService.sendMessage('mentor:user-123', 'I need help with this topic');

// Listen for messages
socketService.on('receive-message', (msg) => {
  console.log(msg.sender_name, ':', msg.message);
});
```

### 2. Real-Time Exam Sessions

**Use Cases:**
- Synchronized exams
- Auto-save progress
- Live participant tracking
- Exam monitoring

**Features:**
- Auto-save every answer
- Timer synchronization
- Participant count
- Progress tracking
- Automatic submission on time expiry

**Example:**
```typescript
const { updateProgress, saveAnswer } = useRealtimeExam(examId);

// Auto-save progress every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    updateProgress(currentQuestion, timeRemaining, answers);
  }, 30000);
  return () => clearInterval(interval);
}, [currentQuestion, timeRemaining, answers]);

// Save answer immediately
const handleAnswer = (questionIndex, answer) => {
  saveAnswer(questionIndex, answer);
};
```

### 3. Live Leaderboard

**Use Cases:**
- Competition tracking
- Performance motivation
- Cohort benchmarking

**Features:**
- Real-time rank updates
- Animated score changes
- Period filtering (weekly/monthly/all-time)
- Specialty filtering
- User position highlighting
- Top performers showcase

**Example:**
```typescript
const { entries, userRank } = useLeaderboard('weekly', 'Cardiology');

// Display top 10
entries.slice(0, 10).map(entry => (
  <div key={entry.user_id}>
    #{entry.rank} - {entry.user_name} - {entry.total_score} pts
  </div>
));
```

### 4. Real-Time Notifications

**Use Cases:**
- Exam reminders
- New messages
- Leaderboard updates
- System announcements

**Features:**
- Priority levels (low, normal, high, urgent)
- Toast notifications
- Badge counters
- Action URLs
- Sound alerts (optional)
- Mark as read functionality

**Example:**
```typescript
const { sendNotification } = useNotifications();

// Send notification
sendNotification({
  type: 'EXAM_UPDATE',
  title: 'Exam Starting Soon',
  message: 'Your exam starts in 5 minutes',
  priority: 'high',
  actionUrl: '/exams/123'
});
```

### 5. Study Groups

**Use Cases:**
- Collaborative learning
- Group discussions
- Peer support

**Features:**
- Create public/private groups
- Member management
- Group chat
- Specialty-based filtering
- Member limit enforcement

**Example:**
```typescript
// Create study group
socketService.createStudyGroup({
  name: 'Cardiology Study Group',
  description: 'Weekly case discussions',
  specialty: 'Cardiology',
  maxMembers: 10,
  isPublic: true
});

// Join study group
socketService.joinStudyGroup(groupId);

// Send message to group
socketService.sendStudyGroupMessage(groupId, 'Hello everyone!');
```

## API Reference

### Server Events (Emit from Client)

#### Chat Events
- `join-room`: `{ roomId: string }`
- `leave-room`: `{ roomId: string }`
- `send-message`: `{ roomId: string, message: string, messageType?: string, fileUrl?: string, fileName?: string, fileSize?: number }`
- `typing-indicator`: `{ roomId: string, isTyping: boolean }`
- `mark-message-read`: `{ messageId: string }`

#### Exam Events
- `join-exam`: `{ examId: string }`
- `leave-exam`: `{ examId: string }`
- `exam-progress`: `{ examId: string, currentQuestion: number, timeRemaining: number, answers: number[] }`
- `exam-answer`: `{ examId: string, questionIndex: number, answer: number }`
- `exam-complete`: `{ examId: string }`

#### Leaderboard Events
- `leaderboard-request`: `{ period?: string, specialty?: string, limit?: number }`
- `leaderboard-update`: `{}`

#### Notification Events
- `notification-send`: `{ userId?: string, type: string, title: string, message: string, data?: any, priority?: string, actionUrl?: string }`
- `notification-read`: `{ notificationId: string }`
- `notification-read-all`: `{}`

#### Study Group Events
- `study-group-create`: `{ name: string, description?: string, specialty?: string, maxMembers?: number, isPublic?: boolean }`
- `study-group-join`: `{ groupId: string }`
- `study-group-leave`: `{ groupId: string }`
- `study-group-message`: `{ groupId: string, message: string }`

### Client Events (Receive from Server)

#### Chat Events
- `room-joined`: `{ roomId: string, messages: ChatMessage[] }`
- `receive-message`: `ChatMessage`
- `typing-indicator`: `{ roomId: string, userId: string, userName: string, isTyping: boolean }`
- `user-status-change`: `{ userId: string, userName: string, status: string }`
- `message-read`: `{ messageId: string, roomId: string, readBy: string }`

#### Exam Events
- `exam-joined`: `{ examId: string, exam: any, session: ExamSession, participantCount: number }`
- `participant-joined-exam`: `{ examId: string, userId: string, userName: string, participantCount: number }`
- `participant-left-exam`: `{ examId: string, userId: string, userName: string, participantCount: number }`
- `exam-progress-saved`: `{ examId: string, currentQuestion: number, timeRemaining: number, timestamp: Date }`
- `exam-answer-saved`: `{ examId: string, questionIndex: number, answer: number, timestamp: Date }`
- `exam-completed`: `{ examId: string, result: any }`

#### Leaderboard Events
- `leaderboard-data`: `{ period: string, specialty?: string, entries: LeaderboardEntry[], userRank: UserRank | null, timestamp: Date }`
- `leaderboard-updated`: `{ period: string, entries: LeaderboardEntry[], timestamp: Date }`

#### Notification Events
- `new-notification`: `Notification`
- `notification-read`: `{ notificationId: string, unreadCount: number }`
- `notifications-read-all`: `{ unreadCount: number }`

#### Study Group Events
- `study-group-created`: `StudyGroup`
- `study-group-joined`: `{ group: StudyGroup, roomId: string }`
- `study-group-member-joined`: `{ groupId: string, userId: string, userName: string, memberCount: number }`
- `study-group-member-left`: `{ groupId: string, userId: string, userName: string, memberCount: number }`
- `study-group-deleted`: `{ groupId: string }`

#### General Events
- `connect`: Connection established
- `disconnect`: Connection lost
- `error`: `{ message: string }`

## Usage Examples

### Complete Chat Integration

```tsx
import { Chat } from './components/Chat';

function MentorChatPage() {
  const [roomId, setRoomId] = useState('mentor:123');
  
  return (
    <div className="h-screen">
      <Chat 
        roomId={roomId} 
        roomName="Mentor Chat"
        onClose={() => navigate(-1)}
      />
    </div>
  );
}
```

### Real-Time Exam Taker

```tsx
function ExamTaker({ examId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  
  const { 
    session, 
    participantCount, 
    updateProgress, 
    saveAnswer, 
    completeExam 
  } = useRealtimeExam(examId);
  
  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateProgress(currentQuestion, timeRemaining, answers);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentQuestion, timeRemaining, answers]);
  
  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    saveAnswer(currentQuestion, answer);
  };
  
  const handleSubmit = () => {
    completeExam();
  };
  
  return (
    <div>
      <div>Participants: {participantCount}</div>
      {/* Exam UI */}
    </div>
  );
}
```

### Leaderboard Dashboard

```tsx
function LeaderboardDashboard() {
  const [period, setPeriod] = useState('weekly');
  const { entries, userRank, refresh } = useLeaderboard(period);
  
  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="weekly">This Week</option>
        <option value="monthly">This Month</option>
        <option value="all_time">All Time</option>
      </select>
      
      {userRank && (
        <div>Your Rank: #{userRank.rank} - {userRank.total_score} pts</div>
      )}
      
      {entries.map((entry) => (
        <div key={entry.user_id}>
          #{entry.rank} - {entry.user_name} - {entry.total_score} pts
        </div>
      ))}
    </div>
  );
}
```

## Testing

### Run Database Migration

```bash
psql -h localhost -U postgres -d sinaesta -f server/migrations/002_realtime_features.sql
```

### Start Backend Server

```bash
npm run server:watch
```

### Start Frontend

```bash
npm run dev
```

### Test WebSocket Connection

1. Login to the application
2. Open browser DevTools > Console
3. Look for "✅ WebSocket connected"
4. Try sending a message in chat
5. Check for real-time updates

### Test Events

Use the browser console to test events:

```javascript
// Access socket service
import { socketService } from './services/socketService';

// Send test message
socketService.sendMessage('test-room', 'Hello World');

// Listen for responses
socketService.on('receive-message', (msg) => console.log(msg));
```

## Troubleshooting

### Connection Issues

**Problem**: WebSocket won't connect

**Solutions**:
1. Check if backend server is running on port 3001
2. Verify JWT token is valid (check localStorage)
3. Check CORS configuration in `server/index.ts`
4. Verify firewall allows WebSocket connections

### Authentication Errors

**Problem**: "Authentication error: Invalid token"

**Solutions**:
1. Check if user is logged in
2. Verify token is being sent in `auth` handshake
3. Check JWT_SECRET matches in .env file
4. Try logging out and back in

### Message Not Received

**Problem**: Messages sent but not received

**Solutions**:
1. Check if both users are in the same room
2. Verify room ID is correct
3. Check rate limiting (max 60 messages/minute)
4. Look for errors in browser console

### Leaderboard Not Updating

**Problem**: Leaderboard ranks are stale

**Solutions**:
1. Check if exam results are being saved
2. Run manual update: `SELECT update_leaderboard_ranks();`
3. Verify leaderboard triggers are active
4. Check for errors in server logs

### Performance Issues

**Problem**: Slow real-time updates

**Solutions**:
1. Check server CPU/memory usage
2. Reduce message payload size
3. Implement message batching
4. Consider Redis adapter for horizontal scaling

## Best Practices

1. **Always handle disconnections gracefully**
   - Show connection status to users
   - Queue messages when offline
   - Auto-reconnect with exponential backoff

2. **Implement proper error handling**
   - Catch all socket errors
   - Show user-friendly error messages
   - Log errors for debugging

3. **Rate limit client-side**
   - Debounce rapid updates (typing indicators)
   - Throttle progress saves
   - Batch similar events

4. **Secure your WebSocket connections**
   - Always use JWT authentication
   - Validate all incoming data
   - Sanitize chat messages
   - Implement room access control

5. **Optimize for performance**
   - Only subscribe to needed events
   - Clean up listeners on unmount
   - Use efficient data structures
   - Implement pagination for large lists

6. **Test real-world scenarios**
   - Test with poor network conditions
   - Test with many concurrent users
   - Test reconnection logic
   - Test with different devices

## Scaling Considerations

For production deployments with many users:

1. **Use Redis Adapter for Socket.IO**
   ```typescript
   import { createAdapter } from '@socket.io/redis-adapter';
   import { createClient } from 'redis';
   
   const pubClient = createClient({ host: 'localhost', port: 6379 });
   const subClient = pubClient.duplicate();
   
   io.adapter(createAdapter(pubClient, subClient));
   ```

2. **Implement Load Balancing**
   - Use sticky sessions for WebSocket connections
   - Deploy multiple server instances
   - Use NGINX or HAProxy for load balancing

3. **Database Optimization**
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Implement caching for leaderboards
   - Archive old messages periodically

4. **Monitoring**
   - Track connection counts
   - Monitor message throughput
   - Set up alerts for errors
   - Log performance metrics

## Future Enhancements

Potential additions:

1. **Voice/Video Chat**: WebRTC integration for mentor sessions
2. **Screen Sharing**: For collaborative learning
3. **Real-Time Whiteboard**: Shared drawing canvas
4. **Push Notifications**: Mobile/desktop notifications
5. **Advanced Presence**: "away", "busy", "do not disturb" statuses
6. **Message Threading**: Replies to specific messages
7. **Message Reactions**: Emoji reactions to messages
8. **File Upload Progress**: Real-time upload progress
9. **Collaborative Docs**: Real-time document editing
10. **Game-ified Challenges**: Real-time quiz competitions

## Support

For issues or questions:
- Check server logs: `npm run server:watch`
- Check browser console for errors
- Review Socket.IO documentation: https://socket.io/docs/
- Open GitHub issue with reproduction steps
