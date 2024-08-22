import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import VerticalGrid from './VerticalGrid';
import FRSSummary from './FRSSummary';
import FRSChart from './FRSChart';
import Notification from './Notification';
import RecentFRS from './RecentFRS';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct import

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwt');

    if (token) {
      try {
        const decoded = jwtDecode(token); // Use jwtDecode
        setUser(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.log('No token found');
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const verticalItems = user.verticals || {}; // Ensure `verticals` is correctly formatted

  const handleViewAllClick = () => {
    navigate('/frs-history');
  };

  return (
    <div className="main">
      <div className='top'>
        <div className="text1">Verticalwise FRS Score</div>
        <VerticalGrid items={verticalItems} user={user} />
      </div>

      <div className="side-grids">
        <div className="left-grid">
          <div className="text2">FRS Summary</div>
          <FRSSummary user={user} />
        </div>
        <div className="right-grid">
          <div className="text3">Notification</div>
          <Notification />
        </div>
      </div>

      <div className='bottom'>
        <div className='line-graph'>
          <div className='text4'>Monthwise FRS Score for Current Semester</div>
          <FRSChart user={user} />
          <div className='note2'>Graphical representation of the Monthwise FRS can be seen here</div>
        </div>
        <div className="recent-update">
          <div className="text5">Recent Updates</div>
          <button className="view-all-button" onClick={handleViewAllClick}>
            View All Updates
          </button>
          <RecentFRS user={user} />
          <div className='note3'>Recently updated FRS from all verticals can be seen here</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
