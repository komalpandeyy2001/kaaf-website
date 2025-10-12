// Utility functions to access user data stored in localStorage

const USER_INFO_KEY = "userInfo";

// Get user data from localStorage
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_INFO_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Check if user is logged in
export const isLoggedIn = () => {
  try {
    const userData = getUserData();
    return userData && userData.uid ? true : false;
  } catch (error) {
    return false;
  }
};

// Get specific user field
export const getUserField = (field: string) => {
  try {
    const userData = getUserData();
    return userData ? userData[field] : null;
  } catch (error) {
    return null;
  }
};

// Clear user data (logout)
export const clearUserData = () => {
  try {
    localStorage.removeItem(USER_INFO_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

// Example usage:
// import { getUserData, isLoggedIn } from './utils/userData';
// 
// const user = getUserData();
// console.log(user); // { uid: "...", name: "...", email: "...", companyId: "", userType: "company", role: "" }
// 
// if (isLoggedIn()) {
//   console.log("User is logged in");
// }
