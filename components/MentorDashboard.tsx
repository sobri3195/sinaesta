
import React, { useState } from 'react';
import { ReviewTask, User } from '../types';
import { CheckCircle, Clock, Users, MessageSquare, BookOpen, ChevronRight, AlertCircle, Calendar } from 'lucide-react';

const MOCK_TASKS: ReviewTask[] = [
  { id: 't1', type: 'LOGBOOK', submitterName: 'dr. Andi Pratama', title: 'Case: STEMI Inferior', timestamp: Date.now() - 3600000, status: 'PENDING' },
  { id: 't2', type: 'OSCE', submitterName: 'dr. Budi Santoso', title: 'Station 1: Chest Pain', timestamp: Date.now() - 7200000, status: 'PENDING' },
  { id: 't3', type: 'CASE_DISCUSSION', submitterName: 'Anonymous', title: 'Dilemma Etik Pasien Terminal', timestamp: Date.now() - 100000, status: 'PENDING' },
];

const MentorDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<ReviewTask[]>(MOCK_TASKS);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Command Center</h1>
          <p className="text-gray-500">Overview of your cohort's progress and pending reviews.</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              <span className="font-bold text-gray-700">Today, {new Date().toLocaleDateString()}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
             <Clock size={24} />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Pending Reviews</p>
             <h3 className="text-2xl font-bold text-gray-900">{tasks.length} Items</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
             <Users size={24} />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Assigned Students</p>
             <h3 className="text-2xl font-bold text-gray-900">12 Mentees</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
             <MessageSquare size={24} />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Discussion Posts</p>
             <h3 className="text-2xl font-bold text-gray-900">5 New</h3>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grading Queue */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                 <CheckCircle className="text-indigo-600" size={20} /> Grading & Review Queue
              </h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{tasks.length}</span>
           </div>
           <div className="divide-y divide-gray-100">
             {tasks.length > 0 ? tasks.map(task => (
               <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold
                        ${task.type === 'LOGBOOK' ? 'bg-purple-500' : task.type === 'OSCE' ? 'bg-pink-500' : 'bg-blue-500'}
                     `}>
                        {task.type === 'LOGBOOK' ? 'LOG' : task.type === 'OSCE' ? 'OSCE' : 'CASE'}
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-800 text-sm">{task.title}</h4>
                        <p className="text-xs text-gray-500">Submitted by <span className="font-medium text-gray-700">{task.submitterName}</span> • {Math.floor((Date.now() - task.timestamp)/60000)} mins ago</p>
                     </div>
                  </div>
                  <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                     Review
                  </button>
               </div>
             )) : (
               <div className="p-8 text-center text-gray-400">No pending reviews. Good job!</div>
             )}
           </div>
           <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button className="text-sm text-indigo-600 font-bold hover:underline">View All History</button>
           </div>
        </div>

        {/* Quick Links / Schedule */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2">Upcoming Case Discussion</h3>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm mb-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <h4 className="font-bold">Bedside Teaching: Acute Kidney Injury</h4>
                       <p className="text-indigo-100 text-sm">Tomorrow, 08:00 AM • Zoom Meeting</p>
                    </div>
                    <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded">Confirmed</span>
                 </div>
              </div>
              <button className="w-full py-2 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
                 Manage Schedule
              </button>
           </div>

           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <AlertCircle size={20} className="text-amber-500" /> At-Risk Students
              </h3>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center font-bold text-red-700 text-xs">BS</div>
                       <div>
                          <p className="text-sm font-bold text-gray-900">dr. Budi Santoso</p>
                          <p className="text-xs text-red-600">Low score in Cardiology (45%)</p>
                       </div>
                    </div>
                    <ChevronRight size={16} className="text-red-400" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
