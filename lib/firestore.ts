import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

interface UserData {
    uid: string;
    email: string;
    name: string;
  }
  
  export const createUserDocument = async (userData: UserData) => {
    try {
      const { uid, email, name } = userData;
  
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error creating user document", error);
      throw error;
    }
  };
  