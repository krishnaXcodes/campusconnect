import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiHash, FiImage } from 'react-icons/fi';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      const res = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(res.data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsedHashtags = hashtags.split(' ').map(t => t.replace('#', '').trim()).filter(t => t);
      const payload = {
        caption,
        location,
        hashtags: parsedHashtags,
        postType: imageUrl.trim() ? 'IMAGE' : 'TEXT',
        mediaUrls: imageUrl.trim() ? [imageUrl.trim()] : []
      };

      await api.post('/api/posts', payload);
      toast.success('Post created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-dark-200 dark:border-dark-800 text-center font-bold">
          Create new post
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Details Area */}
          <div className="w-full flex flex-col p-4">
            <textarea
              placeholder="What's happening on campus?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full h-32 p-4 bg-transparent outline-none resize-none border-b border-dark-200 dark:border-dark-800 text-lg"
              autoFocus
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-aurora-blue" size={20} />
                  <input 
                    type="text" 
                    placeholder="Location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-24 bg-transparent outline-none text-sm text-dark-300 placeholder-dark-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <FiHash className="text-aurora-purple" size={20} />
                  <input 
                    type="text" 
                    placeholder="Hashtags" 
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    className="w-24 bg-transparent outline-none text-sm text-dark-300 placeholder-dark-500"
                  />
                </div>

                <div className="flex items-center gap-2 relative">
                  <FiImage className="text-aurora-cyan" size={20} />
                  <span className="text-sm text-dark-300">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs ${caption.length > 280 ? 'text-red-500' : 'text-dark-400'}`}>
                  {caption.length}/280
                </span>
                <button 
                  type="submit" 
                  disabled={loading || !caption || caption.length > 280} 
                  className="px-6 py-2 btn-aurora-primary rounded-full font-bold disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>

            {/* Image Preview */}
            {imageUrl.trim() && (
              <div className="mt-4 rounded-xl overflow-hidden border border-dark-200 dark:border-dark-800 h-64 bg-dark-900 relative group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-dark-900/80 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
