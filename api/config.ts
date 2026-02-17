import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { deleteToken, getToken, setToken } from '../storage/tokenStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4500';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Access tokens are typically short-lived and can be stored in-memory
      // For refresh tokens, use SecureStore
      const token = await getToken('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Handle FormData - don't set Content-Type, let browser set it with boundary
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError & { config: InternalAxiosRequestConfig & { _retry?: boolean } }) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getToken('refreshToken');
        if (refreshToken) {
          // Attempt to refresh the token
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          await setToken('accessToken', accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed
        // For client-side, typically clear all tokens and force re-login
        await deleteToken('accessToken');
        await deleteToken('refreshToken');
        // Do not redirect here; let the app decide based on guarded routes
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api, API_BASE_URL };

