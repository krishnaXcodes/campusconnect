import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdSchool, MdTrendingUp, MdPeople } from 'react-icons/md';

export default function StudentConnectPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [suggestionsRes, trendingRes] = await Promise.all([
        api.get('/api/users/suggestions'),
        user?.college ? api.get(`/api/posts/trending?college=${encodeURIComponent(user.college)}`) : Promise.resolve({ data: { content: [] } })
      ]);
      setSuggestions(suggestionsRes.data.content);
      setTrending(trendingRes.data.content);
    } catch (error) {
      console.error('Error fetching student connect data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.college) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="glass-panel max-w-lg w-full p-10 text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-blue flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,210,255,0.4)]">
            <MdSchool size={40} className="text-dark-900" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">Campus Discovery Hub</h1>
          <p className="text-dark-300 mb-8 leading-relaxed">Update your profile with your college and department to discover students from other campuses, find trending posts, and expand your network.</p>
          <Link to={`/profile/${user?.username}`} className="btn-aurora-primary w-full block py-3">Add Your Campus</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 py-6 animate-fade-in-up">
      {/* Header */}
      <div className="glass-panel p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-aurora-purple/20 blur-[60px] rounded-full pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white mb-2">
            <MdSchool className="text-aurora-purple" /> {user.college} Network
          </h1>
          <p className="text-aurora font-medium text-lg">Find and connect with students across campuses</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-6 py-4 text-center">
            <div className="text-2xl font-bold text-white">{suggestions.length}</div>
            <div className="text-xs uppercase tracking-wider text-dark-400">Peers Online</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-aurora text-xl animate-pulse">Finding campus connections...</div>
      ) : (
        <>
          {/* Peer Nodes (Suggested Students) */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <MdPeople className="text-aurora-cyan" /> Campus Peers
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-6 hide-scroll snap-x">
              {suggestions.map((student) => (
                <div key={student.id} className="snap-center shrink-0 w-64 glass-interactive p-6 flex flex-col items-center text-center gap-4">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-aurora-cyan to-aurora-blue">
                    <img 
                      src={student.profileImage || `https://ui-avatars.com/api/?name=${student.username}&background=random`} 
                      alt={student.username}
                      className="w-full h-full rounded-full object-cover border-2 border-dark-800"
                    />
                  </div>
                  <div>
                    <Link to={`/profile/${student.username}`} className="font-bold text-lg hover:text-aurora-cyan transition-colors text-white block truncate w-full">{student.fullName || student.username}</Link>
                    <span className="text-sm text-aurora-cyan/80 block">{student.department || 'Undergrad'}</span>
                  </div>
                  <button className="btn-aurora w-full mt-2">Connect</button>
                </div>
              ))}
              {suggestions.length === 0 && (
                <div className="glass-panel w-full text-center py-12 text-dark-400">
                  No students found from other campuses yet. Invite your friends!
                </div>
              )}
            </div>
          </section>

          {/* Campus Trending Board */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <MdTrendingUp className="text-aurora-pink" /> Trending Board
            </h2>
            <div className="bento-grid">
              {trending.map((post, i) => (
                <Link key={post.id} to={`/post/${post.id}`} className={`glass-interactive group overflow-hidden relative block ${i % 4 === 0 ? 'bento-grid-item-large' : ''}`}>
                  {post.mediaUrls && post.mediaUrls.length > 0 ? (
                    <img 
                      src={post.mediaUrls[0]} 
                      alt="Trending" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-center text-xl font-medium">
                      {post.caption?.substring(0, 60)}...
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent opacity-80 flex flex-col justify-end p-6">
                    <span className="text-aurora-pink font-bold uppercase tracking-wider text-xs mb-2">🔥 Hot Topic</span>
                    <span className="text-white font-medium text-sm line-clamp-2">{post.caption}</span>
                    <span className="text-dark-300 text-xs mt-2">By @{post.authorUsername} • {post.likeCount} likes</span>
                  </div>
                </Link>
              ))}
            </div>
            {trending.length === 0 && (
              <div className="glass-panel text-center py-16 text-dark-400">
                The trending board is currently silent.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
