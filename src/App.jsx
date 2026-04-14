import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { auth } from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GoalDetails from './pages/GoalDetails';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';

function PrivateRoute({ children }) {
  const user = useStore((state) => state.user);
  const isOnboarded = useStore((state) => state.isOnboarded);
  const authLoading = useStore((state) => state.authLoading);
  
  // Show spinner while Firebase resolves session
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function OnboardingRoute() {
  const user = useStore((state) => state.user);
  const isOnboarded = useStore((state) => state.isOnboarded);
  const authLoading = useStore((state) => state.authLoading);

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (isOnboarded) return <Navigate to="/" replace />;
  return <Onboarding />;
}

function AuthListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    // Safety: if Firebase never responds in 8s, unblock the UI
    const fallbackTimer = setTimeout(() => {
      const { authLoading } = useStore.getState();
      if (authLoading) {
        useStore.setState({ authLoading: false });
      }
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(fallbackTimer);

      if (firebaseUser) {
        const savedData = localStorage.getItem(`sphere-data-${firebaseUser.uid}`);
        
        const restoredState = savedData
          ? JSON.parse(savedData)
          : { goals: [], preferences: { currency: 'USD' }, isOnboarded: false, financialProfile: null };

        useStore.setState({ 
          ...restoredState,
          user: { 
            id: firebaseUser.uid, 
            email: firebaseUser.email, 
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL 
          },
          authLoading: false
        });

        // Only navigate away from login, let PrivateRoute handle other redirects
        if (location.pathname === '/login') {
          const { isOnboarded } = useStore.getState();
          navigate(isOnboarded ? '/' : '/onboarding', { replace: true });
        }
      } else {
        logout();
        useStore.setState({ authLoading: false });
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="goal/:id" element={<GoalDetails />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
