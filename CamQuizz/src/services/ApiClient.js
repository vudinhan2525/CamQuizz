import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// API base URL - using ngrok for remote access
const API_BASE_URL = `${API_URL}/api/v1`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
  validateStatus: status => status >= 200 && status < 500,
  withCredentials: true,

});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {

    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // config.headers.Authorization = token;

    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.log('Unauthorized access, clearing auth data and redirecting to login');
          // Clear auth data when token is invalid
          try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            console.log('Auth data cleared due to 401 error');

            // You might want to navigate to login screen here
            // This would require importing navigation or using a global state
          } catch (clearError) {
            console.error('Error clearing auth data:', clearError);
          }
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