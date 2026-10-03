import axios from 'axios';

const API_BASE_URL = 'https://siyana-mcq.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(async (config) => {
  // TODO: Add token from secure storage
  return config;
});

export default apiClient;
