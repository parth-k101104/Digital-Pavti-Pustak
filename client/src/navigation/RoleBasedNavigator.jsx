import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import HomePage from '../screens/HomePage';
import DonationsPage from '../screens/DonationsPage';
import colors from '../styles/colors';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Custom Drawer Content Component
function CustomDrawerContent({ navigation, state }) {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('Logout button pressed'); // Debug log
            await logout();
            console.log('Logout completed'); // Debug log
          }
        }
      ]
    );
  };

  const isActiveRoute = (routeName) => {
    const currentRoute = state.routes[state.index];
    return currentRoute.name === routeName;
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={50} color={colors.primary} />
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.drawerItems}>
        {isAdmin() && (
          <TouchableOpacity
            style={[
              styles.drawerItem,
              isActiveRoute('Home') && styles.drawerItemActive
            ]}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons
              name={isActiveRoute('Home') ? "home" : "home-outline"}
              size={24}
              color={isActiveRoute('Home') ? colors.primary : colors.textDark}
            />
            <Text style={[
              styles.drawerItemText,
              isActiveRoute('Home') && styles.drawerItemTextActive
            ]}>
              Dashboard
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.drawerItem,
            isActiveRoute('Donations') && styles.drawerItemActive
          ]}
          onPress={() => navigation.navigate('Donations')}
        >
          <Ionicons
            name={isActiveRoute('Donations') ? "heart" : "heart-outline"}
            size={24}
            color={isActiveRoute('Donations') ? colors.primary : colors.textDark}
          />
          <Text style={[
            styles.drawerItemText,
            isActiveRoute('Donations') && styles.drawerItemTextActive
          ]}>
            Donations
          </Text>
        </TouchableOpacity>

        {/* Add more navigation items based on role */}
        {isAdmin() && (
          <>
            <TouchableOpacity style={styles.drawerItem}>
              <Ionicons name="people-outline" size={24} color={colors.textDark} />
              <Text style={styles.drawerItemText}>Manage Users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem}>
              <Ionicons name="analytics-outline" size={24} color={colors.textDark} />
              <Text style={styles.drawerItemText}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem}>
              <Ionicons name="settings-outline" size={24} color={colors.textDark} />
              <Text style={styles.drawerItemText}>Settings</Text>
            </TouchableOpacity>
          </>
        )}

        {/* User-specific items */}
        {!isAdmin() && (
          <TouchableOpacity style={styles.drawerItem}>
            <Ionicons name="person-outline" size={24} color={colors.textDark} />
            <Text style={styles.drawerItemText}>My Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout Button */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Admin Drawer Navigator (Full Access)
function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          backgroundColor: colors.cardBg,
          width: 280,
        },
        overlayColor: colors.overlay,
        sceneContainerStyle: {
          backgroundColor: colors.background,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomePage} />
      <Drawer.Screen name="Donations" component={DonationsPage} />
    </Drawer.Navigator>
  );
}

// User Drawer Navigator (Limited Access)
function UserDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          backgroundColor: colors.cardBg,
          width: 280,
        },
        overlayColor: colors.overlay,
        sceneContainerStyle: {
          backgroundColor: colors.background,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Donations" component={DonationsPage} />
    </Drawer.Navigator>
  );
}

// Main Role-based Navigator
export default function RoleBasedNavigator() {
  const { user, isAdmin } = useAuth();

  // Create Stack Navigator for additional screens
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAdmin() ? (
        // Admin gets full access with drawer
        <Stack.Screen name="AdminDrawer" component={AdminDrawerNavigator} />
      ) : (
        // Non-admin users get limited access
        <Stack.Screen name="UserDrawer" component={UserDrawerNavigator} />
      )}

      {/* Protected admin-only screens that are not in drawer */}
      {isAdmin() && (
        <>
          <Stack.Screen name="ManageUsers" component={DonationsPage} />
          <Stack.Screen name="Reports" component={DonationsPage} />
          <Stack.Screen name="Settings" component={DonationsPage} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  drawerHeader: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.cardBg,
    marginTop: 12,
    textShadowColor: colors.shadowDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 16,
    shadowColor: colors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 1,
  },
  drawerItemActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.shadowMedium,
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  drawerItemText: {
    fontSize: 16,
    color: colors.textDark,
    marginLeft: 16,
    fontWeight: '600',
  },
  drawerItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  drawerFooter: {
    borderTopWidth: 2,
    borderTopColor: colors.borderLight,
    padding: 24,
    backgroundColor: colors.surfaceElevated,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    fontSize: 16,
    color: colors.danger,
    marginLeft: 12,
    fontWeight: '600',
  },
});
