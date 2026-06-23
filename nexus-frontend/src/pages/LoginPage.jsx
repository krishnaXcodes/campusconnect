import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="login-logo-line"></div>
            <p className="login-tagline">Connect Across Campuses</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Username Field */}
            <div className={`login-field ${focusedField === 'username' || username ? 'login-field-active' : ''}`}>
              <label className="login-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="login-input"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className={`login-field ${focusedField === 'password' || password ? 'login-field-active' : ''}`}>
              <label className="login-label">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="login-input"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-eye-btn"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username || password.length < 6}
              className="login-submit-btn"
            >
              {loading ? (
                <div className="login-spinner"></div>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line"></div>
            <span className="login-divider-text">OR</span>
            <div className="login-divider-line"></div>
          </div>

          {/* Forgot Password */}
          <Link to="#" className="login-forgot">Forgot password?</Link>
        </div>

        {/* Sign Up Card */}
        <div className="login-signup-card">
          <p>Don't have an account? <Link to="/register" className="login-signup-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
