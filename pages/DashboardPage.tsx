import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Zap } from 'lucide-react';
import { useExamData } from '../providers/ExamDataProvider';
import { useUser } from '../providers/UserProvider';
import { UserRole } from '../types';

const PAGE_SIZE = 6;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { exams, isLoading } = useExamData();
  const { user } = useUser();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(exams.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [exams.length]);

  const pagedExams = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return exams.slice(start, start + PAGE_SIZE);
  }, [exams, currentPage]);

  if (user.role !== UserRole.STUDENT) {
    return (
      <div className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard khusus student</h1>
        <p className="text-gray-500">Silakan gunakan menu admin atau mentor untuk fitur lainnya.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
        Selamat Datang, Dok!
      </h1>
      <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
        Siap melanjutkan persiapan PPDS{' '}
        <span className="font-bold text-indigo-600">{user.targetSpecialty}</span> hari ini?
      </p>

      {isLoading ? (
        <div className="text-gray-500">Memuat data ujian...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {pagedExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 lg:p-6 flex flex-col"
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded inline-block">
                      {exam.topic}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mt-2 leading-tight">
                      {exam.title}
                    </h3>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold ml-2 flex-shrink-0 ${
                      exam.difficulty === 'Hard' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {exam.difficulty}
                  </div>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 flex-1 line-clamp-3">
                  {exam.description}
                </p>
                <button
                  onClick={() => navigate(`/exam/${exam.id}`)}
                  className="w-full py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-bold hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                >
                  Mulai Simulasi
                </button>
              </div>
            ))}

            <div
              onClick={() => navigate('/spot-dx')}
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md p-4 sm:p-5 lg:p-6 flex flex-col text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <Zap size={28} className="mb-3 sm:mb-4 text-white/80 sm:w-8 sm:h-8" />
              <h3 className="font-bold text-lg sm:text-xl mb-1">Spot Dx Drill</h3>
              <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 flex-1">
                60-second rapid fire cases to train pattern recognition.
              </p>
              <span className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold">Start Sprint →</span>
            </div>

            <div
              onClick={() => navigate('/microlearning')}
              className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-md p-4 sm:p-5 lg:p-6 flex flex-col text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <Zap size={28} className="mb-3 sm:mb-4 text-white/80 sm:w-8 sm:h-8" />
              <h3 className="font-bold text-lg sm:text-xl mb-1">Microlearning</h3>
              <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 flex-1">
                5-min study packs for your busy shifts.
              </p>
              <span className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold">Quick Study →</span>
            </div>

            <div
              onClick={() => navigate('/clinical-reasoning')}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-4 sm:p-5 lg:p-6 flex flex-col text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <BrainCircuit size={28} className="mb-3 sm:mb-4 text-white/80 sm:w-8 sm:h-8" />
              <h3 className="font-bold text-lg sm:text-xl mb-1">Reasoning Sim</h3>
              <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 flex-1">
                Step-by-step diagnostic challenges with partial scoring.
              </p>
              <span className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold">Practice Now →</span>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
