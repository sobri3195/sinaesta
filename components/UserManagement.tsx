


import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { Search, Filter, CheckCircle, XCircle, Shield, MoreVertical, UserCheck } from 'lucide-react';

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'dr. Andi Pratama', role: UserRole.STUDENT, avatar: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=0D8ABC&color=fff', status: UserStatus.VERIFIED, targetSpecialty: 'Internal Medicine', institution: 'Univ. Indonesia' },
  { id: 'u2', name: 'dr. Budi Santoso', role: UserRole.STUDENT, avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=random', status: UserStatus.PENDING, targetSpecialty: 'Cardiology', institution: 'Univ. Airlangga' },
  { id: 'u3', name: 'Prof. Hartono', role: UserRole.TEACHER, avatar: 'https://ui-avatars.com/api/?name=Hartono&background=111827&color=fff', status: UserStatus.VERIFIED, institution: 'RSCM' },
  { id: 'u4', name: 'Admin Kolegium', role: UserRole.PROGRAM_ADMIN, avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff', status: UserStatus.VERIFIED },
  { id: 'u5', name: 'dr. Siti Aminah', role: UserRole.STUDENT, avatar: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=random', status: UserStatus.VERIFIED, targetSpecialty: 'Pediatrics', institution: 'Univ. Gadjah Mada' },
  { id: 'u6', name: 'dr. Joko Susilo', role: UserRole.STUDENT, avatar: 'https://ui-avatars.com/api/?name=Joko+Susilo&background=random', status: UserStatus.SUSPENDED, targetSpecialty: 'Surgery', institution: 'Univ. Diponegoro' },
  { id: 'u7', name: 'dr. Sarah Wijaya', role: UserRole.TEACHER, avatar: 'https://ui-avatars.com/api/?name=Sarah+Wijaya&background=random', status: UserStatus.VERIFIED, institution: 'RS Hasan Sadikin' },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <Shield className="text-indigo-600" /> User Management
           </h1>
           <p className="text-gray-500 text-sm">Kelola akses, verifikasi dokter, dan role pengguna.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           {/* Toolbar */}
           <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
              <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                    type="text"
                    placeholder="Cari nama atau institusi..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-2">
                 <Filter size={16} className="text-gray-500" />
                 <select 
                   className="bg-white border border-gray-300 text-sm rounded-lg p-2 outline-none"
                   value={filterRole}
                   onChange={e => setFilterRole(e.target.value)}
                 >
                    <option value="ALL">Semua Role</option>
                    <option value={UserRole.STUDENT}>Student (Calon PPDS)</option>
                    <option value={UserRole.TEACHER}>Mentor / Konsulen</option>
                    <option value={UserRole.PROGRAM_ADMIN}>Admin Program</option>
                 </select>
              </div>
           </div>

           {/* Table */}
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left text-gray-500">
               <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                 <tr>
                   <th className="px-6 py-3">User</th>
                   <th className="px-6 py-3">Institusi & Target</th>
                   <th className="px-6 py-3">Role</th>
                   <th className="px-6 py-3">Status</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {filteredUsers.map(user => (
                   <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-200" />
                           <div>
                              <div className="font-bold text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-400">ID: {user.id}</div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        {user.role === UserRole.STUDENT ? (
                           <div>
                              <div className="font-medium text-gray-900">{user.targetSpecialty || '-'}</div>
                              <div className="text-xs text-gray-500">{user.institution || 'No Institution'}</div>
                           </div>
                        ) : (
                           <span className="text-gray-400 italic">-</span>
                        )}
                     </td>
                     <td className="px-6 py-4">
                        <select 
                           className="bg-transparent border-none text-sm font-medium text-gray-700 cursor-pointer focus:ring-0"
                           value={user.role}
                           onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        >
                           {Object.values(UserRole).map(role => (
                              <option key={role} value={role}>{role}</option>
                           ))}
                        </select>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border
                           ${user.status === UserStatus.VERIFIED ? 'bg-green-50 text-green-700 border-green-200' : 
                             user.status === UserStatus.SUSPENDED ? 'bg-red-50 text-red-700 border-red-200' :
                             'bg-yellow-50 text-yellow-700 border-yellow-200'}
                        `}>
                           {user.status === UserStatus.VERIFIED ? <CheckCircle size={12} /> : 
                            user.status === UserStatus.SUSPENDED ? <XCircle size={12} /> : <UserCheck size={12} />}
                           {user.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           {user.status === UserStatus.PENDING && (
                              <button 
                                onClick={() => handleStatusChange(user.id, UserStatus.VERIFIED)}
                                className="text-green-600 hover:bg-green-50 p-2 rounded-lg" title="Verify User"
                              >
                                 <CheckCircle size={18} />
                              </button>
                           )}
                           <button 
                              onClick={() => handleStatusChange(user.id, user.status === UserStatus.SUSPENDED ? UserStatus.VERIFIED : UserStatus.SUSPENDED)}
                              className={`${user.status === UserStatus.SUSPENDED ? 'text-green-600' : 'text-red-500'} hover:bg-gray-100 p-2 rounded-lg`}
                              title={user.status === UserStatus.SUSPENDED ? 'Activate' : 'Suspend'}
                           >
                              {user.status === UserStatus.SUSPENDED ? <CheckCircle size={18} /> : <XCircle size={18} />}
                           </button>
                           <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg">
                              <MoreVertical size={18} />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;