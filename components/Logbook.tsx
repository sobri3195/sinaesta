



import React, { useState } from 'react';
import { LogbookEntry, CompetencyTarget, UserRole, Specialty } from '../types';
import { Plus, Search, Book, User, Calendar, FileText, CheckCircle, Clock, XCircle, AlertCircle, PenTool, Check } from 'lucide-react';

const INITIAL_LOGS: LogbookEntry[] = [
  { id: '1', date: Date.now() - 100000, patientInitials: 'Tn. A.S.', diagnosis: 'STEMI Inferior', procedure: 'Thrombolysis', role: 'Performer', supervisor: 'dr. Budi, Sp.JP', notes: 'Successful reperfusion signs within 30 mins.', status: 'VERIFIED', signedAt: Date.now() },
  { id: '2', date: Date.now() - 86400000, patientInitials: 'Ny. M.', diagnosis: 'DHF Grade III', procedure: 'Fluid Resuscitation', role: 'Observer', supervisor: 'dr. Sinta, Sp.PD', notes: 'Observed hemodynamic monitoring protocol.', status: 'PENDING' },
  { id: '3', date: Date.now() - 200000000, patientInitials: 'An. D', diagnosis: 'Status Epilepticus', procedure: 'Loading Phenytoin', role: 'Performer', supervisor: 'dr. Saraf, Sp.N', notes: 'Loading dose 20mg/kgBB in NS.', status: 'VERIFIED', signedAt: Date.now() - 100000000 },
  { id: '4', date: Date.now() - 300000000, patientInitials: 'Tn. K', diagnosis: 'CKD Stage V', procedure: 'Hemodialysis Initiation', role: 'Assistant', supervisor: 'dr. Ginjal, Sp.PD-KGH', notes: 'Cannulation of CDL.', status: 'PENDING' },
];

const COMPETENCIES: CompetencyTarget[] = [
    { id: 'c1', category: 'Emergency', procedureName: 'Pemasangan ETT', targetCount: 5, currentCount: 2 },
    { id: 'c2', category: 'Emergency', procedureName: 'DC Shock / Cardioversion', targetCount: 3, currentCount: 3 },
    { id: 'c3', category: 'Ward', procedureName: 'Pungsi Pleura', targetCount: 5, currentCount: 0 },
];

