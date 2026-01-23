import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import { query } from '../../config/database';

export async function handleJoinExam(io: Server, socket: AuthenticatedSocket, data: { examId: string }) {
  try {
    const { examId } = data;

    if (!examId) {
      socket.emit('error', { message: 'Exam ID is required' });
      return;
    }

    // Verify exam exists
    const examResult = await query(
      'SELECT id, title, duration_minutes FROM exams WHERE id = $1',
      [examId]
    );

    if (examResult.rows.length === 0) {
      socket.emit('error', { message: 'Exam not found' });
      return;
    }

    const exam = examResult.rows[0];
    const roomId = `exam:${examId}`;

    // Join the exam room
    socket.join(roomId);

    // Check if user has an existing session
    const sessionResult = await query(
      'SELECT * FROM exam_sessions WHERE exam_id = $1 AND user_id = $2',
      [examId, socket.userId]
    );

    let session;
    if (sessionResult.rows.length === 0) {
      // Create new exam session
      const createResult = await query(
        `INSERT INTO exam_sessions (exam_id, user_id, room_id, time_remaining)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [examId, socket.userId, roomId, exam.duration_minutes * 60]
      );
      session = createResult.rows[0];
    } else {
      session = sessionResult.rows[0];
    }

    // Get participant count
    const participantCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;

    // Notify user that they've joined
    socket.emit('exam-joined', {
      examId,
      exam,
      session,
      participantCount,
    });

    // Broadcast to other participants
    socket.to(roomId).emit('participant-joined-exam', {
      examId,
      userId: socket.userId,
      userName: socket.userName,
      participantCount,
    });

    console.log(`User ${socket.userName} joined exam ${examId}`);
  } catch (error) {
    console.error('Error joining exam:', error);
    socket.emit('error', { message: 'Failed to join exam' });
  }
}

export async function handleLeaveExam(io: Server, socket: AuthenticatedSocket, data: { examId: string }) {
  try {
    const { examId } = data;

    if (!examId) {
      socket.emit('error', { message: 'Exam ID is required' });
      return;
    }

    const roomId = `exam:${examId}`;

    // Leave the exam room
    socket.leave(roomId);

    // Get updated participant count
    const participantCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;

    // Broadcast to other participants
    socket.to(roomId).emit('participant-left-exam', {
      examId,
      userId: socket.userId,
      userName: socket.userName,
      participantCount,
    });

    socket.emit('exam-left', { examId });

    console.log(`User ${socket.userName} left exam ${examId}`);
  } catch (error) {
    console.error('Error leaving exam:', error);
    socket.emit('error', { message: 'Failed to leave exam' });
  }
}

export async function handleExamProgress(io: Server, socket: AuthenticatedSocket, data: any) {
  try {
    const { examId, currentQuestion, timeRemaining, answers } = data;

    if (!examId) {
      socket.emit('error', { message: 'Exam ID is required' });
      return;
    }

    // Update exam session
    await query(
      `UPDATE exam_sessions 
       SET current_question = $1, time_remaining = $2, answers = $3, last_activity = CURRENT_TIMESTAMP
       WHERE exam_id = $4 AND user_id = $5`,
      [currentQuestion, timeRemaining, JSON.stringify(answers), examId, socket.userId]
    );

    // Acknowledge progress saved
    socket.emit('exam-progress-saved', {
      examId,
      currentQuestion,
      timeRemaining,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error saving exam progress:', error);
    socket.emit('error', { message: 'Failed to save progress' });
  }
}

export async function handleExamAnswer(io: Server, socket: AuthenticatedSocket, data: any) {
  try {
    const { examId, questionIndex, answer } = data;

    if (!examId || questionIndex === undefined || answer === undefined) {
      socket.emit('error', { message: 'Exam ID, question index, and answer are required' });
      return;
    }

    // Get current session
    const sessionResult = await query(
      'SELECT answers FROM exam_sessions WHERE exam_id = $1 AND user_id = $2',
      [examId, socket.userId]
    );

    if (sessionResult.rows.length === 0) {
      socket.emit('error', { message: 'Exam session not found' });
      return;
    }

    const currentAnswers = sessionResult.rows[0].answers || [];
    currentAnswers[questionIndex] = answer;

    // Update answers
    await query(
      `UPDATE exam_sessions 
       SET answers = $1, last_activity = CURRENT_TIMESTAMP
       WHERE exam_id = $2 AND user_id = $3`,
      [JSON.stringify(currentAnswers), examId, socket.userId]
    );

    // Acknowledge answer saved
    socket.emit('exam-answer-saved', {
      examId,
      questionIndex,
      answer,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error saving exam answer:', error);
    socket.emit('error', { message: 'Failed to save answer' });
  }
}

export async function handleExamComplete(io: Server, socket: AuthenticatedSocket, data: any) {
  try {
    const { examId } = data;

    if (!examId) {
      socket.emit('error', { message: 'Exam ID is required' });
      return;
    }

    const roomId = `exam:${examId}`;

    // Get exam session
    const sessionResult = await query(
      'SELECT * FROM exam_sessions WHERE exam_id = $1 AND user_id = $2',
      [examId, socket.userId]
    );

    if (sessionResult.rows.length === 0) {
      socket.emit('error', { message: 'Exam session not found' });
      return;
    }

    const session = sessionResult.rows[0];

    // Get exam questions
    const questionsResult = await query(
      'SELECT correct_answer_index FROM questions WHERE exam_id = $1 ORDER BY created_at',
      [examId]
    );

    const questions = questionsResult.rows;
    const answers = session.answers || [];

    // Calculate score
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correct_answer_index) {
        score++;
      }
    }

    // Save exam result
    const resultInsert = await query(
      `INSERT INTO exam_results (exam_id, user_id, score, total_questions, answers)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [examId, socket.userId, score, questions.length, answers]
    );

    const result = resultInsert.rows[0];

    // Update exam session status
    await query(
      `UPDATE exam_sessions 
       SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP
       WHERE exam_id = $1 AND user_id = $2`,
      [examId, socket.userId]
    );

    // Send result to user
    socket.emit('exam-completed', {
      examId,
      result,
    });

    // Leave exam room
    socket.leave(roomId);

    // Get updated participant count
    const participantCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;

    // Notify other participants
    socket.to(roomId).emit('participant-completed-exam', {
      examId,
      userId: socket.userId,
      userName: socket.userName,
      score,
      totalQuestions: questions.length,
      participantCount,
    });

    // Create notification
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, 'EXAM_UPDATE', $2, $3, $4)`,
      [
        socket.userId,
        'Exam Completed',
        `You scored ${score}/${questions.length} on the exam`,
        JSON.stringify({ examId, resultId: result.id }),
      ]
    );

    // Notify user of new notification
    io.to(`user:${socket.userId}`).emit('new-notification', {
      type: 'EXAM_UPDATE',
      title: 'Exam Completed',
      message: `You scored ${score}/${questions.length} on the exam`,
    });

    console.log(`User ${socket.userName} completed exam ${examId} with score ${score}/${questions.length}`);
  } catch (error) {
    console.error('Error completing exam:', error);
    socket.emit('error', { message: 'Failed to complete exam' });
  }
}
