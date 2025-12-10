import React, { useState, useEffect, useMemo } from 'react';
import { Exam, Question } from '../types';
import { 
  ChevronLeft, ChevronRight, Clock, Flag, LayoutGrid, CheckCircle2, 
  AlertCircle, Save, Menu, X, ArrowRight 
} from 'lucide-react';

interface ExamTakerProps {
  exam: Exam;
  onSubmit: (answers: number[]) => void;
  onExit: () => void;
}

const ExamTaker: React.FC<ExamTakerProps> = ({ exam, onSubmit, onExit }) => {
  // --- State ---
  // If sections exist, questions are flattened based on section order for rendering
  const [flatQuestions, setFlatQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index in flatQuestions
  
  // Answers map to global question IDs (or original exam.questions indices, sticking to indices for simplicity with existing architecture)
  // We need to map flat index back to original exam.questions index to store answers correctly
  const [answers, setAnswers] = useState<number[]>(new Array(exam.questions.length).fill(-1));
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSectionTransition, setShowSectionTransition] = useState(false);

  const hasSections = (exam.sections?.length || 0) > 0;

  // --- Initialization ---
  useEffect(() => {
      if (hasSections && exam.sections) {
          // Create a flat list of questions ordered by section
          const orderedQuestions = exam.sections.flatMap(section => 
              section.questionIds.map(id => exam.questions.find(q => q.id === id)).filter(q => q !== undefined) as Question[]
          );
          setFlatQuestions(orderedQuestions);
          // Set initial timer for first section
          setTimeLeft(exam.sections[0].durationMinutes * 60);
      } else {
          setFlatQuestions(exam.questions);
          setTimeLeft(exam.durationMinutes * 60);
      }
  }, [exam]);

  // --- Timer ---
  useEffect(() => {
    if (showSectionTransition) return; // Pause timer during transition

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (hasSections && currentSectionIndex < (exam.sections?.length || 0) - 1) {
              handleNextSection(true); // Auto advance due to time
              return 0;
          } else {
              handleSubmit(); // Auto submit exam
              return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSectionTransition, currentSectionIndex, hasSections]);

  // Auto-save & Restore
  useEffect(() => {
    const storageKey = `examo_progress_${exam.id}`;
    
    // Restore
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers);
        setFlagged(new Set(parsed.flagged));
      } catch (e) {
        console.error("Failed to restore progress", e);
      }
    }

    // Save interval
    const saveInterval = setInterval(() => {
      localStorage.setItem(storageKey, JSON.stringify({
        answers,
        flagged: Array.from(flagged),
        timestamp: Date.now()
      }));
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [answers, flagged, exam.id]);

  // --- Helpers ---
  
  // Map current flat index to the original index in exam.questions to store answer
  const getOriginalIndex = (flatIdx: number) => {
      const qId = flatQuestions[flatIdx]?.id;
      return exam.questions.findIndex(q => q.id === qId);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const originalIdx = getOriginalIndex(currentQuestionIndex);
    const newAnswers = [...answers];
    newAnswers[originalIdx] = optionIndex;
    setAnswers(newAnswers);
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestionIndex)) {
      newFlagged.delete(currentQuestionIndex);
    } else {
      newFlagged.add(currentQuestionIndex);
    }
    setFlagged(newFlagged);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    localStorage.removeItem(`examo_progress_${exam.id}`);
    onSubmit(answers);
  };

  const handleNextSection = (auto: boolean = false) => {
      if (!exam.sections) return;
      
      if (currentSectionIndex < exam.sections.length - 1) {
          if (auto || confirm("Finish this section? You cannot return to it once time expires (Simulated). Proceed to next section?")) {
             // Logic to move to next section
             const nextSectionIdx = currentSectionIndex + 1;
             setCurrentSectionIndex(nextSectionIdx);
             setTimeLeft(exam.sections[nextSectionIdx].durationMinutes * 60);
             
             // Find index of first question in next section within flatQuestions
             const nextSectionFirstQId = exam.sections[nextSectionIdx].questionIds[0];
             const nextFlatIdx = flatQuestions.findIndex(q => q.id === nextSectionFirstQId);
             
             if (nextFlatIdx !== -1) setCurrentQuestionIndex(nextFlatIdx);
             setShowSectionTransition(true);
          }
      } else {
          handleSubmit();
      }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.round((answers.filter(a => a !== -1).length / exam.questions.length) * 100);
  const currentQuestion = flatQuestions[currentQuestionIndex];
  
  // Section Navigation Bounds
  let isLastQuestionInSection = false;
  let isLastQuestionInExam = currentQuestionIndex === flatQuestions.length - 1;

  if (hasSections && exam.sections) {
      const currentSection = exam.sections[currentSectionIndex];
      const lastQId = currentSection.questionIds[currentSection.questionIds.length - 1];
      isLastQuestionInSection = currentQuestion.id === lastQId;
  }

  // --- Rendering ---

  if (showSectionTransition && exam.sections) {
      const nextSec = exam.sections[currentSectionIndex];
      return (
          <div className="flex items-center justify-center h-screen bg-indigo-900 text-white">
              <div className="text-center max-w-md p-8">
                  <h2 className="text-3xl font-bold mb-4">Section {currentSectionIndex + 1}: {nextSec.title}</h2>
                  <p className="text-indigo-200 mb-8">
                      Duration: {nextSec.durationMinutes} minutes<br/>
                      Questions: {nextSec.questionIds.length}
                  </p>
                  <button 
                    onClick={() => setShowSectionTransition(false)}
                    className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 mx-auto"
                  >
                      Start Section <ArrowRight size={20}/>
                  </button>
              </div>
          </div>
      );
  }
  
  // Wait for init
  if (flatQuestions.length === 0) return null;

  // Question Grid for Sidebar
  const QuestionGrid = () => (
    <div className="space-y-6">
        {hasSections && exam.sections ? (
            exam.sections.map((sec, sIdx) => (
                <div key={sec.id} className={sIdx === currentSectionIndex ? '' : 'opacity-50 pointer-events-none grayscale'}>
                    <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{sec.title}</h4>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2">
                        {sec.questionIds.map((qId, i) => {
                            const flatIdx = flatQuestions.findIndex(q => q.id === qId);
                            if (flatIdx === -1) return null;
                            
                            const originalIdx = getOriginalIndex(flatIdx);
                            const isAnswered = answers[originalIdx] !== -1;
                            const isFlagged = flagged.has(flatIdx);
                            const isCurrent = currentQuestionIndex === flatIdx;

                            let baseClass = "h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all border-2 relative active:scale-95 ";
                            if (isCurrent) baseClass += "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200";
                            else if (isFlagged) baseClass += "border-amber-400 bg-amber-50 text-amber-700";
                            else if (isAnswered) baseClass += "border-green-500 bg-green-50 text-green-700";
                            else baseClass += "border-gray-200 bg-white text-gray-500 hover:border-gray-300";

                            return (
                                <button
                                    key={qId}
                                    onClick={() => {
                                        if (sIdx === currentSectionIndex) {
                                            setCurrentQuestionIndex(flatIdx);
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className={baseClass}
                                >
                                    {i + 1}
                                    {isFlagged && <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full translate-x-1/3 -translate-y-1/3 border border-white"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))
        ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2">
                {flatQuestions.map((_, idx) => {
                    const originalIdx = getOriginalIndex(idx);
                    const isAnswered = answers[originalIdx] !== -1;
                    const isFlagged = flagged.has(idx);
                    const isCurrent = currentQuestionIndex === idx;

                    let baseClass = "h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all border-2 relative active:scale-95 ";
                    if (isCurrent) baseClass += "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200";
                    else if (isFlagged) baseClass += "border-amber-400 bg-amber-50 text-amber-700";
                    else if (isAnswered) baseClass += "border-green-500 bg-green-50 text-green-700";
                    else baseClass += "border-gray-200 bg-white text-gray-500 hover:border-gray-300";

                    return (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrentQuestionIndex(idx);
                                setIsSidebarOpen(false);
                            }}
                            className={baseClass}
                        >
                            {idx + 1}
                            {isFlagged && <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full translate-x-1/3 -translate-y-1/3 border border-white"></div>}
                        </button>
                    );
                })}
            </div>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-8 z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
          <div className="lg:hidden flex-shrink-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 sm:p-2 text-gray-600 active:bg-gray-100 rounded-lg transition-colors">
              {isSidebarOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
          </div>
          <h1 className="font-bold text-sm sm:text-base lg:text-lg truncate">{exam.title}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-8 flex-shrink-0">
          {hasSections && (
              <div className="hidden lg:block px-2 sm:px-3 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                  Section {currentSectionIndex + 1} / {exam.sections?.length}
              </div>
          )}

          {/* Progress Bar (Desktop) */}
          <div className="hidden lg:flex flex-col w-36 xl:w-48">
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
              <span>Total Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            <Clock size={14} className="sm:w-[18px] sm:h-[18px]" />
            <span className="tabular-nums">{formatTime(timeLeft)}</span>
          </div>

          <button 
            onClick={onExit} 
            className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 hidden lg:block"
          >
            Quit
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar (Desktop & Mobile Drawer) */}
        <aside className={`
          fixed inset-y-0 left-0 z-10 w-72 sm:w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col pt-14 sm:pt-16 lg:pt-0 lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
            <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <LayoutGrid size={14} className="sm:w-4 sm:h-4" /> Question Map
            </h3>
            <QuestionGrid />
            
            <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full bg-indigo-50 border border-indigo-600 flex-shrink-0"></div> Current
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full bg-green-50 border border-green-500 flex-shrink-0"></div> Answered
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full bg-amber-50 border border-amber-400 flex-shrink-0"></div> Flagged
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative">
          <div className="max-w-3xl mx-auto pb-20">
            
            {/* Question Header */}
            <div className="flex justify-between items-start mb-4 sm:mb-6 gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2.5 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] sm:text-xs font-bold mb-2 sm:mb-3">
                  Question {hasSections ? 
                    (exam.sections![currentSectionIndex].questionIds.indexOf(currentQuestion.id) + 1) : 
                    (currentQuestionIndex + 1)
                  }
                </span>

                {currentQuestion.imageUrl && (
                  <div className="mb-4 sm:mb-6">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Question Attachment" 
                      className="rounded-lg max-h-60 sm:max-h-80 w-full object-contain border border-gray-200 bg-gray-50 shadow-sm" 
                    />
                  </div>
                )}

                <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 leading-relaxed">
                  {currentQuestion.text}
                </h2>
              </div>
              <button 
                onClick={toggleFlag}
                className={`p-2 sm:p-3 rounded-full transition-colors flex-shrink-0 ${flagged.has(currentQuestionIndex) ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 active:bg-gray-300'}`}
                title="Flag for review"
              >
                <Flag size={18} className="sm:w-5 sm:h-5" fill={flagged.has(currentQuestionIndex) ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4">
              {currentQuestion.options.map((option, idx) => {
                const originalIdx = getOriginalIndex(currentQuestionIndex);
                const isSelected = answers[originalIdx] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`w-full text-left p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border-2 transition-all duration-200 flex items-center justify-between group active:scale-[0.98]
                      ${isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-bold transition-colors flex-shrink-0
                        ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-500 group-hover:border-gray-400'}
                      `}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-sm sm:text-base ${isSelected ? 'font-medium text-indigo-900' : 'text-gray-700'}`}>
                        {option}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="text-indigo-600 animate-in zoom-in duration-200 flex-shrink-0" size={20} />}
                  </button>
                );
              })}
            </div>

          </div>
        </main>

        {/* Footer Navigation */}
        <footer className="bg-white border-t border-gray-200 p-3 sm:p-4 fixed bottom-0 w-full lg:w-[calc(100%-20rem)] right-0 z-20 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={
                // Disable if first question of exam OR first question of section (if strict nav)
                // For now, allow navigating back within section
                hasSections ? 
                    currentQuestion.id === exam.sections![currentSectionIndex].questionIds[0] 
                    : currentQuestionIndex === 0
            }
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:bg-gray-200"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <span className="text-xs sm:text-sm text-gray-400 hidden md:inline">
              <span className="font-bold text-gray-900">{answers.filter(a => a !== -1).length}</span> answered
            </span>
            
            {isLastQuestionInExam ? (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Exam'}</span> <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
              </button>
            ) : isLastQuestionInSection ? (
              <button 
                onClick={() => handleNextSection()}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-gray-900 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-gray-800 transition-all active:scale-95"
              >
                <span>Finish Section</span> <ArrowRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestionIndex(prev => Math.min(flatQuestions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-gray-900 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-gray-800 transition-all active:scale-95"
              >
                <span>Next</span> <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </footer>

      </div>
    </div>
  );
};

export default ExamTaker;