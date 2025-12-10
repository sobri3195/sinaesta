
import React, { useState } from 'react';
import { FlashcardDeck } from '../types';
import { ChevronLeft, ChevronRight, RotateCw, X, Check, RefreshCw } from 'lucide-react';

interface FlashcardStudyProps {
  deck: FlashcardDeck;
  onExit: () => void;
}

const FlashcardStudy: React.FC<FlashcardStudyProps> = ({ deck, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  const currentCard = deck.cards[currentIndex];
  const progress = Math.round(((currentIndex + 1) / deck.cards.length) * 100);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % deck.cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex(prev => (prev - 1 + deck.cards.length) % deck.cards.length);
    }, 150);
  };

  const toggleMastery = () => {
    const newSet = new Set(mastered);
    if (newSet.has(currentIndex)) {
      newSet.delete(currentIndex);
    } else {
      newSet.add(currentIndex);
    }
    setMastered(newSet);
    // Auto advance if marking as known
    if (!mastered.has(currentIndex)) {
       nextCard();
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button onClick={onExit} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                <ChevronLeft size={24} />
             </button>
             <div>
                 <h2 className="font-bold text-gray-900">{deck.title}</h2>
                 <p className="text-xs text-gray-500">{currentIndex + 1} / {deck.cards.length} Cards</p>
             </div>
         </div>
         <div className="w-32">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-300" style={{width: `${progress}%`}}></div>
            </div>
         </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center perspective-1000 min-h-[400px]">
         <div 
           className={`relative w-full max-w-2xl aspect-[3/2] cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
           onClick={() => setIsFlipped(!isFlipped)}
         >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center justify-center p-8 text-center hover:shadow-2xl transition-shadow">
                <span className="absolute top-6 left-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Front</span>
                <span className="absolute top-6 right-6 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{currentCard.category}</span>
                <h3 className="text-3xl font-bold text-gray-800 leading-snug">{currentCard.front}</h3>
                <p className="mt-8 text-sm text-gray-400 font-medium flex items-center gap-2">
                    <RotateCw size={14} /> Click to flip
                </p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 text-center rotate-y-180 text-white">
                <span className="absolute top-6 left-6 text-xs font-bold text-white/50 uppercase tracking-wide">Back</span>
                <div className="text-2xl font-medium leading-relaxed max-h-full overflow-y-auto custom-scrollbar">
                    {currentCard.back}
                </div>
            </div>
         </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex justify-center items-center gap-6">
         <button 
           onClick={prevCard} 
           className="p-3 bg-white text-gray-600 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
         >
            <ChevronLeft size={24} />
         </button>

         <button 
            onClick={toggleMastery}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-md
               ${mastered.has(currentIndex) 
                 ? 'bg-green-100 text-green-700 border border-green-200' 
                 : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600'
               }`}
         >
             {mastered.has(currentIndex) ? (
                 <><Check size={20} /> Mastered</>
             ) : (
                 <><Check size={20} className="opacity-0 w-0" /> Mark as Known</>
             )}
         </button>

         <button 
            onClick={() => setIsFlipped(!isFlipped)}
            className="p-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors hover:scale-105 transform active:scale-95"
         >
             <RefreshCw size={24} />
         </button>
         
         <button 
           onClick={nextCard} 
           className="p-3 bg-white text-gray-600 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
         >
            <ChevronRight size={24} />
         </button>
      </div>
      
      <div className="text-center mt-6 text-sm text-gray-400 font-medium">
         Mastered: {mastered.size} / {deck.cards.length}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardStudy;
