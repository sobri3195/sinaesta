


import React, { useState, useEffect } from 'react';
import { Question, ClinicalReasoningStep } from '../types';
import { ArrowRight, CheckCircle, AlertCircle, BrainCircuit, Activity, ShieldAlert, GripVertical } from 'lucide-react';

interface ClinicalReasoningSimulatorProps {
  question: Question; // Should be of type CLINICAL_REASONING with steps
  onComplete: (score: number, maxScore: number) => void;
  onExit: () => void;
}

// Mock Data for a Multi-step Question if none provided
const MOCK_STEPS: ClinicalReasoningStep[] = [
    {
        id: 's1', type: 'PROBLEM_REPRESENTATION',
        prompt: "Berdasarkan data klinis di atas, manakah Problem Representation (Kalimat Masalah) yang paling akurat?",
        options: [
            "Laki-laki 50 tahun dengan nyeri dada atipikal dan EKG normal.",
            "Laki-laki 50 tahun, perokok, dengan nyeri dada tipikal angina, riwayat DM, dan EKG iskemia.",
            "Laki-laki 50 tahun dengan keluhan sesak napas dan riwayat asma."
        ],
        correctOptions: [1],
        scoringWeight: 2,
        explanation: "Problem representation harus mencakup demografi, faktor risiko kunci (DM, perokok), gejala utama (Typical Angina), dan data penunjang pivot (EKG Iskemia)."
    },
    {
        id: 's2', type: 'DDX',
        prompt: "Apa 2 Diagnosis Banding prioritas yang harus disingkirkan segera?",
        options: ["Stable Angina", "STEMI", "NSTEMI / UAP", "GERD", "Costochondritis", "Aortic Dissection"],
        correctOptions: [1, 5],
        scoringWeight: 3,
        explanation: "Nyeri dada akut yang mengancam nyawa (Life threatening) yang harus dipikirkan: ACS (STEMI/NSTEMI), Diseksi Aorta, Emboli Paru, Tension Pneumothorax."
    },
    {
        id: 's3', type: 'INVESTIGATION',
        prompt: "Pemeriksaan penunjang awal apa yang paling tepat untuk stratifikasi risiko?",
        options: ["CT Scan Thorax", "Echocardiography", "Serial Enzim Jantung (Troponin)", "Spirometri"],
        correctOptions: [2],
        criticalErrorOptions: [3], // Spirometry is irrelevant and delays care
        scoringWeight: 2,
        explanation: "Pada kecurigaan ACS, serial enzim jantung (Troponin) wajib untuk membedakan UAP (Troponin negatif) dengan NSTEMI (Troponin positif)."
    },
    {
        id: 's4', type: 'QSORT',
        prompt: "Urutkan langkah tatalaksana awal pada pasien NSTEMI High Risk:",
        options: [
            "Oksigenasi (jika saturasi < 90%)",
            "Aspirin Loading Dose",
            "Nitrat Sublingual (jika TD stabil)",
            "Morfin IV (jika nyeri menetap)",
            "Rujuk segera ke Cath Lab"
        ],
        correctOptions: [0, 1, 2, 3, 4], // Represents indices in correct sequence order
        scoringWeight: 4,
        explanation: "MONA (Morphine, Oxygen, Nitrate, Aspirin) adalah mnemonik klasik, namun prioritas modern adalah: Oksigen (hanya jika hipoksia), Aspirin (segera semua pasien), Nitrat, lalu Morfin (opsional). Rujukan adalah langkah definitif."
    },
    {
        id: 's5', type: 'THERAPY',
        prompt: "Troponin positif. Pasien didiagnosis NSTEMI High Risk. Apa terapi antikoagulan awal?",
        options: ["Warfarin oral", "Fondaparinux / Enoxaparin s.c", "Rivaroxaban oral", "Tidak perlu antikoagulan", "Trombolitik (Streptokinase)"],
        correctOptions: [1],
        criticalErrorOptions: [4], // Thrombolysis is contraindicated in NSTEMI (Harmful!)
        scoringWeight: 3,
        explanation: "Fondaparinux 2.5mg sc (pilihan utama pada NSTEMI strategi invasif awal) atau Enoxaparin 1mg/kgBB sc. Trombolitik KONTRAINDIKASI pada NSTEMI."
    }
];

