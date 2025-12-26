import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppSettings } from '../types';

interface SettingsContextValue {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const defaultSettings: AppSettings = {
  ui: {
    compactMode: false,
    showFloatingHelp: true
  },
  examCreator: {
    defaultQuestionCount: 10,
    autoGenerateThumbnail: true
  },
  examTaker: {
    showTimer: true,
    confirmBeforeSubmit: true,
    showExplanationsInResults: true
  },
  flashcards: {
    shuffleCards: false
  },
  osce: {
    showChecklistTips: true
  },
  importSoal: {
    strictValidation: true
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('sinaesta_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        // ignore invalid settings
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sinaesta_settings', JSON.stringify(settings));
  }, [settings]);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
