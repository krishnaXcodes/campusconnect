import { useState } from 'react';
import { FiX, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EditProfileModal({ profile, onClose, onUpdate }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    bio: profile.bio || '',
    profileImage: profile.profileImage || '',
    college: profile.college || '',
    department: profile.department || '',
    year: profile.year || '',
    skills: profile.skills ? profile.skills.join(', ') : '',
    interests: profile.interests || '',
    isPrivate: profile.isPrivate || false
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); 

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    
    setUploading(true);
    try {
      const res = await api.post('/api/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, profileImage: res.data.url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      const res = await api.put(`/api/users/${profile.id}`, payload);
      toast.success('Profile updated successfully');
      onUpdate(res.data);
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-panel w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in relative" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-dark-800/50">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`text-lg font-bold transition-colors ${activeTab === 'profile' ? 'text-white border-b-2 border-aurora-cyan' : 'text-dark-300 hover:text-white'}`}
            >
              Edit Profile
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`text-lg font-bold transition-colors ${activeTab === 'settings' ? 'text-white border-b-2 border-aurora-cyan' : 'text-dark-300 hover:text-white'}`}
            >
              Settings
            </button>
          </div>
          <button onClick={onClose} className="p-2 text-dark-300 hover:text-white transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {activeTab === 'profile' && (
              <>
                <div className="form-group">
                  <label className="text-sm font-medium text-aurora">Profile Image</label>
                  <div className="flex items-center gap-4 mt-2">
                    {formData.profileImage ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-aurora-cyan shrink-0">
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                          className="absolute inset-0 bg-dark-900/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-dark-800 border-2 border-dashed border-dark-400 flex items-center justify-center shrink-0">
                        <span className="text-xs text-dark-400">None</span>
                      </div>
                    )}
                    
                    <div className="flex-1 relative">
                      <button type="button" disabled={uploading} className="btn-secondary w-full py-2">
                        {uploading ? 'Uploading...' : 'Choose Image'}
                      </button>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="text-sm font-medium text-aurora">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-aurora">College</label>
                    <input type="text" name="college" value={formData.college} onChange={handleChange} className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-aurora">Department</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-aurora">Year</label>
                    <input type="text" name="year" value={formData.year} onChange={handleChange} className="input-field" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="text-sm font-medium text-aurora">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} className="input-field min-h-[100px]" placeholder="Tell us about yourself..." />
                </div>

                <div className="form-group">
                  <label className="text-sm font-medium text-aurora">Skills (comma separated)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="input-field" placeholder="React, Java, Spring Boot" />
                </div>
              </>
            )}

            {activeTab === 'settings' && (
              <div className="flex flex-col gap-6">
                <div className="glass-panel p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Private Account</h3>
                    <p className="text-dark-300 text-sm">When your account is private, only people you approve can see your posts and followers.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isPrivate" checked={formData.isPrivate} onChange={handleChange} className="sr-only peer" />
                    <div className="w-14 h-7 bg-dark-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-aurora-cyan"></div>
                  </label>
                </div>

                <div className="mt-8 border-t border-red-500/20 pt-6">
                  <h3 className="text-red-400 font-bold text-lg mb-4">Danger Zone</h3>
                  <button 
                    type="button" 
                    onClick={() => {
                      logout();
                      onClose();
                      navigate('/login');
                      toast.success('Logged out successfully');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors border border-red-500/20"
                  >
                    <FiLogOut />
                    Log Out of CampusConnect
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-4 border-t border-white/10 bg-dark-800/50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg font-bold text-white bg-dark-900 hover:bg-dark-700 transition-colors">
            Cancel
          </button>
          <button type="submit" form="edit-profile-form" disabled={loading} className="btn-aurora px-8">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
