import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
// import StoryViewer from './StoryViewer'; // We'll build this next

export default function StoryBar() {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await api.get('/api/stories/feed');
      setStoryGroups(res.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto bg-white dark:bg-dark-900 border-b md:border md:rounded-xl border-dark-200 dark:border-dark-800">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 min-w-[72px]">
            <div className="w-16 h-16 rounded-full bg-dark-200 dark:bg-dark-800 animate-pulse" />
            <div className="w-12 h-3 bg-dark-200 dark:bg-dark-800 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Find if current user has an active story
  const myStoryGroup = storyGroups.find(g => g.userId === user?.id);

  return (
    <div className="flex gap-4 p-4 overflow-x-auto bg-white dark:bg-dark-900 border-b md:border md:rounded-xl border-dark-200 dark:border-dark-800 scrollbar-hide">
      
      {/* My Story Button */}
      <div className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer relative">
        <div className={`w-16 h-16 rounded-full p-[2px] ${myStoryGroup ? (myStoryGroup.hasUnviewed ? 'insta-gradient' : 'bg-dark-300 dark:bg-dark-700') : ''}`}>
          <img 
            src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
            alt="Your story" 
            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-dark-900"
          />
        </div>
        {!myStoryGroup && (
          <div className="absolute bottom-5 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white dark:border-dark-900">
            <FiPlus size={14} />
          </div>
        )}
        <span className="text-xs text-dark-600 dark:text-dark-300 truncate w-16 text-center">
          Your story
        </span>
      </div>

      {/* Other users' stories */}
      {storyGroups.filter(g => g.userId !== user?.id).map((group) => (
        <div key={group.userId} className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer">
          <div className={`w-16 h-16 rounded-full p-[2px] ${group.hasUnviewed ? 'insta-gradient' : 'bg-dark-300 dark:bg-dark-700'}`}>
            <img 
              src={group.userProfileImage || `https://ui-avatars.com/api/?name=${group.username}&background=random`} 
              alt={`${group.username}'s story`}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-dark-900"
            />
          </div>
          <span className="text-xs text-dark-600 dark:text-dark-300 truncate w-16 text-center">
            {group.username}
          </span>
        </div>
      ))}
    </div>
  );
}
