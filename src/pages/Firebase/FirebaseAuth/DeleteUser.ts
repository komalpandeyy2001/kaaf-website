import { reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { auth } from "../firebase";
import { deleteDocument } from "../CloudFirestore/DeleteData";
export const deleteUserData = async (id) => {
  try {
    const currentUser = auth.currentUser;
  
    // Change the user's password
    
    await deleteUser(currentUser);
    await deleteDocument("users",id)
  } catch (error) {
    console.log(error);
  }
};
