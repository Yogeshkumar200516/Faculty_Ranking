import React from 'react';
import './MonthwiseFRS.css';
import BarCharts from '../../../components/Graph/BarChart';

function MonthwiseFRS() {
  return (
    <div className="grid-full">
      <div className='chart'>
        Monthwise FRS Summary
      </div>
      <BarCharts />
      <div className='monthwise-notes'>
        Monthwise FRS Distribution from all Verticals can be seen in this chart
      </div>
    </div>
  );
}

export default MonthwiseFRS;