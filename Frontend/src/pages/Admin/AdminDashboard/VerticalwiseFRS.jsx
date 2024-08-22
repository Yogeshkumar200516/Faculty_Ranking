import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Import the jwt-decode package
import './VerticalwiseFRS.css';
import academicsImage from '../../../assets/images/academics.png';
import coeImage from '../../../assets/images/coe.png';
import iqacImage from '../../../assets/images/iqac.png';
import skillImage from '../../../assets/images/skill.png';
import specialLabImage from '../../../assets/images/special_lab.png';
import { useNavigate } from 'react-router-dom';

// Default verticals with images and initial FRS points of 0
const defaultVerticals = [
  { vertical: 'Academics', image: academicsImage, positiveScore: 0, negativeScore: 0 },
  { vertical: 'COE', image: coeImage, positiveScore: 0, negativeScore: 0 },
  { vertical: 'IQAC', image: iqacImage, positiveScore: 0, negativeScore: 0 },
  { vertical: 'Skill', image: skillImage, positiveScore: 0, negativeScore: 0 },
  { vertical: 'Special Lab', image: specialLabImage, positiveScore: 0, negativeScore: 0 },
];

function VerticalwiseFRS() {
  const navigate = useNavigate();
  const [verticals, setVerticals] = useState(defaultVerticals);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt');

    if (!token || !checkTokenValidity(token)) {
      setError('Token has expired or is invalid');
      setLoading(false);
      return;
    }

    // Fetch data from the backend
    fetch('http://localhost:4000/verticals/frs', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Ensure verticals array is not empty
        if (!Array.isArray(data)) {
          setError('Invalid data format');
          setLoading(false);
          return;
        }

        // Merge fetched data with default verticals
        const mergedData = defaultVerticals.map(defaultVertical => {
          const found = data.find(item => item.vertical === defaultVertical.vertical);
          return found ? { ...defaultVertical, ...found } : defaultVertical;
        });

        setVerticals(mergedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleVerticalClick = (name) => {
    console.log(name)
    navigate(`/vertical-history/${name}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="verticalwise1">
      {verticals.length > 0 ? (
        verticals.map((vertical, index) => (
          <div className="grid6" key={index} onClick={() => handleVerticalClick(vertical.vertical)}>
            <img src={vertical.image} alt={vertical.vertical} className="icon1" />
            <div className="name2">{vertical.vertical}</div>
            <div className='score'>
              <div className="positive-score">
                <span className="score-icon">▲</span>
                {vertical.positiveScore || 0} {/* Default to 0 if undefined */}
              </div>
              <div className="negative-score">
                <span className="score-icon">▼</span>
                {vertical.negativeScore || 0} {/* Default to 0 if undefined */}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>No verticals available</div>
      )}
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

export default VerticalwiseFRS;
