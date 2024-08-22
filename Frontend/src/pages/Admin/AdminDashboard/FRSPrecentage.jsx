import React from 'react';
import './FRSPercentage.css';
import PieCharts from '../../../components/Graph/PieChart';

function FRSPercentage() {
  return (
    <div className="new-grid">
      <div className='grid-head'>
        FRS Percentage accross Verticals
      </div>
      <PieCharts />
    </div>
  );
}

export default FRSPercentage;
