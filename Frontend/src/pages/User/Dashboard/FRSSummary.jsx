import React, { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import './FRSSummary.css';
import frsTotalImage from '../../../assets/images/frs_total.png';
import frsGainedImage from '../../../assets/images/frs_gained.png';
import frsLostImage from '../../../assets/images/frs_lost.png';
import PropTypes from 'prop-types';

function FRSSummary({ user }) {
  const [summary, setSummary] = useState({
    total: 0,
    gained: 0,
    lost: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      const token = localStorage.getItem('jwt');

      if (!token || !checkTokenValidity(token)) {
        setError('Token has expired or is invalid');
        return;
      }

      fetch(`http://localhost:4000/frssummary/${user.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setSummary({
            total: parseInt(data.total, 10) || 0,
            gained: parseInt(data.gained, 10) || 0,
            lost: parseInt(data.lost, 10) || 0,
          });
        })
        .catch(error => {
          console.error('Error fetching summary data:', error);
          setError(error.message);
        });
    }
  }, [user]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="frs-summary">
      <div className="summary1">
        <img className="summary-image" src={frsTotalImage} alt="FRS Total" />
        <div className="summary-text">
          <span className="summary-title">FRS Total</span>
          <span className="summary-value" style={{ color: '#29B6F6', fontWeight: 'bold' }}>{summary.total}</span>
        </div>
      </div>
      <div className="summary2">
        <img className="summary-image" src={frsGainedImage} alt="FRS Gained" />
        <div className="summary-text">
          <span className="summary-title">FRS Gained</span>
          <span className="summary-value" style={{ color: '#00C853', fontWeight: 'bold' }}>{summary.gained}</span>
        </div>
      </div>
      <div className="summary3">
        <img className="summary-image" src={frsLostImage} alt="FRS Lost" />
        <div className="summary-text">
          <span className="summary-title">FRS Lost</span>
          <span className="summary-value" style={{ color: '#FF3D00', fontWeight: 'bold' }}>{summary.lost}</span>
        </div>
      </div>
    </div>
  );
}

function checkTokenValidity(token) {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decodedToken.exp >= currentTime;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return false;
  }
}

FRSSummary.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};

export default FRSSummary;
