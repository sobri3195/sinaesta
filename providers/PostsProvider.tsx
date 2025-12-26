import React, { createContext, useContext, useMemo, useState } from 'react';
import { AdminPost } from '../types';

interface PostsContextValue {
  posts: AdminPost[];
  setPosts: React.Dispatch<React.SetStateAction<AdminPost[]>>;
}

const PostsContext = createContext<PostsContextValue | undefined>(undefined);

const initialPosts: AdminPost[] = [
  {
    id: 'post_1',
    title: 'Pendaftaran PPDS Periode Juli 2025 Dibuka',
    excerpt: 'Simak jadwal lengkap dan persyaratan terbaru untuk seleksi penerimaan peserta didik baru.',
    content: 'Detailed content here...',
    createdAt: Date.now() - 86400000 * 2,
    authorName: 'Admin Akademik',
    published: true
  },
  {
    id: 'post_2',
    title: 'Fitur Baru: Virtual OSCE dengan AI',
    excerpt: 'Latihan ujian lisan kini lebih realistis dengan feedback otomatis dari model AI terbaru kami.',
    content: 'Detailed content here...',
    createdAt: Date.now() - 86400000 * 5,
    authorName: 'Tim Teknis',
    published: true
  }
];

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<AdminPost[]>(initialPosts);

  const value = useMemo(() => ({ posts, setPosts }), [posts]);

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within PostsProvider');
  }
  return context;
};
