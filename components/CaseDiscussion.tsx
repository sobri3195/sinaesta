


import React, { useState } from 'react';
import { DiscussionThread, UserRole } from '../types';
import { MessageSquare, Plus, User, Shield, Check, Clock, EyeOff, ThumbsUp, LayoutList } from 'lucide-react';

const MOCK_THREADS: DiscussionThread[] = [
  {
    id: 'd1', title: '55M with refractory hyponatremia', authorId: 'u2', authorName: 'Anonymous', isAnonymous: true,
    createdAt: Date.now() - 86400000, status: 'APPROVED',
    content: 'Patient post-op craniotomy developed Na 118. Urine Osm 600. Clinical euvolemic. SIADH vs CSW? How to differentiate clinically?',
    tags: ['Nephrology', 'Endocrinology'],
    replies: [
        { id: 'r1', authorId: 'm1', authorName: 'dr. Senior, Sp.PD', content: 'Check Uric acid and volume status carefully. CSW usually hypovolemic.', createdAt: Date.now(), isMentor: true }
    ]
  },
  {
    id: 'd2', title: 'Ethical dilemma: DNR in septic shock', authorId: 'u1', authorName: 'dr. Andi', isAnonymous: false,
    createdAt: Date.now() - 3600000, status: 'PENDING',
    content: 'Family refuses intubation but wants "maximum drugs". Patient is unconscious. What is the legal stance?',
    tags: ['Ethics', 'ICU'],
    replies: []
  },
  {
    id: 'd3', title: 'Interpretasi AGD pada Ketoasidosis', authorId: 'u3', authorName: 'dr. Junior', isAnonymous: false,
    createdAt: Date.now() - 7200000, status: 'APPROVED',
    content: 'Pasien KAD dengan pH 6.9. Kapan tepatnya kita koreksi Bicarbonate? Guideline berbeda-beda.',
    tags: ['Endocrinology', 'Critical Care'],
    replies: []
  }
];

