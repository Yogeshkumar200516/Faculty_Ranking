import React, { useEffect, useState } from "react";
import './Record.css';
import updateIcon from '../../../assets/images/frs_total.png';
import positiveIcon from '../../../assets/images/increase.png';
import negativeIcon from '../../../assets/images/decrease.png';
import PropTypes from 'prop-types';

function Record({ user }) {
    const { id } = user;
    const [recordSummary, setRecordSummary] = useState({
        totalUpdates: 0,
        positiveUpdates: 0,
        negativeUpdates: 0
    });

    useEffect(() => {
        const fetchRecordSummary = async () => {
            try {
                const token = localStorage.getItem('jwt');
                if (!token) {
                    console.error('No access token found');
                    return;
                }
                const response = await fetch(`http://localhost:4000/api/verticalhead/record-summary/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setRecordSummary(data);
            } catch (error) {
                console.error('Error fetching record summary:', error);
            }
        };

        fetchRecordSummary();
    }, [id]);

    return (
        <div className="record-body">
            <div className="head-text1">Update Records</div>
            <div className="right-content">
                <div className="update-details">
                    <div className="update-item">
                        <img className="update-icon" src={updateIcon} alt="Update Icon" />
                        <div className="update-text">
                            <div className="update-title">No. of Updates</div>
                            <div className="update-value">{recordSummary.totalUpdates}</div>
                        </div>
                    </div>
                    <div className="update-item">
                        <img className="update-icon" src={positiveIcon} alt="Positive Icon" />
                        <div className="update-text">
                            <div className="update-title">Positive Updates</div>
                            <div className="update-value positive">{recordSummary.positiveUpdates}</div>
                        </div>
                    </div>
                    <div className="update-item">
                        <img className="update-icon" src={negativeIcon} alt="Negative Icon" />
                        <div className="update-text">
                            <div className="update-title">Negative Updates</div>
                            <div className="update-value negative">{recordSummary.negativeUpdates}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Record.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        verticals: PropTypes.objectOf(PropTypes.number).isRequired,
    }).isRequired,
};

export default Record;
