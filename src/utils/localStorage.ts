// Storage keys
const STORAGE_KEYS = {
  USER_CREDENTIALS: 'userCredentials',
  USER_TOKEN: 'userToken',
  USER_INFO: 'userInfo',
  REMEMBER_ME: 'rememberMe',
  USER_DATA: 'userData' // New key for simplified user data
};

// Store user credentials in localStorage
export const storeUserCredentials = (credentials, rememberMe = false) => {
  try {
    const dataToStore = {
      email: credentials.email,
      token: credentials.token,
      userInfo: credentials.userInfo,
      timestamp: new Date().toISOString()
    };

    // Only store password if remember me is explicitly true
    if (rememberMe && (credentials as any).password) {
      (dataToStore as any).password = (credentials as any).password;
    }

    localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(dataToStore));
    localStorage.setItem(STORAGE_KEYS.USER_TOKEN, credentials.token);
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(credentials.userInfo));
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(rememberMe));
    
    // Store user data in the exact format specified
    const userInfo = {
      uid: credentials.userInfo.uid,
      name: credentials.userInfo.displayName || credentials.userInfo.email?.split('@')[0] || 'User',
      email: credentials.userInfo.email,
      companyId: "", // Default empty as per your format
      userType: "company", // Default as per your format
      role: "" // Default empty as per your format
    };
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    
    // Also store in the old format for backward compatibility
    const userData = {
      name: credentials.userInfo.displayName || credentials.userInfo.email?.split('@')[0] || 'User',
      email: credentials.userInfo.email,
      UID: credentials.userInfo.uid
    };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    
    return true;
  } catch (error) {
    console.error('Error storing credentials:', error);
    return false;
  }
};

// Get user credentials from localStorage
export const getUserCredentials = () => {
  try {
    const credentials = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
    return credentials ? JSON.parse(credentials) : null;
  } catch (error) {
    console.error('Error getting credentials:', error);
    return null;
  }
};

// Get user token from localStorage
export const getUserToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Get user info from localStorage
export const getUserInfo = () => {
  try {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

// Get simplified user data (name, email, UID)
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Get remember me preference
export const getRememberMe = () => {
  try {
    const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    return rememberMe ? JSON.parse(rememberMe) : false;
  } catch (error) {
    console.error('Error getting remember me:', error);
    return false;
  }
};

// Clear all user credentials from localStorage
export const clearUserCredentials = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_CREDENTIALS);
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA); // Also clear userData
    return true;
  } catch (error) {
    console.error('Error clearing credentials:', error);
    return false;
  }
};

// Check if user is logged in
export const isUserLoggedIn = () => {
  try {
    const token = getUserToken();
    const userData = getUserData();
    return !!(token && userData);
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};
