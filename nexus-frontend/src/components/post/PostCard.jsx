import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiMoreHorizontal, FiTrash2 } from 'react-icons/fi';
import { FaHeart, FaBookmark } from 'react-icons/fa';
import AvatarInitials from '../AvatarInitials';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function PostCard({ post, sizeClass, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [showSettings, setShowSettings] = useState(false);
  
  const isAuthor = user?.username === post.authorUsername || user?.role === 'ADMIN';

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/${post.id}`);
        toast.success('Post deleted successfully');
        if (onDelete) onDelete(post.id);
        else window.location.reload();
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.stopPropagation();
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
    <Link to={`/post/${post.id}`} className={`clay-card flex flex-col overflow-hidden relative group ${sizeClass}`}>
      
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
        <div className="absolute top-4 left-4 z-10 px-3 py-1 glass-panel text-[10px] font-bold uppercase tracking-wider text-aurora-cyan rounded-full shadow-none border-none bg-dark-900/40 backdrop-blur-md">
          {post.feedReason === 'CAMPUS_TRENDING' ? 'Campus' : 'Suggested'}
        </div>
      )}

      {/* Post Settings / Delete Option (Only for Author/Admin) */}
      {isAuthor && (
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSettings(!showSettings); }}
            className="p-2 glass-panel rounded-full hover:bg-white/10 transition-colors backdrop-blur-md"
          >
            <FiMoreHorizontal className="text-white" />
          </button>
          
          {showSettings && (
            <div className="absolute top-full right-0 mt-2 w-32 glass-panel rounded-xl shadow-xl border border-white/10 overflow-hidden animate-fade-in-up">
              <button 
                onClick={handleDelete}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <FiTrash2 size={16} /> Delete
              </button>
            </div>
          )}
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
            <Link to={`/profile/${post.authorUsername}`} onClick={e => e.stopPropagation()} className="transition-transform hover:scale-105">
              {post.authorProfileImage ? (
                <img 
                  src={post.authorProfileImage} 
                  alt={post.authorUsername}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <AvatarInitials name={post.authorFullName || post.authorUsername} size={40} />
              )}
            </Link>
            <div className="flex flex-col">
              <Link to={`/profile/${post.authorUsername}`} onClick={e => e.stopPropagation()} className="font-bold text-sm hover:text-aurora-cyan transition-colors drop-shadow">
                {post.authorFullName || post.authorUsername} {post.campusVerified && <span className="verified-badge ml-1">🎓</span>}
              </Link>
              <span className="text-[11px] text-white/60 font-medium">
                {post.college || post.location || 'CampusConnect'}
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
