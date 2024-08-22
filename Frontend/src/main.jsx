import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';

const clientId = '794179756170-q2jggerfesll7g0ip7kiukbvt46ckdpm.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </BrowserRouter>
);
