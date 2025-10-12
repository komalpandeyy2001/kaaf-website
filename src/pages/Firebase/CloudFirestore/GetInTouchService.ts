import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface GetInTouchData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const submitGetInTouchForm = async (formData: GetInTouchData) => {
  try {
    const contactData = {
      ...formData,
      submittedAt: new Date(),
      status: 'new',
      isRead: false
    };
    
    const docRef = await addDoc(collection(db, "getInTouch"), contactData);
    console.log(`Contact form submitted successfully with ID: ${docRef.id}`);
    return docRef;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};
