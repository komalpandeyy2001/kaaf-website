import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export const subscribeToNewsletter = async (email: string, source: string = 'general') => {
  try {
    const newsletterData = {
      email: email,
      source: source,
      subscribedAt: new Date(),
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, "newsletter"), newsletterData);
    console.log(`Email subscribed successfully with ID: ${docRef.id}`);
    return docRef;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};

export const unsubscribeFromNewsletter = async (email: string) => {
  try {
    // This would require additional logic to find and update the document
    // For now, we'll just log it - implementation can be added later
    console.log(`Unsubscribe request for email: ${email}`);
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    throw error;
  }
};
