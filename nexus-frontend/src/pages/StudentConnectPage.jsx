import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdSchool, MdTrendingUp, MdPeople } from 'react-icons/md';

export default function StudentConnectPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillQuery, setSkillQuery] = useState('');
  const [skillResults, setSkillResults] = useState([]);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [suggestionsRes, trendingRes, tagsRes] = await Promise.all([
        api.get('/api/users/suggestions'),
        user?.college ? api.get(`/api/posts/trending?college=${encodeURIComponent(user.college)}`) : Promise.resolve({ data: { content: [] } }),
        api.get('/api/trending').catch(() => ({ data: [] }))
      ]);
      setSuggestions(suggestionsRes.data.content);
      setTrendingPosts(trendingRes.data.content);
      setTrendingTags(tagsRes.data);
    } catch (error) {
      console.error('Error fetching student connect data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSearch = async (e) => {
    e.preventDefault();
    if (!skillQuery.trim()) {
      setSkillResults([]);
      return;
    }
    setIsSearchingSkills(true);
    try {
      const res = await api.get(`/api/search?q=${encodeURIComponent(skillQuery)}&type=skills`);
      setSkillResults(res.data.content || []);
    } catch (error) {
      console.error('Error searching skills:', error);
    } finally {
      setIsSearchingSkills(false);
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
    <div className="flex flex-col gap-12 py-6 animate-fade-in-up aurora-bg">
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
          {/* Skill Match Discovery */}
          <section className="mb-8">
            <div className="clay-card p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
                  🎯 Skill Match Discovery
                </h2>
                <p className="text-dark-300">Find hackathon teammates, project partners, or study buddies by skill across any campus.</p>
              </div>
              <div className="flex-1 w-full relative">
                <form onSubmit={handleSkillSearch} className="relative w-full">
                  <input 
                    type="text" 
                    placeholder="Search for 'React', 'Java', 'UI/UX'..." 
                    className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-4 pl-6 pr-16 text-white focus:outline-none focus:border-aurora-cyan transition-colors"
                    value={skillQuery}
                    onChange={(e) => setSkillQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-2 top-2 bottom-2 bg-aurora-cyan hover:bg-aurora-cyan/80 text-dark-900 px-6 rounded-lg font-bold transition-colors">
                    {isSearchingSkills ? '...' : 'Find'}
                  </button>
                </form>
              </div>
            </div>

            {skillResults.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 text-aurora-cyan">Match Results:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {skillResults.map(student => (
                    <div key={student.id} className="clay-card p-5 flex flex-col items-center text-center gap-3 relative">
                      {student.openToConnect && (
                        <div className="absolute top-4 right-4 relative flex h-3 w-3" title="Open to Connect">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-pink opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-aurora-pink"></span>
                        </div>
                      )}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-aurora-cyan to-aurora-purple p-[2px]">
                        <img 
                          src={student.profileImage || `https://ui-avatars.com/api/?name=${student.username}&background=random`} 
                          alt={student.username}
                          className="w-full h-full rounded-full object-cover border-2 border-dark-900"
                        />
                      </div>
                      <div>
                        <Link to={`/profile/${student.username}`} className="font-bold text-white hover:text-aurora-cyan transition-colors">{student.fullName || student.username}</Link>
                        <span className="text-xs text-dark-300 block truncate w-full">{student.college}</span>
                        <div className="flex flex-wrap justify-center gap-1 mt-2">
                          {student.skills?.slice(0, 3).map(s => (
                            <span key={s} className="text-[10px] px-2 py-1 bg-white/5 rounded text-aurora-cyan">{s}</span>
                          ))}
                          {student.skills?.length > 3 && <span className="text-[10px] px-2 py-1 bg-white/5 rounded text-dark-300">+{student.skills.length - 3}</span>}
                        </div>
                      </div>
                      <Link to={`/messages`} state={{ newChat: student }} className="btn-aurora text-center text-sm w-full py-2 mt-auto">Connect</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

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
                  <Link to={`/messages`} state={{ newChat: student }} className="btn-aurora w-full mt-2 text-center py-2">Connect</Link>
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
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <MdTrendingUp className="text-aurora-pink" /> Hot on Campus
              </h2>
              <div className="bento-grid">
                {trendingPosts.map((post, i) => (
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
              {trendingPosts.length === 0 && (
                <div className="glass-panel text-center py-16 text-dark-400 flex flex-col items-center gap-4 mt-6">
                  <div className="text-5xl opacity-50">🔇</div>
                  <h3 className="text-xl font-bold text-white">The board is silent</h3>
                  <p>Be the first to start a trend on campus.</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                Trending Tags
              </h2>
              <div className="clay-card p-6 flex flex-col gap-4">
                {trendingTags.length > 0 ? trendingTags.map((t, i) => (
                  <div key={t.tag} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-aurora-cyan font-bold text-lg">#{i + 1}</span>
                      <span className="text-white font-medium">#{t.tag}</span>
                    </div>
                    <span className="text-xs text-dark-300 bg-dark-900/50 px-2 py-1 rounded-md">{t.count} posts</span>
                  </div>
                )) : (
                  <div className="text-center py-10 text-dark-400">
                    <p>No trending tags yet.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
