import { generateExamsForSpecialty } from '../mockData';
import { Exam, Specialty, SPECIALTIES } from '../types';

export interface ExamProvider {
  getExamsBySpecialty: (specialty: Specialty) => Promise<Exam[]>;
  getAllExams: () => Promise<Exam[]>;
}

export class MockExamProvider implements ExamProvider {
  async getExamsBySpecialty(specialty: Specialty): Promise<Exam[]> {
    return generateExamsForSpecialty(specialty);
  }

  async getAllExams(): Promise<Exam[]> {
    return SPECIALTIES.flatMap((spec) => generateExamsForSpecialty(spec));
  }
}
