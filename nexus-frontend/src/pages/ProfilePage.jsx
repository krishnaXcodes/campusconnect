import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiGrid, FiBookmark, FiSettings, FiHeart, FiMessageCircle, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AvatarInitials from '../components/AvatarInitials';
import FollowListModal from '../components/FollowListModal';
import EditProfileModal from '../components/EditProfileModal';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); 
  const [followModal, setFollowModal] = useState({ isOpen: false, type: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const profileRes = await api.get(`/api/users/username/${username}`);
      const fetchedProfile = profileRes.data;
      
      const postsRes = await api.get(`/api/posts/user/${fetchedProfile.id}`);

      setProfile(fetchedProfile);
      setPosts(postsRes.data.content);
    } catch (error) {
      toast.error("Identity not found");
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
  if (!profile) return <div className="p-20 text-center text-dark-400">Identity not found in CampusConnect.</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 flex flex-col gap-8 animate-fade-in-up">
      
      {/* Portfolio Header (Glass Panel) */}
      <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
        {/* Subtle decorative aurora glow behind profile picture */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-cyan/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full p-1 avatar-ring shadow-[0_0_30px_rgba(138,43,226,0.3)]">
            {profile.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt={profile.username}
                className="w-full h-full rounded-full object-cover border-4 border-dark-900"
              />
            ) : (
              <div className="w-full h-full rounded-full border-4 border-dark-900 overflow-hidden flex items-center justify-center bg-dark-900">
                <AvatarInitials name={profile.fullName || profile.username} size="100%" />
              </div>
            )}
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
                    <button onClick={() => setIsEditModalOpen(true)} className="btn-aurora">Edit Profile</button>
                    <button onClick={() => setIsEditModalOpen(true)} className="btn-aurora px-4" title="Settings"><FiSettings size={20} /></button>
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/login');
                        toast.success('Logged out successfully');
                      }} 
                      className="btn-aurora bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 px-4" 
                      title="Logout"
                    >
                      <FiLogOut size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleFollow} className={profile.isFollowing ? 'btn-aurora' : 'btn-aurora-primary'}>
                      {profile.isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <Link to={`/messages`} state={{ newChat: profile }} className="btn-aurora text-center py-2 px-4 rounded-lg">Message</Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-6 mt-2">
              <div className="text-center md:text-left"><span className="text-xl font-bold text-white block">{profile.postCount}</span> <span className="text-xs text-dark-300 uppercase tracking-wider">Posts</span></div>
              <div 
                className="text-center md:text-left cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setFollowModal({ isOpen: true, type: 'followers' })}
              >
                <span className="text-xl font-bold text-white block">{profile.followerCount}</span> 
                <span className="text-xs text-dark-300 uppercase tracking-wider">Followers</span>
              </div>
              <div 
                className="text-center md:text-left cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setFollowModal({ isOpen: true, type: 'following' })}
              >
                <span className="text-xl font-bold text-white block">{profile.followingCount}</span> 
                <span className="text-xs text-dark-300 uppercase tracking-wider">Following</span>
              </div>
            </div>

            {profile.bio && <p className="text-dark-100 max-w-2xl leading-relaxed mt-2">{profile.bio}</p>}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.college && <span className="px-3 py-1 glass-panel text-xs font-semibold text-aurora-cyan flex items-center gap-1">🎓 {profile.college} {profile.campusVerified && <span title="Verified Student">✅</span>}</span>}
              {profile.department && <span className="px-3 py-1 glass-panel text-xs font-semibold text-aurora-cyan">📚 {profile.department}</span>}
              
              {profile.openToConnect && (
                <span className="px-3 py-1 glass-panel text-xs font-semibold text-aurora-pink flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-aurora-pink animate-pulse"></span> Open to Connect
                </span>
              )}

              {profile.skills && profile.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 glass-panel text-xs font-semibold text-aurora-purple">💻 {skill}</span>
              ))}
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
            <FiBookmark /> Skill Stack
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <>
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
            <div className="glass-panel text-center py-20 text-dark-400 flex flex-col items-center gap-4">
              <div className="text-5xl opacity-50">📭</div>
              <h3 className="text-xl font-bold text-white">No Posts Yet</h3>
              <p>This space is waiting to be filled.</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'saved' && (
        <div className="w-full animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-aurora-cyan">💻</span> Skill Portfolio
            </h2>
          </div>
          
          {profile.skills && profile.skills.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {profile.skills.map((skill, i) => (
                <div key={i} className="clay-card p-8 flex flex-col items-center justify-center text-center group cursor-default transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,210,255,0.2)]">
                  <div className="w-16 h-16 rounded-2xl bg-dark-900/50 mb-4 flex items-center justify-center border border-white/5 group-hover:border-aurora-cyan/30 transition-colors">
                    <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-br from-aurora-cyan to-aurora-purple font-black">
                      {skill.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{skill}</h3>
                  <div className="w-8 h-1 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-purple opacity-50 group-hover:w-16 transition-all duration-300"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="clay-card text-center py-20 text-dark-400 flex flex-col items-center gap-4">
              <div className="text-5xl opacity-50">🛠️</div>
              <h3 className="text-xl font-bold text-white">Empty Stack</h3>
              <p>Add some skills to your profile to build your portfolio.</p>
              {isOwnProfile && <button onClick={() => setIsEditModalOpen(true)} className="btn-aurora mt-2">Edit Skills</button>}
            </div>
          )}
        </div>
      )}

      {followModal.isOpen && (
        <FollowListModal 
          userId={profile.id} 
          type={followModal.type} 
          onClose={() => setFollowModal({ isOpen: false, type: '' })} 
        />
      )}

      {isEditModalOpen && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}
    </div>
  );
}
