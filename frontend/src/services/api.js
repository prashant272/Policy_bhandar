import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes timeout for large video uploads
});

// Automatically inject JWT token into header if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Retry logic for failed requests
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // If config does not exist or the retry option is not set, reject
    if (!config) {
      return Promise.reject(error);
    }
    
    // Set default retries if not set
    config.retry = config.retry || 3;
    config.retryCount = config.retryCount || 0;
    
    // Check if we've maxed out the total number of retries
    if (config.retryCount >= config.retry) {
      return Promise.reject(error);
    }
    
    // Increase the retry count
    config.retryCount += 1;
    
    // Create new promise to handle exponential backoff
    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, config.retryCount * 2000); // Wait 2s, 4s, 6s
    });
    
    // Return the promise in which recalls axios to retry the request
    await backoff;
    return API(config);
  }
);

export default API;
