
import React, { useState, useEffect } from 'react';
import { SpotDxItem } from '../types';
import { Timer, CheckCircle, XCircle, ArrowRight, Zap, Activity, Maximize2 } from 'lucide-react';

const MOCK_DRILL_ITEMS: SpotDxItem[] = [
    {
        id: 'sd1',
        imageUrl: 'https://prod-images-static.radiopaedia.org/images/54823869/414f08967926715494860156641551_jumbo.jpeg',
        prompt: 'Laki-laki 25 tahun, sesak napas mendadak. PF: Hipersonor paru kanan.',
        diagnosisOptions: ['Pneumonia Lobaris', 'Pneumothorax', 'Efusi Pleura', 'Atelectasis'],
        correctDiagnosisIndex: 1,
        nextStepOptions: ['Antibiotik IV', 'Needle Decompression', 'WSD / Chest Tube', 'CT Scan Thorax'],
        correctNextStepIndex: 1, // Assumption: Tension signs implicit or rapid step needed
        explanation: 'Gambaran lusen tanpa corakan vaskuler + hipersonor = Pneumothorax. Jika ada tanda tension (hipotensi/deviasi trakea), lakukan Needle Decompression segera.'
    },
    {
        id: 'sd2',
        imageUrl: 'https://litfl.com/wp-content/uploads/2018/10/ECG-Hyperkalaemia-1.jpg',
        prompt: 'Pasien Gagal Ginjal Kronik, lemas memberat. EKG:',
        diagnosisOptions: ['STEMI Anteroseptal', 'Hyperkalemia', 'Hypocalcemia', 'Pericarditis'],
        correctDiagnosisIndex: 1,
        nextStepOptions: ['Aspirin + Clopidogrel', 'Calcium Gluconate IV', 'Dialysis Cito', 'Insulin Drip'],
        correctNextStepIndex: 1,
        explanation: 'Tall T waves (peaked) + riwayat CKD = Hiperkalemia. Langkah pertama stabilisasi membran jantung dengan Calcium Gluconate.'
    }
];

const SpotDxDrill: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'DIAGNOSIS' | 'NEXT_STEP' | 'FEEDBACK'>('DIAGNOSIS');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [selectedDx, setSelectedDx] = useState<number | null>(null);
  const [selectedNext, setSelectedNext] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  const currentItem = MOCK_DRILL_ITEMS[currentIndex];

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft > 0) {
        timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
        handleTimeout();
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const handleTimeout = () => {
      setPhase('FEEDBACK');
      setIsActive(false);
  };

  const handleDxSelect = (idx: number) => {
      setSelectedDx(idx);
      setPhase('NEXT_STEP');
  };

  const handleNextStepSelect = (idx: number) => {
      setSelectedNext(idx);
      setPhase('FEEDBACK');
      setIsActive(false);
      
      // Scoring: 1 pt for Dx, 1 pt for Next Step
      let pts = 0;
      if (selectedDx === currentItem.correctDiagnosisIndex) pts++;
      if (idx === currentItem.correctNextStepIndex) pts++;
      setScore(s => s + pts);
  };

  const nextCase = () => {
      if (currentIndex < MOCK_DRILL_ITEMS.length - 1) {
          setCurrentIndex(p => p + 1);
          setPhase('DIAGNOSIS');
          setSelectedDx(null);
          setSelectedNext(null);
          setTimeLeft(60);
          setIsActive(true);
      } else {
          alert(`Drill Completed! Score: ${score}/${MOCK_DRILL_ITEMS.length * 2}`);
          onExit();
      }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="text-amber-500" fill="currentColor" /> Spot Dx Sprint
                </h1>
                <p className="text-gray-500 text-sm">Rapid Fire Clinical Reasoning • 60s per case</p>
            </div>
            <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg border flex items-center gap-2
                ${timeLeft < 10 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-gray-100 text-gray-800 border-gray-200'}
            `}>
                <Timer size={24} /> {timeLeft}s
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row">
            {/* Left: Image & Prompt */}
            <div className="md:w-1/2 bg-black flex flex-col relative">
                <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                    <img src={currentItem.imageUrl} className="max-w-full max-h-full object-contain" alt="Clinical Case" />
                    <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-sm">
                        <Maximize2 size={20} />
                    </button>
                </div>
                <div className="p-4 bg-gray-900 text-white">
                    <h3 className="font-bold text-lg mb-2">Clinical Scenario:</h3>
                    <p className="text-gray-300">{currentItem.prompt}</p>
                </div>
            </div>

            {/* Right: Interaction */}
            <div className="md:w-1/2 flex flex-col">
                {/* Progress Indicators */}
                <div className="flex border-b border-gray-200">
                    <div className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider ${phase === 'DIAGNOSIS' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                        1. Spot Diagnosis
                    </div>
                    <div className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider ${phase === 'NEXT_STEP' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                        2. Next Best Step
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {phase === 'DIAGNOSIS' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">What is the most likely diagnosis?</h3>
                            {currentItem.diagnosisOptions.map((opt, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleDxSelect(idx)}
                                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 font-medium transition-all"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {phase === 'NEXT_STEP' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">What is the next best step?</h3>
                            {currentItem.nextStepOptions.map((opt, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleNextStepSelect(idx)}
                                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 font-medium transition-all"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {phase === 'FEEDBACK' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Your Answers</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Dx: {currentItem.diagnosisOptions[selectedDx || 0]}</span>
                                        {selectedDx === currentItem.correctDiagnosisIndex ? <CheckCircle className="text-green-500" size={18}/> : <XCircle className="text-red-500" size={18}/>}
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Step: {currentItem.nextStepOptions[selectedNext || 0]}</span>
                                        {selectedNext === currentItem.correctNextStepIndex ? <CheckCircle className="text-green-500" size={18}/> : <XCircle className="text-red-500" size={18}/>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><Activity size={16}/> Explanation</h4>
                                <p className="text-indigo-800 text-sm leading-relaxed">{currentItem.explanation}</p>
                            </div>

                            <button onClick={nextCase} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black flex items-center justify-center gap-2">
                                Next Case <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SpotDxDrill;
