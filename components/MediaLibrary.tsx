import React, { useMemo, useState } from 'react';
import {
  Search,
  Folder,
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Trash2,
  RotateCw,
  Crop,
  Maximize2,
  Filter,
  Tag,
  CheckSquare,
  X
} from 'lucide-react';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  folder: string;
  size: string;
  url: string;
  altText?: string;
  usedIn: number;
  lastUsed: string;
}

interface MediaLibraryProps {
  onSelect?: (item: MediaItem) => void;
  onClose?: () => void;
}

const MOCK_MEDIA: MediaItem[] = [
  {
    id: 'media-1',
    name: 'ECG-STEMI.png',
    type: 'image',
    folder: 'Cardiology',
    size: '320 KB',
    url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    altText: 'ECG with STEMI pattern',
    usedIn: 12,
    lastUsed: '2 days ago'
  },
  {
    id: 'media-2',
    name: 'Chest-Xray.mp4',
    type: 'video',
    folder: 'Pulmonology',
    size: '18 MB',
    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    altText: 'Chest X-ray tutorial video',
    usedIn: 4,
    lastUsed: '1 week ago'
  },
  {
    id: 'media-3',
    name: 'Guideline-HTN.pdf',
    type: 'document',
    folder: 'Guidelines',
    size: '1.2 MB',
    url: '#',
    altText: 'Hypertension guideline 2024',
    usedIn: 29,
    lastUsed: 'today'
  },
  {
    id: 'media-4',
    name: 'Neuro-CT.png',
    type: 'image',
    folder: 'Neurology',
    size: '540 KB',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    altText: 'Neuro CT scan',
    usedIn: 0,
    lastUsed: 'never'
  }
];

const folders = ['All Media', 'Cardiology', 'Pulmonology', 'Neurology', 'Guidelines', 'OSCE', 'Templates'];

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, onClose }) => {
  const [activeFolder, setActiveFolder] = useState('All Media');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(MOCK_MEDIA);

  const filteredItems = useMemo(() => {
    return mediaItems.filter(item => {
      const folderMatch = activeFolder === 'All Media' || item.folder === activeFolder;
      const typeMatch = filterType === 'all' || item.type === filterType;
      const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());
      return folderMatch && typeMatch && searchMatch;
    });
  }, [activeFolder, filterType, search, mediaItems]);

  const toggleSelect = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const removeUnused = () => {
    setMediaItems(prev => prev.filter(item => item.usedIn > 0));
    setSelected([]);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      name: file.name,
      type: file.type.includes('video') ? 'video' : file.type.includes('pdf') ? 'document' : 'image',
      folder: activeFolder === 'All Media' ? 'Uploads' : activeFolder,
      size: `${Math.round(file.size / 1024)} KB`,
      url: URL.createObjectURL(file),
      altText: '',
      usedIn: 0,
      lastUsed: 'just now'
    };
    setMediaItems(prev => [newItem, ...prev]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
            <p className="text-sm text-gray-500">Upload, organize, and reuse images, videos, and documents.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-0 min-h-[560px]">
          <aside className="col-span-3 border-r border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-3">
              <Folder size={14} /> Folders
            </div>
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    activeFolder === folder ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-white text-gray-600'
                  }`}
                >
                  {folder}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-xs font-bold text-gray-500 uppercase">Bulk actions</div>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-white">
                <Tag size={14} /> Apply tags
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-white">
                <Folder size={14} /> Move to folder
              </button>
              <button
                onClick={removeUnused}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete unused
              </button>
            </div>
          </aside>

          <section className="col-span-6 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm"
                  placeholder="Search media"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
                  value={filterType}
                  onChange={event => setFilterType(event.target.value as any)}
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                </select>
              </div>
            </div>

            <div
              onDragOver={event => event.preventDefault()}
              onDrop={handleDrop}
              className="mt-4 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500"
            >
              <Upload size={18} className="mx-auto mb-2 text-gray-400" />
              Drag & drop files here or click Upload to add assets
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    toggleSelect(item.id);
                    onSelect?.(item);
                  }}
                  className={`border rounded-xl p-3 text-left shadow-sm hover:shadow-md transition ${
                    selected.includes(item.id) ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase text-gray-400">{item.folder}</span>
                    <CheckSquare size={14} className={selected.includes(item.id) ? 'text-indigo-600' : 'text-gray-300'} />
                  </div>
                  <div className="h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.type === 'image' && <img src={item.url} alt={item.altText} className="w-full h-full object-cover" />}
                    {item.type === 'video' && <Video size={28} className="text-gray-400" />}
                    {item.type === 'document' && <FileText size={28} className="text-gray-400" />}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-gray-800 truncate">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.size} · Used {item.usedIn}x</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <aside className="col-span-3 border-l border-gray-200 p-5 bg-gray-50">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-3">
              <ImageIcon size={14} /> Asset detail
            </div>
            {selected.length === 0 ? (
              <div className="text-sm text-gray-500">Select media to view details and edit.</div>
            ) : (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="text-xs text-gray-400 uppercase">Alt text</div>
                  <input
                    className="w-full mt-2 border border-gray-200 rounded-md px-2 py-1 text-sm"
                    placeholder="Describe the image"
                  />
                </div>
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="text-xs text-gray-400 uppercase mb-2">Quick edits</div>
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-1 px-2 py-1 text-xs border rounded-lg">
                      <Crop size={12} /> Crop
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs border rounded-lg">
                      <Maximize2 size={12} /> Resize
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs border rounded-lg">
                      <RotateCw size={12} /> Rotate
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="text-xs text-gray-400 uppercase">Usage tracking</div>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    <li>Used in: 3 exams</li>
                    <li>Referenced in: 2 flashcards</li>
                    <li>Last used: yesterday</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="text-xs text-gray-400 uppercase">Bulk operations</div>
                  <div className="mt-2 text-sm text-gray-600">{selected.length} items selected</div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