const Logbook: React.FC<{ userRole?: UserRole; targetSpecialty?: Specialty }> = ({ userRole, targetSpecialty }) => {
  const [logs, setLogs] = useState<LogbookEntry[]>(INITIAL_LOGS);
  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState<Partial<LogbookEntry>>({});
  
  // Sign-off Modal State
  const [signOffModal, setSignOffModal] = useState<LogbookEntry | null>(null);
  const [signOffFeedback, setSignOffFeedback] = useState('');

  const isMentor = userRole === UserRole.TEACHER || userRole === UserRole.PROGRAM_ADMIN;

  const handleSave = () => {
    if(!newLog.diagnosis || !newLog.patientInitials) return;
    const entry: LogbookEntry = {
       id: Math.random().toString(),
       date: Date.now(),
       patientInitials: newLog.patientInitials!,
       diagnosis: newLog.diagnosis!,
       procedure: newLog.procedure || '-',
       role: (newLog.role as any) || 'Observer',
       supervisor: newLog.supervisor || '-',
       notes: newLog.notes || '',
       status: 'PENDING'
    };
    setLogs([entry, ...logs]);
    setShowForm(false);
    setNewLog({});
  };

  const handleSignOff = () => {
      if (!signOffModal) return;
      setLogs(logs.map(l => l.id === signOffModal.id ? { 
          ...l, 
          status: 'VERIFIED', 
          supervisorFeedback: signOffFeedback,
          signedAt: Date.now()
      } : l));
      setSignOffModal(null);
      setSignOffFeedback('');
  };

  const verifyLog = (id: string, status: 'VERIFIED' | 'REJECTED') => {
      setLogs(logs.map(l => l.id === id ? { ...l, status } : l));
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pb-10">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               <Book className="text-indigo-600" /> E-Logbook & Portofolio
             </h1>
             <p className="text-gray-500 mt-1">Rekam jejak kompetensi dan tindakan klinis{targetSpecialty ? ` for ${targetSpecialty}` : ''}.</p>
          </div>
          {!isMentor && (
              <button 
                 onClick={() => setShowForm(true)}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 font-medium"
              >
                 <Plus size={18} /> Catat Kasus Baru
              </button>
          )}
       </div>

       {/* Competency Tracker */}
       {!isMentor && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               {COMPETENCIES.map(comp => {
                   const progress = Math.min(100, Math.round((comp.currentCount / comp.targetCount) * 100));
                   return (
                       <div key={comp.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                           <div className="flex justify-between items-start mb-2">
                               <h4 className="font-bold text-gray-800 text-sm">{comp.procedureName}</h4>
                               <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{comp.category}</span>
                           </div>
                           <div className="flex items-end gap-2 mb-2">
                               <span className="text-2xl font-bold text-indigo-600">{comp.currentCount}</span>
                               <span className="text-gray-400 text-sm mb-1">/ {comp.targetCount} Required</span>
                           </div>
                           <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                               <div className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }}></div>
                           </div>
                       </div>
                   )
               })}
           </div>
       )}

       {showForm && (
         <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-lg mb-8 animate-in slide-in-from-top-4">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Formulir Kasus Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Inisial Pasien</label>
                 <input className="w-full border p-2 rounded" placeholder="e.g. Tn. X" value={newLog.patientInitials || ''} onChange={e => setNewLog({...newLog, patientInitials: e.target.value})} />
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Diagnosis (ICD-10)</label>
                 <input className="w-full border p-2 rounded" placeholder="Diagnosis..." value={newLog.diagnosis || ''} onChange={e => setNewLog({...newLog, diagnosis: e.target.value})} />
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Tindakan / Prosedur</label>
                 <input className="w-full border p-2 rounded" placeholder="Tindakan..." value={newLog.procedure || ''} onChange={e => setNewLog({...newLog, procedure: e.target.value})} />
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Peran</label>
                 <select className="w-full border p-2 rounded" value={newLog.role || 'Observer'} onChange={e => setNewLog({...newLog, role: e.target.value as any})}>
                    <option>Observer</option>
                    <option>Assistant</option>
                    <option>Performer</option>
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Supervisor</label>
                 <input className="w-full border p-2 rounded" placeholder="dr. Sp..." value={newLog.supervisor || ''} onChange={e => setNewLog({...newLog, supervisor: e.target.value})} />
               </div>
               <div className="col-span-2">
                 <label className="text-xs font-bold text-gray-500 uppercase">Catatan Refleksi / Klinis</label>
                 <textarea className="w-full border p-2 rounded" rows={3} placeholder="Poin penting..." value={newLog.notes || ''} onChange={e => setNewLog({...newLog, notes: e.target.value})} />
               </div>
            </div>
            <div className="flex justify-end gap-2">
               <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
               <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan Log</button>
            </div>
         </div>
       )}

       <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                <tr>
                   <th className="px-6 py-3">Tanggal</th>
                   <th className="px-6 py-3">Pasien & Diagnosis</th>
                   <th className="px-6 py-3">Tindakan & Refleksi</th>
                   <th className="px-6 py-3">Supervisor</th>
                   <th className="px-6 py-3">Status</th>
                   {isMentor && <th className="px-6 py-3 text-right">Action</th>}
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {logs.map(log => (
                   <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 align-top">
                         <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(log.date).toLocaleDateString()}
                         </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 align-top">
                          <div>{log.patientInitials}</div>
                          <div className="text-indigo-700 font-bold">{log.diagnosis}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                         <div className="font-medium text-gray-800">{log.procedure}</div>
                         <div className="flex gap-2 mt-1 mb-2">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                ${log.role === 'Performer' ? 'bg-green-100 text-green-700' : 
                                  log.role === 'Assistant' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {log.role}
                             </span>
                         </div>
                         {log.notes && <div className="text-xs bg-yellow-50 p-2 rounded text-yellow-800 italic border border-yellow-100 max-w-xs">{log.notes}</div>}
                         {log.supervisorFeedback && (
                             <div className="mt-2 text-xs bg-indigo-50 p-2 rounded text-indigo-800 border border-indigo-100 max-w-xs">
                                 <strong>Mentor:</strong> {log.supervisorFeedback}
                             </div>
                         )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 align-top">
                         <div className="flex items-center gap-2">
                            <User size={14} />
                            {log.supervisor}
                         </div>
                         {log.status === 'VERIFIED' && log.signedAt && (
                             <div className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                                 <PenTool size={10} /> Signed: {new Date(log.signedAt).toLocaleDateString()}
                             </div>
                         )}
                      </td>
                      <td className="px-6 py-4 align-top">
                          {log.status === 'VERIFIED' ? (
                              <span className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded w-fit"><CheckCircle size={14}/> Verified</span>
                          ) : log.status === 'REJECTED' ? (
                              <span className="flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded w-fit"><XCircle size={14}/> Rejected</span>
                          ) : (
                              <span className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded w-fit"><Clock size={14}/> Pending</span>
                          )}
                      </td>
                      {isMentor && (
                          <td className="px-6 py-4 text-right align-top">
                              {log.status === 'PENDING' && (
                                  <div className="flex justify-end gap-2">
                                      <button onClick={() => verifyLog(log.id, 'REJECTED')} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Reject"><XCircle size={18} /></button>
                                      <button onClick={() => setSignOffModal(log)} className="p-2 text-green-500 hover:bg-green-50 rounded" title="Sign-off"><PenTool size={18} /></button>
                                  </div>
                              )}
                          </td>
                      )}
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Supervisor Sign-off Modal */}
       {signOffModal && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <PenTool className="text-indigo-600" /> Supervisor Sign-off
                   </h3>
                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 text-sm">
                       <p><strong>Procedure:</strong> {signOffModal.procedure}</p>
                       <p><strong>Diagnosis:</strong> {signOffModal.diagnosis}</p>
                       <p><strong>Notes:</strong> {signOffModal.notes}</p>
                   </div>
                   
                   <label className="block text-sm font-bold text-gray-700 mb-2">Mentor Feedback / Comments</label>
                   <textarea 
                       className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-6"
                       rows={3}
                       placeholder="e.g. Good technique, needs improvement on..."
                       value={signOffFeedback}
                       onChange={e => setSignOffFeedback(e.target.value)}
                   />
                   
                   <div className="flex justify-end gap-3">
                       <button onClick={() => setSignOffModal(null)} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                       <button onClick={handleSignOff} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2">
                           <Check size={18} /> Digitally Sign & Verify
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default Logbook;