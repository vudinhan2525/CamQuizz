import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL}  from '@env';

// API base URL - using ngrok for remote access
// const API_BASE_URL = `${API_URL}/api/v1`;

const API_BASE_URL = 'https://ca3c-14-169-33-91.ngrok-free.app/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
  validateStatus: status => status >= 200 && status < 500,
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (token) {
        console.log('Token for API request:', token.substring(0, 15) + '...');
        console.log('Token length:', token.length);

        // Đảm bảo token không có khoảng trắng
        const cleanToken = token.trim();

        // Thêm token vào header
        config.headers.Authorization = `Bearer ${cleanToken}`;

        // Log đầy đủ header để debug
        console.log('Request headers:', JSON.stringify(config.headers));
      } else {
        console.warn('No token available for request');
      }

      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('Request data:', config.data);
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Response [${response.status}] for ${response.config.method.toUpperCase()} ${response.config.url}`);
    if (response.data) {
      console.log('Response data:', response.data);
    }
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.log('Unauthorized access, token may be invalid or expired');
          // Không xóa token ở đây, chỉ thông báo lỗi
          break;
        case 403:
          console.log('Forbidden access, you do not have permission');
          break;
        case 404:
          console.log('Resource not found');
          break;
        case 422:
          console.log('Validation error:', error.response.data);
          break;
        case 429:
          console.log('Too many requests, please try again later');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.log('Server error, please try again later');
          break;
        default:
          console.log('An error occurred:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received. Network error or server is down:', error.request);
    } else {
      // Error in setting up the request
      console.error('Request setup error:', error.message);
    }

    // Thêm thông tin về thời gian và URL gây lỗi để debug
    console.log('Error occurred at:', new Date().toISOString());
    console.log('Request URL:', error.config?.url);
    console.log('Request method:', error.config?.method);

    return Promise.reject(error);
  }
);

export default apiClient;
