import React, { useMemo, useState } from 'react';
import FlashcardCreator from '../components/FlashcardCreator';
import FlashcardStudy from '../components/FlashcardStudy';
import { FlashcardDeck } from '../types';
import { generateFlashcardDecks } from '../mockData';
import { useUser } from '../providers/UserProvider';

const FlashcardsPage: React.FC = () => {
  const { user } = useUser();
  const [customDecks, setCustomDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [mode, setMode] = useState<'list' | 'create' | 'study'>('list');

  const baseDecks = useMemo(() => {
    if (user.targetSpecialty) {
      return generateFlashcardDecks(user.targetSpecialty);
    }
    return generateFlashcardDecks('Internal Medicine');
  }, [user.targetSpecialty]);

  const decks = [...baseDecks, ...customDecks];

  if (mode === 'create') {
    return (
      <div className="p-8 h-full overflow-y-auto">
        <FlashcardCreator
          onSave={(deck) => {
            setCustomDecks((prev) => [...prev, deck]);
            setMode('list');
          }}
          onCancel={() => setMode('list')}
        />
      </div>
    );
  }

  if (mode === 'study' && activeDeck) {
    return (
      <div className="p-8 h-full overflow-y-auto">
        <FlashcardStudy deck={activeDeck} onExit={() => setMode('list')} />
      </div>
    );
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-gray-500">Deck belajar untuk {user.targetSpecialty}</p>
        </div>
        <button
          onClick={() => setMode('create')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          Buat Deck Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <div key={deck.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{deck.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{deck.cards.length} cards • {deck.topic}</p>
            <button
              onClick={() => {
                setActiveDeck(deck);
                setMode('study');
              }}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Mulai Belajar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardsPage;
