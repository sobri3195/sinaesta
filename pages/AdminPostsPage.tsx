import React from 'react';
import AdminPostManager from '../components/AdminPostManager';
import { usePosts } from '../providers/PostsProvider';

const AdminPostsPage: React.FC = () => {
  const { posts, setPosts } = usePosts();

  return (
    <div className="p-8 overflow-y-auto h-full">
      <AdminPostManager posts={posts} onUpdatePosts={setPosts} />
    </div>
  );
};

export default AdminPostsPage;
