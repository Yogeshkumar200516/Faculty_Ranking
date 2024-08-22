import React, { useState } from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

const GaugeChart = ({ earned, lost, total }) => {
  const gaugeValue = (earned / total) * 100;

  const [isTooltipVisible, setTooltipVisible] = useState(false);

  const handleMouseEnter = () => setTooltipVisible(true);
  const handleMouseLeave = () => setTooltipVisible(false);

  return (
    <div className="gauge-wrapper">
      <Gauge
        className="gauge-chart"
        width={150}
        height={150}
        value={gaugeValue}
        cornerRadius="50%"
        sx={(theme) => ({
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 24,
            color: theme.palette.primary.contrastText,
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: 'url(#gradient)', // Use gradient
          },
          [`& .${gaugeClasses.referenceArc}`]: {
            fill: theme.palette.text.disabled,
          },
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#52b202', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#f50057', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
      {isTooltipVisible && (
        <div className="tooltip visible">
          <div className="tooltip-item">
            <span className="tooltip-label">Earned:</span>
            <span className="tooltip-value">{earned}</span>
          </div>
          <div className="tooltip-item">
            <span className="tooltip-label">Lost:</span>
            <span className="tooltip-value">{lost}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaugeChart;
