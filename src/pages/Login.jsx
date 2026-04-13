import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Eye, Mail } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    // Mock login
    login(email, password);
    navigate('/');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-form-container">
        
        <h1 className="login-hero-title">Welcome back</h1>
        <p className="login-hero-subtitle">Access your account and continue your journey.</p>

        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label className="auth-label">Username | Email</label>
            <div className="auth-input-wrapper">
              <input
                type="text"
                className="auth-input"
                placeholder="username or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="auth-input-icon" style={{ opacity: 0.8 }}>
                 {/* Simplified icon similar to the exact image icon request */}
                <Mail size={18} />
              </div>
            </div>
          </div>
          
          <div className="auth-form-group">
             <label className="auth-label">Password</label>
             <div className="auth-input-wrapper">
               <input
                 type="password"
                 className="auth-input"
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
               />
               <div className="auth-input-icon">
                 <Eye size={18} />
               </div>
             </div>
          </div>

          {error && <span style={{color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', display: 'block'}}>{error}</span>}

          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" className="remember-checkbox" defaultChecked />
              <span className="remember-text">Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="btn-signin">
            Sign in
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">Or sign in with</span>
        </div>

        <button type="button" className="btn-google">
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <div className="signup-prompt">
          Don't have an account? <span className="signup-link">Create account</span>
        </div>

      </div>
    </div>
  );
}
