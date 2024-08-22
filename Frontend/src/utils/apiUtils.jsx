import axios from 'axios';

// Define the base URL for your API
const API_URL = 'http://localhost:4000';

// Function to refresh the access token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await axios.post(`${API_URL}/refresh-token`, { token: refreshToken });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    return accessToken;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw error;
  }
};

// Function to make authenticated requests
export const makeAuthenticatedRequest = async (url, options = {}) => {
  try {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('No access token found');
    }

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios(`${API_URL}${url}`, options);

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token might be expired, try refreshing
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        // Retry the original request
        options.headers.Authorization = `Bearer ${newAccessToken}`;
        const response = await axios(`${API_URL}${url}`, options);
        return response.data;
      }
    }

    throw error;
  }
};
