import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add access token
api.interceptors.request.use(config => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
}, error => Promise.reject(error));

// Response interceptor to handle token refresh
api.interceptors.response.use(response => response, async error => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await fetch('http://localhost:4000/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const { accessToken } = await response.json();
                localStorage.setItem('accessToken', accessToken);
                api.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);
            }
        } catch (refreshError) {
            // Handle refresh token error
        }
    }

    return Promise.reject(error);
});

export default api;
