import React from 'react';
import './VerticalFRS.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import authImage from '../../../assets/images/auth.png';
import logoImage from '../../../assets/images/logo.png';

const VerticalwiseFRS = () => {
  // Function to handle Google sign-in
  const handleGoogleSignIn = () => {
    // Implement Google sign-in functionality here
    console.log('Signing in with Google...');
  };

  return (
    <div>
      <h1>Verticalwise FRS Page</h1>
    </div>
  );
};

export default VerticalwiseFRS;
