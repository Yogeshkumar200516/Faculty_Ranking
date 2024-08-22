import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './LoginPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import authImage from '../../assets/images/auth.png';
import logoImage from '../../assets/images/logo.png';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setLoading(true);
      try {
        const { data: userInfo } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token} `},
        });

        const { data: loginResponse } = await axios.post('http://localhost:4000/login', {
          email: userInfo.email,
        });

        const { token, user } = loginResponse;

        const userData = {
          email:user.email,
          id: user.id || 'Unknown',
          role: user.role || 'guest',
          verticalHeadId: user.verticals?.vertical_head || 'N/A',
          verticals: user.verticals || {},
          department: user.department || 'Not Assigned',
        };

        localStorage.setItem('jwt', token);
        localStorage.setItem('user', JSON.stringify(userData));

        onLogin(userData, token);
        navigate('/');
      } catch (err) {
        console.error('Login Error:', err);
        setError('Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Login Error:', error);
      setError('Google login failed. Please try again.');
      setLoading(false);
    },
  });

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="left">
          <h1 className="login-title">Faculty Worklog</h1>
          <p className="login-subtitle">
            A teacher is a great listener of knowledge, prosperity, and light, from which we can benefit greatly throughout our life.
          </p>
          <div className="login-illustration">
            <img src={authImage} alt="Illustration" />
          </div>
        </div>
      </div>
      <div className="login-right">
        <img src={logoImage} alt="Logo" className="login-logo" />
        <div className="login-signin">Sign In</div>
        <div className="login-access">Get access to your account</div>
        <hr className="divider" />
        <form className="login-form">
          <button 
            type="button" 
            className="login-button-google" 
            onClick={() => handleGoogleLogin()} 
            disabled={loading}
          >
            <FontAwesomeIcon icon={faGoogle} className="google-icon" />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default LoginPage;