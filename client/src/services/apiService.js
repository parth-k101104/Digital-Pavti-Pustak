import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API endpoints
const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  VALIDATE: '/auth/validate',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',

  // System info
  HEALTH: '/health',
  INFO: '/info',

  // Donations
  DONATIONS: '/donations',
  DONATIONS_BY_YEAR: '/donations',
  DONATIONS_ALL: '/donations/all',
  DONATIONS_YEARS: '/donations/years',
  DONATIONS_STATS: '/donations',
  DONATIONS_HEALTH: '/donations/health',

  // Users
  USERS: '/users',
  USERS_CREATE: '/users/create',
  USERS_ACTIVE: '/users/active',
  USERS_ROLE: '/users/role',
  USERS_DEACTIVATE: '/users/deactivate',
  USERS_UPDATE_PASSWORD: '/users/update-password',
  USERS_HEALTH: '/users/health',
};

/**
 * API Service class for handling all backend communication
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // ======== TOKEN HANDLERS ========
  async getToken() {
    try {
      return await AsyncStorage.getItem('jwt_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token) {
    try {
      await AsyncStorage.setItem('jwt_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  async removeToken() {
    try {
      await AsyncStorage.removeItem('jwt_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // ======== GENERIC REQUEST HANDLER ========
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const defaultHeaders = { 'Content-Type': 'application/json' };
    if (token && !options.skipAuth) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      method: 'GET',
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${config.method} ${url}`);
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type');
      const data = contentType && contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() };

      console.log(`📡 API Response: ${response.status}`, data);

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

      return { success: true, data, status: response.status };
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error);

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

  // ======== AUTH METHODS ========
  async login(name, password) {
    return this.makeRequest(ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ name, password }),
      skipAuth: true,
    });
  }

  async validateToken() {
    return this.makeRequest(ENDPOINTS.VALIDATE, { method: 'POST' });
  }

  async getCurrentUser() {
    return this.makeRequest(ENDPOINTS.ME);
  }

  async logout() {
    const result = await this.makeRequest(ENDPOINTS.LOGOUT, { method: 'POST' });
    await this.removeToken(); // Always remove token locally
    return result;
  }

  // ======== SYSTEM INFO ========
  async healthCheck() {
    return this.makeRequest(ENDPOINTS.HEALTH, { skipAuth: true });
  }

  async getAppInfo() {
    return this.makeRequest(ENDPOINTS.INFO, { skipAuth: true });
  }

  async isBackendAvailable() {
    try {
      const result = await this.healthCheck();
      return result.success && result.data?.status === 'UP';
    } catch (error) {
      console.error('Backend availability check failed:', error);
      return false;
    }
  }

  // ======== DONATION METHODS ========
  async createDonation(donationData) {
    return this.makeRequest(ENDPOINTS.DONATIONS, {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async getDonationsByYear(year) {
    return this.makeRequest(`${ENDPOINTS.DONATIONS_BY_YEAR}/${year}`);
  }

  async getAllDonations() {
    return this.makeRequest(ENDPOINTS.DONATIONS_ALL);
  }

  async updateDonation(year, donationId, donationData) {
    return this.makeRequest(`${ENDPOINTS.DONATIONS}/${year}/${donationId}`, {
      method: 'PUT',
      body: JSON.stringify(donationData),
    });
  }

  async deleteDonation(year, donationId) {
    return this.makeRequest(`${ENDPOINTS.DONATIONS}/${year}/${donationId}`, {
      method: 'DELETE',
    });
  }

  async getAvailableYears() {
    return this.makeRequest(ENDPOINTS.DONATIONS_YEARS);
  }

  async getYearStats(year) {
    return this.makeRequest(`${ENDPOINTS.DONATIONS_STATS}/${year}/stats`);
  }

  async checkDonationHealth() {
    return this.makeRequest(ENDPOINTS.DONATIONS_HEALTH);
  }

  // ======== USER METHODS ========
  async createUser(userData) {
    return this.makeRequest(ENDPOINTS.USERS_CREATE, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getAllActiveUsers() {
    return this.makeRequest(ENDPOINTS.USERS_ACTIVE);
  }

  async getUsersByRole(role) {
    return this.makeRequest(`${ENDPOINTS.USERS_ROLE}/${role}`);
  }

  async deactivateUser(firstName, lastName) {
    return this.makeRequest(`${ENDPOINTS.USERS_DEACTIVATE}/${firstName}/${lastName}`, {
      method: 'PUT',
    });
  }

  async updatePassword(firstName, lastName, newPassword) {
    const query = `?newPassword=${encodeURIComponent(newPassword)}`;
    return this.makeRequest(
      `${ENDPOINTS.USERS_UPDATE_PASSWORD}/${firstName}/${lastName}${query}`,
      { method: 'PUT' }
    );
  }

  async checkUserServiceHealth() {
    return this.makeRequest(ENDPOINTS.USERS_HEALTH);
  }
}

// Export singleton instance
export default new ApiService();

// Export class for testing
export { ApiService };
