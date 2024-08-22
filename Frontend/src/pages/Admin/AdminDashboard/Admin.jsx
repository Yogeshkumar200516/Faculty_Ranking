import React, { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode'; // Import the jwt-decode package
import './Admin.css';
import RecentUpdates from './RecentUpdates';
import VerticalwiseFRS from './VerticalwiseFRS';
import MonthwiseFRS from './MonthwiseFRS';
import FRSPercentage from './FRSPrecentage';
import Leaderboard from './Leaderboard';
import EventDetails from './EventDetails';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');

    if (token && checkTokenValidity(token)) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setError('Authentication required or token has expired.');
    }
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view this content.</div>;
  }

  return (
    <div className="admin">
      <div className='verticalwise-head'>
        Vertical wise Overview
      </div>
      <VerticalwiseFRS />
      <div className='verticalwise-tail'>
        Overall FRS provided for the Faculties in Positive and Negative from each vertical can be seen here
      </div>
      <div className="grid-container">
        <MonthwiseFRS />
        <FRSPercentage />
      </div>
      {/* <div className='summary-head'>
        Summary of Recent Updates
      </div>
      <RecentUpdates /> */}
      <div className="leaderboard-frs">
        {/* <EventDetails /> */}
        <Leaderboard />
      </div>
    </div>
  );
}

function checkTokenValidity(token) {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      console.log('Token has expired');
      return false;
    }

    console.log('Token is valid');
    return true;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return false;
  }
}

export default Admin;
