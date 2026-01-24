
import React, { useState } from 'react';
import { FlashcardDeck, Flashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';
import { 
  ChevronLeft, Save, Plus, Trash2, Wand2, Loader2, Zap, Layers 
} from 'lucide-react';
import ContentEditor from './ContentEditor';
import MediaLibrary from './MediaLibrary';
import ContentVersionHistory from './ContentVersionHistory';

interface FlashcardCreatorProps {
  onSave: (deck: FlashcardDeck) => void;
  onCancel: () => void;
}

const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genCount, setGenCount] = useState(5);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ index: number; field: 'front' | 'back' } | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const newCards = await generateFlashcards(topic, genCount);
      setCards(prev => [...prev, ...newCards]);
    } catch (e) {
      alert("Failed to generate cards");
    } finally {
      setIsGenerating(false);
    }
  };

  const addCard = () => {
    setCards([...cards, {
      id: Math.random().toString(36).substr(2, 9),
      front: '',
      back: '',
      category: topic
    }]);
  };

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleOpenMediaLibrary = (index: number, field: 'front' | 'back') => {
    setMediaTarget({ index, field });
    setShowMediaLibrary(true);
  };

  const handleInsertMedia = (item: { url: string; altText?: string; name: string }) => {
    if (!mediaTarget) return;
    const markup = `<p><img src=\"${item.url}\" alt=\"${item.altText || item.name}\" /></p>`;
    updateCard(mediaTarget.index, mediaTarget.field, `${cards[mediaTarget.index][mediaTarget.field]}${markup}`);
    setShowMediaLibrary(false);
  };

  const deleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title || cards.length === 0) return;
    const deck: FlashcardDeck = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      topic,
      cards,
      createdAt: Date.now()
    };
    onSave(deck);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Buat Dek Flashcard</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={!title || cards.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all font-medium shadow-sm"
        >
          <Save size={18} />
          Simpan Dek
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Metadata Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <div className="col-span-2 md:col-span-1">
               <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dek</label>
               <input 
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="Contoh: Hafalan Dosis Antibiotik"
                 value={title}
                 onChange={e => setTitle(e.target.value)}
               />
             </div>
             <div className="col-span-2 md:col-span-1">
               <label className="block text-sm font-medium text-gray-700 mb-1">Topik Utama</label>
               <input 
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="e.g. Farmakologi, Kardiologi"
                 value={topic}
                 onChange={e => setTopic(e.target.value)}
               />
             </div>
          </section>

          {/* AI Generator */}
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100 dashed-border">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                  <Zap size={20} />
                  AI Flashcard Generator
                </h3>
             </div>
             <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">Topic for Cards</label>
                  <input 
                    className="w-full px-4 py-2 bg-white border border-amber-200 rounded-lg"
                    placeholder="e.g. Kriteria Diagnosis SLE"
                    value={topic} // reusing main topic or allow override
                    onChange={e => setTopic(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">Count</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 bg-white border border-amber-200 rounded-lg"
                    value={genCount}
                    onChange={e => setGenCount(parseInt(e.target.value))}
                    min={1} max={20}
                  />
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 shadow-md font-medium flex items-center gap-2 whitespace-nowrap"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                  Generate Cards
                </button>
             </div>
          </section>

          {/* Cards List */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Layers size={20} className="text-gray-400" />
                Daftar Kartu ({cards.length})
              </h3>
              <button 
                onClick={addCard}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Tambah Manual
              </button>
            </div>

            <div className="grid gap-4">
              {cards.map((card, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-start group">
                  <div className="flex-1 w-full space-y-2">
                    <ContentEditor
                      label="Front (Pertanyaan)"
                      value={card.front}
                      onChange={val => updateCard(idx, 'front', val)}
                      placeholder="e.g. Dosis Adrenalin untuk Anafilaksis?"
                      minHeight="min-h-[160px]"
                      onOpenMediaLibrary={() => handleOpenMediaLibrary(idx, 'front')}
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <ContentEditor
                      label="Back (Jawaban)"
                      value={card.back}
                      onChange={val => updateCard(idx, 'back', val)}
                      placeholder="e.g. 0.3 - 0.5 mg IM (1:1000)"
                      minHeight="min-h-[160px]"
                      onOpenMediaLibrary={() => handleOpenMediaLibrary(idx, 'back')}
                    />
                  </div>
                  <button 
                    onClick={() => deleteCard(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-center opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            {cards.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                   <p>Belum ada kartu. Gunakan AI Generator atau tambah manual.</p>
                </div>
            )}
          </div>
          <ContentVersionHistory compact />
        </section>

        </div>
      </div>

      {showMediaLibrary && (
        <MediaLibrary
          onClose={() => {
            setShowMediaLibrary(false);
            setMediaTarget(null);
          }}
          onSelect={handleInsertMedia}
        />
      )}
    </div>
  );
};

export default FlashcardCreator;
