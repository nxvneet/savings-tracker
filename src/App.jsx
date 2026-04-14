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
  
  if (authLoading) return <div className="loading-screen"><div className="loader"></div></div>;
  
  if (!user) return <Navigate to="/login" replace />;
  if (user && !isOnboarded) return <Navigate to="/onboarding" replace />;
  
  return children;
}

function AuthListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const savedData = localStorage.getItem(`sphere-data-${firebaseUser.uid}`);
        
        const newState = savedData ? JSON.parse(savedData) : {
          goals: [],
          preferences: { currency: 'USD' },
          isOnboarded: false,
          financialProfile: null
        };

        useStore.setState({ 
          ...newState,
          user: { 
            id: firebaseUser.uid, 
            email: firebaseUser.email, 
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL 
          },
          authLoading: false
        });

        if (location.pathname === '/login') {
          navigate('/', { replace: true });
        }
      } else {
        logout();
        useStore.setState({ authLoading: false });
      }
    });

    return () => unsubscribe();
  }, [logout, navigate, location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={
          <PrivateRoute>
            <Onboarding />
          </PrivateRoute>
        } />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="goal/:id" element={<GoalDetails />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
