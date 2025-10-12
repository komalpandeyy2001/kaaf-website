import { updateDoc, arrayUnion, doc, arrayRemove, FieldValue, increment } from "firebase/firestore";
import { db } from "../firebase";

// Update a document to a Collection
// export const updateDocument = async (collectionName, docId, data) => {
//   const res = await updateDoc(doc(db, collectionName, docId), {
//     ...data,
//   }).catch((err) => console.log(err));

//   return res;
// };
export const updateDocument = async (collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId); // expects strings
  await updateDoc(docRef, data);
};

// Update arrays of a Collection
export const updateArray = async (collectionName, docId, key, data) => {
  const res = await updateDoc(doc(db, collectionName, docId), {
    [key]: arrayUnion(data),
  }).catch((err) => console.log(err));

  return res;
};
export const incrementDecrement = async (collectionName, docId, key) => {
  const res = await updateDoc(doc(db, collectionName, docId), {
    [key]: increment(1),

  }).catch((err) => console.log(err));

  return res;
};

export const pushValuetoArrayInDoc = async (collectionName, docId, fieldName, valueToPush) => {
  try {
    if (!collectionName || !docId || !fieldName || valueToPush === undefined) {
      console.error("Invalid parameters for pushValuetoArrayInDoc", { collectionName, docId, fieldName, valueToPush });
      throw new Error("Invalid parameters for array update");
    }
    
    console.log(`Adding value to ${fieldName} array in ${collectionName}/${docId}:`, valueToPush);
    const docRef = doc(db, collectionName, docId);
    return await updateDoc(docRef, {
      [fieldName]: arrayUnion(valueToPush)
    });
  } catch (error) {
    console.error("Error in pushValuetoArrayInDoc:", error);
    throw error; // Re-throw to handle in the component
  }
}

export const removeValuetoArrayInDoc = async (collectionName, docId, fieldName, valueToRemove) => {
  try {
    if (!collectionName || !docId || !fieldName || valueToRemove === undefined) {
      console.error("Invalid parameters for removeValuetoArrayInDoc", { collectionName, docId, fieldName, valueToRemove });
      throw new Error("Invalid parameters for array update");
    }
    
    console.log(`Removing value from ${fieldName} array in ${collectionName}/${docId}:`, valueToRemove);
    const docRef = doc(db, collectionName, docId);
    return await updateDoc(docRef, {
      [fieldName]: arrayRemove(valueToRemove)
    });
  } catch (error) {
    console.error("Error in removeValuetoArrayInDoc:", error);
    throw error; // Re-throw to handle in the component
  }
}


export const incrementNumber = async (collectionName,documentId, key, value) => {
  const res = await updateDoc(doc(db, collectionName, documentId), {
    [key]: increment(value),

  }).catch((err) => console.log(err));

  return res;
};


export const decrementNumber = async (collectionName,documentId, key, value) => {
  const res = await updateDoc(doc(db, collectionName, documentId), {
    [key]: increment(-(value)),

  }).catch((err) => console.log(err));

  return res;
};

// Mark a notification as read
export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  try {
    const notificationRef = doc(db, "users", userId, "notifications", notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark multiple notifications as read
export const markMultipleNotificationsAsRead = async (userId: string, notificationIds: string[]) => {
  try {
    const promises = notificationIds.map(notificationId => 
      markNotificationAsRead(userId, notificationId)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error("Error marking multiple notifications as read:", error);
    throw error;
  }
};


