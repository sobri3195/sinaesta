import React, { useState } from 'react';
import { Exam } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Eye, 
  FileText, 
  MoreVertical, 
  Calendar, 
  Clock, 
  ListOrdered,
  Filter,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  exams: Exam[];
  onCreateExam: () => void;
  onEditExam: (exam: Exam) => void;
  onPreviewExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ exams, onCreateExam, onEditExam, onPreviewExam, onDeleteExam }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const topics = ['All', ...Array.from(new Set(exams.map(e => e.topic)))];

  const filteredExams = exams.filter(exam => {
    // 1. Search Query
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Topic Filter
    const matchesTopic = filterTopic === 'All' || exam.topic === filterTopic;

    // 3. Difficulty Filter
    const matchesDifficulty = filterDifficulty === 'All' || exam.difficulty === filterDifficulty;

    // 4. Date Range Filter
    let matchesDate = true;
    if (filterStartDate || filterEndDate) {
        const examDate = new Date(exam.createdAt).toISOString().split('T')[0]; // Compare using YYYY-MM-DD string
        if (filterStartDate && examDate < filterStartDate) matchesDate = false;
        if (filterEndDate && examDate > filterEndDate) matchesDate = false;
    }

    return matchesSearch && matchesTopic && matchesDifficulty && matchesDate;
  });

  const clearDateFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Soal Management</h1>
          <p className="text-gray-500">Input, edit, dan kelola paket soal untuk Calon PPDS.</p>
        </div>
        <button 
          onClick={onCreateExam}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-md flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Input Paket Soal Baru
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Paket Soal</p>
                <h3 className="text-2xl font-bold text-gray-900">{exams.length}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <ListOrdered size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Pertanyaan</p>
                <h3 className="text-2xl font-bold text-gray-900">
                    {exams.reduce((acc, curr) => acc + curr.questions.length, 0)}
                </h3>
            </div>
        </div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Clock size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Durasi Ujian</p>
                <h3 className="text-2xl font-bold text-gray-900">
                    {exams.reduce((acc, curr) => acc + curr.durationMinutes, 0)} <span className="text-sm font-normal text-gray-500">menit</span>
                </h3>
            </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-gray-50/50">
           <div className="relative w-full xl:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Cari berdasarkan judul..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
           </div>
           
           <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-600 hidden sm:inline">Filters:</span>
                </div>
                
                {/* Topic Filter */}
                <select 
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none min-w-[140px]"
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                >
                    {topics.map(t => <option key={t} value={t}>{t === 'All' ? 'Semua Topik' : t}</option>)}
                </select>

                {/* Difficulty Filter */}
                <select 
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none"
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                    <option value="All">Semua Tingkat</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>

                {/* Date Filter */}
                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <input 
                        type="date" 
                        className="px-2 py-1.5 text-sm text-gray-700 outline-none border-r border-gray-200 bg-transparent w-32"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        placeholder="Start Date"
                        title="Start Date"
                    />
                    <div className="px-1 text-gray-400">-</div>
                    <input 
                        type="date" 
                        className="px-2 py-1.5 text-sm text-gray-700 outline-none bg-transparent w-32"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        placeholder="End Date"
                        title="End Date"
                    />
                    {(filterStartDate || filterEndDate) && (
                        <button onClick={clearDateFilters} className="px-2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
           </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th scope="col" className="px-6 py-3">Judul Ujian</th>
                        <th scope="col" className="px-6 py-3">Topik & Kesulitan</th>
                        <th scope="col" className="px-6 py-3">Detail</th>
                        <th scope="col" className="px-6 py-3">Tanggal Dibuat</th>
                        <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredExams.length > 0 ? (
                        filteredExams.map((exam) => (
                            <tr key={exam.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0
                                            ${exam.thumbnailUrl ? '' : 'bg-indigo-500'}`}
                                        >
                                            {exam.thumbnailUrl ? (
                                                <img src={exam.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <FileText size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{exam.title}</div>
                                            <div className="text-xs text-gray-400 line-clamp-1">{exam.description.replace(/<[^>]*>/g, '').substring(0, 40)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-900 font-medium">{exam.topic}</span>
                                        <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium border
                                            ${exam.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' : 
                                              exam.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                                              'bg-red-50 text-red-700 border-red-100'}`}
                                        >
                                            {exam.difficulty}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <ListOrdered size={14} className="text-gray-400"/>
                                            {exam.questions.length} Soal
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-gray-400"/>
                                            {exam.durationMinutes} Menit
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(exam.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => onPreviewExam(exam)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Preview"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => onEditExam(exam)}
                                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(confirm('Are you sure you want to delete this exam?')) {
                                                    onDeleteExam(exam.id);
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Search size={32} className="text-gray-300" />
                                    <p>Tidak ada paket soal yang ditemukan.</p>
                                    <button onClick={() => {
                                        setSearchQuery('');
                                        setFilterTopic('All');
                                        setFilterDifficulty('All');
                                        clearDateFilters();
                                    }} className="text-indigo-600 hover:underline text-xs mt-1">
                                        Reset Filters
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;