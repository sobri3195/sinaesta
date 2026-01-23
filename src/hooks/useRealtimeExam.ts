import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';

export interface ExamSession {
  id: string;
  exam_id: string;
  user_id: string;
  room_id: string;
  current_question: number;
  answers: number[];
  time_remaining: number;
  status: 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
  last_activity: string;
  started_at: string;
  completed_at?: string;
}

export interface ExamParticipant {
  userId: string;
  userName: string;
}

export function useRealtimeExam(examId: string | null) {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [participants, setParticipants] = useState<ExamParticipant[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!examId || !socketService.isConnected()) {
      return;
    }

    // Join exam
    socketService.joinExam(examId);

    // Set up event listeners
    const handleExamJoined = (data: {
      examId: string;
      exam: any;
      session: ExamSession;
      participantCount: number;
    }) => {
      if (data.examId === examId) {
        setSession(data.session);
        setParticipantCount(data.participantCount);
        setIsJoined(true);
      }
    };

    const handleParticipantJoined = (data: {
      examId: string;
      userId: string;
      userName: string;
      participantCount: number;
    }) => {
      if (data.examId === examId) {
        setParticipants((prev) => [
          ...prev,
          { userId: data.userId, userName: data.userName },
        ]);
        setParticipantCount(data.participantCount);
      }
    };

    const handleParticipantLeft = (data: {
      examId: string;
      userId: string;
      userName: string;
      participantCount: number;
    }) => {
      if (data.examId === examId) {
        setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
        setParticipantCount(data.participantCount);
      }
    };

    const handleProgressSaved = (data: {
      examId: string;
      currentQuestion: number;
      timeRemaining: number;
      timestamp: Date;
    }) => {
      if (data.examId === examId) {
        setLastSaved(new Date(data.timestamp));
      }
    };

    const handleAnswerSaved = (data: {
      examId: string;
      questionIndex: number;
      answer: number;
      timestamp: Date;
    }) => {
      if (data.examId === examId) {
        setLastSaved(new Date(data.timestamp));
      }
    };

    const handleExamCompleted = (data: { examId: string; result: any }) => {
      if (data.examId === examId) {
        setSession((prev) => (prev ? { ...prev, status: 'COMPLETED' } : null));
      }
    };

    socketService.on('exam-joined', handleExamJoined);
    socketService.on('participant-joined-exam', handleParticipantJoined);
    socketService.on('participant-left-exam', handleParticipantLeft);
    socketService.on('exam-progress-saved', handleProgressSaved);
    socketService.on('exam-answer-saved', handleAnswerSaved);
    socketService.on('exam-completed', handleExamCompleted);

    // Cleanup
    return () => {
      if (examId) {
        socketService.leaveExam(examId);
      }
      socketService.off('exam-joined', handleExamJoined);
      socketService.off('participant-joined-exam', handleParticipantJoined);
      socketService.off('participant-left-exam', handleParticipantLeft);
      socketService.off('exam-progress-saved', handleProgressSaved);
      socketService.off('exam-answer-saved', handleAnswerSaved);
      socketService.off('exam-completed', handleExamCompleted);
      setIsJoined(false);
    };
  }, [examId]);

  const updateProgress = useCallback(
    (currentQuestion: number, timeRemaining: number, answers: number[]) => {
      if (examId && socketService.isConnected()) {
        socketService.updateExamProgress(examId, currentQuestion, timeRemaining, answers);
      }
    },
    [examId]
  );

  const saveAnswer = useCallback(
    (questionIndex: number, answer: number) => {
      if (examId && socketService.isConnected()) {
        socketService.saveExamAnswer(examId, questionIndex, answer);
      }
    },
    [examId]
  );

  const completeExam = useCallback(() => {
    if (examId && socketService.isConnected()) {
      socketService.completeExam(examId);
    }
  }, [examId]);

  return {
    session,
    participants,
    participantCount,
    isJoined,
    lastSaved,
    updateProgress,
    saveAnswer,
    completeExam,
  };
}
