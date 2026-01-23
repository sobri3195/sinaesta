-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(255) NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  sender_avatar TEXT,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Chat Rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'DIRECT', 'MENTOR', 'STUDY_GROUP', 'EXAM'
  participants UUID[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on participants for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participants ON chat_rooms USING GIN(participants);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'EXAM_UPDATE', 'MESSAGE', 'LEADERBOARD', 'SYSTEM'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Study Groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  room_id VARCHAR(255) UNIQUE NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  members UUID[],
  max_members INTEGER DEFAULT 10,
  specialty VARCHAR(100),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on study groups
CREATE INDEX IF NOT EXISTS idx_study_groups_creator_id ON study_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_members ON study_groups USING GIN(members);
CREATE INDEX IF NOT EXISTS idx_study_groups_specialty ON study_groups(specialty);

-- Leaderboard Entries table (for caching)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_avatar TEXT,
  specialty VARCHAR(100),
  total_score INTEGER DEFAULT 0,
  exams_completed INTEGER DEFAULT 0,
  average_score DECIMAL(5, 2) DEFAULT 0,
  rank INTEGER,
  period VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'all_time'
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, period, specialty)
);

-- Create indexes for leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_entries(period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_specialty ON leaderboard_entries(specialty);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(rank);

-- Online Users table (for presence tracking)
CREATE TABLE IF NOT EXISTS online_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  socket_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'online', -- 'online', 'away', 'busy', 'offline'
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  current_room VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on online users
CREATE INDEX IF NOT EXISTS idx_online_users_status ON online_users(status);

-- Exam Sessions table (for real-time exam tracking)
CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_id VARCHAR(255) NOT NULL,
  current_question INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,
  time_remaining INTEGER, -- in seconds
  status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'PAUSED', 'COMPLETED'
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(exam_id, user_id)
);

-- Create indexes for exam sessions
CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam_id ON exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_room_id ON exam_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON exam_sessions(status);

-- Typing Indicators table (temporary, for real-time typing status)
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  is_typing BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for typing indicators
CREATE INDEX IF NOT EXISTS idx_typing_indicators_room_id ON typing_indicators(room_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user_id ON typing_indicators(user_id);

-- Update triggers for new tables
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_online_users_updated_at BEFORE UPDATE ON online_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_typing_indicators_updated_at BEFORE UPDATE ON typing_indicators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Update weekly leaderboard
  INSERT INTO leaderboard_entries (user_id, user_name, user_avatar, specialty, total_score, exams_completed, average_score, period, period_start, period_end)
  SELECT 
    u.id,
    u.name,
    u.avatar,
    u.target_specialty,
    SUM(er.score) as total_score,
    COUNT(er.id) as exams_completed,
    AVG(er.score::decimal / er.total_questions * 100) as average_score,
    'weekly',
    date_trunc('week', CURRENT_TIMESTAMP),
    date_trunc('week', CURRENT_TIMESTAMP) + interval '1 week'
  FROM users u
  INNER JOIN exam_results er ON u.id = er.user_id
  WHERE er.completed_at >= date_trunc('week', CURRENT_TIMESTAMP)
    AND u.id = NEW.user_id
  GROUP BY u.id, u.name, u.avatar, u.target_specialty
  ON CONFLICT (user_id, period, specialty) 
  DO UPDATE SET
    total_score = EXCLUDED.total_score,
    exams_completed = EXCLUDED.exams_completed,
    average_score = EXCLUDED.average_score,
    updated_at = CURRENT_TIMESTAMP;

  -- Update monthly leaderboard
  INSERT INTO leaderboard_entries (user_id, user_name, user_avatar, specialty, total_score, exams_completed, average_score, period, period_start, period_end)
  SELECT 
    u.id,
    u.name,
    u.avatar,
    u.target_specialty,
    SUM(er.score) as total_score,
    COUNT(er.id) as exams_completed,
    AVG(er.score::decimal / er.total_questions * 100) as average_score,
    'monthly',
    date_trunc('month', CURRENT_TIMESTAMP),
    date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month'
  FROM users u
  INNER JOIN exam_results er ON u.id = er.user_id
  WHERE er.completed_at >= date_trunc('month', CURRENT_TIMESTAMP)
    AND u.id = NEW.user_id
  GROUP BY u.id, u.name, u.avatar, u.target_specialty
  ON CONFLICT (user_id, period, specialty) 
  DO UPDATE SET
    total_score = EXCLUDED.total_score,
    exams_completed = EXCLUDED.exams_completed,
    average_score = EXCLUDED.average_score,
    updated_at = CURRENT_TIMESTAMP;

  -- Update all-time leaderboard
  INSERT INTO leaderboard_entries (user_id, user_name, user_avatar, specialty, total_score, exams_completed, average_score, period)
  SELECT 
    u.id,
    u.name,
    u.avatar,
    u.target_specialty,
    SUM(er.score) as total_score,
    COUNT(er.id) as exams_completed,
    AVG(er.score::decimal / er.total_questions * 100) as average_score,
    'all_time'
  FROM users u
  INNER JOIN exam_results er ON u.id = er.user_id
  WHERE u.id = NEW.user_id
  GROUP BY u.id, u.name, u.avatar, u.target_specialty
  ON CONFLICT (user_id, period, specialty) 
  DO UPDATE SET
    total_score = EXCLUDED.total_score,
    exams_completed = EXCLUDED.exams_completed,
    average_score = EXCLUDED.average_score,
    updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update leaderboard on exam completion
CREATE TRIGGER update_leaderboard_on_exam_completion
  AFTER INSERT ON exam_results
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard();

-- Function to update ranks in leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS void AS $$
BEGIN
  -- Update ranks for weekly leaderboard
  WITH ranked_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY period, specialty ORDER BY total_score DESC, average_score DESC) as new_rank
    FROM leaderboard_entries
    WHERE period = 'weekly'
  )
  UPDATE leaderboard_entries le
  SET rank = ru.new_rank
  FROM ranked_users ru
  WHERE le.id = ru.id;

  -- Update ranks for monthly leaderboard
  WITH ranked_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY period, specialty ORDER BY total_score DESC, average_score DESC) as new_rank
    FROM leaderboard_entries
    WHERE period = 'monthly'
  )
  UPDATE leaderboard_entries le
  SET rank = ru.new_rank
  FROM ranked_users ru
  WHERE le.id = ru.id;

  -- Update ranks for all-time leaderboard
  WITH ranked_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY period, specialty ORDER BY total_score DESC, average_score DESC) as new_rank
    FROM leaderboard_entries
    WHERE period = 'all_time'
  )
  UPDATE leaderboard_entries le
  SET rank = ru.new_rank
  FROM ranked_users ru
  WHERE le.id = ru.id;
END;
$$ LANGUAGE plpgsql;
