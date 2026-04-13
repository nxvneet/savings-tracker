import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Diamond } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    // Simulate OAuth delay
    setTimeout(() => {
      login('mockuser@google.com', 'mockpassword');
      navigate('/');
    }, 1000);
  };

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
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-logo">
          <Diamond size={32} color="var(--primary)" />
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>Sphere</h1>
        </div>
        
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to track your savings goals</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label" style={{ textAlign: 'left' }}>Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-group">
             <label className="input-label" style={{ textAlign: 'left' }}>Password</label>
             <input
               type="password"
               className="input-field"
               placeholder="••••••••"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
             />
          </div>

          {error && <span className="error-text">{error}</span>}

          <button type="submit" className="btn btn-primary login-btn">
            Sign In
          </button>
        </form>

        <div className="login-divider">
          <span className="divider-text">Or sign in with</span>
        </div>

        <button 
          type="button" 
          className="btn-google" 
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          style={isGoogleLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
        >
          {isGoogleLoading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </>
          )}
        </button>

      </div>
    </div>
  );
}
