import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  
  if (!user) return <Navigate to="/login" />;
  if (user && !isOnboarded) return <Navigate to="/onboarding" />;
  
  return children;
}

function App() {
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    // Listen for real Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Look up this specific user's saved state
        const savedData = localStorage.getItem(`sphere-data-${firebaseUser.uid}`);
        
        if (savedData) {
          const parsed = JSON.parse(savedData);
          useStore.setState({ 
            ...parsed,
            user: { 
              id: firebaseUser.uid, 
              email: firebaseUser.email, 
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL 
            } 
          });
        } else {
          // Fresh user with no local storage history yet
          useStore.setState({ 
            goals: [],
            preferences: { currency: 'USD' },
            isOnboarded: false,
            financialProfile: null,
            user: { 
              id: firebaseUser.uid, 
              email: firebaseUser.email, 
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL 
            } 
          });
        }
        if (window.location.pathname === '/login') {
          window.location.href = '/';
        }
      } else {
        // User is signed out. Clear local storage session!
        logout();
      }
    });

    return () => unsubscribe();
  }, [logout]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={
          useStore.getState().user ? <Onboarding /> : <Navigate to="/login" />
        } />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="goal/:id" element={<GoalDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
