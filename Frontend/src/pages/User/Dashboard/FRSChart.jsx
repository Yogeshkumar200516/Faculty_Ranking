import { useState, useRef, useEffect } from 'react';
import './FRSChart.css';
import FRSLineChart from '../../../components/Graph/FRSLineChart';
import SortIcon from '@mui/icons-material/Sort';
import PropTypes from 'prop-types';

function FRSChart({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState('All');
  const [frsData, setFrsData] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchFRSData = async (facultyId, vertical) => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await fetch(`http://localhost:4000/facultyfrsgraph/${facultyId}/${vertical}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Raw data fetched:', data);

        // Ensure data is an array and map it to the required format
        const formattedData = Array.isArray(data) ? data.map(item => ({
          month: item.month,
          score: parseFloat(item.totalFRS) // Convert to number
        })) : [];
        
        setFrsData(formattedData);
      } catch (error) {
        console.error('Error fetching FRS data:', error);
      }
    };

    if (user && user.id) {
      fetchFRSData(user.id, selectedVertical);
    }
  }, [user.id, selectedVertical]);

  const handleFilterChange = (filter) => {
    setSelectedVertical(filter);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='frs-chart'>
      <div className='filter-dropdown' ref={dropdownRef}>
        <button className="filter-button" onClick={() => setShowDropdown(!showDropdown)}>
          <SortIcon className="filter-button-icon" />
        </button>
        {showDropdown && (
          <ul className="filter-menu">
            <li onClick={() => handleFilterChange('All')}>All</li>
            <li onClick={() => handleFilterChange('Academics')}>Academics</li>
            <li onClick={() => handleFilterChange('Skill')}>Skill</li>
            <li onClick={() => handleFilterChange('Special Lab')}>Special Lab</li>
            <li onClick={() => handleFilterChange('IQAC')}>IQAC</li>
            <li onClick={() => handleFilterChange('COE')}>COE</li>
          </ul>
        )}
      </div>
      <div className='selected-vertical'>{selectedVertical}</div>
      <div className="chart-container">
        <FRSLineChart data={frsData} />
      </div>
    </div>
  );
}

FRSChart.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};

export default FRSChart;
