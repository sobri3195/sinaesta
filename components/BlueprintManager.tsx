
import React, { useState } from 'react';
import { Blueprint } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Save, Target, Layout, ChevronLeft } from 'lucide-react';

interface BlueprintManagerProps {
  onClose: () => void;
}

const INITIAL_BLUEPRINT: Blueprint = {
  id: 'bp_1',
  title: 'Blueprint Ujian Nasional Interna 2025',
  specialty: 'Internal Medicine',
  totalItems: 100,
  topics: [
    { name: 'Kardiologi', targetPercent: 15 },
    { name: 'Pulmonologi', targetPercent: 10 },
    { name: 'Gastroenterohepatologi', targetPercent: 15 },
    { name: 'Nefrologi', targetPercent: 10 },
    { name: 'Hematologi', targetPercent: 10 },
    { name: 'Endokrinologi', targetPercent: 15 },
    { name: 'Rheumatologi', targetPercent: 10 },
    { name: 'Tropik Infeksi', targetPercent: 15 },
  ],
  domains: [
    { name: 'Diagnosis', targetPercent: 40 },
    { name: 'Therapy', targetPercent: 30 },
    { name: 'Investigation', targetPercent: 20 },
    { name: 'Pathophysiology', targetPercent: 10 },
  ],
  difficulty: [
    { name: 'Easy', targetPercent: 30 },
    { name: 'Medium', targetPercent: 50 },
    { name: 'Hard', targetPercent: 20 },
  ],
  createdAt: Date.now()
};

const BlueprintManager: React.FC<BlueprintManagerProps> = ({ onClose }) => {
  const [blueprint, setBlueprint] = useState<Blueprint>(INITIAL_BLUEPRINT);
  const [activeTab, setActiveTab] = useState<'TOPIC' | 'DOMAIN' | 'DIFFICULTY'>('TOPIC');

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

  const handleUpdateItem = (section: 'topics' | 'domains' | 'difficulty', index: number, field: 'name' | 'targetPercent', value: any) => {
    const newSection = [...blueprint[section]];
    // @ts-ignore
    newSection[index][field] = value;
    setBlueprint({ ...blueprint, [section]: newSection });
  };

  const handleAddItem = (section: 'topics' | 'domains') => {
    const newSection = [...blueprint[section], { name: 'New Item', targetPercent: 0 }];
    // @ts-ignore
    setBlueprint({ ...blueprint, [section]: newSection });
  };

  const handleDeleteItem = (section: 'topics' | 'domains', index: number) => {
    const newSection = [...blueprint[section]];
    newSection.splice(index, 1);
    // @ts-ignore
    setBlueprint({ ...blueprint, [section]: newSection });
  };

  const getCurrentData = () => {
    switch(activeTab) {
      case 'TOPIC': return blueprint.topics;
      case 'DOMAIN': return blueprint.domains;
      case 'DIFFICULTY': return blueprint.difficulty;
    }
  };

  const totalPercent = getCurrentData().reduce((acc, curr) => acc + (parseInt(curr.targetPercent as any) || 0), 0);
  const isValid = totalPercent === 100;

  return (
    <div className="bg-gray-50 h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <ChevronLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Blueprint & Kompetensi</h1>
                <p className="text-sm text-gray-500">Atur kisi-kisi dan proporsi ujian program studi.</p>
            </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium">
            <Save size={18} /> Simpan Blueprint
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Configuration */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Blueprint</label>
                            <input 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={blueprint.title}
                                onChange={e => setBlueprint({...blueprint, title: e.target.value})}
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Program Studi</label>
                             <input 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={blueprint.specialty}
                                onChange={e => setBlueprint({...blueprint, specialty: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex border-b border-gray-200 mb-6">
                        <button 
                            onClick={() => setActiveTab('TOPIC')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'TOPIC' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Topik Klinis
                        </button>
                        <button 
                            onClick={() => setActiveTab('DOMAIN')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DOMAIN' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Domain Kompetensi
                        </button>
                        <button 
                            onClick={() => setActiveTab('DIFFICULTY')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DIFFICULTY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Tingkat Kesulitan
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase px-2">
                            <span>Nama Kategori</span>
                            <span>Target Proporsi (%)</span>
                        </div>
                        {getCurrentData().map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                                <div className="flex-1 relative">
                                    <input 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none"
                                        value={item.name}
                                        onChange={(e) => handleUpdateItem(activeTab === 'TOPIC' ? 'topics' : activeTab === 'DOMAIN' ? 'domains' : 'difficulty', idx, 'name', e.target.value)}
                                        readOnly={activeTab === 'DIFFICULTY'} // Difficulty preset names usually fixed
                                    />
                                </div>
                                <div className="w-24 relative">
                                    <input 
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none"
                                        value={item.targetPercent}
                                        onChange={(e) => handleUpdateItem(activeTab === 'TOPIC' ? 'topics' : activeTab === 'DOMAIN' ? 'domains' : 'difficulty', idx, 'targetPercent', parseInt(e.target.value))}
                                    />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                </div>
                                {activeTab !== 'DIFFICULTY' && (
                                    <button 
                                        onClick={() => handleDeleteItem(activeTab === 'TOPIC' ? 'topics' : 'domains', idx)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {activeTab !== 'DIFFICULTY' && (
                            <button 
                                onClick={() => handleAddItem(activeTab === 'TOPIC' ? 'topics' : 'domains')}
                                className="mt-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2 px-2 py-1"
                            >
                                <Plus size={16} /> Tambah Kategori
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Visualization */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Target size={20} className="text-indigo-600" />
                        Distribusi {activeTab === 'TOPIC' ? 'Topik' : activeTab === 'DOMAIN' ? 'Domain' : 'Kesulitan'}
                    </h3>
                    
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getCurrentData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="targetPercent"
                                >
                                    {getCurrentData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className={`text-3xl font-black ${isValid ? 'text-gray-800' : 'text-red-500'}`}>
                                {totalPercent}%
                            </span>
                            <span className="text-xs text-gray-400 font-bold uppercase">Total</span>
                        </div>
                    </div>

                    {!isValid && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center justify-center gap-2">
                            Total persentase harus 100%. Saat ini: <strong>{totalPercent}%</strong>
                        </div>
                    )}
                    
                    <div className="mt-6 space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Legend</h4>
                        {getCurrentData().map((item, idx) => (
                             <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length]}}></div>
                                    <span className="text-gray-600 truncate max-w-[150px]">{item.name}</span>
                                </div>
                                <span className="font-medium">{item.targetPercent}%</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintManager;
