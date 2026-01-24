import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognitionHook = {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setLanguage: (lang: string) => void;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const useSpeechRecognition = (defaultLanguage = 'en-US'): SpeechRecognitionHook => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(defaultLanguage);

  const isSupported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    if (!recognitionRef.current) {
      const RecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!RecognitionConstructor) return;
      const recognition = new RecognitionConstructor();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => `${prev} ${finalTranscript}`.trim());
        }
        setInterimTranscript(interim.trim());
      };
      recognition.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
    }

    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.lang = language;
      recognition.start();
      setIsListening(true);
    }
  }, [isSupported, language]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.lang = language;
  }, [language]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
  };
};
