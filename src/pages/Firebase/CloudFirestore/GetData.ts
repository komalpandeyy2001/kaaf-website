import { db } from "../firebase";
import {
  doc,
  query,
  where,
  getDoc,
  getDocs,
  collection,
  orderBy,
  onSnapshot,
  getCountFromServer,
  limit,
} from "firebase/firestore";

// Get all the data from a collection
export const getCollectionData = async (collectionName) => {
  const arr = [];
  let querySnapshot;

  if (collectionName === "jobs") {
    const dataQuery = query(
      collection(db, collectionName),
      orderBy("submitDate", "desc")
    );
    querySnapshot = await getDocs(dataQuery);
  } else {
    querySnapshot = await getDocs(collection(db, collectionName));
  }

  querySnapshot.forEach((doc) => {
    arr.push({ id: doc.id, ...doc.data() });
  });

  return arr;
};

// Get collection data with constraints
export const getCollectionDataWithConstraints = async (params) => {
  const arr = [];
  let querySnapshot;

  const { collection: collectionName, constraints = [] } = params;
  
  if (collectionName === "jobs" && constraints.length === 0) {
    const dataQuery = query(
      collection(db, collectionName),
      orderBy("submitDate", "desc")
    );
    querySnapshot = await getDocs(dataQuery);
  } else if (constraints.length > 0) {
    const dataQuery = query(
      collection(db, collectionName),
      ...constraints
    );
    querySnapshot = await getDocs(dataQuery);
  } else {
    querySnapshot = await getDocs(collection(db, collectionName));
  }

  querySnapshot.forEach((doc) => {
    arr.push({ id: doc.id, ...doc.data() });
  });

  return arr;
};

// Get all the data from a document
export const getDocumentData = async (collectionName, documentName) => {
  const docRef = doc(db, collectionName, documentName);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { ...docSnap.data(), id: documentName };
  } else {
    console.log("No such document!");
  }
};

// Get Number of Documents in Collection
export const numOfDocuments = async (collectionName) => {
  const data = await getCollectionData(collectionName);
  return data.length;
};

// Get Data using a Query
export const getMatchingData = async (collectionName, key, operator, value) => {
  const arr = [];

  const dataQuery = query(
    collection(db, collectionName),
    where(key, operator, value)
  );

  const querySnapshot = await getDocs(dataQuery);

  querySnapshot.forEach((doc) => {
    arr.push({ id: doc.id, ...doc.data() });
  });

  return arr;
};

export const getSnapShotData = (collectionName: string, key: string, operator: any, value: any, callback?: (data: any[]) => void): () => void => {
  const dataQuery = query(
    collection(db, collectionName),
    where(key, operator, value)
  );

  // Return the unsubscribe function so it can be called to clean up the listener
  return onSnapshot(dataQuery, 
    (snapShot) => {
      let data = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('Snapshot data:', data);
      if (callback) callback(data);
    },
    (error) => {
      console.error('Firestore snapshot error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        collectionName,
        key,
        operator, 
        value
      });
    }
  );
};

export const compoundQuery = async (collectionName, QueryArr) => {
  const arr = [];
  const queryParams = [];

  QueryArr.forEach((e) => {
    queryParams.push(where(e.key, e.operator, e.value));
  });

  const dataQuery = query(collection(db, collectionName), ...queryParams);

  const querySnapshot = await getDocs(dataQuery);

  querySnapshot.forEach((doc) => {
    arr.push({ id: doc.id, ...doc.data() });
  });

  return arr;
};


export const getLatestData = async (collectionName, QueryArr, orderByKey) => {

  const arr = [];
  const queryParams = [];

  QueryArr.forEach((e) => {
    queryParams.push(where(e.key, e.operator, e.value));
  });

  const dataQuery = query(collection(db, collectionName), ...queryParams,orderBy("created_at", "desc"),limit(1));

  // const querySnapshot = await getDocs(dataQuery).orderByChild(orderByKey).limitToLast(1)
  const querySnapshot = await getDocs(dataQuery)

  querySnapshot.forEach((doc) => {
    arr.push({ id: doc.id, ...doc.data() });
  });

  return arr;

}

export const getOrderByCollectionData = async (
  collectionName,
  orderByField,
  order
) => {
  const q = query(collection(db, collectionName), orderBy(orderByField, order));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getCoumpoundQueryLength = async (
  collectionName,
  QueryArr
) => {
  try {

    const arr = [];
    const queryParams = [];

    QueryArr.forEach((e) => {
      queryParams.push(where(e.key, e.operator, e.value));
    });

    const dataQuery = query(collection(db, collectionName), ...queryParams);

    let dd = await getCountFromServer(dataQuery)

    return dd.data().count
  } catch (err) {
    console.log(err)
  }
}

export const getUsers = async () => {
  const users = [];
  const querySnapshot = await getDocs(collection(db, "users"));
  
  querySnapshot.forEach((doc) => {
    users.push({ 
      value: doc.id, 
      label: doc.data().name || doc.data().email // Use name if available, otherwise email
    });
  });
  
  return users;
};

export const getLabels = async () => {
  try {
    const labels = [];
    const querySnapshot = await getDocs(collection(db, "labels"));
    
    console.log("Total labels fetched:", querySnapshot.size); // Debug line
    
    querySnapshot.forEach((doc) => {
      console.log("Label document:", doc.id, doc.data()); // Debug line
      labels.push({ 
        labelID: doc.id,
        labelName: doc.data().labelName || "Unnamed Label",
        color: doc.data().color || 0
      });
    });
    
    return labels;
  } catch (error) {
    console.error("Error in getLabels:", error);
    throw error; // Re-throw the error so it's caught in FilterModal
  }
};

// Get notifications from user's subcollection
export const getUserNotifications = async (userId: string) => {
  try {
    console.log('getUserNotifications - Fetching for userId:', userId);
    const notifications = [];
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    console.log('getUserNotifications - Query snapshot size:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      notifications.push({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() // Convert Firestore timestamp to Date
      });
    });
    
    console.log('getUserNotifications - Returning notifications:', notifications);
    return notifications;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};

// Get unread notifications count for a user
export const getUnreadNotificationsCount = async (userId: string) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, where("isRead", "==", false));
    const countSnapshot = await getCountFromServer(q);
    return countSnapshot.data().count;
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    return 0;
  }
};