import axios from 'axios';
import { tokenStore } from '../storage/token';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://siyana-mcq.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * A rejected token means the session is dead. Clearing here stops the app
 * from looping on 401s; the navigator picks up the signed-out state and
 * returns the user to the auth screen.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await tokenStore.clear();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
export { API_BASE_URL };