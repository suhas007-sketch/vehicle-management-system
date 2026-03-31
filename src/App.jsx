import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
// import Bookings from './pages/Bookings';
// import Customers from './pages/Customers';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="bookings" element={<div className="p-8 text-2xl text-textMain">Bookings (Coming Soon)</div>} />
          <Route path="customers" element={<div className="p-8 text-2xl text-textMain">Customers (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
