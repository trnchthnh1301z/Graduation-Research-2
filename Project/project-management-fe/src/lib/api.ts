import axios from "axios";

export const API_BASE_URL = 'http://localhost:8080/api';
export const API_TIMEOUT = 15000;

// Create an axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      return Promise.reject(new Error(error.response.data.message || 'An error occurred'));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Error:', error.message);
      return Promise.reject(error);
    }
  }
);
