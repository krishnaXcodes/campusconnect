import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/post/PostCard';
import api from '../services/api';

export default function BookmarksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookmarks?page=0&size=50');
      const postIds = res.data.content || [];
      const postPromises = postIds.map((id) => api.get(`/api/posts/${id}`).catch(() => null));
      const results = await Promise.all(postPromises);
      setPosts(results.filter(Boolean).map((r) => r.data));
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Bookmarks</h1>
        <span className="text-sm text-dark-500">{posts.length} saved posts</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🔖</div>
          <h3 className="text-lg font-semibold mb-1">No bookmarks yet</h3>
          <p className="text-sm text-dark-500">Save posts to find them here later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => <PostCard key={post.id} post={post} onVote={fetchBookmarks} onBookmark={fetchBookmarks} />)}
        </div>
      )}
    </div>
  );
}
