import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import api from '../services/api';
import AvatarInitials from './AvatarInitials';

export default function FollowListModal({ userId, type, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/users/${userId}/${type}`);
        setUsers(res.data.content);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUsers();
  }, [userId, type]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-panel w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-scale-in relative" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-dark-800/50">
          <h2 className="text-xl font-bold text-white capitalize">{type}</h2>
          <button onClick={onClose} className="p-2 text-dark-300 hover:text-white transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 flex-1 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-aurora animate-pulse">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-dark-400">No {type} found.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link to={`/profile/${user.username}`} onClick={onClose} className="flex items-center gap-3 group flex-1">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-aurora-cyan to-aurora-purple shrink-0">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.username} className="w-full h-full rounded-full object-cover border border-dark-900" />
                      ) : (
                        <div className="w-full h-full rounded-full overflow-hidden border border-dark-900 flex items-center justify-center bg-dark-900">
                           <AvatarInitials name={user.fullName || user.username} size="100%" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-white group-hover:text-aurora-cyan transition-colors truncate">{user.fullName || user.username}</div>
                      <div className="text-sm text-dark-300 truncate">@{user.username}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