const CaseDiscussion: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [threads, setThreads] = useState<DiscussionThread[]>(MOCK_THREADS);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ 
      title: '', 
      problemList: '', 
      ddx: '', 
      plan: '', 
      isAnonymous: false 
  });

  const isMentor = userRole === UserRole.TEACHER || userRole === UserRole.PROGRAM_ADMIN;

  const handlePost = () => {
     if (!newPost.title || !newPost.problemList) return;
     
     const fullContent = `
     **Problem List:**
     ${newPost.problemList}
     
     **Ddx:**
     ${newPost.ddx}
     
     **Proposed Plan/Question:**
     ${newPost.plan}
     `;

     const post: DiscussionThread = {
         id: Math.random().toString(),
         title: newPost.title,
         content: fullContent,
         structuredContent: {
             problemList: newPost.problemList,
             ddx: newPost.ddx,
             plan: newPost.plan
         },
         isAnonymous: newPost.isAnonymous,
         authorId: 'me',
         authorName: newPost.isAnonymous ? 'Anonymous' : 'Me',
         createdAt: Date.now(),
         status: isMentor ? 'APPROVED' : 'PENDING',
         tags: [],
         replies: []
     };
     setThreads([post, ...threads]);
     setShowNewPost(false);
     setNewPost({ title: '', problemList: '', ddx: '', plan: '', isAnonymous: false });
  };

  const handleApprove = (id: string) => {
      setThreads(threads.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t));
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col p-6">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               <MessageSquare className="text-indigo-600" /> Case Discussion Room
             </h1>
             <p className="text-gray-500">Structured clinical case discussions moderated by mentors.</p>
          </div>
          <button 
             onClick={() => setShowNewPost(true)}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 font-medium"
          >
             <Plus size={18} /> Buat Diskusi Baru
          </button>
       </div>

       {showNewPost && (
           <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-lg mb-8 animate-fade-in">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <LayoutList size={20} /> New Structured Case
               </h3>
               <div className="space-y-4">
                   <input 
                     className="w-full border p-2 rounded-lg font-bold" 
                     placeholder="Case Title (e.g., 45M with Acute Chest Pain)"
                     value={newPost.title}
                     onChange={e => setNewPost({...newPost, title: e.target.value})}
                   />
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Problem List (History/PF/Labs)</label>
                           <textarea 
                             className="w-full border p-2 rounded-lg h-32 bg-gray-50 focus:bg-white transition-colors"
                             placeholder="1. Chest pain typical angina..."
                             value={newPost.problemList}
                             onChange={e => setNewPost({...newPost, problemList: e.target.value})}
                           />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Differential Diagnosis</label>
                           <textarea 
                             className="w-full border p-2 rounded-lg h-32 bg-gray-50 focus:bg-white transition-colors"
                             placeholder="1. STEMI..."
                             value={newPost.ddx}
                             onChange={e => setNewPost({...newPost, ddx: e.target.value})}
                           />
                       </div>
                   </div>
                   
                   <div>
                       <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Plan / Specific Question for Mentor</label>
                       <textarea 
                         className="w-full border p-2 rounded-lg h-24 bg-gray-50 focus:bg-white transition-colors"
                         placeholder="What is the best approach for..."
                         value={newPost.plan}
                         onChange={e => setNewPost({...newPost, plan: e.target.value})}
                       />
                   </div>

                   <label className="flex items-center gap-2 cursor-pointer w-fit">
                       <input 
                         type="checkbox" 
                         checked={newPost.isAnonymous}
                         onChange={e => setNewPost({...newPost, isAnonymous: e.target.checked})}
                         className="w-4 h-4 text-indigo-600 rounded"
                       />
                       <span className="text-sm text-gray-700 flex items-center gap-1"><EyeOff size={14}/> Post Anonymously</span>
                   </label>
                   <div className="flex justify-end gap-2">
                       <button onClick={() => setShowNewPost(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                       <button onClick={handlePost} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Post Discussion</button>
                   </div>
               </div>
           </div>
       )}

       <div className="space-y-4">
          {threads.map(thread => (
              <div key={thread.id} className={`bg-white p-6 rounded-xl border ${thread.status === 'PENDING' ? 'border-amber-200 bg-amber-50' : 'border-gray-200'} shadow-sm`}>
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {thread.isAnonymous ? (
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs font-bold"><EyeOff size={12}/> Anonymous</span>
                        ) : (
                            <span className="flex items-center gap-1 font-medium text-indigo-600"><User size={14}/> {thread.authorName}</span>
                        )}
                        <span>•</span>
                        <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                        {thread.status === 'PENDING' && <span className="text-amber-600 font-bold text-xs bg-amber-100 px-2 py-0.5 rounded">Pending Approval</span>}
                    </div>
                    {isMentor && thread.status === 'PENDING' && (
                        <button onClick={() => handleApprove(thread.id)} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold hover:bg-green-200 flex items-center gap-1">
                            <Check size={12} /> Approve
                        </button>
                    )}
                 </div>
                 
                 <h3 className="text-lg font-bold text-gray-900 mb-2">{thread.title}</h3>
                 
                 {thread.structuredContent ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                         <div>
                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Problem List</h4>
                             <p className="text-sm text-gray-800 whitespace-pre-line">{thread.structuredContent.problemList}</p>
                         </div>
                         <div>
                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Differential Diagnosis</h4>
                             <p className="text-sm text-gray-800 whitespace-pre-line">{thread.structuredContent.ddx}</p>
                         </div>
                         <div className="md:col-span-2 border-t border-gray-200 pt-2 mt-2">
                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Plan / Question</h4>
                             <p className="text-sm text-gray-800 whitespace-pre-line">{thread.structuredContent.plan}</p>
                         </div>
                     </div>
                 ) : (
                     <p className="text-gray-700 mb-4 whitespace-pre-line">{thread.content}</p>
                 )}

                 <div className="border-t border-gray-100 pt-4 mt-4">
                     <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><MessageSquare size={14}/> Replies ({thread.replies.length})</h4>
                     <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                         {thread.replies.map(reply => (
                             <div key={reply.id} className="text-sm">
                                 <div className="flex items-center gap-2 mb-1">
                                     <span className={`font-bold ${reply.isMentor ? 'text-indigo-600 flex items-center gap-1' : 'text-gray-800'}`}>
                                         {reply.isMentor && <Shield size={12}/>}
                                         {reply.authorName}
                                     </span>
                                     <span className="text-gray-400 text-xs">• 2h ago</span>
                                 </div>
                                 <p className="text-gray-600">{reply.content}</p>
                             </div>
                         ))}
                         {thread.replies.length === 0 && <p className="text-gray-400 italic text-sm">No replies yet. Be the first to discuss!</p>}
                     </div>
                 </div>
              </div>
          ))}
       </div>
    </div>
  );
};

export default CaseDiscussion;