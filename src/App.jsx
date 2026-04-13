import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { auth } from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GoalDetails from './pages/GoalDetails';
import Login from './pages/Login';

function PrivateRoute({ children }) {
  const user = useStore((state) => state.user);
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    // Listen for real Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is securely signed in with Firebase
        useStore.setState({ 
          user: { 
            id: firebaseUser.uid, 
            email: firebaseUser.email, 
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL 
          } 
        });
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
