import React from 'react';
import './ViewPopup.css'; // Import CSS for styling
import PropTypes from 'prop-types';

const ViewPopup = ({ data, onClose }) => {
  const { verticalName, date, frsUpdate, reason } = data;

  return (
    <div className="popup-container">
      <div className="popup">
        <h2 className="popup-title">Details</h2>
        <div className="popup-content">
          <div className="popup-row">
            <strong>Vertical Name:</strong> {verticalName}
          </div>
          <div className="popup-row">
            <strong>Date:</strong> {date}
          </div>
          <div className="popup-row">
            <strong>Updated FRS:</strong> {frsUpdate}
          </div>
          {/* Add more fields as needed */}
          <div className="popup-row">
            <strong>Reason:</strong> {reason}
          </div>
        </div>
        <div className="popup-actions">
          <button className="popup-close" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

ViewPopup.propTypes = {
  data: PropTypes.shape({
    verticalName: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    frsUpdate: PropTypes.number.isRequired,
    reason: PropTypes.string.isRequired,
    // Add more PropTypes for other fields
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ViewPopup;
