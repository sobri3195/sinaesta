
import React, { useState } from 'react';
import { CaseVignette } from '../types';
import { ChevronLeft, Save, Plus, Trash2, Image as ImageIcon, Activity } from 'lucide-react';

interface VignetteBuilderProps {
  onSave: (vignette: CaseVignette) => void;
  onCancel: () => void;
}

const VignetteBuilder: React.FC<VignetteBuilderProps> = ({ onSave, onCancel }) => {
  const [vignette, setVignette] = useState<CaseVignette>({
    id: Math.random().toString(36).substr(2, 9),
    title: '',
    content: '',
    tabs: []
  });

  const [activeTab, setActiveTab] = useState(0);

  const addTab = () => {
    setVignette({
      ...vignette,
      tabs: [...(vignette.tabs || []), { label: 'New Tab', content: '' }]
    });
    setActiveTab((vignette.tabs?.length || 0));
  };

  const updateTab = (index: number, field: 'label' | 'content' | 'imageUrl', value: any) => {
    const newTabs = [...(vignette.tabs || [])];
    newTabs[index] = { ...newTabs[index], [field]: value };
    setVignette({ ...vignette, tabs: newTabs });
  };

  const removeTab = (index: number) => {
    const newTabs = [...(vignette.tabs || [])];
    newTabs.splice(index, 1);
    setVignette({ ...vignette, tabs: newTabs });
    if (activeTab >= newTabs.length) setActiveTab(Math.max(0, newTabs.length - 1));
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-4">
            <button onClick={onCancel} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500">
                <ChevronLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Clinical Vignette Builder</h1>
                <p className="text-xs text-gray-500">Create rich clinical scenarios with labs and imaging.</p>
            </div>
        </div>
        <button 
            onClick={() => onSave(vignette)}
            disabled={!vignette.title || !vignette.content}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all font-medium shadow-sm"
        >
            <Save size={18} />
            Save Case
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Main Scenario */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Case Title</label>
                    <input 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. 45yo Male with Chest Pain"
                        value={vignette.title}
                        onChange={e => setVignette({...vignette, title: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Clinical History & Physical Exam</label>
                    <textarea 
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px]"
                        placeholder="Patient presents with..."
                        value={vignette.content}
                        onChange={e => setVignette({...vignette, content: e.target.value})}
                    />
                </div>
            </div>

            {/* Supporting Data Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Activity size={18} /> Supporting Data (Labs, EKG, Imaging)
                    </h3>
                    <button onClick={addTab} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded flex items-center gap-2">
                        <Plus size={16} /> Add Tab
                    </button>
                </div>

                <div className="border-b border-gray-200 flex overflow-x-auto">
                    {vignette.tabs?.map((tab, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setActiveTab(idx)}
                            className={`px-6 py-3 text-sm font-bold cursor-pointer border-r border-gray-100 hover:bg-gray-50 flex items-center gap-2 min-w-[120px] justify-between group
                                ${activeTab === idx ? 'bg-white text-indigo-600 border-b-2 border-b-indigo-600' : 'bg-gray-50 text-gray-500'}
                            `}
                        >
                            <span>{tab.label}</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeTab(idx); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-500 rounded"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {(!vignette.tabs || vignette.tabs.length === 0) && (
                        <div className="px-6 py-3 text-sm text-gray-400 italic">No tabs added yet.</div>
                    )}
                </div>

                {vignette.tabs && vignette.tabs.length > 0 && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tab Label</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
                                    value={vignette.tabs[activeTab].label}
                                    onChange={e => updateTab(activeTab, 'label', e.target.value)}
                                />
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data / Content (Text or JSON)</label>
                                <textarea 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-40 font-mono"
                                    placeholder="Enter lab results or text..."
                                    value={typeof vignette.tabs[activeTab].content === 'string' ? vignette.tabs[activeTab].content as string : JSON.stringify(vignette.tabs[activeTab].content, null, 2)}
                                    onChange={e => updateTab(activeTab, 'content', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image Attachment (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                                    {vignette.tabs[activeTab].imageUrl ? (
                                        <div className="relative w-full">
                                            <img src={vignette.tabs[activeTab].imageUrl} className="max-h-48 mx-auto rounded shadow-sm" alt="" />
                                            <button 
                                                onClick={() => updateTab(activeTab, 'imageUrl', undefined)}
                                                className="absolute top-2 right-2 bg-white text-red-500 p-1 rounded shadow border"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon size={32} className="text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Paste Image URL below</p>
                                        </>
                                    )}
                                </div>
                                <input 
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="https://..."
                                    value={vignette.tabs[activeTab].imageUrl || ''}
                                    onChange={e => updateTab(activeTab, 'imageUrl', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default VignetteBuilder;
