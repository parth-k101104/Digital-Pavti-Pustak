import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API endpoints
const ENDPOINTS = {
  LOGIN: '/auth/login',
  VALIDATE: '/auth/validate',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',
  USERS: '/auth/users',
  HEALTH: '/health',
  INFO: '/info',
  // Donation endpoints
  DONATIONS: '/donations',
  DONATIONS_BY_YEAR: '/donations',
  DONATIONS_ALL: '/donations/all',
  DONATIONS_YEARS: '/donations/years',
  DONATIONS_STATS: '/donations',
  DONATIONS_HEALTH: '/donations/health',
};

/**
 * API Service class for handling all backend communication
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get stored JWT token
   */
  async getToken() {
    try {
      return await AsyncStorage.getItem('jwt_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Store JWT token
   */
  async setToken(token) {
    try {
      await AsyncStorage.setItem('jwt_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Remove JWT token
   */
  async removeToken() {
    try {
      await AsyncStorage.removeItem('jwt_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  /**
   * Make HTTP request with proper headers and error handling
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (token && !options.skipAuth) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${config.method} ${url}`);

      const response = await fetch(url, config);

      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      console.log(`📡 API Response: ${response.status}`, data);

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        console.log('🔑 Token expired or invalid, removing from storage');
        await this.removeToken();
        return {
          success: false,
          error: 'Authentication expired. Please login again.',
          status: 401,
          tokenExpired: true,
        };
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error);

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your connection.',
          status: 0,
          networkError: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Network error occurred',
        status: error.status || 500,
      };
    }
  }

  /**
   * User login with firstName_lastName format
   */
  async login(name, password) {
    return this.makeRequest(ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ name, password }),
      skipAuth: true,
    });
  }

  /**
   * Validate current token
   */
  async validateToken() {
    return this.makeRequest(ENDPOINTS.VALIDATE, {
      method: 'POST',
    });
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    return this.makeRequest(ENDPOINTS.ME);
  }

  /**
   * User logout
   */
  async logout() {
    const result = await this.makeRequest(ENDPOINTS.LOGOUT, {
      method: 'POST',
    });

    // Always remove token locally, regardless of server response
    await this.removeToken();

    return result;
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    return this.makeRequest(ENDPOINTS.USERS);
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.makeRequest(ENDPOINTS.HEALTH, {
      skipAuth: true,
    });
  }

  /**
   * Get application info
   */
  async getAppInfo() {
    return this.makeRequest(ENDPOINTS.INFO, {
      skipAuth: true,
    });
  }

  /**
   * Check if backend is available
   */
  async isBackendAvailable() {
    try {
      const result = await this.healthCheck();
      return result.success && result.data?.status === 'UP';
    } catch (error) {
      console.error('Backend availability check failed:', error);
      return false;
    }
  }

  // ===== DONATION API METHODS =====

  /**
   * Create a new donation
   */
  async createDonation(donationData) {
    return this.makeRequest(ENDPOINTS.DONATIONS, {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  /**
   * Get donations for a specific year
   */
  async getDonationsByYear(year) {
    return this.makeRequest(`${ENDPOINTS.DONATIONS_BY_YEAR}/${year}`);
  }

  /**
   * Get all donations (admin only)
   */
  async getAllDonations() {
    return this.makeRequest(ENDPOINTS.DONATIONS_ALL);
  }

  /**
   * Update a donation (admin only)
   */
  async updateDonation(year, donationId, donationData) {
    return this.makeRequest(`${ENDPOINTS.DONATIONS}/${year}/${donationId}`, {
      method: 'PUT',
      body: JSON.stringify(donationData),
    });
  }

  /**
   * Delete a donation (admin only)
   */
  async deleteDonation(year, donationId) {
    return this.makeRequest(`${ENDPOINTS.DONATIONS}/${year}/${donationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get available years with donation data
   */
  async getAvailableYears() {
    return this.makeRequest(ENDPOINTS.DONATIONS_YEARS);
  }

  /**
   * Get statistics for a specific year
   */
  async getYearStats(year) {
    return this.makeRequest(`${ENDPOINTS.DONATIONS_STATS}/${year}/stats`);
  }

  /**
   * Check donation service health
   */
  async checkDonationHealth() {
    return this.makeRequest(ENDPOINTS.DONATIONS_HEALTH);
  }
}

// Export singleton instance
export default new ApiService();

// Export class for testing
export { ApiService };
