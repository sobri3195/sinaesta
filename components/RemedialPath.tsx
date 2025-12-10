
import React, { useState } from 'react';
import { RemedialTask } from '../types';
import { CheckCircle, BookOpen, Layers, ArrowRight, PlayCircle, BarChart } from 'lucide-react';

const MOCK_TASKS: RemedialTask[] = [
    { id: 't1', type: 'REVIEW_QUESTION', title: 'Review: Management of Hyperkalemia', referenceId: 'q_123', completed: false, priority: 'HIGH' },
    { id: 't2', type: 'READ_GUIDELINE', title: 'Read: KDIGO CKD Guidelines 2024 (pg 15-20)', referenceId: 'g_456', completed: false, priority: 'HIGH' },
    { id: 't3', type: 'STUDY_FLASHCARD', title: 'Drill: Electrolyte Correction Formula Deck', referenceId: 'd_789', completed: true, priority: 'MEDIUM' },
];

const RemedialPath: React.FC = () => {
  const [tasks, setTasks] = useState<RemedialTask[]>(MOCK_TASKS);

  const toggleTask = (id: string) => {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col p-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg mb-8">
            <h1 className="text-3xl font-bold mb-2">Personalized Remedial Path</h1>
            <p className="text-indigo-100 mb-6 max-w-2xl">
                Based on your recent performance, our AI has curated a targeted learning path to address your weak areas in Nephrology and Fluid Management.
            </p>
            
            <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/20 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="font-bold">{progress}% Completed</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Layers className="text-indigo-600" /> Recommended Actions
                </h3>
                
                {tasks.map((task, idx) => (
                    <div key={task.id} className={`bg-white p-5 rounded-xl border transition-all hover:shadow-md flex items-center gap-4 group
                        ${task.completed ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}
                    `}>
                        <button 
                            onClick={() => toggleTask(task.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-400'}
                            `}
                        >
                            {task.completed && <CheckCircle size={14} />}
                        </button>
                        
                        <div className="flex-1">
                            <h4 className={`font-bold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{task.title}</h4>
                            <div className="flex gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                                    ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
                                `}>
                                    {task.priority} Priority
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    {task.type === 'READ_GUIDELINE' ? <BookOpen size={12}/> : task.type === 'STUDY_FLASHCARD' ? <Layers size={12}/> : <PlayCircle size={12}/>}
                                    {task.type.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <button className="p-2 text-gray-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                            <ArrowRight size={20} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart className="text-amber-500" /> Error Taxonomy
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Why you missed questions:</p>
                    
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                <span>Knowledge Gap</span>
                                <span>45%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 w-[45%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                <span>Premature Closure</span>
                                <span>30%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 w-[30%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                <span>Guideline Mismatch</span>
                                <span>25%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-400 w-[25%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 p-3 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                        <strong>Insight:</strong> You tend to stop investigating too early (Premature Closure). Try to broaden your Differential Diagnosis before selecting a therapy.
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default RemedialPath;
