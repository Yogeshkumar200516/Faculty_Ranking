import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Navbar from '../components/Navbar/Navbar';
import Dashboard from '../pages/User/Dashboard/Dashboard';
import VerticalFRS from '../pages/User/VerticalFRS/VerticalFRS';
import FRSHistory from '../pages/User/FRSHistory/FRSHistory';
import HeadDashboard from '../pages/Head/HeadDashboard/Head';
import FRSEntry from '../pages/Head/FRSEntry/FRSEntry';
import Admin from '../pages/Admin/AdminDashboard/Admin';
import VerticalwiseFRS from '../pages/Admin/FRSVertical/FRSVertical';
import DepartmentwiseFRS from '../pages/Admin/FRSDepartment/FRSDepartment';
import FacultyFRS from '../pages/Admin/FacultyList/FacultyFRS';
import LoginPage from '../components/LoginPage/LoginPage';
import VerticalGrid from '../pages/User/Dashboard/VerticalGrid';
import VerticalHistory from '../pages/Head/VerticalFRSHistory/VerticalHistory';
import FacultyTable from '../pages/Admin/FacultyList/FacultyFRS';
import FacultyDetails from '../pages/Admin/FacultyDetails/FacultyDetails';

const AppLayout = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogin = (userData, accessToken, refreshToken) => {
    console.log('Handling login:', userData, accessToken);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    navigate('/'); // Navigate to the default route after login
  };

  const checkAuthStatus = async () => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      console.log('User authenticated:', storedUser);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      console.log('User not authenticated');
      setIsAuthenticated(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Redirect to the login page
    navigate('/login');

    // Update authentication state
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar jwtToken={localStorage.getItem('accessToken')} onLogout={handleLogout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: 8,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#121212' : '#f4f6f8',
          transition: 'margin 0.3s',
        }}
      >
        <Routes>
          {user?.role === 'admin' && (
            <>
              <Route path="/" element={<Admin user={user} />} />
              <Route path="/verticalwise-frs" element={<VerticalwiseFRS />} />
              <Route path="/departmentwise-frs" element={<DepartmentwiseFRS />} />
              <Route path="/faculty-details" element={<FacultyDetails />} />
              <Route path="/faculty-entry" element={<FacultyFRS />} />
            </>
          )}
          {user?.role === 'vertical_head' && (
            <>
              <Route path="/" element={<HeadDashboard user={user} />} />
              <Route path="/vertical-history" element={<VerticalHistory user={user} />} />
              <Route path="/frs-entry" element={<FRSEntry user={user} />} />
              <Route path="/head-dashboard/:name" element={<HeadDashboard user={user} />} />
            </>
          )}
          {user?.role === 'user' && (
            <>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/vertical-frs" element={<VerticalFRS user={user} />} />
              <Route path="/frs-history" element={<FRSHistory user={user} />} />
              <Route path="/vertical-grid" element={<VerticalGrid user={user} />} />
            </>
          )}
          {user?.role === 'hr' && (
            <>
              <Route path="/" element={<FacultyTable user={user} />} />
              
              <Route path="/faculty-details" element={<FacultyDetails />} />

            </>
          )}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AppLayout;
