import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StoryBar from '../components/story/StoryBar';
import PostCard from '../components/post/PostCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (user) fetchFeed();
  }, [user]);

  const fetchFeed = async () => {
    try {
      const res = await api.get(`/api/posts/feed?page=${page}`);
      setPosts(prev => [...prev, ...res.data.content]);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine bento grid sizes for visual variety
  const getBentoSize = (post, index) => {
    const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
    if (!hasMedia) return ''; // Standard square for text
    
    // Pattern for variety: Every 5th post with media is large
    if (index % 5 === 0) return 'bento-grid-item-large';
    // Every 7th post with media is wide
    if (index % 7 === 0) return 'bento-grid-item-wide';
    
    return '';
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* Modern Story/Campus Bar */}
      <div className="glass-panel p-2">
        <StoryBar />
      </div>
      
      {/* Bento Grid Feed */}
      <div>
        {loading && posts.length === 0 ? (
          <div className="bento-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`glass-panel animate-pulse ${i % 4 === 0 ? 'bento-grid-item-large' : ''}`} />
            ))}
          </div>
        ) : (
          <div className="bento-grid">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} sizeClass={getBentoSize(post, i)} />
            ))}
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="glass-panel text-center py-20 mt-10">
            <h2 className="text-3xl font-bold text-aurora mb-4">Welcome to CampusConnect</h2>
            <p className="text-dark-300">Your feed is empty. Follow students from other campuses and start connecting!</p>
            <Link to="/students" className="btn-aurora-primary mt-8 inline-block">Find Connections</Link>
          </div>
        )}
      </div>
    </div>
  );
}
