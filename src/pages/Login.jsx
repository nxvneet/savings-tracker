import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Diamond } from 'lucide-react';
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
      </div>
    </div>
  );
}
