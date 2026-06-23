import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiHeart, FiMessageCircle, FiUserPlus, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.content);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'LIKE': return <FiHeart className="text-red-500 fill-red-500" size={16} />;
      case 'COMMENT': return <FiMessageCircle className="text-blue-500 fill-blue-500" size={16} />;
      case 'FOLLOW': return <FiUserPlus className="text-blue-500" size={16} />;
      default: return <FiInfo className="text-dark-500" size={16} />;
    }
  };

  const formatTime = (dateString) => {
    const diff = (new Date() - new Date(dateString)) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6 px-4">Notifications</h1>

      {loading ? (
        <div className="flex flex-col gap-4 px-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-dark-200 dark:bg-dark-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-dark-200 dark:bg-dark-800 rounded w-3/4" />
                <div className="h-3 bg-dark-200 dark:bg-dark-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col">
          {notifications.map((notif) => (
            <div key={notif.id} className={`flex items-center gap-4 p-4 hover:bg-dark-50 dark:hover:bg-dark-900 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
              <div className="relative">
                <Link to={`/profile/${notif.senderUsername}`}>
                  <img 
                    src={notif.senderProfileImage || `https://ui-avatars.com/api/?name=${notif.senderUsername}&background=random`} 
                    alt={notif.senderUsername}
                    className="w-11 h-11 rounded-full object-cover border border-dark-200 dark:border-dark-700"
                  />
                </Link>
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-dark-950 p-[2px] rounded-full">
                  {getIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 text-sm">
                <Link to={`/profile/${notif.senderUsername}`} className="font-semibold hover:underline mr-1">
                  {notif.senderUsername}
                </Link>
                <span>{notif.message.replace(`${notif.senderUsername} `, '')}</span>
                <span className="text-dark-500 ml-2">{formatTime(notif.createdAt)}</span>
              </div>

              {notif.postThumbnail ? (
                <Link to={`/post/${notif.postId}`} className="w-11 h-11 flex-shrink-0">
                  <img src={notif.postThumbnail} alt="Post thumbnail" className="w-full h-full object-cover rounded" />
                </Link>
              ) : notif.type === 'FOLLOW' ? (
                <button className="btn-primary text-sm px-4 py-1.5 rounded-lg">Follow Back</button>
              ) : null}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-10 text-dark-500">
              No notifications yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
