import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiGrid, FiBookmark, FiSettings, FiHeart, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); 

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const searchRes = await api.get(`/api/search?q=${username}&type=users`);
      const userMatch = searchRes.data.content.find(u => u.username === username);
      
      if (!userMatch) {
        toast.error("User not found");
        return;
      }

      const [profileRes, postsRes] = await Promise.all([
        api.get(`/api/users/${userMatch.id}`),
        api.get(`/api/posts/user/${userMatch.id}`)
      ]);

      setProfile(profileRes.data);
      setPosts(postsRes.data.content);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (profile.isFollowing) {
        await api.delete(`/api/users/${profile.id}/follow`);
        setProfile(p => ({ ...p, isFollowing: false, followerCount: p.followerCount - 1 }));
      } else {
        await api.post(`/api/users/${profile.id}/follow`);
        setProfile(p => ({ ...p, isFollowing: true, followerCount: p.followerCount + 1 }));
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-aurora text-xl font-bold">Loading Identity...</div>;
  if (!profile) return <div className="p-20 text-center text-dark-400">Identity not found in the Nexus.</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 flex flex-col gap-8 animate-fade-in-up">
      
      {/* Portfolio Header (Glass Panel) */}
      <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
        {/* Subtle decorative aurora glow behind profile picture */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-cyan/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-aurora-blue to-aurora-purple shadow-[0_0_30px_rgba(138,43,226,0.3)]">
            <img 
              src={profile.profileImage || `https://ui-avatars.com/api/?name=${profile.username}&background=random`} 
              alt={profile.username}
              className="w-full h-full rounded-full object-cover border-4 border-dark-900"
            />
          </div>
          
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">{profile.fullName || profile.username}</h1>
                <p className="text-aurora font-medium text-lg">@{profile.username}</p>
              </div>
              <div className="flex gap-3">
                {isOwnProfile ? (
                  <>
                    <button className="btn-aurora">Edit Profile</button>
                    <button className="btn-aurora px-4"><FiSettings size={20} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={handleFollow} className={profile.isFollowing ? 'btn-aurora' : 'btn-aurora-primary'}>
                      {profile.isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="btn-aurora">Message</button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-6 mt-2">
              <div className="text-center md:text-left"><span className="text-xl font-bold text-white block">{profile.postCount}</span> <span className="text-xs text-dark-300 uppercase tracking-wider">Posts</span></div>
              <div className="text-center md:text-left"><span className="text-xl font-bold text-white block">{profile.followerCount}</span> <span className="text-xs text-dark-300 uppercase tracking-wider">Followers</span></div>
              <div className="text-center md:text-left"><span className="text-xl font-bold text-white block">{profile.followingCount}</span> <span className="text-xs text-dark-300 uppercase tracking-wider">Following</span></div>
            </div>

            {profile.bio && <p className="text-dark-100 max-w-2xl leading-relaxed mt-2">{profile.bio}</p>}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.college && <span className="px-3 py-1 glass-panel text-xs font-semibold text-aurora-cyan">🎓 {profile.college}</span>}
              {profile.department && <span className="px-3 py-1 glass-panel text-xs font-semibold text-aurora-cyan">📚 {profile.department}</span>}
              {profile.skills && <span className="px-3 py-1 glass-panel text-xs font-semibold text-aurora-purple">💻 {profile.skills}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`btn-aurora flex items-center gap-2 ${activeTab === 'posts' ? 'border-aurora-cyan/50 shadow-[0_0_15px_rgba(0,210,255,0.2)]' : 'border-transparent'}`}
        >
          <FiGrid /> Portfolio
        </button>
        {isOwnProfile && (
          <button 
            onClick={() => setActiveTab('saved')}
            className={`btn-aurora flex items-center gap-2 ${activeTab === 'saved' ? 'border-aurora-purple/50 shadow-[0_0_15px_rgba(138,43,226,0.2)]' : 'border-transparent'}`}
          >
            <FiBookmark /> Vault
          </button>
        )}
      </div>

      {/* Bento Grid Gallery */}
      <div className="bento-grid">
        {posts.map((post, i) => (
          <Link key={post.id} to={`/post/${post.id}`} className={`glass-interactive group overflow-hidden relative block ${i % 3 === 0 ? 'bento-grid-item-large' : ''}`}>
            {post.mediaUrls && post.mediaUrls.length > 0 ? (
              <img 
                src={post.mediaUrls[0]} 
                alt="Post" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6 text-center text-lg md:text-xl font-medium">
                {post.caption?.substring(0, 60)}...
              </div>
            )}
            
            {/* Dark Hover Overlay */}
            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4">
              <p className="text-white text-center px-4 line-clamp-3 font-medium text-sm">{post.caption}</p>
              <div className="flex gap-6 text-aurora font-bold text-lg">
                <span className="flex items-center gap-2"><FiHeart /> {post.likeCount}</span>
                <span className="flex items-center gap-2"><FiMessageCircle /> {post.commentCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {posts.length === 0 && (
        <div className="glass-panel text-center py-20 text-dark-400">
          No entries found in the data core.
        </div>
      )}
    </div>
  );
}
