import React, { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode'; // Fixed import statement
import './VerticalGrid.css';
import academicsImage from '../../../assets/images/academics.png';
import coeImage from '../../../assets/images/coe.png';
import iqacImage from '../../../assets/images/iqac.png';
import skillImage from '../../../assets/images/skill.png';
import specialLabImage from '../../../assets/images/special_lab.png';
import PropTypes from 'prop-types';

const defaultVerticals = [
  { vertical: 'Academics', image: academicsImage, total_frs_points: 0 },
  { vertical: 'COE', image: coeImage, total_frs_points: 0 },
  { vertical: 'IQAC', image: iqacImage, total_frs_points: 0 },
  { vertical: 'Skill', image: skillImage, total_frs_points: 0 },
  { vertical: 'Special Lab', image: specialLabImage, total_frs_points: 0 },
];

function VerticalGrid({ user }) {
  const [frsPoints, setFrsPoints] = useState(defaultVerticals);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      const token = localStorage.getItem('jwt');

      if (!token || !checkTokenValidity(token)) {
        setError('Token has expired or is invalid');
        return;
      }

      fetch(`http://localhost:4000/verticalvisefrs/${user.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Map data to match the defaultVerticals format
          const updatedFrsPoints = defaultVerticals.map((vertical) => {
            const dataPoint = data.find(d => d.vertical === vertical.vertical);
            return {
              ...vertical,
              total_frs_points: dataPoint ? Math.round(dataPoint.total_frs_points) : 0,
            };
          });
          setFrsPoints(updatedFrsPoints);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setError(error.message);
        });
    }
  }, [user.id]);

  if (!user || !user.id) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="verticalwise">
      {frsPoints.map((point) => (
        <div className="grid" key={point.vertical}>
          <img src={point.image} alt={point.vertical} className="icon" />
          <div className="name">{point.vertical}</div>
          <div className="frs-score">{point.total_frs_points}</div>
        </div>
      ))}
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

VerticalGrid.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};

export default VerticalGrid;
