


import React, { useState } from 'react';
import { Cohort } from '../types';
import { School, Plus, Calendar, Users, Edit, Trash2 } from 'lucide-react';

const MOCK_COHORTS: Cohort[] = [
  { id: 'c1', name: 'Batch Januari 2026', specialty: 'Internal Medicine', startDate: Date.now(), endDate: Date.now() + 15552000000, maxStudents: 50, students: ['u1', 'u2'], mentors: ['u3'] },
  { id: 'c2', name: 'Batch Juli 2026', specialty: 'Cardiology', startDate: Date.now() + 8640000000, endDate: Date.now() + 25552000000, maxStudents: 30, students: [], mentors: [] },
  { id: 'c3', name: 'Batch Januari 2026', specialty: 'Pediatrics', startDate: Date.now(), endDate: Date.now() + 15552000000, maxStudents: 40, students: ['u5'], mentors: [] },
];

const CohortManagement: React.FC = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>(MOCK_COHORTS);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
        setCohorts(cohorts.filter(c => c.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <School className="text-indigo-600" /> Cohort Management
           </h1>
           <p className="text-gray-500 text-sm">Kelola batch, kuota, dan jadwal seleksi.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
            <Plus size={16} /> Buat Batch Baru
        </button>
      </div>

      <div className="p-6 md:p-8 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cohorts.map(cohort => (
                <div key={cohort.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded">{cohort.specialty}</span>
                            <h3 className="text-lg font-bold text-gray-900 mt-2">{cohort.name}</h3>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(cohort.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{new Date(cohort.startDate).toLocaleDateString()} — {new Date(cohort.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Users size={16} className="text-gray-400" />
                            <span>{cohort.students.length} / {cohort.maxStudents} Students Enrolled</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex -space-x-2 overflow-hidden">
                             {/* Mock Avatars */}
                             {[1,2,3].map(i => (
                                 <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                     S{i}
                                 </div>
                             ))}
                             <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">+</div>
                        </div>
                        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                            Manage Students &rarr;
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CohortManagement;