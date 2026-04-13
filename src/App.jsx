import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GoalDetails from './pages/GoalDetails';
import Login from './pages/Login';

function PrivateRoute({ children }) {
  const user = useStore((state) => state.user);
  return user ? children : <Navigate to="/login" />;
}

function App() {
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
