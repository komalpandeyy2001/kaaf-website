import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase";

// Upload Image to Firebase Cloud Storage
export const UploadImage = async (imageFile) => {
  // const imgName = crypto.randomUUID();

  const storageRef = ref(storage, `images/${imageFile.name}${Math.random()}.jpg`);

  const upload = await uploadBytes(storageRef, imageFile);
  const downloadURL = await getDownloadURL(upload.ref);
  console.log(downloadURL);
  return downloadURL;
};

// Upload Profile Image to Firebase Cloud Storage
export const UploadProfileImage = async (imageFile, userId) => {
  const storageRef = ref(storage, `profile_images/profile_${userId}.jpg`);

  const upload = await uploadBytes(storageRef, imageFile);
  const downloadURL = await getDownloadURL(upload.ref);
  console.log(downloadURL);
  return downloadURL;
};



// Upload PDF to Firebase Cloud Storage
export const UploadPDF = async (pdfBlob: Blob, fileName: string) => {
  const storageRef = ref(storage, `reports/${fileName}_${Date.now()}.pdf`);
  
  const upload = await uploadBytes(storageRef, pdfBlob);
  const downloadURL = await getDownloadURL(upload.ref);
  console.log(downloadURL);
  return downloadURL;
};

export const deleteImage = async (imageUrl) => {
  try{

    const storageRef = ref(storage, imageUrl);
  
    const deletes = await deleteObject(storageRef);
    return true;
  }catch(err){
    
    return true;

  }
    
};
