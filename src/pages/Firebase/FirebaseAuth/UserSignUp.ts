import {
  updateProfile,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { auth, db } from "../firebase";
import { createDocument } from "../CloudFirestore/SetData";
import { storeUserCredentials } from "../../../utils/localStorage";
import { serverTimestamp } from "firebase/firestore";

// SignUp users using their Email and Password
export const emailPasswordSignUp = async (name: string, mail: string, pass: string) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, mail, pass);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, { displayName: name });
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    // Create user document in Firestore
const userData = {
  uid: userCredential.user.uid,
  email: userCredential.user.email,
  displayName: name,
  password: pass,
  createdAt: serverTimestamp(), // Firestore timestamp
  updatedAt: serverTimestamp(), // Firestore timestamp
  emailVerified: false,
  role: 'user',
  isActive: true
};
    
    await createDocument('users', userCredential.user.uid, userData);
    
    // Get Firebase ID token
    const token = await userCredential.user.getIdToken();
    
    // Prepare user info for storage
    const userInfo = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: name,
      emailVerified: false,
      createdAt: new Date().toISOString()
    };
    
    // Store credentials in localStorage (auto-login after signup)
    const stored = storeUserCredentials({
      email: mail,
      password: pass,
      token: token,
      userInfo: userInfo
    }, true); // Auto-remember signup users
    
    if (!stored) {
      console.warn('Failed to store user credentials in localStorage');
    }
    
    return {
      success: true,
      user: userCredential.user,
      message: 'Account created successfully! Please check your email for verification.'
    };
    
  } catch (error) {
    let errorMessage = 'Sign up failed';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email address is already in use';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      default:
        errorMessage = error.message || 'Sign up failed';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Update user profile
export const updateName = async (name: string) => {
  try {
    const res = await updateProfile(auth.currentUser, {
      displayName: name,
    });
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if email is verified
export const checkEmailVerification = async () => {
  if (auth.currentUser) {
    await auth.currentUser.reload();
    return auth.currentUser.emailVerified;
  }
  return false;
};
