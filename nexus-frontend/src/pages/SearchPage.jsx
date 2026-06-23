import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FiSearch } from 'react-icons/fi';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({ users: [], hashtags: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/search?q=${q}`);
      setResults(res.data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const q = formData.get('q');
    if (q) setSearchParams({ q });
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <form onSubmit={updateSearch} className="px-4 mb-6 relative">
        <FiSearch className="absolute left-7 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
        <input 
          type="text" 
          name="q"
          defaultValue={query}
          placeholder="Search users, hashtags..." 
          className="w-full bg-dark-100 dark:bg-dark-900 border-none rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-dark-300 dark:focus:ring-dark-700 transition-shadow"
        />
      </form>

      {query && (
        <>
          <div className="flex gap-6 px-4 border-b border-dark-200 dark:border-dark-800 mb-4 text-sm font-semibold text-dark-500">
            {['all', 'accounts', 'tags'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-2 transition-colors ${activeTab === tab ? 'border-dark-900 dark:border-white text-dark-900 dark:text-white' : 'border-transparent hover:text-dark-900 dark:hover:text-white'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="px-4 flex flex-col gap-4">
            {loading ? (
              <div className="text-center py-8 text-dark-500">Searching...</div>
            ) : (
              <>
                {(activeTab === 'all' || activeTab === 'accounts') && results.users.length > 0 && (
                  <div className="flex flex-col gap-4 mb-4">
                    {results.users.map(user => (
                      <Link key={user.id} to={`/profile/${user.username}`} className="flex items-center gap-3 hover:bg-dark-50 dark:hover:bg-dark-900 p-2 rounded-lg -mx-2 transition-colors">
                        <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt={user.username} className="w-12 h-12 rounded-full" />
                        <div>
                          <div className="font-semibold text-[15px]">{user.username}</div>
                          <div className="text-sm text-dark-500">{user.fullName || 'User'}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {(activeTab === 'all' || activeTab === 'tags') && results.hashtags.length > 0 && (
                  <div className="flex flex-col gap-4 mb-4">
                    {results.hashtags.map(tag => (
                      <Link key={tag.id} to={`/search?q=${tag.name}&type=posts`} className="flex items-center gap-4 hover:bg-dark-50 dark:hover:bg-dark-900 p-2 rounded-lg -mx-2 transition-colors">
                        <div className="w-12 h-12 rounded-full border border-dark-200 dark:border-dark-700 flex items-center justify-center">
                          <FiSearch size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-[15px]">#{tag.name}</div>
                          <div className="text-sm text-dark-500">{tag.postCount} posts</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {results.users.length === 0 && results.hashtags.length === 0 && (
                  <div className="text-center py-10 text-dark-500">No results found for "{query}".</div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
