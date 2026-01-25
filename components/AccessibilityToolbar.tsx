import React, { useMemo, useState } from 'react';
import { Pause, Play, Square, Volume2 } from 'lucide-react';
import { AppSettings } from '../types';

interface AccessibilityToolbarProps {
  settings: AppSettings['accessibility'];
}

const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({ settings }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const canUseSpeech = useMemo(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    []
  );

  const getReadableText = () => {
    const content = document.getElementById('main-content');
    const text = content?.innerText?.trim();
    return text && text.length > 0 ? text : document.title || 'Sinaesta';
  };

  const startSpeech = () => {
    if (!canUseSpeech || !settings.ttsEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getReadableText());
    utterance.rate = settings.ttsRate;
    utterance.lang = settings.ttsLanguage;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (!canUseSpeech) return;
    window.speechSynthesis.pause();
    setIsSpeaking(false);
  };

  const resumeSpeech = () => {
    if (!canUseSpeech) return;
    window.speechSynthesis.resume();
    setIsSpeaking(true);
  };

  const stopSpeech = () => {
    if (!canUseSpeech) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!settings.ttsEnabled) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-40 bg-white border border-gray-200 shadow-lg rounded-xl p-3 flex flex-col gap-2"
      role="region"
      aria-label="Kontrol Text-to-Speech"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
        <Volume2 size={14} />
        TTS Aktif
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={startSpeech}
          className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1"
          aria-label="Bacakan layar"
        >
          <Play size={12} />
          Putar
        </button>
        <button
          type="button"
          onClick={pauseSpeech}
          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1"
          disabled={!isSpeaking}
          aria-label="Jeda pembacaan"
        >
          <Pause size={12} />
          Jeda
        </button>
        <button
          type="button"
          onClick={resumeSpeech}
          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1"
          aria-label="Lanjutkan pembacaan"
        >
          <Volume2 size={12} />
          Lanjut
        </button>
        <button
          type="button"
          onClick={stopSpeech}
          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1"
          aria-label="Hentikan pembacaan"
        >
          <Square size={12} />
          Stop
        </button>
      </div>
      {!canUseSpeech && <p className="text-xs text-red-600">TTS tidak tersedia di browser ini.</p>}
    </div>
  );
};

export default AccessibilityToolbar;
