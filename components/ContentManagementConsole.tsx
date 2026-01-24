import React, { useState } from 'react';
import ContentEditor from './ContentEditor';
import MediaLibrary from './MediaLibrary';
import ContentVersionHistory from './ContentVersionHistory';
import ContentApprovalQueue from './ContentApprovalQueue';
import ContentTemplates from './ContentTemplates';
import ContentAnalytics from './ContentAnalytics';
import { LayoutGrid, Image as ImageIcon, History, CheckCircle, Layers, BarChart3 } from 'lucide-react';

const ContentManagementConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EDITOR' | 'MEDIA' | 'VERSIONS' | 'APPROVALS' | 'TEMPLATES' | 'ANALYTICS'>('EDITOR');
  const [content, setContent] = useState('');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Content Management System</h1>
        <p className="text-sm text-gray-500">Create, review, version, and publish content across Sinaesta.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => setActiveTab('EDITOR')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'EDITOR' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <LayoutGrid size={14} className="inline mr-1" /> Editor
          </button>
          <button onClick={() => setActiveTab('MEDIA')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'MEDIA' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <ImageIcon size={14} className="inline mr-1" /> Media Library
          </button>
          <button onClick={() => setActiveTab('VERSIONS')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'VERSIONS' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <History size={14} className="inline mr-1" /> Versions
          </button>
          <button onClick={() => setActiveTab('APPROVALS')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'APPROVALS' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <CheckCircle size={14} className="inline mr-1" /> Approvals
          </button>
          <button onClick={() => setActiveTab('TEMPLATES')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'TEMPLATES' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <Layers size={14} className="inline mr-1" /> Templates
          </button>
          <button onClick={() => setActiveTab('ANALYTICS')} className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === 'ANALYTICS' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <BarChart3 size={14} className="inline mr-1" /> Analytics
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'EDITOR' && (
          <div className="space-y-6">
            <ContentEditor
              label="Unified Content Editor"
              value={content}
              onChange={setContent}
              placeholder="Draft question stems, OSCE scenarios, and flashcards here..."
              onOpenMediaLibrary={() => setShowMediaLibrary(true)}
            />
            <ContentVersionHistory />
          </div>
        )}

        {activeTab === 'MEDIA' && (
          <div className="space-y-6">
            <button
              onClick={() => setShowMediaLibrary(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Open Media Library
            </button>
            <ContentTemplates />
          </div>
        )}

        {activeTab === 'VERSIONS' && <ContentVersionHistory />}
        {activeTab === 'APPROVALS' && <ContentApprovalQueue />}
        {activeTab === 'TEMPLATES' && <ContentTemplates />}
        {activeTab === 'ANALYTICS' && <ContentAnalytics />}
      </div>

      {showMediaLibrary && (
        <MediaLibrary
          onClose={() => setShowMediaLibrary(false)}
          onSelect={(item) => {
            setContent(prev => `${prev}<p><img src=\"${item.url}\" alt=\"${item.altText || item.name}\" /></p>`);
            setShowMediaLibrary(false);
          }}
        />
      )}
    </div>
  );
};

export default ContentManagementConsole;
