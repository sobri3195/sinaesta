

import React, { useState } from 'react';
import { MicrolearningPack } from '../types';
import { Play, Clock, Zap, BookOpen, ChevronRight, X, Image as ImageIcon, Layers, BrainCircuit } from 'lucide-react';

const MOCK_PACKS: MicrolearningPack[] = [
    {
        id: 'mp1',
        title: 'Morning Commute: Acute Coronary Syndrome',
        description: 'Master the ACS algorithm, key EKG patterns, and initial drug doses in 7 minutes.',
        durationMinutes: 7,
        tags: ['Cardiology', 'Emergency'],
        items: [
            { type: 'INFOGRAPHIC', title: 'ACS Algorithm 2023', content: 'https://via.placeholder.com/600x800?text=ACS+Algorithm' },
            { type: 'FLASHCARD', title: 'Loading Dose CPG', content: { front: 'Loading Dose Clopidogrel?', back: '300-600 mg PO' } },
            { type: 'MINI_CASE', title: 'Inferior STEMI Case', content: 'Patient with II, III, aVF elevation. Hypotensive. Next step?' }
        ]
    },
    {
        id: 'mp2',
        title: 'Coffee Break: Electrolyte Imbalances',
        description: 'Quick review of Hyperkalemia and Hyponatremia correction formulas.',
        durationMinutes: 5,
        tags: ['Nephrology', 'Internal Medicine'],
        items: [
            { type: 'INFOGRAPHIC', title: 'Hyperkalemia Management', content: 'https://via.placeholder.com/600x800?text=K+Management' },
            { type: 'FLASHCARD', title: 'Na Correction Rate', content: { front: 'Max Na correction per 24h?', back: '8-10 mEq/L' } }
        ]
    }
];

const MicrolearningHub: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activePack, setActivePack] = useState<MicrolearningPack | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const startPack = (pack: MicrolearningPack) => {
      setActivePack(pack);
      setCurrentItemIndex(0);
  };

  const nextItem = () => {
      if (activePack && currentItemIndex < activePack.items.length - 1) {
          setCurrentItemIndex(currentItemIndex + 1);
      } else {
          // Finished
          setActivePack(null);
      }
  };

  if (activePack) {
      const currentItem = activePack.items[currentItemIndex];
      const progress = Math.round(((currentItemIndex + 1) / activePack.items.length) * 100);

      return (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col text-white">
              <div className="p-4 flex justify-between items-center border-b border-gray-800">
                  <div>
                      <h2 className="font-bold text-lg">{activePack.title}</h2>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Item {currentItemIndex + 1} of {activePack.items.length}</span>
                          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                          <span className="uppercase">{currentItem.type.replace('_', ' ')}</span>
                      </div>
                  </div>
                  <button onClick={() => setActivePack(null)} className="p-2 hover:bg-gray-800 rounded-full"><X size={24}/></button>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-1 bg-gray-800">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
                  <div className="max-w-2xl w-full">
                      {currentItem.type === 'INFOGRAPHIC' && (
                          <div className="bg-white rounded-lg p-2">
                              <h3 className="text-gray-900 font-bold mb-2 text-center">{currentItem.title}</h3>
                              <img src={currentItem.content} alt="" className="w-full rounded" />
                          </div>
                      )}
                      
                      {currentItem.type === 'FLASHCARD' && (
                          <div className="bg-white text-gray-900 rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center shadow-2xl">
                              <h3 className="text-xl font-bold mb-4 text-indigo-600">{currentItem.content.front}</h3>
                              <div className="w-full h-px bg-gray-200 my-4"></div>
                              <p className="text-lg text-gray-700">{currentItem.content.back}</p>
                          </div>
                      )}

                      {currentItem.type === 'MINI_CASE' && (
                          <div className="bg-white text-gray-900 rounded-xl p-8 shadow-2xl">
                              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600">
                                  <BrainCircuit /> {currentItem.title}
                              </h3>
                              <p className="text-lg leading-relaxed">{currentItem.content}</p>
                          </div>
                      )}
                  </div>
              </div>

              <div className="p-6 flex justify-center">
                  <button 
                    onClick={nextItem}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 text-lg shadow-lg transition-transform active:scale-95"
                  >
                      {currentItemIndex < activePack.items.length - 1 ? 'Next' : 'Finish Pack'} <ChevronRight size={24} />
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="text-amber-500" fill="currentColor" /> Microlearning Packs
                </h1>
                <p className="text-gray-500 text-sm">Bite-sized learning for busy schedules (5-7 mins).</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Back</button>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PACKS.map(pack => (
                    <div key={pack.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <Clock size={12} /> {pack.durationMinutes} min
                            </span>
                            <div className="flex gap-1">
                                {pack.items.some(i => i.type === 'INFOGRAPHIC') && <div title="Infographic"><ImageIcon size={16} className="text-gray-400" /></div>}
                                {pack.items.some(i => i.type === 'FLASHCARD') && <div title="Flashcards"><Layers size={16} className="text-gray-400" /></div>}
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{pack.title}</h3>
                        <p className="text-gray-500 text-sm mb-6 flex-1">{pack.description}</p>
                        
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {pack.tags.map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tag}</span>
                            ))}
                        </div>

                        <button 
                            onClick={() => startPack(pack)}
                            className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                        >
                            <Play size={18} fill="currentColor" /> Start Learning
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default MicrolearningHub;