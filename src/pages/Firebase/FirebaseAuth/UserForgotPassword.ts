import {
  sendPasswordResetEmail,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
  deleteUser
} from "firebase/auth";
import { auth } from "../firebase";
import { updateDocument } from "../CloudFirestore/UpdateData";

export const UserForgotPassword = async (mail) => {
  const res = await sendPasswordResetEmail(auth, mail);
  // .catch((err)=>{
  // console.log(err)
  //   alert("please cheack your email")
  // });
  return res;
};
export const ForgotPassword = async ( password, newPassword) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("No authenticated user found");
    }
    console.log(currentUser);
    // Get the user's credentials and reauthenticate the user
    const credential = await EmailAuthProvider.credential(
      currentUser.email,
      password
    );
    await reauthenticateWithCredential(currentUser, credential);

    // Change the user's password
    await updatePassword(currentUser, newPassword);

    // Update password in users collection
    await updateDocument("users", currentUser.uid, { password: newPassword });

  } catch (error) {
    console.log(error);
     throw error;
  }
};

// export const ForgotPassword = async (password, newPassword) => {
//   const currentUser = auth.currentUser;

//   const credential = EmailAuthProvider.credential(currentUser.email, password);
//   // Reauthenticate
//   await reauthenticateWithCredential(currentUser, credential);

//   // Update password
//   await updatePassword(currentUser, newPassword);
// };

