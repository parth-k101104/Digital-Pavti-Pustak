import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authKey, setAuthKey] = useState(0); // Force re-render key
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Restore user on app start
  useEffect(() => {
    const restoreUser = async () => {
      try {
        console.log('🔄 Restoring user session...');

        // Check if backend is available
        const isAvailable = await apiService.isBackendAvailable();
        setBackendAvailable(isAvailable);

        if (!isAvailable) {
          console.warn('⚠️ Backend not available, using offline mode');
          setIsLoading(false);
          return;
        }

        // Try to validate existing token
        const result = await apiService.validateToken();

        if (result.success && result.data?.valid) {
          console.log('✅ Token valid, restoring user session');
          const userData = {
            fullName: result.data.fullName,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            role: result.data.role,
            name: `${result.data.firstName} ${result.data.lastName}`, // Display name
            redirectTo: result.data.redirectTo,
          };

          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.log('❌ Token invalid or expired');
          await apiService.removeToken();
        }
      } catch (error) {
        console.error('Error restoring user:', error);
        await apiService.removeToken();
      } finally {
        setIsLoading(false);
      }
    };
    restoreUser();
  }, []);

  // Login with firstName_lastName format
  const login = async (name, password) => {
    try {
      console.log('🔐 Attempting login for:', name);

      // Validate name format
      if (!name || !name.includes('_') || name.split('_').length !== 2) {
        return {
          success: false,
          error: 'Please enter name in format "FirstName_LastName" (e.g., "John_Doe")'
        };
      }

      // Check if backend is available
      if (!backendAvailable) {
        const isAvailable = await apiService.isBackendAvailable();
        setBackendAvailable(isAvailable);

        if (!isAvailable) {
          return {
            success: false,
            error: 'Backend server is not available. Please check your connection and try again.'
          };
        }
      }

      const result = await apiService.login(name, password);

      if (result.success && result.data?.success) {
        const loginData = result.data;
        console.log('✅ Login successful:', loginData);

        // Store token
        await apiService.setToken(loginData.token);

        // Create user object
        const userData = {
          fullName: loginData.fullName,
          firstName: loginData.firstName,
          lastName: loginData.lastName,
          role: loginData.role,
          name: `${loginData.firstName} ${loginData.lastName}`, // Display name
          redirectTo: loginData.redirectTo,
        };

        setUser(userData);
        setIsAuthenticated(true);
        setAuthKey(prev => prev + 1); // re-render navigation

        return {
          success: true,
          user: userData,
          redirectTo: loginData.redirectTo
        };
      } else {
        const errorMessage = result.data?.message || result.error || 'Invalid name or password';
        console.log('❌ Login failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Logout
  const logout = async () => {
    console.log('🔓 Logout function called');
    try {
      // Call backend logout if available
      if (backendAvailable) {
        await apiService.logout();
      } else {
        // Remove token locally if backend not available
        await apiService.removeToken();
      }

      console.log('🗑️ Token removed from storage');

      setUser(null);
      setIsAuthenticated(false);
      setAuthKey(prev => prev + 1); // trigger re-render
      console.log('✅ State cleared - logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Always clear local state even if backend call fails
      await apiService.removeToken();
      setUser(null);
      setIsAuthenticated(false);
      setAuthKey(prev => prev + 1);
    }
  };

  // Clear storage
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      await apiService.removeToken();
      console.log('All storage cleared');
      setUser(null);
      setIsAuthenticated(false);
      setAuthKey(prev => prev + 1);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  // Get all users (admin only)
  const getAllUsers = async () => {
    if (!isAdmin()) {
      return { success: false, error: 'Access denied' };
    }

    try {
      const result = await apiService.getAllUsers();

      // Handle token expiration
      if (result.tokenExpired) {
        console.log('🔑 Token expired during API call, logging out');
        await logout();
        return { success: false, error: 'Session expired. Please login again.' };
      }

      return result;
    } catch (error) {
      console.error('Error getting users:', error);
      return { success: false, error: 'Failed to fetch users' };
    }
  };

  // Validate current session
  const validateSession = async () => {
    try {
      const result = await apiService.validateToken();

      if (!result.success || !result.data?.valid) {
        console.log('🔑 Session validation failed, logging out');
        await logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      await logout();
      return false;
    }
  };

  // Check if user is admin (backend uses 'ADMIN' role)
  const isAdmin = () => user?.role === 'ADMIN';

  // Check if user has specific role
  const hasRole = role => user?.role === role;

  const value = {
    isAuthenticated,
    user,
    isLoading,
    authKey,
    backendAvailable,
    login,
    logout,
    clearStorage,
    getAllUsers,
    validateSession,
    isAdmin,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;