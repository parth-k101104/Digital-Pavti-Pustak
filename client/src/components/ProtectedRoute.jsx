import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../styles/colors';

// Component to protect routes based on user roles
export default function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  adminOnly = false,
  fallbackComponent = null 
}) {
  const { user, isAdmin, hasRole } = useAuth();

  // Check if user has required permissions
  const hasPermission = () => {
    if (adminOnly && !isAdmin()) {
      return false;
    }
    
    if (requiredRole && !hasRole(requiredRole)) {
      return false;
    }
    
    return true;
  };

  // Default fallback component for unauthorized access
  const DefaultFallback = () => (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={64} color={colors.textLight} />
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.message}>
          You don't have permission to access this page.
        </Text>
        <Text style={styles.roleInfo}>
          Your role: {user?.role?.toUpperCase() || 'UNKNOWN'}
        </Text>
        {requiredRole && (
          <Text style={styles.requiredRole}>
            Required role: {requiredRole.toUpperCase()}
          </Text>
        )}
        {adminOnly && (
          <Text style={styles.requiredRole}>
            Admin access required
          </Text>
        )}
      </View>
    </View>
  );

  // If user has permission, render children
  if (hasPermission()) {
    return children;
  }

  // Otherwise, render fallback component
  return fallbackComponent || <DefaultFallback />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    padding: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  roleInfo: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '600',
    marginBottom: 8,
  },
  requiredRole: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '500',
  },
});
