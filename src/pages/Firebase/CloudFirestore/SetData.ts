import { collection, addDoc, setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

export const addDocument = async (collectionName: string, data: any) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    if (data.userId && data.userId !== user.uid) {
      throw new Error("User ID mismatch");
    }
    const enrichedData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid
    };
    const docRef = await addDoc(collection(db, collectionName), enrichedData);
    console.log(`Document added successfully with ID: ${docRef.id}`);
    return docRef;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Create a Document with DocId
export const createDocument = async (collectionName: string, docId: string, data: any, merge = false) => {
  try {
    console.log(`Creating document with ID: ${docId} in collection: ${collectionName}`);
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge });
    console.log(`Document created successfully with ID: ${docId}`);
    return docRef;
  } catch (error) {
    console.error(`Error creating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Update Document
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    console.log(`Updating document ${docId} in collection: ${collectionName}`);
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    console.log(`Document ${docId} updated successfully`);
    return docRef;
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};
