import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import PostCard from '../components/post/PostCard';
import AvatarInitials from '../components/AvatarInitials';

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchPost(); 
    fetchComments(); 
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/api/posts/${id}`);
      setPost(res.data);
    } catch { 
      toast.error('Post not found'); 
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/posts/${id}/comments`);
      setComments(res.data.content || []);
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/api/posts/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments(); 
      fetchPost();
      toast.success('Comment added!');
    } catch { 
      toast.error('Failed to comment'); 
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-aurora font-bold">Loading Post...</div>;
  if (!post) return <div className="p-20 text-center text-dark-400">Post not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 animate-fade-in-up">
      {/* Post */}
      <div className="w-full h-[600px] mb-8">
        <PostCard post={post} sizeClass="h-full" />
      </div>

      {/* Comments Section */}
      <div className="clay-card p-6 mt-8">
        <h3 className="text-xl font-bold text-white mb-6">Comments ({comments.length})</h3>
        
        {user && (
          <form onSubmit={handleComment} className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-dark-800 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
               <AvatarInitials name={user.username} size="100%" />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-white placeholder-dark-400 focus:outline-none focus:border-aurora-cyan resize-none"
                placeholder="Add a comment..."
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <button type="submit" className="btn-aurora text-sm py-1.5 px-4" disabled={!newComment.trim()}>
                  Post
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-dark-400 py-4">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-dark-800 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                  {comment.authorProfileImage ? (
                    <img src={comment.authorProfileImage} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <AvatarInitials name={comment.authorUsername} size="100%" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-dark-900/50 rounded-2xl rounded-tl-none p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{comment.authorUsername}</span>
                      <span className="text-xs text-dark-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-dark-100 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
