import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiMoreHorizontal } from 'react-icons/fi';
import { FaHeart, FaBookmark } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PostCard({ post, sizeClass }) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  
  const handleLike = async (e) => {
    e.preventDefault();
    try {
      if (liked) {
        await api.delete(`/api/posts/${post.id}/like`);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await api.post(`/api/posts/${post.id}/like`);
        setLikeCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    try {
      if (bookmarked) {
        await api.delete(`/api/posts/${post.id}/bookmark`);
      } else {
        await api.post(`/api/posts/${post.id}/bookmark`);
      }
      setBookmarked(!bookmarked);
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;

  return (
    <Link to={`/post/${post.id}`} className={`glass-interactive flex flex-col overflow-hidden relative group ${sizeClass}`}>
      
      {/* Background Image / Solid Area */}
      {hasMedia ? (
        <img 
          src={post.mediaUrls[0]} 
          alt="Post content" 
          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 z-0 flex items-center justify-center p-6 text-xl md:text-2xl font-medium text-center text-balance leading-relaxed">
          {post.caption}
        </div>
      )}

      {/* Dark Overlay for media */}
      {hasMedia && <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent z-0"></div>}
      
      {/* "Why this post?" Mini Tag */}
      {post.feedReason && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 glass-panel text-[10px] font-bold uppercase tracking-wider text-aurora-cyan rounded-full shadow-none border-none bg-dark-900/40 backdrop-blur-md">
          {post.feedReason === 'CAMPUS_TRENDING' ? 'Campus' : 'Suggested'}
        </div>
      )}

      {/* Content Overlay (Bottom) */}
      <div className="relative z-10 mt-auto p-5 flex flex-col gap-3">
        
        {/* Caption for Media Posts */}
        {hasMedia && (
          <p className="text-sm md:text-base font-medium line-clamp-2 drop-shadow-md">
            {post.caption}
          </p>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.authorUsername}`} onClick={e => e.stopPropagation()} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-aurora-cyan transition-colors">
              <img 
                src={post.authorProfileImage || `https://ui-avatars.com/api/?name=${post.authorUsername}&background=random`} 
                alt={post.authorUsername}
                className="w-full h-full object-cover"
              />
            </Link>
            <div className="flex flex-col">
              <Link to={`/profile/${post.authorUsername}`} onClick={e => e.stopPropagation()} className="font-bold text-sm hover:text-aurora-cyan transition-colors drop-shadow">
                {post.authorUsername}
              </Link>
              <span className="text-[11px] text-white/60 font-medium">
                {post.location || 'CampusConnect'}
              </span>
            </div>
          </div>

          {/* Actions - Visible on hover desktop, always visible mobile */}
          <div className="flex items-center gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={handleLike} className="p-2 rounded-full glass-panel hover:bg-white/10 hover:text-aurora-pink transition-all">
              {liked ? <FaHeart className="text-aurora-pink" size={18} /> : <FiHeart size={18} />}
            </button>
            <button onClick={handleBookmark} className="p-2 rounded-full glass-panel hover:bg-white/10 hover:text-aurora-blue transition-all">
              {bookmarked ? <FaBookmark className="text-aurora-blue" size={18} /> : <FiBookmark size={18} />}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs font-semibold text-white/60">
          <span className="flex items-center gap-1.5"><FiHeart size={14} /> {likeCount}</span>
          <span className="flex items-center gap-1.5"><FiMessageCircle size={14} /> {post.commentCount}</span>
        </div>
      </div>

    </Link>
  );
}
