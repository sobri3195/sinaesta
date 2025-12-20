import React from 'react';
import { X, Calendar, User } from 'lucide-react';
import { AdminPost } from '../types';

interface PostDetailModalProps {
  post: AdminPost;
  isOpen: boolean;
  onClose: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">{post.title}</h2>
            <button 
              onClick={onClose} 
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-88px)]">
          {post.imageUrl && (
            <div className="mb-6">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(post.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {post.content ? (
              post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;