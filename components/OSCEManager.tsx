
import React, { useState } from 'react';
import { OSCEStation, OSCERubric } from '../types';
import { Plus, Trash2, Edit, Save, CheckSquare, ClipboardList, ChevronLeft, UserPlus, Video, Scale } from 'lucide-react';

interface OSCEManagerProps {
  onClose: () => void;
}

const MOCK_STATIONS: OSCEStation[] = [
  {
    id: 's1',
    title: 'Station 1: Chest Pain',
    scenario: 'A 55yo male presents with crushing chest pain...',
    instruction: 'Perform focused history and physical exam.',
    durationMinutes: 15,
    checklist: [
      { item: 'Introduce self', points: 1, category: 'Communication' },
      { item: 'Ask about onset', points: 1, category: 'Anamnesis' }
    ],
    calibrationVideoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' // Mock URL
  }
];

const OSCEManager: React.FC<OSCEManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'STATIONS' | 'CALIBRATION'>('STATIONS');
  const [stations, setStations] = useState<OSCEStation[]>(MOCK_STATIONS);
  const [editingStation, setEditingStation] = useState<OSCEStation | null>(null);

  // Calibration State
  const [calibStation, setCalibStation] = useState<OSCEStation | null>(null);

  const addNewStation = () => {
    const newStation: OSCEStation = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Station',
      scenario: '',
      instruction: '',
      durationMinutes: 15,
      checklist: []
    };
    setEditingStation(newStation);
  };

  const saveStation = () => {
    if (!editingStation) return;
    if (stations.find(s => s.id === editingStation.id)) {
        setStations(stations.map(s => s.id === editingStation.id ? editingStation : s));
    } else {
        setStations([...stations, editingStation]);
    }
    setEditingStation(null);
  };

  const addChecklistItem = () => {
    if (!editingStation) return;
    setEditingStation({
      ...editingStation,
      checklist: [...editingStation.checklist, { item: '', points: 1, category: 'Anamnesis' }]
    });
  };

  const updateChecklistItem = (idx: number, field: keyof typeof editingStation.checklist[0], value: any) => {
    if (!editingStation) return;
    const newChecklist = [...editingStation.checklist];
    // @ts-ignore
    newChecklist[idx][field] = value;
    setEditingStation({ ...editingStation, checklist: newChecklist });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
       <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
         <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <ChevronLeft size={20} />
             </button>
             <div>
                <h1 className="text-xl font-bold text-gray-900">OSCE Management System</h1>
                <p className="text-sm text-gray-500">Create stations, define rubrics, and calibrate examiners.</p>
             </div>
         </div>
         
         <div className="flex bg-gray-100 p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('STATIONS')}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'STATIONS' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
             >
                Stations
             </button>
             <button 
                onClick={() => setActiveTab('CALIBRATION')}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'CALIBRATION' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
             >
                Calibration
             </button>
         </div>

         {!editingStation && activeTab === 'STATIONS' && (
             <button onClick={addNewStation} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                 <Plus size={18} /> New Station
             </button>
         )}
       </div>

       <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'STATIONS' ? (
              editingStation ? (
                  <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
                      <div className="flex justify-between items-start">
                          <h2 className="text-xl font-bold text-gray-800">Edit Station</h2>
                          <div className="flex gap-2">
                              <button onClick={() => setEditingStation(null)} className="px-4 py-2 text-gray-600">Cancel</button>
                              <button onClick={saveStation} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Save Changes</button>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2">
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Station Title</label>
                              <input 
                                  className="w-full border p-2 rounded" 
                                  value={editingStation.title} 
                                  onChange={e => setEditingStation({...editingStation, title: e.target.value})}
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinical Scenario (For Student)</label>
                              <textarea 
                                  className="w-full border p-2 rounded h-24" 
                                  value={editingStation.scenario} 
                                  onChange={e => setEditingStation({...editingStation, scenario: e.target.value})}
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructions</label>
                              <textarea 
                                  className="w-full border p-2 rounded h-24" 
                                  value={editingStation.instruction} 
                                  onChange={e => setEditingStation({...editingStation, instruction: e.target.value})}
                              />
                          </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-gray-800 flex items-center gap-2"><ClipboardList size={20} /> Assessment Checklist</h3>
                              <button onClick={addChecklistItem} className="text-sm text-indigo-600 font-bold flex items-center gap-1">+ Add Item</button>
                          </div>
                          <div className="space-y-2">
                              {editingStation.checklist.map((item, idx) => (
                                  <div key={idx} className="flex gap-2 items-center">
                                      <input 
                                        className="flex-1 border p-2 rounded text-sm" 
                                        placeholder="Task item..."
                                        value={item.item}
                                        onChange={e => updateChecklistItem(idx, 'item', e.target.value)}
                                      />
                                      <select 
                                        className="border p-2 rounded text-sm w-32"
                                        value={item.category}
                                        onChange={e => updateChecklistItem(idx, 'category', e.target.value)}
                                      >
                                          <option>Anamnesis</option>
                                          <option>Physical Exam</option>
                                          <option>Diagnosis</option>
                                          <option>Communication</option>
                                      </select>
                                      <input 
                                        type="number"
                                        className="w-16 border p-2 rounded text-sm"
                                        value={item.points}
                                        onChange={e => updateChecklistItem(idx, 'points', parseInt(e.target.value))}
                                      />
                                      <button onClick={() => {
                                          const newC = [...editingStation.checklist];
                                          newC.splice(idx, 1);
                                          setEditingStation({...editingStation, checklist: newC});
                                      }} className="text-red-500 p-2"><Trash2 size={16} /></button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stations.map(station => (
                          <div key={station.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="font-bold text-gray-900 mb-2">{station.title}</h3>
                              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{station.scenario}</p>
                              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                  <span>{station.durationMinutes} Mins</span>
                                  <span>{station.checklist.length} Checklist Items</span>
                              </div>
                              <div className="flex gap-2 pt-4 border-t border-gray-100">
                                  <button onClick={() => setEditingStation(station)} className="flex-1 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium">Edit Station</button>
                                  <button className="flex-1 py-2 text-gray-600 bg-gray-50 rounded-lg font-medium flex items-center justify-center gap-2">
                                      <UserPlus size={16} /> Assign Examiner
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )
          ) : (
              // CALIBRATION MODE
              <div className="max-w-5xl mx-auto">
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 flex items-start gap-4">
                    <Scale className="text-blue-600 mt-1" size={24} />
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg">Examiner Calibration</h3>
                        <p className="text-blue-800">Watch standard performance videos, score them using the station checklist, and compare your rating against the Gold Standard to ensure inter-rater reliability.</p>
                    </div>
                 </div>

                 {calibStation ? (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="space-y-4">
                             <div className="bg-black rounded-xl aspect-video flex items-center justify-center text-white">
                                <Video size={48} />
                                <span className="ml-2">Mock Video Player</span>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-gray-200">
                                 <h4 className="font-bold text-gray-800 mb-2">{calibStation.title}</h4>
                                 <p className="text-sm text-gray-500">{calibStation.scenario}</p>
                             </div>
                             <button onClick={() => setCalibStation(null)} className="text-gray-500 underline">Back to list</button>
                         </div>
                         <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-[600px]">
                             <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CheckSquare size={18}/> Score This Attempt</h4>
                             <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                                 {calibStation.checklist.map((item, idx) => (
                                     <label key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                                         <input type="checkbox" className="mt-1" />
                                         <div>
                                             <p className="text-sm font-bold text-gray-800">{item.item}</p>
                                             <p className="text-xs text-gray-500">{item.points} pts</p>
                                         </div>
                                     </label>
                                 ))}
                             </div>
                             <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Submit & Compare</button>
                         </div>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {stations.filter(s => s.calibrationVideoUrl).map(station => (
                             <div key={station.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all" onClick={() => setCalibStation(station)}>
                                 <div className="bg-gray-100 rounded-lg aspect-video mb-4 flex items-center justify-center text-gray-400">
                                     <Video size={32} />
                                 </div>
                                 <h3 className="font-bold text-gray-900">{station.title}</h3>
                                 <p className="text-sm text-gray-500">Video Duration: 10m</p>
                                 <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded mt-2 inline-block">Ready for Calibration</span>
                             </div>
                         ))}
                     </div>
                 )}
              </div>
          )}
       </div>
    </div>
  );
};

export default OSCEManager;
