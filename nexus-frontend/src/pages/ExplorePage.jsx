import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiHeart, FiMessageCircle, FiCompass } from 'react-icons/fi';

export default function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExplore();
  }, []);

  const fetchExplore = async () => {
    try {
      const res = await api.get('/api/posts/explore');
      setPosts(res.data.content);
    } catch (error) {
      console.error('Error fetching explore:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-6 animate-fade-in-up">
      <div className="glass-panel p-8 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-aurora-cyan/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white mb-2">
            <FiCompass className="text-aurora-cyan" /> Discover
          </h1>
          <p className="text-aurora font-medium">Discover students and trending posts across campuses.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="bento-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`glass-panel animate-pulse ${i % 5 === 0 ? 'bento-grid-item-large' : ''}`} />
          ))}
        </div>
      ) : (
        <div className="bento-grid">
          {posts.map((post, i) => (
            <Link key={post.id} to={`/post/${post.id}`} className={`glass-interactive group overflow-hidden relative block ${i % 5 === 0 ? 'bento-grid-item-large' : i % 7 === 0 ? 'bento-grid-item-wide' : ''}`}>
              {post.mediaUrls && post.mediaUrls.length > 0 ? (
                <img 
                  src={post.mediaUrls[0]} 
                  alt="Explore post" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-6 text-center text-lg md:text-xl font-medium text-white/80">
                  {post.caption?.substring(0, 60)}...
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-6 text-aurora font-bold text-xl">
                <div className="flex items-center gap-2 drop-shadow-md">
                  <FiHeart />
                  <span>{post.likeCount}</span>
                </div>
                <div className="flex items-center gap-2 drop-shadow-md">
                  <FiMessageCircle />
                  <span>{post.commentCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
