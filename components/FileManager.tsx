import React, { useState, useEffect } from 'react';
import {
  Folder,
  Image as ImageIcon,
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAuthStore } from '../stores/authStore';

interface FileMetadata {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  category: string;
  url: string;
  uploadedAt: number;
  contextId?: string;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<string, { count: number; size: number }>;
}

export const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const user = useAuthStore(state => state.user);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<any>(`/files?limit=100`, {
        headers: {
          'X-User-Id': user?.id,
          'X-User-Role': user?.role,
          'X-User-Name': user?.name,
        },
      });

      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<any>(`/stats`, {
        headers: {
          'X-User-Id': user?.id,
          'X-User-Role': user?.role,
          'X-User-Name': user?.name,
        },
      });

      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const data = await apiClient.delete<any>(`/files/${fileId}`, {
        headers: {
          'X-User-Id': user?.id,
          'X-User-Role': user?.role,
          'X-User-Name': user?.name,
        },
      });

      if (data.success || data.message) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        setSelectedFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
        fetchStats();
      }
    } catch (error: any) {
      alert('Failed to delete file: ' + (error.message || 'Unknown error'));
    }
  };

  const deleteBulk = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Delete ${selectedFiles.size} selected file(s)?`)) return;

    const promises = Array.from(selectedFiles).map(fileId => deleteFile(fileId));
    await Promise.all(promises);
    setSelectedFiles(new Set());
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(files.map(f => f.category))];

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Folder className="w-7 h-7 text-indigo-600" />
          File Manager
        </h1>
        <p className="text-gray-600 mt-1">Kelola file yang diunggah dan penyimpanan</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalFiles}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total File</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-lg text-green-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{formatBytes(stats.totalSize)}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Penyimpanan</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.byCategory.image?.count || 0}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Gambar</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {(stats.byCategory.document?.count || 0) +
                    (stats.byCategory.template?.count || 0)}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Dokumen</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari file..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Semua Kategori' : cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              fetchFiles();
              fetchStats();
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {selectedFiles.size > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-sm font-medium text-indigo-900">
              {selectedFiles.size} file dipilih
            </p>
            <button
              onClick={deleteBulk}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Terpilih
            </button>
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="px-3 py-1 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-bold transition-colors"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-4" />
            <p className="text-gray-500 font-medium">Memuat file...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 font-medium">Tidak ada file ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Ukuran
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Tanggal Unggah
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                          {file.mimeType?.startsWith('image/') ? (
                            <img src={file.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getFileIcon(file.mimeType)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{file.originalName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{file.filename}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                        {file.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {formatBytes(file.size)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
