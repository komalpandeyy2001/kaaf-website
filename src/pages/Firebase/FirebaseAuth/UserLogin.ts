import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// Login users using their Email and Password
export const emailPasswordLogin = async (mail, pass) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, mail, pass);

    // Extract only required user info
    const userInfo = {
      userId: userCredential.user.uid,
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName || "", // fallback empty string
    };

    // Store only uid, email, and name in localStorage
    localStorage.setItem("userInfo", JSON.stringify(userInfo));

    return {
      success: true,
      user: userCredential.user,
      userInfo: userInfo,
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      error: err.message || "Login failed",
    };
  }
};

// Logout user and clear localStorage
export const logoutUser = () => {
  try {
    localStorage.removeItem("userInfo"); // Clear only stored user data
    return auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);
    return Promise.reject(error);
  }
};

// Get stored user data
export const getStoreduserInfo = () => {
  try {
    const data = localStorage.getItem("userInfo");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error parsing userInfo:", error);
    return null;
  }
};
