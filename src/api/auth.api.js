import axios from 'axios';
import { setTokens, clearTokens, setUserData, getRefreshToken } from '../utils/authStorage.js';
import { API_BASE_URL } from '../config/api.js';

const baseURL = API_BASE_URL;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email
 * @param {string} userData.phoneNumber - User's phone number
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} User data and tokens
 */
export async function register(userData) {
  try {
    const response = await axios.post(`${baseURL}/auth/signup`, userData);
    
    if (response.data?.success && response.data?.data) {
      const { user, accessToken, refreshToken, emailSent } = response.data.data;
      
      // Store tokens and user data
      setTokens({ accessToken, refreshToken });
      setUserData(user);
      
      return {
        user,
        accessToken,
        refreshToken,
        emailSent: emailSent === true,
        message: response.data.message || '',
      };
    }
    
    throw new Error(response.data?.message || 'Registration failed');
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} User data and tokens
 */
export async function login(credentials) {
  try {
    const response = await axios.post(`${baseURL}/auth/login`, credentials);
    
    if (response.data?.success && response.data?.data) {
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Store tokens and user data
      setTokens({ accessToken, refreshToken });
      setUserData(user);
      
      return { user, accessToken, refreshToken };
    }
    
    throw new Error(response.data?.message || 'Login failed');
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await axios.post(`${baseURL}/auth/logout`, { refreshToken });
    }
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API error:', error);
  } finally {
    // Clear local storage
    clearTokens();
  }
}

/**
 * Request a 6-digit password reset code by email.
 * @param {{ email: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function forgotPassword(payload) {
  try {
    const response = await axios.post(`${baseURL}/auth/forgot-password`, payload);
    if (response.data?.success) {
      return { message: response.data.message || '' };
    }
    throw new Error(response.data?.message || 'Request failed');
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Set a new password using the emailed OTP.
 * @param {{ email: string, otp: string, password: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword(payload) {
  try {
    const response = await axios.post(`${baseURL}/auth/reset-password`, payload);
    if (response.data?.success) {
      return { message: response.data.message || '' };
    }
    throw new Error(response.data?.message || 'Reset failed');
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}
