import { useCallback, useEffect, useState } from 'react';

type SpeechSynthesisHook = {
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string, lang?: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  setVoiceByLanguage: (lang: string) => void;
};

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVoice, setActiveVoice] = useState<SpeechSynthesisVoice | null>(null);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const loadVoices = useCallback(() => {
    if (!isSupported) return;
    const available = window.speechSynthesis.getVoices();
    setVoices(available);
    if (!activeVoice && available.length > 0) {
      setActiveVoice(available[0]);
    }
  }, [activeVoice, isSupported]);

  useEffect(() => {
    if (!isSupported) return;
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, loadVoices]);

  const speak = useCallback(
    (text: string, lang?: string) => {
      if (!isSupported || !text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || activeVoice?.lang || 'en-US';
      if (activeVoice) {
        utterance.voice = activeVoice;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [activeVoice, isSupported],
  );

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const setVoiceByLanguage = useCallback(
    (lang: string) => {
      const voice = voices.find((v) => v.lang.startsWith(lang));
      if (voice) setActiveVoice(voice);
    },
    [voices],
  );

  return {
    isSupported,
    voices,
    speak,
    cancel,
    isSpeaking,
    setVoiceByLanguage,
  };
};
