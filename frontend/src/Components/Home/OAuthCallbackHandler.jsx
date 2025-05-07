import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userId = urlParams.get('userId');
    const username = urlParams.get('username'); // Grab username too

    if (accessToken && userId && username) {
      // Save tokens and user info to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken); // Optional
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);

      // Dispatch a custom event to notify app that auth state changed
      window.dispatchEvent(new Event('authStateChanged'));

      // Optionally, redirect user to a specific page (e.g., dashboard/home)
      navigate('/', { replace: true });
    } else {
      // If required data is missing, redirect to home or error page
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return <div>Loading... Please wait while we log you in.</div>;
};

export default OAuthCallback;
