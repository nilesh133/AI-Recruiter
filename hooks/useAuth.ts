import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useState } from "react";

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);

  const signup = async (
    userInfo: { name: string; email: string; role: string },
    password: string,
    onSuccess: () => void
  ) => {
    try {
      setError(null);
  
      const userCred = await createUserWithEmailAndPassword(auth, userInfo.email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        ...userInfo,
        uid: userCred.user.uid,
      });
  
      onSuccess();
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email ID already exists");
        throw new Error("email-exists");
      } else {
        setError("Something went wrong");
        throw new Error("signup-failed");
      }
    }
  };
  

  const login = async (
    email: string,
    password: string,
    onSuccess: () => void
  ) => {
    try {
      setError(null);
  
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
  
      if (!userDoc.exists()) {
        throw new Error("user-doc-not-found");
      }
  
      onSuccess();
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        throw new Error("invalid-credentials");
      } else if (err.message === "user-doc-not-found") {
        throw new Error("user-doc-not-found");
      } else {
        throw new Error("unknown-error");
      }
    }
  };

  return { signup, login, error };
};