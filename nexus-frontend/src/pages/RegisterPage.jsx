import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '', fullName: '', email: '', password: '', college: '', department: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'fullName', label: 'Full Name', type: 'text', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: showPassword ? 'text' : 'password', required: true, minLength: 6, hasToggle: true },
    { name: 'college', label: 'College (Optional)', type: 'text', required: false },
    { name: 'department', label: 'Department (Optional)', type: 'text', required: false },
  ];

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-blob login-blob-1"></div>
        <div className="login-blob login-blob-2"></div>
        <div className="login-blob login-blob-3"></div>
      </div>

      <div className="login-container">
        {/* Main Card */}
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo-section">
            <h1 className="login-logo">CampusConnect</h1>
            <p className="login-tagline">Join students from campuses everywhere</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`login-field ${focusedField === field.name || formData[field.name] ? 'login-field-active' : ''}`}
              >
                <label className="login-label">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                  className="login-input"
                  required={field.required}
                  minLength={field.minLength}
                  autoComplete={field.name === 'password' ? 'new-password' : field.name}
                />
                {field.hasToggle && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-eye-btn"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                )}
              </div>
            ))}

            <p className="register-terms">
              By signing up, you agree to our <span>Terms</span>, <span>Privacy Policy</span> and <span>Cookies Policy</span>.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.username || !formData.password || !formData.email}
              className="login-submit-btn"
            >
              {loading ? (
                <div className="login-spinner"></div>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
        </div>

        {/* Login Card */}
        <div className="login-signup-card">
          <p>Have an account? <Link to="/login" className="login-signup-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
