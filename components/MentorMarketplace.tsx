
import React, { useState } from 'react';
import { MentorSession } from '../types';
import { Calendar, Clock, User, Video, Search, Filter, Star, CheckCircle } from 'lucide-react';

const MOCK_SESSIONS: MentorSession[] = [
    { id: 'ms1', mentorId: 'm1', mentorName: 'dr. Senior, Sp.PD', mentorAvatar: 'https://ui-avatars.com/api/?name=Senior+SpPD&background=random', topic: 'Review Case Report & Logbook', startTime: Date.now() + 86400000, durationMinutes: 60, status: 'AVAILABLE', price: 150000 },
    { id: 'ms2', mentorId: 'm2', mentorName: 'dr. Heart, Sp.JP', mentorAvatar: 'https://ui-avatars.com/api/?name=Heart+SpJP&background=random', topic: 'Mock OSCE: Cardiology Station', startTime: Date.now() + 172800000, durationMinutes: 45, status: 'AVAILABLE', price: 200000 },
    { id: 'ms3', mentorId: 'm1', mentorName: 'dr. Senior, Sp.PD', mentorAvatar: 'https://ui-avatars.com/api/?name=Senior+SpPD&background=random', topic: 'Journal Reading Guidance', startTime: Date.now() + 259200000, durationMinutes: 60, status: 'BOOKED' },
];

const MentorMarketplace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [sessions, setSessions] = useState<MentorSession[]>(MOCK_SESSIONS);
  const [filterTopic, setFilterTopic] = useState('');

  const handleBook = (id: string) => {
      setSessions(sessions.map(s => s.id === id ? { ...s, status: 'BOOKED' } : s));
      alert("Session booked successfully! Check your schedule.");
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="text-indigo-600" /> Mentor Sessions
                </h1>
                <p className="text-gray-500 text-sm">Book 1-on-1 reviews, mock exams, or consultation slots with residents & specialists.</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Back</button>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" 
                        placeholder="Search by mentor or topic..." 
                        value={filterTopic}
                        onChange={e => setFilterTopic(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"><Filter size={16}/> Filter</button>
                    <button className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"><Calendar size={16}/> Date</button>
                </div>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions
                    .filter(s => s.topic.toLowerCase().includes(filterTopic.toLowerCase()) || s.mentorName.toLowerCase().includes(filterTopic.toLowerCase()))
                    .map(session => (
                    <div key={session.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md
                        ${session.status === 'BOOKED' ? 'border-gray-200 opacity-70' : 'border-indigo-100'}
                    `}>
                        <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={session.mentorAvatar} alt="" className="w-10 h-10 rounded-full border border-gray-200" />
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{session.mentorName}</h3>
                                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                                            <Star size={10} fill="currentColor" /> 4.9 (20 reviews)
                                        </div>
                                    </div>
                                </div>
                                {session.status === 'BOOKED' ? (
                                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">Booked</span>
                                ) : (
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Available</span>
                                )}
                            </div>
                            
                            <h4 className="font-bold text-lg mb-2 text-indigo-900">{session.topic}</h4>
                            
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" />
                                    {session.durationMinutes} Minutes
                                </div>
                                <div className="flex items-center gap-2">
                                    <Video size={16} className="text-gray-400" />
                                    Zoom / Google Meet
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-900">
                                {session.price ? `Rp ${session.price.toLocaleString()}` : 'Free'}
                            </span>
                            <button 
                                onClick={() => session.status === 'AVAILABLE' && handleBook(session.id)}
                                disabled={session.status === 'BOOKED'}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors
                                    ${session.status === 'BOOKED' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                                `}
                            >
                                {session.status === 'BOOKED' ? 'Unavailable' : 'Book Session'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default MentorMarketplace;
