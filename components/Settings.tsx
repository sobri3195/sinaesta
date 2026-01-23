import React, { useState } from 'react';
import { AppSettings, User, UserRole } from '../types';
import { 
  Settings as SettingsIcon, X, Save, Upload, Download, FileText, 
  Eye, EyeOff, Bell, BellOff, Palette, Layout, Zap, CheckCircle,
  HelpCircle, RefreshCw, Info, User as UserIcon
} from 'lucide-react';
import FileUpload from './FileUpload';

interface SettingsProps {
  user: User;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, settings, onUpdateSettings, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'exam' | 'flashcards' | 'osce' | 'import' | 'about'>('general');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sinaesta-settings.json';
    link.click();
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedSettings = JSON.parse(event.target?.result as string);
          setLocalSettings(importedSettings);
          alert('Settings imported successfully!');
        } catch (error) {
          alert('Failed to import settings. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
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
      setLocalSettings(defaultSettings);
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <X size={20} />
          </button>
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pengaturan Aplikasi</h1>
            <p className="text-sm text-gray-500">Kustomisasi pengalaman belajar Anda</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showSaveSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle size={16} />
              Tersimpan!
            </div>
          )}
          <button 
            onClick={handleSave}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Simpan Perubahan
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Layout size={18} />
              Umum & UI
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'exam' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={18} />
              Exam Creator & Taker
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'flashcards' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Zap size={18} />
              Flashcards & Study
            </button>
            <button
              onClick={() => setActiveTab('osce')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'osce' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckCircle size={18} />
              OSCE & Clinical
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'import' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Upload size={18} />
              Import Soal
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'about' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Info size={18} />
              Tentang Aplikasi
            </button>
          </nav>

          {/* Export/Import Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
            <button 
              onClick={handleExportSettings}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Download size={14} />
              Export Settings
            </button>
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
              <Upload size={14} />
              Import Settings
              <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
            </label>
            <button 
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <RefreshCw size={14} />
              Reset ke Default
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">User Interface</h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Compact Mode</h3>
                      <p className="text-sm text-gray-500">Reduce spacing and padding for a denser UI</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        ui: { ...localSettings.ui, compactMode: !localSettings.ui.compactMode }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.ui.compactMode ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.ui.compactMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Floating Help Indicator</h3>
                      <p className="text-sm text-gray-500">Show contextual help tooltips throughout the app</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        ui: { ...localSettings.ui, showFloatingHelp: !localSettings.ui.showFloatingHelp }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.ui.showFloatingHelp ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.ui.showFloatingHelp ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                          />
                        ) : (
                          <UserIcon className="w-12 h-12 text-indigo-300" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Foto Profil</label>
                      <FileUpload
                        fileType="image"
                        maxFiles={1}
                        contextId={user.id}
                        onUploadComplete={(files) => {
                          // In a real app, we would call an API to update user's avatar URL
                          alert('Profile picture uploaded! URL: ' + files[0].url);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG, GIF, WebP. Max: 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                      <input 
                        type="text" 
                        defaultValue={user.name}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="text" 
                        defaultValue={user.email}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input 
                        type="text" 
                        defaultValue={user.role}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Specialty</label>
                      <input 
                        type="text" 
                        defaultValue={user.targetSpecialty || 'N/A'}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Profile information (except photo) can be requested for change from Program Admin.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Exam Creator</h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Default Question Count</h3>
                    <p className="text-sm text-gray-500 mb-3">Default number of questions when using AI Generator</p>
                    <input 
                      type="number" 
                      min="5"
                      max="50"
                      step="5"
                      value={localSettings.examCreator.defaultQuestionCount}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        examCreator: { ...localSettings.examCreator, defaultQuestionCount: parseInt(e.target.value) }
                      })}
                      className="w-32 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Auto-Generate Thumbnail</h3>
                      <p className="text-sm text-gray-500">Automatically generate exam thumbnails with AI</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        examCreator: { ...localSettings.examCreator, autoGenerateThumbnail: !localSettings.examCreator.autoGenerateThumbnail }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.examCreator.autoGenerateThumbnail ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.examCreator.autoGenerateThumbnail ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Exam Taker</h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Show Timer</h3>
                      <p className="text-sm text-gray-500">Display countdown timer during exams</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        examTaker: { ...localSettings.examTaker, showTimer: !localSettings.examTaker.showTimer }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.examTaker.showTimer ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.examTaker.showTimer ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Confirm Before Submit</h3>
                      <p className="text-sm text-gray-500">Ask confirmation before submitting exam answers</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        examTaker: { ...localSettings.examTaker, confirmBeforeSubmit: !localSettings.examTaker.confirmBeforeSubmit }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.examTaker.confirmBeforeSubmit ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.examTaker.confirmBeforeSubmit ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Show Explanations in Results</h3>
                      <p className="text-sm text-gray-500">Display answer explanations immediately after exam</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        examTaker: { ...localSettings.examTaker, showExplanationsInResults: !localSettings.examTaker.showExplanationsInResults }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.examTaker.showExplanationsInResults ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.examTaker.showExplanationsInResults ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Flashcards Study Mode</h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Shuffle Cards</h3>
                      <p className="text-sm text-gray-500">Randomize flashcard order during study sessions</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        flashcards: { ...localSettings.flashcards, shuffleCards: !localSettings.flashcards.shuffleCards }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.flashcards.shuffleCards ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.flashcards.shuffleCards ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Flashcard Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Use spaced repetition for better retention</li>
                      <li>Review cards marked as "need review" more frequently</li>
                      <li>Create your own cards for personalized learning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'osce' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">OSCE & Clinical Skills</h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Show Checklist Tips</h3>
                      <p className="text-sm text-gray-500">Display helpful hints for each checklist item</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        osce: { ...localSettings.osce, showChecklistTips: !localSettings.osce.showChecklistTips }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.osce.showChecklistTips ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.osce.showChecklistTips ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Import Soal dari Excel</h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Strict Validation</h3>
                      <p className="text-sm text-gray-500">Enforce strict validation rules during Excel import</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        importSoal: { ...localSettings.importSoal, strictValidation: !localSettings.importSoal.strictValidation }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.importSoal.strictValidation ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.importSoal.strictValidation ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-900 mb-1">Import Guidelines</h3>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Always download the template file first</li>
                      <li>Ensure all required fields are filled</li>
                      <li>Use correct answer format (A, B, C, or D)</li>
                      <li>Check for errors before importing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">SINAESTA Digital</h2>
                <p className="text-gray-600 mb-4">
                  Platform komprehensif untuk persiapan ujian seleksi Program Pendidikan Dokter Spesialis (PPDS) 
                  dengan kecerdasan buatan (AI).
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Build:</strong> 2025.01</p>
                  <p><strong>AI Engine:</strong> Google Gemini 2.5 Flash</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Fitur Utama</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Bank Soal AI dengan berbagai specialty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Virtual OSCE dengan Gemini Live</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Clinical Reasoning Simulator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>E-Logbook & Mentor Marketplace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Analitik & Performance Tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Import Soal dari Excel/CSV</span>
                  </li>
                </ul>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-indigo-900 mb-2">Developer</h3>
                <p className="text-sm text-indigo-800 mb-2">
                  <strong>Lettu Kes dr. Muhammad Sobri Maulana, S.Kom, CEH, OSCP, OSCE</strong>
                </p>
                <div className="text-sm text-indigo-700 space-y-1">
                  <p>Email: muhammadsobrimaulana31@gmail.com</p>
                  <p>GitHub: github.com/sobri3195</p>
                  <p>Website: muhammadsobrimaulana.netlify.app</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
