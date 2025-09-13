import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // no initial loading needed
  const [authKey, setAuthKey] = useState(0); // Force re-render key

  // Mock user database
  const mockUsers = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
    { id: 2, username: 'user1', password: 'user123', role: 'user', name: 'Regular User' },
    { id: 3, username: 'donor', password: 'donor123', role: 'donor', name: 'Donor User' }
  ];

  // Login
  const login = async (username, password) => {
    try {
      const foundUser = mockUsers.find(
        u => u.username === username && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;

        await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));

        setUser(userWithoutPassword);
        setIsAuthenticated(true);

        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, error: 'Invalid username or password' };
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
      await AsyncStorage.removeItem('user');
      console.log('🗑️ User removed from storage');

      setUser(null);
      setIsAuthenticated(false);
      setAuthKey(prev => prev + 1);
      console.log('✅ State cleared - logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Clear storage
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('All AsyncStorage cleared');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const hasRole = role => user?.role === role;

  const value = {
    isAuthenticated,
    user,
    isLoading,
    authKey,
    login,
    logout,
    clearStorage,
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



// import React, { createContext, useContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const AuthContext = createContext({});

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [authKey, setAuthKey] = useState(0); // Force re-render key

//   // Check if user is already logged in when app starts
//   useEffect(() => {
//     console.log('AuthProvider mounted, checking auth state...'); // Debug log
//     checkAuthState();
//   }, []);

//   // Debug effect to track authentication state changes
//   useEffect(() => {
//     console.log('🔄 Authentication state changed:', {
//       isAuthenticated,
//       user: user?.username || 'null',
//       userRole: user?.role || 'null',
//       isLoading
//     });
//   }, [isAuthenticated, user, isLoading]);

//   const checkAuthState = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('user');
//       console.log('Checking auth state, stored user data:', userData); // Debug log
//       if (userData) {
//         const parsedUser = JSON.parse(userData);
//         console.log('Parsed user:', parsedUser); // Debug log
//         setUser(parsedUser);
//         setIsAuthenticated(true);
//       } else {
//         console.log('No stored user data found'); // Debug log
//         setUser(null);
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error('Error checking auth state:', error);
//       setUser(null);
//       setIsAuthenticated(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Mock user database - In a real app, this would be an API call
//   const mockUsers = [
//     {
//       id: 1,
//       username: 'admin',
//       password: 'admin123',
//       role: 'admin',
//       name: 'Administrator'
//     },
//     {
//       id: 2,
//       username: 'user1',
//       password: 'user123',
//       role: 'user',
//       name: 'Regular User'
//     },
//     {
//       id: 3,
//       username: 'donor',
//       password: 'donor123',
//       role: 'donor',
//       name: 'Donor User'
//     }
//   ];

//   // Login function
//   const login = async (username, password) => {
//     try {
//       // Find user in mock database
//       const foundUser = mockUsers.find(
//         u => u.username === username && u.password === password
//       );

//       if (foundUser) {
//         // Remove password from user object for security
//         const { password: _, ...userWithoutPassword } = foundUser;
        
//         // Save user data to AsyncStorage
//         await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
//         // Update state
//         setUser(userWithoutPassword);
//         setIsAuthenticated(true);
        
//         return { success: true, user: userWithoutPassword };
//       } else {
//         return { success: false, error: 'Invalid username or password' };
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       return { success: false, error: 'Login failed. Please try again.' };
//     }
//   };

//   // Logout function
//   const logout = async () => {
//     console.log('🔓 Logout function called'); // Debug log
//     try {
//       // Check what's in storage before removal
//       const beforeRemoval = await AsyncStorage.getItem('user');
//       console.log('📦 Data in AsyncStorage before removal:', beforeRemoval);

//       // Remove user data from AsyncStorage
//       await AsyncStorage.removeItem('user');
//       console.log('🗑️ AsyncStorage.removeItem() completed');

//       // Verify removal
//       const afterRemoval = await AsyncStorage.getItem('user');
//       console.log('📦 Data in AsyncStorage after removal:', afterRemoval);

//       // Update state
//       setUser(null);
//       setIsAuthenticated(false);
//       setAuthKey(prev => prev + 1); // Force complete re-render
//       console.log('✅ Authentication state cleared - isAuthenticated: false, user: null');

//       // Force a small delay to ensure state updates are processed
//       await new Promise(resolve => setTimeout(resolve, 100));
//       console.log('⏱️ State update delay completed');

//     } catch (error) {
//       console.error('❌ Logout error:', error);
//       // Even if there's an error, we should still log out locally
//       setUser(null);
//       setIsAuthenticated(false);
//       console.log('🔄 Fallback logout completed');
//     }
//   };

//   // Debug function to clear all storage (for testing)
//   const clearStorage = async () => {
//     try {
//       await AsyncStorage.clear();
//       console.log('All AsyncStorage cleared');
//       setUser(null);
//       setIsAuthenticated(false);
//     } catch (error) {
//       console.error('Error clearing storage:', error);
//     }
//   };

//   // Check if user is admin
//   const isAdmin = () => {
//     return user?.role === 'admin';
//   };

//   // Check if user has specific role
//   const hasRole = (role) => {
//     return user?.role === role;
//   };

//   const value = {
//     isAuthenticated,
//     user,
//     isLoading,
//     authKey,
//     login,
//     logout,
//     clearStorage,
//     isAdmin,
//     hasRole
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook to use the Auth Context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export default AuthContext;
