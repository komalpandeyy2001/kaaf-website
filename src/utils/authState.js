// Authentication state management utilities

// Check if user is logged in - more robust check
export const isUserLoggedIn = () => {
  try {
    // Check multiple storage keys to ensure user is authenticated
    const userInfo = localStorage.getItem('userInfo');
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    const userCredentials = localStorage.getItem('userCredentials');
    
    // Debug logging (comment out in production)
    console.log('Auth state check:', {
      userInfo: !!userInfo,
      userToken: !!userToken,
      userData: !!userData,
      userCredentials: !!userCredentials
    });
    
    // User is considered logged in if we have userInfo OR (userToken AND userData)
    const isAuthenticated = !!userInfo || (!!userToken && !!userData);
    
    console.log('User authenticated:', isAuthenticated);
    return isAuthenticated;
  } catch (error) {
    console.error('Error checking authentication state:', error);
    return false;
  }
};

// Get current user data with fallback to multiple storage locations
export const getCurrentUser = () => {
  try {
    // Try to get from userInfo first
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedInfo = JSON.parse(userInfo);
        console.log('Found user in userInfo:', parsedInfo);
        return parsedInfo;
      } catch (error) {
        console.error('Error parsing userInfo:', error);
      }
    }
    
    // Fallback to userData
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        console.log('Found user in userData:', parsedData);
        return parsedData;
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
    
    // Fallback to userCredentials
    const userCredentials = localStorage.getItem('userCredentials');
    if (userCredentials) {
      try {
        const parsedCredentials = JSON.parse(userCredentials);
        if (parsedCredentials.userInfo) {
          console.log('Found user in userCredentials:', parsedCredentials.userInfo);
          return parsedCredentials.userInfo;
        }
      } catch (error) {
        console.error('Error parsing userCredentials:', error);
      }
    }
    
    console.log('No user data found in localStorage');
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Force refresh auth state across components
export const refreshAuthState = () => {
  window.dispatchEvent(new Event('authStateChanged'));
};

// Listen for auth state changes
export const onAuthStateChanged = (callback) => {
  window.addEventListener('authStateChanged', callback);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('authStateChanged', callback);
  };
};

// Clear auth state (logout)
export const clearAuthState = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userCredentials');
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  refreshAuthState();
};

// Debug function to check all auth-related localStorage items
export const debugAuthState = () => {
  const keys = ['userInfo', 'userToken', 'userData', 'userCredentials', 'rememberMe'];
  const state = {};
  
  keys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      state[key] = value ? JSON.parse(value) : null;
    } catch (error) {
      state[key] = `Error parsing: ${error.message}`;
    }
  });
  
  console.log('Auth State Debug:', state);
  return state;
};
