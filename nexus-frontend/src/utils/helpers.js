export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return date.toLocaleDateString();
};

export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toString() || '0';
};

export const getLevelBadgeClass = (level) => {
  const classes = {
    NEWCOMER: 'badge-newcomer',
    CONTRIBUTOR: 'badge-contributor',
    EXPERT: 'badge-expert',
    MENTOR: 'badge-mentor',
    LEGEND: 'badge-legend',
  };
  return classes[level] || 'badge-newcomer';
};

export const getPostTypeLabel = (type) => {
  const labels = {
    DISCUSSION: '💬 Discussion',
    QUESTION: '❓ Question',
    POLL: '📊 Poll',
    PROJECT_SHOWCASE: '🚀 Project',
  };
  return labels[type] || type;
};

export const getPostTypeColor = (type) => {
  const colors = {
    DISCUSSION: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    QUESTION: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    POLL: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    PROJECT_SHOWCASE: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  };
  return colors[type] || '';
};
