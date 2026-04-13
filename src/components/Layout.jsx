import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogOut, Home, Settings, Wallet, Diamond } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Diamond size={24} color="white" />
          </div>
          <h1 className="logo-text">Sphere</h1>
        </div>
        
        <nav className="nav-menu">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <button className="nav-link">
            <Wallet size={20} />
            <span>Wallets</span>
          </button>
          
          <div className="nav-link" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', background: 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Settings size={20} />
              <span>Preferences</span>
            </div>
            <select 
              value={useStore((state) => state.preferences.currency)}
              onChange={(e) => useStore.getState().setCurrency(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-main)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </nav>

        <div className="user-profile">
          <div className="user-card">
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-name">
              {user?.name || 'User'}
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="mobile-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Diamond size={24} color="var(--primary)" />
              <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Sphere</span>
           </div>
           <button onClick={handleLogout} style={{ background:'transparent', border:'none', color:'var(--text-muted)' }}>
             <LogOut size={24} />
           </button>
        </header>

        <div className="page-content">
           {/* Abstract blur effects */}
           <div className="abstract-blob1" />
           <div className="abstract-blob2" />
           
           <Outlet />
        </div>
      </main>
    </div>
  );
}
