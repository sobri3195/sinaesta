import React, { createContext, useContext, useMemo, useState } from 'react';
import { ExamResult } from '../types';

interface ExamSessionContextValue {
  lastResult: ExamResult | null;
  examHistory: ExamResult[];
  recordResult: (result: ExamResult) => void;
  clearLastResult: () => void;
}

const ExamSessionContext = createContext<ExamSessionContextValue | undefined>(undefined);

export const ExamSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastResult, setLastResult] = useState<ExamResult | null>(null);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);

  const recordResult = (result: ExamResult) => {
    setLastResult(result);
    setExamHistory((prev) => [...prev, result]);
  };

  const clearLastResult = () => setLastResult(null);

  const value = useMemo(
    () => ({ lastResult, examHistory, recordResult, clearLastResult }),
    [lastResult, examHistory]
  );

  return <ExamSessionContext.Provider value={value}>{children}</ExamSessionContext.Provider>;
};

export const useExamSession = () => {
  const context = useContext(ExamSessionContext);
  if (!context) {
    throw new Error('useExamSession must be used within ExamSessionProvider');
  }
  return context;
};
