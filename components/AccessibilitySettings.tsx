import React, { useEffect, useMemo, useState } from 'react';
import { Volume2, Pause, Play, Square, Eye, EyeOff, Accessibility, Contrast, Type, Languages } from 'lucide-react';
import { AppSettings } from '../types';

interface AccessibilitySettingsProps {
  settings: AppSettings['accessibility'];
  onChange: (updates: Partial<AppSettings['accessibility']>) => void;
}

const sampleText =
  'Sinaesta menyediakan pengalaman belajar yang inklusif. Gunakan kontrol ini untuk menyesuaikan kontras, ukuran teks, dan pembaca layar.';

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ settings, onChange }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
  }, []);

  const availableLanguages = useMemo(() => {
    const langs = voices.map((voice) => voice.lang).filter(Boolean);
    return Array.from(new Set(langs));
  }, [voices]);

  const speakSample = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.rate = settings.ttsRate;
    utterance.lang = settings.ttsLanguage;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsSpeaking(false);
  };

  const resumeSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.resume();
    setIsSpeaking(true);
  };

  const stopSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <Accessibility className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Aksesibilitas</h2>
          <p className="text-sm text-gray-500">Sesuaikan pengalaman agar nyaman bagi semua pengguna.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Contrast className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Mode Kontras Tinggi</p>
                <p className="text-xs text-gray-500">Meningkatkan perbandingan warna untuk keterbacaan.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ highContrast: !settings.highContrast })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                settings.highContrast ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              aria-pressed={settings.highContrast}
            >
              {settings.highContrast ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Ukuran Teks</p>
              <p className="text-xs text-gray-500">Skalakan hingga 200% tanpa merusak tata letak.</p>
              <input
                type="range"
                min={1}
                max={2}
                step={0.05}
                value={settings.textScale}
                onChange={(e) => onChange({ textScale: Number(e.target.value) })}
                className="w-full mt-2"
                aria-label="Skala ukuran teks"
              />
              <div className="text-xs text-gray-500 mt-1">{Math.round(settings.textScale * 100)}%</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Hint Pembaca Layar</p>
                <p className="text-xs text-gray-500">Tambahkan petunjuk tambahan untuk navigasi.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ screenReaderHints: !settings.screenReaderHints })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                settings.screenReaderHints ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              aria-pressed={settings.screenReaderHints}
            >
              {settings.screenReaderHints ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Kurangi Gerakan</p>
                <p className="text-xs text-gray-500">Nonaktifkan animasi untuk kenyamanan visual.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onChange({
                  reduceMotion: !settings.reduceMotion,
                  disableAnimations: !settings.reduceMotion
                })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                settings.reduceMotion ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              aria-pressed={settings.reduceMotion}
            >
              {settings.reduceMotion ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Text-to-Speech (TTS)</h3>
            <p className="text-xs text-gray-500">Aktifkan pembacaan instruksi, soal, dan umpan balik.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onChange({ ttsEnabled: !settings.ttsEnabled })}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              settings.ttsEnabled ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
            aria-pressed={settings.ttsEnabled}
          >
            {settings.ttsEnabled ? 'TTS Aktif' : 'Aktifkan TTS'}
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Kecepatan
            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.1}
              value={settings.ttsRate}
              onChange={(e) => onChange({ ttsRate: Number(e.target.value) })}
              className="w-28"
              aria-label="Kecepatan TTS"
            />
            <span className="text-xs">{settings.ttsRate.toFixed(1)}x</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <Languages className="w-4 h-4" />
            Bahasa
            <select
              value={settings.ttsLanguage}
              onChange={(e) => onChange({ ttsLanguage: e.target.value })}
              className="border border-gray-200 rounded-md px-2 py-1 text-sm"
              aria-label="Bahasa TTS"
            >
              {availableLanguages.length === 0 && <option value="id-ID">id-ID</option>}
              {availableLanguages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={speakSample}
            className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold flex items-center gap-2"
            disabled={!settings.ttsEnabled}
            aria-label="Putar contoh TTS"
          >
            <Play size={14} />
            Dengarkan Contoh
          </button>
          <button
            type="button"
            onClick={pauseSpeech}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-2"
            disabled={!settings.ttsEnabled || !isSpeaking}
            aria-label="Jeda TTS"
          >
            <Pause size={14} />
            Jeda
          </button>
          <button
            type="button"
            onClick={resumeSpeech}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-2"
            disabled={!settings.ttsEnabled}
            aria-label="Lanjutkan TTS"
          >
            <Volume2 size={14} />
            Lanjutkan
          </button>
          <button
            type="button"
            onClick={stopSpeech}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-2"
            disabled={!settings.ttsEnabled}
            aria-label="Hentikan TTS"
          >
            <Square size={14} />
            Stop
          </button>
          {isSpeaking && <span className="text-xs text-indigo-600 font-semibold">TTS aktif</span>}
        </div>
        <p className="text-xs text-gray-500">Gunakan tombol untuk membaca layar aktif atau latihan mendengarkan.</p>
      </div>
    </section>
  );
};

export default AccessibilitySettings;
