
import React, { useState } from 'react';
import { Guideline, Infographic } from '../types';
import { Search, FileText, ExternalLink, Image as ImageIcon, Tag, Plus, Filter, BookOpen, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

const MOCK_GUIDELINES: Guideline[] = [
    { id: 'g1', title: 'ESC Guidelines for the management of acute coronary syndromes', organization: 'ESC', year: 2023, version: 'v1.0', url: '#', tags: ['Cardiology', 'ACS', 'STEMI'], status: 'ACTIVE', impactedQuestionIds: [] },
    { id: 'g2', title: 'KDIGO Clinical Practice Guideline for CKD', organization: 'KDIGO', year: 2020, version: 'v2.1', url: '#', tags: ['Nephrology', 'CKD'], status: 'ACTIVE', impactedQuestionIds: ['q1', 'q5'] }, // Old version
    { id: 'g3', title: 'GOLD Report: Global Strategy for COPD', organization: 'GOLD', year: 2023, version: 'v1.0', url: '#', tags: ['Pulmonology', 'COPD'], status: 'ACTIVE', impactedQuestionIds: [] },
];

const MOCK_INFOGRAPHICS: Infographic[] = [
    { id: 'i1', title: 'Algoritma ACLS 2020: Cardiac Arrest', imageUrl: 'https://via.placeholder.com/400x600?text=ACLS+Algorithm', tags: ['Cardiology', 'Emergency'], type: 'ALGORITHM' },
    { id: 'i2', title: 'Sepsis Bundle Hour-1', imageUrl: 'https://via.placeholder.com/400x300?text=Sepsis+Bundle', tags: ['Infection', 'Emergency'], type: 'ALGORITHM' },
    { id: 'i3', title: 'Jembatan Keledai: Cranial Nerves', imageUrl: 'https://via.placeholder.com/400x300?text=Cranial+Nerves', tags: ['Neurology', 'Anatomy'], type: 'MNEMONIC' },
];

const KnowledgeBaseManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'GUIDELINES' | 'INFOGRAPHICS'>('GUIDELINES');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for content
  const [guidelines, setGuidelines] = useState<Guideline[]>(MOCK_GUIDELINES);
  const [infographics, setInfographics] = useState<Infographic[]>(MOCK_INFOGRAPHICS);
  const [showUpdateModal, setShowUpdateModal] = useState<Guideline | null>(null);

  const handleUpdateGuideline = () => {
      if (!showUpdateModal) return;
      // Mock logic: Archive old, create new, flag questions
      const updatedGuidelines = guidelines.map(g => g.id === showUpdateModal.id ? { ...g, status: 'ARCHIVED' as const } : g);
      const newGuideline: Guideline = {
          ...showUpdateModal,
          id: Math.random().toString(),
          year: new Date().getFullYear(),
          version: 'v' + (parseFloat(showUpdateModal.version.replace('v', '')) + 1).toFixed(1),
          status: 'ACTIVE',
          impactedQuestionIds: [] // New one has no history yet
      };
      
      setGuidelines([newGuideline, ...updatedGuidelines]);
      
      if (showUpdateModal.impactedQuestionIds && showUpdateModal.impactedQuestionIds.length > 0) {
          alert(`Warning: ${showUpdateModal.impactedQuestionIds.length} questions linked to the old guideline have been flagged for review.`);
      }
      
      setShowUpdateModal(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="text-indigo-600" />
                    Knowledge Base & Curriculum
                </h1>
                <p className="text-gray-500 text-sm">Pustaka referensi guideline, algoritme klinis, dan materi visual.</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Back</button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Tabs & Toolbar */}
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border-b border-gray-200 shadow-sm z-10">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('GUIDELINES')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'GUIDELINES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Guidelines & Referensi
                    </button>
                    <button 
                        onClick={() => setActiveTab('INFOGRAPHICS')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'INFOGRAPHICS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Infografis & Algoritme
                    </button>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cari referensi..." 
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                        <Plus size={16} />
                        Upload {activeTab === 'GUIDELINES' ? 'Guideline' : 'Media'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {activeTab === 'GUIDELINES' ? (
                    <div className="grid gap-4">
                        {guidelines.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase())).map(g => (
                            <div key={g.id} className={`bg-white p-5 rounded-xl border transition-all flex justify-between items-start group
                                ${g.status === 'ARCHIVED' ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-200 hover:border-indigo-300'}
                            `}>
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                                        ${g.status === 'ARCHIVED' ? 'bg-gray-200 text-gray-500' : 'bg-red-50 text-red-600'}
                                    `}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{g.title}</h3>
                                            {g.status === 'ARCHIVED' && <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">ARCHIVED</span>}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className="font-semibold text-gray-700">{g.organization}</span>
                                            <span>•</span>
                                            <span>{g.year}</span>
                                            <span>•</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{g.version}</span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            {g.tags.map(t => (
                                                <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                                                    #{t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                        <ExternalLink size={20} />
                                    </button>
                                    {g.status === 'ACTIVE' && (
                                        <button 
                                            onClick={() => setShowUpdateModal(g)}
                                            className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 flex items-center gap-1"
                                        >
                                            <RefreshCw size={12}/> Update Version
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {infographics.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())).map(info => (
                            <div key={info.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    <img src={info.imageUrl} alt={info.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold text-white shadow-sm
                                            ${info.type === 'ALGORITHM' ? 'bg-blue-600' : 'bg-purple-600'}
                                        `}>
                                            {info.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{info.title}</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {info.tags.map(t => (
                                            <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Update Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <RefreshCw className="text-orange-500" /> Update Guideline Evidence
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            You are updating <strong>{showUpdateModal.title}</strong>. This will archive the current version ({showUpdateModal.version}).
                        </p>
                        
                        {(showUpdateModal.impactedQuestionIds?.length || 0) > 0 && (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6 flex gap-3 items-start">
                                <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm font-bold text-red-900">Impact Analysis</p>
                                    <p className="text-xs text-red-700">
                                        {showUpdateModal.impactedQuestionIds?.length} questions are linked to this guideline. They will be automatically flagged for review.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowUpdateModal(null)} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
                            <button onClick={handleUpdateGuideline} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 flex items-center gap-2">
                                Confirm Update <ArrowRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default KnowledgeBaseManager;
