import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Exam, UserRole } from '../types';
import { MockExamProvider, ExamProvider } from '../services/examProviders';
import { useUser } from './UserProvider';

interface ExamDataContextValue {
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  isLoading: boolean;
  refreshExams: () => Promise<void>;
  provider: ExamProvider;
}

const ExamDataContext = createContext<ExamDataContextValue | undefined>(undefined);

export const ExamDataProvider: React.FC<{ children: React.ReactNode; provider?: ExamProvider }> = ({
  children,
  provider
}) => {
  const { user } = useUser();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const examProvider = useMemo(() => provider ?? new MockExamProvider(), [provider]);

  const loadExams = async () => {
    setIsLoading(true);
    try {
      if (user.role === UserRole.STUDENT && user.targetSpecialty) {
        const data = await examProvider.getExamsBySpecialty(user.targetSpecialty);
        setExams(data);
      } else {
        const data = await examProvider.getAllExams();
        setExams(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadExams();
  }, [user.role, user.targetSpecialty, examProvider]);

  const value = useMemo(
    () => ({
      exams,
      setExams,
      isLoading,
      refreshExams: loadExams,
      provider: examProvider
    }),
    [exams, isLoading, examProvider]
  );

  return <ExamDataContext.Provider value={value}>{children}</ExamDataContext.Provider>;
};

export const useExamData = () => {
  const context = useContext(ExamDataContext);
  if (!context) {
    throw new Error('useExamData must be used within ExamDataProvider');
  }
  return context;
};
