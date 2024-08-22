import React from 'react';
import './Head.css';
import MonthBarChart from './MonthBarChart';
import FRSTotal from './FRSTotal';
import Record from './Record';

import PropTypes from 'prop-types';

const HeadDashboard = ({user}) => {
  return (
    <div className='head-main'>
      <div className='head-top'>
        <div className='top-left'>
          <FRSTotal user={user}/>
        </div>
        <div className='top-right'>
          <Record  user={user}/>
        </div>
      </div>
      <div className='head-middle'>
        <div className='head-text2'>
          Monthwise FRS Summary
        </div>
        <MonthBarChart  user={user}/>
      </div>
      
    </div>
  );
};
HeadDashboard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    verticals: PropTypes.objectOf(PropTypes.number).isRequired,
   
  }).isRequired,
};
export default HeadDashboard;