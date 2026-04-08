import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import FullScreenLoader from './components/ui/FullScreenLoader';


// Redirects to /login if not logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  
  console.log('ProtectedRoute Eval:', { user: user ? user.email : 'null', loading });

  if (loading) {
    return <FullScreenLoader isVisible={true} message="Authenticating Fleet Commander..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}


function App() {
  const { initializing } = useContext(AuthContext);

  return (
    <>
      <FullScreenLoader isVisible={initializing} />
      <Router>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: {
            background: '#18181b',
            color: '#f8fafc',
            border: '1px solid #27272a',
          },
        }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}


export default App;
