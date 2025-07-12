import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface UserData {
    uid: string;
    email: string;
    name: string;
    role?: string;
    createdAt?: Date;
  }
  
  export const createUserDocument = async (userData: UserData) => {
    try {
      const { uid, email, name, role = "user" } = userData;
  
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error creating user document", error);
      throw error;
    }
  };

  export const getUserDocument = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user document", error);
      throw error;
    }
  };

  export const updateUserDocument = async (uid: string, updates: Partial<UserData>) => {
    try {
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, updates, { merge: true });
    } catch (error) {
      console.error("Error updating user document", error);
      throw error;
    }
  };
  