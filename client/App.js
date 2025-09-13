import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RoleBasedNavigator from "./src/navigation/RoleBasedNavigator";
import colors from "./src/styles/colors";

// Main App Content Component
function AppContent() {
  const { isAuthenticated, isLoading, authKey } = useAuth();

  // Show loading spinner while checking authentication state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  console.log('🧭 AppContent rendering - isAuthenticated:', isAuthenticated, 'authKey:', authKey);

  // Show login screen if not authenticated, otherwise show role-based navigation
  // Using authKey to force complete re-render when authentication state changes
  return isAuthenticated ? (
    <RoleBasedNavigator key={`authenticated-${authKey}`} />
  ) : (
    <LoginScreen key={`unauthenticated-${authKey}`} />
  );
}

// Root App Component
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
