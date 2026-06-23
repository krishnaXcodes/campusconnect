import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi2';
import { HiOutlineBookmark, HiBookmark, HiOutlineShare, HiOutlineExternalLink, HiOutlineCheckCircle, HiOutlineReply } from 'react-icons/hi';
import { formatTimeAgo, formatNumber, getPostTypeLabel, getPostTypeColor, getLevelBadgeClass } from '../utils/helpers';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPost(); fetchComments(); }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/api/posts/${id}`);
      setPost(res.data);
    } catch { toast.error('Post not found'); }
    setLoading(false);
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/posts/${id}/comments`);
      setComments(res.data);
    } catch {}
  };

  const handleVote = async (type) => {
    if (!user) return toast.error('Please login');
    try { await api.post(`/api/votes/post/${id}`, { voteType: type }); fetchPost(); } catch { toast.error('Failed to vote'); }
  };

  const handleBookmark = async () => {
    if (!user) return toast.error('Please login');
    try { await api.post(`/api/bookmarks/${id}`); fetchPost(); } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/api/posts/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments(); fetchPost();
      toast.success('Comment added!');
    } catch { toast.error('Failed to comment'); }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    try {
      await api.post(`/api/posts/${id}/comments`, { content: replyContent, parentId });
      setReplyContent(''); setReplyTo(null);
      fetchComments(); fetchPost();
    } catch { toast.error('Failed to reply'); }
  };

  const handleCommentVote = async (commentId, type) => {
    if (!user) return toast.error('Please login');
    try { await api.post(`/api/votes/comment/${commentId}`, { voteType: type }); fetchComments(); } catch {}
  };

  const handleBestAnswer = async (commentId) => {
    try { await api.put(`/api/comments/${commentId}/best-answer`); fetchComments(); toast.success('Best answer marked! 🏆'); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handlePollVote = async (pollId, optionId) => {
    if (!user) return toast.error('Please login');
    try { await api.post(`/api/polls/${pollId}/vote`, { optionId }); fetchPost(); toast.success('Vote recorded!'); } catch (err) { toast.error(err.response?.data?.message || 'Already voted'); }
  };

  const CommentItem = ({ comment, depth = 0 }) => (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-dark-200 dark:border-dark-700' : ''}`} id={`comment-${comment.id}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 text-xs text-dark-500 mb-1.5">
          <Link to={`/profile/${comment.authorId}`} className="font-semibold text-dark-700 dark:text-dark-300 hover:text-primary-500">{comment.authorUsername}</Link>
          <span>•</span>
          <span>{formatTimeAgo(comment.createdAt)}</span>
          {comment.bestAnswer && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-semibold text-[10px]">✓ Best Answer</span>}
        </div>
        <p className="text-sm text-dark-800 dark:text-dark-200 leading-relaxed">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => handleCommentVote(comment.id, 'UPVOTE')} className={`vote-btn p-1 ${comment.userVote === 'UPVOTE' ? 'text-primary-500' : 'text-dark-400'}`}><HiArrowUp className="w-4 h-4" /></button>
          <span className="text-xs font-bold">{comment.score}</span>
          <button onClick={() => handleCommentVote(comment.id, 'DOWNVOTE')} className={`vote-btn p-1 ${comment.userVote === 'DOWNVOTE' ? 'text-red-500' : 'text-dark-400'}`}><HiArrowDown className="w-4 h-4" /></button>
          {user && <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-xs text-dark-500 hover:text-primary-500 flex items-center gap-1"><HiOutlineReply className="w-3.5 h-3.5" /> Reply</button>}
          {user && post?.postType === 'QUESTION' && post?.authorId === user.userId && !comment.bestAnswer && (
            <button onClick={() => handleBestAnswer(comment.id)} className="text-xs text-green-500 hover:text-green-600 flex items-center gap-1"><HiOutlineCheckCircle className="w-3.5 h-3.5" /> Mark Best</button>
          )}
        </div>
        {replyTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <input value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="input-field text-sm flex-1" placeholder="Write a reply..." />
            <button onClick={() => handleReply(comment.id)} className="btn-primary text-sm px-4">Reply</button>
          </div>
        )}
      </div>
      {comment.replies?.map((reply) => <CommentItem key={reply.id} comment={reply} depth={depth + 1} />)}
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return null;

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Post */}
      <div className="glass-card animate-fade-in">
        <div className="flex">
          <div className="flex flex-col items-center gap-1 p-4 pr-0">
            <button onClick={() => handleVote('UPVOTE')} className={`vote-btn ${post.userVote === 'UPVOTE' ? 'vote-btn-active-up' : ''}`}><HiArrowUp className="w-6 h-6" /></button>
            <span className={`text-lg font-bold ${post.score > 0 ? 'text-primary-500' : post.score < 0 ? 'text-red-500' : 'text-dark-500'}`}>{post.score}</span>
            <button onClick={() => handleVote('DOWNVOTE')} className={`vote-btn ${post.userVote === 'DOWNVOTE' ? 'vote-btn-active-down' : ''}`}><HiArrowDown className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 p-5 pl-3">
            <div className="flex items-center gap-2 text-xs text-dark-500 mb-3 flex-wrap">
              <Link to={`/community/${post.communityId}`} className="font-semibold text-dark-700 dark:text-dark-300 hover:text-primary-500">{post.communityName}</Link>
              <span>•</span>
              <Link to={`/profile/${post.authorId}`} className="hover:text-primary-500">{post.authorUsername}</Link>
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getPostTypeColor(post.postType)}`}>{getPostTypeLabel(post.postType)}</span>
            </div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">{post.title}</h1>
            {post.content && <div className="text-dark-700 dark:text-dark-300 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</div>}
            {post.imageUrl && <img src={post.imageUrl} alt="" className="rounded-lg max-h-96 object-cover mb-4" />}

            {/* Project Showcase */}
            {post.postType === 'PROJECT_SHOWCASE' && post.projectName && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30 mb-4">
                <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-2">🚀 {post.projectName}</h3>
                {post.techStack && <p className="text-sm text-dark-600 dark:text-dark-400 mb-3">Tech: {post.techStack}</p>}
                <div className="flex gap-4">
                  {post.githubUrl && <a href={post.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm flex items-center gap-1.5"><HiOutlineExternalLink className="w-4 h-4" /> GitHub</a>}
                  {post.liveDemoUrl && <a href={post.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm flex items-center gap-1.5"><HiOutlineExternalLink className="w-4 h-4" /> Live Demo</a>}
                </div>
              </div>
            )}

            {/* Poll */}
            {post.postType === 'POLL' && post.poll && (
              <div className="space-y-2 mb-4">
                {post.poll.options?.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => !post.poll.userVotedOptionId && handlePollVote(post.poll.id, opt.id)}
                    disabled={!!post.poll.userVotedOptionId}
                    className={`relative w-full overflow-hidden rounded-xl p-3 text-left transition-all ${post.poll.userVotedOptionId === opt.id ? 'ring-2 ring-primary-500' : 'hover:bg-dark-100 dark:hover:bg-dark-800'} bg-dark-50 dark:bg-dark-800`}
                  >
                    <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 transition-all" style={{ width: `${opt.percentage || 0}%` }} />
                    <div className="relative flex justify-between text-sm font-medium">
                      <span>{opt.optionText} {post.poll.userVotedOptionId === opt.id && '✓'}</span>
                      <span className="text-dark-500">{Math.round(opt.percentage || 0)}%</span>
                    </div>
                  </button>
                ))}
                <p className="text-xs text-dark-500 mt-2">{post.poll.totalVotes} total votes</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-dark-200/50 dark:border-dark-700/50">
              <span className="text-sm text-dark-500">{post.commentCount} comments</span>
              <button onClick={handleBookmark} className="flex items-center gap-1.5 text-sm text-dark-500 hover:text-primary-500 transition-colors">
                {post.bookmarked ? <HiBookmark className="w-4 h-4 text-primary-500" /> : <HiOutlineBookmark className="w-4 h-4" />}
                {post.bookmarked ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleComment} className="glass-card p-4" id="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input-field min-h-[80px] resize-y"
            placeholder="Share your thoughts..."
            id="comment-input"
          />
          <div className="flex justify-end mt-3">
            <button type="submit" className="btn-primary text-sm" id="submit-comment">Comment</button>
          </div>
        </form>
      )}

      {/* Comments */}
      <div className="glass-card p-4">
        <h3 className="font-bold text-dark-800 dark:text-dark-200 mb-4">Comments ({comments.length})</h3>
        {comments.length === 0 ? (
          <p className="text-sm text-dark-500 text-center py-6">No comments yet. Be the first!</p>
        ) : (
          <div className="divide-y divide-dark-200/50 dark:divide-dark-700/50">
            {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
