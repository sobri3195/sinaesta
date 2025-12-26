import { Exam } from '../types';

export const calculateExamScore = (exam: Exam, answers: number[]) =>
  answers.reduce((acc, answer, index) => {
    const question = exam.questions[index];
    const points = question?.points ?? 1;
    return answer === question?.correctAnswerIndex ? acc + points : acc;
  }, 0);
