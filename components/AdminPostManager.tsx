import React, { useState } from 'react';
import { AdminPost } from '../types';
import { Plus, Trash2, Edit, Eye, EyeOff, Save, X } from 'lucide-react';

interface AdminPostManagerProps {
  posts: AdminPost[];
  onUpdatePosts: (posts: AdminPost[]) => void;
}

const AdminPostManager: React.FC<AdminPostManagerProps> = ({ posts, onUpdatePosts }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<AdminPost>>({});
  
  const handleSave = () => {
    if (!currentPost.title || !currentPost.content) return;
    
    const newPost: AdminPost = {
      id: currentPost.id || `post_${Date.now()}`,
      title: currentPost.title,
      excerpt: currentPost.excerpt || '',
      content: currentPost.content,
      imageUrl: currentPost.imageUrl,
      createdAt: currentPost.createdAt || Date.now(),
      authorName: currentPost.authorName || 'Admin',
      published: currentPost.published ?? true
    };
    
    if (currentPost.id) {
      // Edit existing
      onUpdatePosts(posts.map(p => p.id === newPost.id ? newPost : p));
    } else {
      // Add new
      onUpdatePosts([newPost, ...posts]);
    }
    
    setIsEditing(false);
    setCurrentPost({});
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      onUpdatePosts(posts.filter(p => p.id !== id));
    }
  };
  
  const handleTogglePublish = (post: AdminPost) => {
    onUpdatePosts(posts.map(p => p.id === post.id ? { ...p, published: !p.published } : p));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-bold text-gray-900">Landing Page Posts</h2>
           <p className="text-gray-500 text-sm">Manage news and updates visible on the public landing page.</p>
        </div>
        <button 
          onClick={() => { setCurrentPost({}); setIsEditing(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> New Post
        </button>
      </div>
      
      {isEditing && (
        <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">{currentPost.id ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                 <input 
                    type="text" 
                    value={currentPost.title || ''} 
                    onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter post title"
                 />
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Short Description)</label>
                 <textarea 
                    value={currentPost.excerpt || ''} 
                    onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={2}
                    placeholder="Brief summary shown on card..."
                 />
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                 <textarea 
                    value={currentPost.content || ''} 
                    onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    rows={8}
                    placeholder="Write content here..."
                 />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                 <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Cancel</button>
                 <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <Save size={18} /> Save Post
                 </button>
              </div>
           </div>
        </div>
      )}
      
      <div className="space-y-4">
         {posts.length === 0 ? (
             <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                 No posts yet. Create one to share updates!
             </div>
         ) : (
             posts.map(post => (
                 <div key={post.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-bold text-gray-900">{post.title}</h4>
                           {!post.published && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">Draft</span>}
                           {post.published && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Published</span>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                        <div className="text-xs text-gray-400">
                           {new Date(post.createdAt).toLocaleDateString()} by {post.authorName}
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => handleTogglePublish(post)} className={`p-2 rounded-lg ${post.published ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={post.published ? "Unpublish" : "Publish"}>
                           {post.published ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button onClick={() => { setCurrentPost(post); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                           <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                           <Trash2 size={18} />
                        </button>
                     </div>
                 </div>
             ))
         )}
      </div>
    </div>
  );
};

export default AdminPostManager;