const ClinicalReasoningSimulator: React.FC<ClinicalReasoningSimulatorProps> = ({ question, onComplete, onExit }) => {
  const steps = question.reasoningSteps && question.reasoningSteps.length > 0 ? question.reasoningSteps : MOCK_STEPS;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // For standard questions, selectedOptions holds indices of selected items.
  // For QSORT, selectedOptions holds the *ordered list of indices*.
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [stepResults, setStepResults] = useState<{isCorrect: boolean, score: number, criticalError?: boolean}[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentStep = steps[currentStepIndex];

  // Initialize Q-Sort order if needed
  useEffect(() => {
      if (currentStep.type === 'QSORT' && selectedOptions.length === 0 && !showExplanation) {
          // Initialize with default index order [0, 1, 2, ...]
          setSelectedOptions(currentStep.options.map((_, i) => i));
      }
  }, [currentStepIndex, currentStep.type, showExplanation]);

  const handleToggleOption = (idx: number) => {
      if (showExplanation) return; // Locked
      if (currentStep.type === 'QSORT') return; // Handled by drag/drop

      if (selectedOptions.includes(idx)) {
          setSelectedOptions(selectedOptions.filter(i => i !== idx));
      } else {
          if (currentStep.correctOptions.length === 1) {
              setSelectedOptions([idx]);
          } else {
              setSelectedOptions([...selectedOptions, idx]);
          }
      }
  };

  // Drag and Drop Handlers for QSORT
  const handleDragStart = (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData('text/plain', index.toString());
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (showExplanation) return;
      
      const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
      if (isNaN(draggedIndex) || draggedIndex === targetIndex) return;

      const newOrder = [...selectedOptions];
      // Note: Dragged index refers to position in current array, not original ID, 
      // but here we are rendering mapped by index of selectedOptions array.
      // Actually, standard DND: remove from old index, insert at new index.
      const [movedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, movedItem);
      setSelectedOptions(newOrder);
  };

  const submitStep = () => {
      let isCorrect = false;
      let hasCriticalError = false;

      if (currentStep.type === 'QSORT') {
          // Check if order matches exactly
          isCorrect = JSON.stringify(selectedOptions) === JSON.stringify(currentStep.correctOptions);
      } else {
          // Check for Critical Errors (Red Flag Safety Layer)
          hasCriticalError = selectedOptions.some(opt => currentStep.criticalErrorOptions?.includes(opt));
          
          isCorrect = 
            !hasCriticalError &&
            currentStep.correctOptions.every(opt => selectedOptions.includes(opt)) &&
            selectedOptions.length === currentStep.correctOptions.length;
      }

      // Score is 0 if critical error, else standard logic
      const score = hasCriticalError ? 0 : (isCorrect ? currentStep.scoringWeight : 0);
      
      setStepResults([...stepResults, { isCorrect, score, criticalError: hasCriticalError }]);
      setShowExplanation(true);
  };

  const nextStep = () => {
      if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
          setSelectedOptions([]);
          setShowExplanation(false);
      } else {
          // Finish
          const totalScore = stepResults.reduce((acc, curr) => acc + curr.score, 0) + (stepResults[currentStepIndex]?.score || 0); // Include last step
          const maxScore = steps.reduce((acc, curr) => acc + curr.scoringWeight, 0);
          onComplete(totalScore, maxScore);
      }
  };

  // Determine current result for rendering immediately after submit
  const currentResult = stepResults[currentStepIndex];

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BrainCircuit className="text-indigo-600" /> Clinical Reasoning
                </h1>
                <p className="text-gray-500 text-sm">Case Scenario: {question.text.substring(0, 60)}...</p>
            </div>
            <button onClick={onExit} className="text-gray-400 hover:text-gray-600 font-medium">Exit</button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full mb-8 flex gap-1">
            {steps.map((_, idx) => {
                let color = 'bg-gray-200';
                if (idx < currentStepIndex || (idx === currentStepIndex && showExplanation)) {
                    // Check history or current result
                    const res = idx === currentStepIndex ? currentResult : stepResults[idx];
                    if (res?.criticalError) color = 'bg-red-600';
                    else if (res?.isCorrect) color = 'bg-green-500';
                    else color = 'bg-orange-400';
                } else if (idx === currentStepIndex) {
                    color = 'bg-indigo-500';
                }
                return <div key={idx} className={`flex-1 h-full rounded-full ${color}`} />;
            })}
        </div>

        {/* Main Step Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-1 flex flex-col">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                <span className="font-bold text-indigo-700 uppercase tracking-wide text-xs">Step {currentStepIndex + 1}: {currentStep.type.replace('_', ' ')}</span>
                <span className="text-indigo-600 font-bold text-sm">{currentStep.scoringWeight} Pts</span>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">{currentStep.prompt}</h3>

                <div className="space-y-3">
                    {currentStep.type === 'QSORT' ? (
                        // Render Draggable List
                        <div className="space-y-2">
                            {selectedOptions.map((originalIndex, displayIndex) => {
                                const optText = currentStep.options[originalIndex];
                                
                                let borderClass = 'border-gray-200 hover:border-indigo-300';
                                if (showExplanation) {
                                    const isCorrectPos = currentStep.correctOptions[displayIndex] === originalIndex;
                                    borderClass = isCorrectPos ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50';
                                }

                                return (
                                    <div 
                                        key={originalIndex}
                                        draggable={!showExplanation}
                                        onDragStart={(e) => handleDragStart(e, displayIndex)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, displayIndex)}
                                        className={`flex items-center gap-3 p-4 bg-white rounded-xl border-2 transition-all ${borderClass} ${!showExplanation ? 'cursor-move' : ''}`}
                                    >
                                        <div className="text-gray-400"><GripVertical size={20} /></div>
                                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                                            {displayIndex + 1}
                                        </div>
                                        <span className="font-medium text-gray-800">{optText}</span>
                                    </div>
                                )
                            })}
                            {!showExplanation && <p className="text-xs text-gray-400 text-center pt-2">Drag and drop items to reorder</p>}
                        </div>
                    ) : (
                        // Render Standard Options
                        currentStep.options.map((opt, idx) => {
                            const isSelected = selectedOptions.includes(idx);
                            const isAnswer = currentStep.correctOptions.includes(idx);
                            const isCritical = currentStep.criticalErrorOptions?.includes(idx);
                            
                            let borderClass = 'border-gray-200 hover:border-indigo-300';
                            let bgClass = 'bg-white';
                            let icon = <div className={`w-5 h-5 rounded border ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`} />;

                            if (showExplanation) {
                                if (isAnswer) {
                                    borderClass = 'border-green-500 bg-green-50';
                                    icon = <CheckCircle className="text-green-600" size={20} />;
                                } else if (isSelected && isCritical) {
                                    borderClass = 'border-red-600 bg-red-100 ring-2 ring-red-600';
                                    icon = <ShieldAlert className="text-red-700" size={20} />;
                                } else if (isSelected && !isAnswer) {
                                    borderClass = 'border-orange-400 bg-orange-50';
                                    icon = <AlertCircle className="text-orange-500" size={20} />;
                                } else {
                                    borderClass = 'border-gray-100 opacity-50';
                                }
                            } else if (isSelected) {
                                borderClass = 'border-indigo-600 ring-1 ring-indigo-600';
                                bgClass = 'bg-indigo-50';
                            }

                            return (
                                <button
                                    key={idx}
                                    disabled={showExplanation}
                                    onClick={() => handleToggleOption(idx)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${borderClass} ${bgClass}`}
                                >
                                    {icon}
                                    <span className="font-medium text-gray-800">{opt}</span>
                                    {showExplanation && isCritical && isSelected && (
                                        <span className="text-xs font-bold text-red-700 uppercase bg-red-200 px-2 py-1 rounded ml-auto">Harmful!</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {showExplanation && (
                    <div className={`mt-8 rounded-xl p-6 border animate-in fade-in slide-in-from-bottom-2 ${currentResult?.criticalError ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
                        <h4 className={`font-bold mb-2 flex items-center gap-2 ${currentResult?.criticalError ? 'text-red-800' : 'text-blue-900'}`}>
                            {currentResult?.criticalError ? <ShieldAlert size={20}/> : <Activity size={18} />} 
                            {currentResult?.criticalError ? 'Patient Safety Warning' : 'Reasoning Logic'}
                        </h4>
                        <p className={`${currentResult?.criticalError ? 'text-red-800' : 'text-blue-800'} leading-relaxed`}>
                            {currentStep.explanation}
                        </p>
                    </div>
                )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                {!showExplanation ? (
                    <button 
                        onClick={submitStep}
                        disabled={selectedOptions.length === 0}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                        Submit Step
                    </button>
                ) : (
                    <button 
                        onClick={nextStep}
                        className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition-colors flex items-center gap-2"
                    >
                        {currentStepIndex === steps.length - 1 ? 'Finish Case' : 'Next Step'} <ArrowRight size={18} />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default ClinicalReasoningSimulator;