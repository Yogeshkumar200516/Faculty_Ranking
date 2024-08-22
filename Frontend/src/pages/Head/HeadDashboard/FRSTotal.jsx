import React, { useEffect, useState } from "react";
import frsTotalImage from '../../../assets/images/frs_gained.png';
import frsLostImage from '../../../assets/images/frs_lost.png';
import './FRSTotal.css';
import PropTypes from 'prop-types';

function FRSTotal({ user }) {
    const [frsSummary, setFrsSummary] = useState({ frsProvided: 0, frsTaken: 0, vertical: '' });

    useEffect(() => {
        const fetchFrsSummary = async () => {
            try {
                const token = localStorage.getItem('jwt');
                if (!token) {
                    console.error('No access token found');
                    return;
                }
                const response = await fetch(`http://localhost:4000/api/verticalhead/frs-summary/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log('FRS Summary Response:', data); // Add this line
                setFrsSummary(data);
            } catch (error) {
                console.error('Error fetching FRS summary:', error);
            }
        };

        fetchFrsSummary();
    }, [user.id]);

    console.log('FRS Summary State:', frsSummary);

    return (
        <div className="frs-body">
            <div className='head-text4'>Overall FRS Summary for {frsSummary.vertical || 'Loading...'}</div>
            <div className='left-content'>
                <div className='positive-update'>
                    <div className="summary4">
                        <img className="summary-image2" src={frsTotalImage} alt="FRS Total Image" />
                        <div className="summary-text2">
                            <span className="summary-title2">FRS Provided</span>
                            <span className="summary-value2" style={{ color: '#4caf50' }}>{frsSummary.frsProvided || '0'}</span>
                        </div>
                    </div>
                </div>
                <div className='negative-update'>
                    <div className="summary5">
                        <img className="summary-image2" src={frsLostImage} alt="FRS Lost Image" />
                        <div className="summary-text2">
                            <span className="summary-title2">FRS Taken</span>
                            <span className="summary-value2" style={{ color: '#e64a19' }}>{frsSummary.frsTaken || '0'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

FRSTotal.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        verticals: PropTypes.objectOf(PropTypes.number).isRequired,
    }).isRequired,
};

export default FRSTotal;
